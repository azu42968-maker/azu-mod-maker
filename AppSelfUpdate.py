"""AppSelfUpdate.py — actualiza el codigo y la web de Azu Modification sin reinstalar el .exe.

Que se actualiza : los .py del motor (AppAllInOne/AppPublic, AppConfig, ...) y la web
                   (index.html, app.js, styles.css, codemirror.bundle.js).
Que NO           : AppLauncher.py, AppSelfUpdate.py, Python, pywebview y cualquier libreria
                   nueva. Eso sigue requiriendo un .exe nuevo (ver min_launcher_api).

Flujo: el launcher llama a get_active() + activate() al arrancar (usa la ultima version
descargada) y, ya con la ventana abierta, a check_and_stage() en segundo plano. Lo que se
descarga queda listo para el *proximo* arranque.
"""
import hashlib
import importlib.abc
import importlib.util
import json
import os
import re
import shutil
import sys
import time
import urllib.parse
import urllib.request

# Sube este numero SOLO cuando un cambio del launcher haga incompatibles las
# actualizaciones viejas/nuevas. Los manifests con min_launcher_api mayor avisan
# "descarga el .exe nuevo" en vez de aplicarse.
LAUNCHER_API = 1

# Carpeta del repo donde publicas manifest.json + archivos (la que genera make_release.py).
UPDATE_BASE_URL = os.environ.get(
    "AZU_UPDATE_URL",
    "https://raw.githubusercontent.com/azu42968-maker/azu-mod-maker/main/update/",
)

# AppCodeInstaller / AppRelinker / AppUpdater (el de FFDec) buscan ffdec, export/ y update.log
# junto a su propio __file__; si se cargaran desde la carpeta de actualizaciones dejarian de
# encontrar el ffdec que viene dentro del .exe. Por eso se quedan congelados en el .exe.
NEVER_UPDATE = {
    "AppLauncher.py", "AppSelfUpdate.py", "manifest.json",
    "AppCodeInstaller.py", "AppRelinker.py", "AppUpdater.py", "AppAutoPatch.py",
}
ENGINE_FILES = ("AppAllInOne.py", "AppPublic.py")

_NAME_RE = re.compile(r"^[A-Za-z0-9_][A-Za-z0-9_.\-]*$")
_PY_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*\.py$")
_SHA_RE = re.compile(r"^[0-9a-f]{64}$")
_VERSION_RE = re.compile(r"^\d+(\.\d+)*$")
_ALLOWED_EXT = {".py", ".html", ".js", ".css", ".json", ".svg"}
_TIMEOUT = 15
_MAX_BYTES = 25 * 1024 * 1024

_active = None
_finder = None
_served = set()
_running_version = "0"


# ----------------------------------------------------------------- utilidades

def enabled():
    """Solo en el .exe (o en desarrollo con AZU_FORCE_UPDATER=1 para probarlo)."""
    return hasattr(sys, "_MEIPASS") or os.environ.get("AZU_FORCE_UPDATER") == "1"


def _configured():
    return "TU_USUARIO" not in UPDATE_BASE_URL  # por si lo cambias a mano


def _bundle_dir():
    if hasattr(sys, "_MEIPASS"):
        return sys._MEIPASS
    return os.environ.get("AZU_BUNDLE_DIR") or os.path.dirname(os.path.abspath(__file__))


def _data_root():
    base = os.getenv("APPDATA") or os.path.expanduser("~")
    return os.path.join(base, "AzuModification")


def _engine_dir():
    return os.path.join(_data_root(), "engine")


def _updates_root():
    path = os.path.join(_data_root(), "updates")
    os.makedirs(path, exist_ok=True)
    return path


def _read_json(path, default=None):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def _write_json_atomic(path, data):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    os.replace(tmp, path)


def _sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def _sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _vkey(version):
    return tuple(int(x) for x in re.findall(r"\d+", str(version or "0"))) or (0,)


# -------------------------------------------------------------- version activa

def _bad_versions():
    data = _read_json(os.path.join(_updates_root(), "bad.json"), {})
    return set(data.get("versions", [])) if isinstance(data, dict) else set()


def mark_bad(version):
    """Marca una version como rota: no se vuelve a usar ni a descargar."""
    try:
        bad = _bad_versions()
        bad.add(str(version))
        _write_json_atomic(os.path.join(_updates_root(), "bad.json"), {"versions": sorted(bad)})
        state_path = os.path.join(_updates_root(), "current.json")
        state = _read_json(state_path, {})
        if isinstance(state, dict) and str(state.get("version")) == str(version):
            os.remove(state_path)
    except Exception:
        pass


def mark_active_bad():
    """Si hay una actualizacion en uso, la descarta. Devuelve su version o None."""
    if _active is None:
        return None
    version = _active["version"]
    mark_bad(version)
    return version


def get_active():
    """Ultima actualizacion completa y valida, o None (se usa lo que trae el .exe)."""
    if not enabled():
        return None
    state = _read_json(os.path.join(_updates_root(), "current.json"))
    if not isinstance(state, dict):
        return None
    version = str(state.get("version") or "")
    folder_name = str(state.get("dir") or "")
    files = state.get("files")
    if not version or not folder_name or os.path.basename(folder_name) != folder_name:
        return None
    if not isinstance(files, dict) or version in _bad_versions():
        return None
    folder = os.path.join(_updates_root(), folder_name)
    if not os.path.isdir(folder):
        return None
    for name in files:
        if not os.path.isfile(os.path.join(folder, name)):
            return None
    return {"version": version, "dir": folder, "dir_name": folder_name, "files": files}


def active_version():
    return _active["version"] if _active else None


def running_version():
    return _running_version


def module_names(active=None):
    active = active or _active
    if not active:
        return set()
    return {n[:-3] for n in active["files"] if _PY_RE.match(n)}


def asset_path(name):
    """Ruta del archivo dentro de la actualizacion activa (o None)."""
    if _active:
        path = os.path.join(_active["dir"], name)
        if os.path.isfile(path):
            return path
    return None


class _OverrideFinder(importlib.abc.MetaPathFinder):
    """Hace que `import AppConfig` (etc.) cargue la copia actualizada y no la del .exe."""

    def __init__(self, root, names):
        self.root = root
        self.names = set(names)

    def find_spec(self, fullname, path=None, target=None):
        if path is not None or fullname not in self.names:
            return None
        file = os.path.join(self.root, fullname + ".py")
        if not os.path.isfile(file):
            return None
        _served.add(fullname)
        return importlib.util.spec_from_file_location(fullname, file)


def activate(active):
    """Usa `active` para este arranque. Llamar ANTES de importar el motor."""
    global _active, _finder, _running_version
    deactivate()
    if not active:
        return
    _active = active
    _running_version = active["version"]
    names = module_names(active)
    if names:
        _finder = _OverrideFinder(active["dir"], names)
        sys.meta_path.insert(0, _finder)


def deactivate():
    """Vuelve a lo que trae el .exe (por si la actualizacion no carga)."""
    global _active, _finder, _running_version
    if _finder is not None:
        try:
            sys.meta_path.remove(_finder)
        except ValueError:
            pass
        _finder = None
    for name in list(_served):
        sys.modules.pop(name, None)
    _served.clear()
    _active = None
    _running_version = "0"


# ------------------------------------------------------------------- descarga

def _http_get(name, limit):
    url = UPDATE_BASE_URL.rstrip("/") + "/" + urllib.parse.quote(name)
    url += ("&" if "?" in url else "?") + "cb=" + str(int(time.time()))
    req = urllib.request.Request(
        url, headers={"User-Agent": "AzuModification-Updater", "Cache-Control": "no-cache"}
    )
    with urllib.request.urlopen(req, timeout=_TIMEOUT) as resp:
        data = resp.read(limit + 1)
    if len(data) > limit:
        raise ValueError(f"{name} supera el tamano maximo permitido")
    return data


def _load_manifest():
    data = json.loads(_http_get("manifest.json", 1 << 20).decode("utf-8"))
    version = str(data.get("version") or "").strip()
    files = data.get("files")
    if not _VERSION_RE.match(version):
        raise ValueError(f"version invalida en el manifest: {version!r}")
    if not isinstance(files, dict) or not files:
        raise ValueError("el manifest no lista archivos")

    clean = {}
    for name, digest in files.items():
        ext = os.path.splitext(name)[1].lower()
        if not _NAME_RE.match(name) or name in NEVER_UPDATE or ext not in _ALLOWED_EXT:
            raise ValueError(f"archivo no permitido en el manifest: {name!r}")
        if ext == ".py" and not _PY_RE.match(name):
            raise ValueError(f"nombre de modulo no valido: {name!r}")
        digest = str(digest).lower()
        if not _SHA_RE.match(digest):
            raise ValueError(f"sha256 invalido para {name}")
        clean[name] = digest

    return {
        "version": version,
        "min_launcher_api": int(data.get("min_launcher_api", 1)),
        "notes": str(data.get("notes", ""))[:500],
        "files": clean,
    }


def _cleanup(root, keep):
    for entry in os.listdir(root):
        path = os.path.join(root, entry)
        if os.path.isdir(path) and (entry.startswith(".tmp-") or (entry.startswith("v") and entry not in keep)):
            shutil.rmtree(path, ignore_errors=True)


def _check_and_stage(log):
    manifest = _load_manifest()
    active = get_active()
    disk_version = active["version"] if active else "0"

    if _vkey(manifest["version"]) <= _vkey(disk_version):
        if _vkey(disk_version) > _vkey(_running_version):
            return {"status": "restart_required", "version": disk_version, "notes": ""}
        return {"status": "up_to_date", "version": disk_version}

    if manifest["version"] in _bad_versions():
        return {"status": "up_to_date", "version": disk_version}

    if manifest["min_launcher_api"] > LAUNCHER_API:
        return {"status": "needs_new_exe", "version": manifest["version"], "notes": manifest["notes"]}

    # Que se copia de lo que ya hay y que se descarga.
    bundle = _bundle_dir()
    record = active["files"] if active else {}
    plan_copy, plan_download = {}, []
    for name, want in manifest["files"].items():
        if active and name in record:
            have = record[name]
            src = os.path.join(active["dir"], name)
        else:
            src = os.path.join(bundle, name)
            have = _sha256_file(src) if os.path.isfile(src) else None
            engine_copy = os.path.join(_engine_dir(), name)
            if name in ENGINE_FILES and have == want and os.path.isfile(engine_copy):
                src = engine_copy  # conserva los cambios locales del relinker
        if have == want and os.path.isfile(src):
            plan_copy[name] = src
        else:
            plan_download.append(name)

    if not plan_download:
        return {"status": "up_to_date", "version": disk_version}

    root = _updates_root()
    final_name = "v" + manifest["version"]
    tmp = os.path.join(root, ".tmp-" + final_name)
    shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp)
    try:
        for name, src in plan_copy.items():
            shutil.copy2(src, os.path.join(tmp, name))
        for name in plan_download:
            log(f"[update] descargando {name}")
            data = _http_get(name, _MAX_BYTES)
            if _sha256_bytes(data) != manifest["files"][name]:
                raise ValueError(f"el hash de {name} no coincide con el manifest")
            if name.endswith(".py"):
                compile(data, name, "exec")  # sintaxis rota -> se aborta antes de activarlo
            with open(os.path.join(tmp, name), "wb") as f:
                f.write(data)
    except Exception:
        shutil.rmtree(tmp, ignore_errors=True)
        raise

    final = os.path.join(root, final_name)
    shutil.rmtree(final, ignore_errors=True)
    os.replace(tmp, final)
    _write_json_atomic(
        os.path.join(root, "current.json"),
        {
            "version": manifest["version"],
            "dir": final_name,
            "files": manifest["files"],
            "installed_at": int(time.time()),
        },
    )
    keep = {final_name}
    if active:
        keep.add(active["dir_name"])
    _cleanup(root, keep)

    log(f"[update] {manifest['version']} lista ({len(plan_download)} archivo(s) descargados)")
    return {
        "status": "staged",
        "version": manifest["version"],
        "notes": manifest["notes"],
        "downloaded": plan_download,
    }


def check_and_stage(log=print):
    """Baja la version nueva (si hay) a disco. Nunca lanza: devuelve {'status': ...}.

    status: disabled | up_to_date | staged | restart_required | needs_new_exe | error
    """
    if not enabled():
        return {"status": "disabled"}
    if not _configured():
        return {"status": "disabled", "message": "UPDATE_BASE_URL sin configurar"}
    try:
        return _check_and_stage(log)
    except Exception as e:
        log(f"[update] no se pudo actualizar: {e}")
        return {"status": "error", "message": str(e)}
