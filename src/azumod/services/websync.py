"""
AppWebSync.py -- mantiene la interfaz web (index.html, app.js, styles.css y
codemirror.bundle.js) al dia desde GitHub, sin recompilar el ejecutable.

Flujo (misma interfaz que ya usa AppLauncher.py):
  sync(log)     Hilo de fondo, despues de abrir la ventana. Baja web_manifest.json,
                descarga solo lo que cambio a <datos>/updates/web, verifica sha256
                y lo deja "staged". Devuelve status="staged" para que el launcher
                muestre el aviso "reabre la app".
  seed()        Al arrancar, antes de cargar el index: si hay algo staged y verificado,
                lo copia a <datos>/engine.
  web_path(rel) Devuelve la copia de engine solo si el juego COMPLETO de archivos esta
                ahi (index.html necesita app.js/styles.css al lado); si no, None y el
                launcher usa los del ejecutable.

Reglas de seguridad:
  - Solo se bajan los 4 archivos de WEB_FILES, solo desde BASE_URL (https).
  - Cada archivo se verifica contra el sha256 del manifest antes de usarse.
  - NO se sincroniza codigo Python: nada descargado se ejecuta como programa.
  - Nunca lanza excepciones hacia el launcher; sin internet simplemente no hace nada.

Variables de entorno:  AZU_NO_WEB_SYNC=1 (desactiva)   AZU_WEB_BASE=<url> (solo pruebas)
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import sys
import urllib.error
import urllib.request

REPO = "azu42968-maker/azu-mod-maker"
BRANCH = "main"
BASE_URL = (os.environ.get("AZU_WEB_BASE")
            or f"https://raw.githubusercontent.com/{REPO}/{BRANCH}").rstrip("/")
MANIFEST_NAME = "web_manifest.json"
VERSION_FILE = "web_version.json"
WEB_FILES = ("index.html", "app.js", "styles.css", "codemirror.bundle.js")
TIMEOUT = 20
MAX_BYTES = 25 * 1024 * 1024
_SHA_RE = re.compile(r"^[0-9a-f]{64}$")


# ---------------------------------------------------------------- rutas

def _data_root() -> str:
    if sys.platform.startswith("win"):
        base = os.getenv("APPDATA") or os.path.expanduser("~")
    elif sys.platform == "darwin":
        base = os.path.expanduser("~/Library/Application Support")
    else:
        base = os.getenv("XDG_DATA_HOME") or os.path.expanduser("~/.local/share")
    return os.path.join(base, "AzuModification")


def _engine_dir() -> str:
    return os.path.join(_data_root(), "engine")


def _pending_dir() -> str:
    return os.path.join(_data_root(), "updates", "web")


def _bundled_dir() -> str:
    if hasattr(sys, "_MEIPASS"):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))


# ---------------------------------------------------------------- utilidades

def _sha_file(path: str) -> str:
    """sha256 normalizando CRLF->LF, para que Windows (autocrlf) y GitHub coincidan."""
    with open(path, "rb") as f:
        data = f.read()
    return hashlib.sha256(data.replace(b"\r\n", b"\n")).hexdigest()


def _read_json(path: str):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def _write_json(path: str, obj) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2)


def _valid_set(folder: str):
    """Info de version si la carpeta tiene el juego completo de archivos; si no, None."""
    info = _read_json(os.path.join(folder, VERSION_FILE))
    if not isinstance(info, dict) or not isinstance(info.get("files"), dict):
        return None
    for name in WEB_FILES:
        if name not in info["files"] or not os.path.isfile(os.path.join(folder, name)):
            return None
    return info


def _verified(folder: str):
    """Como _valid_set, pero ademas comprueba el sha256 de cada archivo."""
    info = _valid_set(folder)
    if info is None:
        return None
    try:
        for name in WEB_FILES:
            if _sha_file(os.path.join(folder, name)) != info["files"][name]:
                return None
    except OSError:
        return None
    return info


def _bundled_stamp() -> str:
    """Huella de los archivos web incluidos en el ejecutable. Si cambia (nuevo .exe),
    lo sincronizado con un ejecutable anterior deja de valer."""
    h = hashlib.sha256()
    for name in WEB_FILES:
        p = os.path.join(_bundled_dir(), name)
        try:
            h.update(_sha_file(p).encode())
        except OSError:
            h.update(b"-")
    return h.hexdigest()[:16]


def _engine_set():
    """Info del engine si esta completo Y fue sembrado con este mismo ejecutable."""
    info = _valid_set(_engine_dir())
    if info is None or info.get("bundled") != _bundled_stamp():
        return None
    return info


def _check_url(url: str) -> None:
    if not url.startswith("https://") and not os.environ.get("AZU_WEB_BASE"):
        raise ValueError("solo se permiten URLs https")


def _fetch_json(url: str) -> dict:
    _check_url(url)
    req = urllib.request.Request(url, headers={"User-Agent": "AzuModification-WebSync"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        raw = r.read(1024 * 1024 + 1)
    if len(raw) > 1024 * 1024:
        raise ValueError("manifest demasiado grande")
    data = json.loads(raw.decode("utf-8"))
    if not isinstance(data, dict):
        raise ValueError("manifest invalido")
    return data


def _download(url: str, dest: str) -> None:
    _check_url(url)
    req = urllib.request.Request(url, headers={"User-Agent": "AzuModification-WebSync"})
    size = 0
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r, open(dest, "wb") as f:
        while True:
            chunk = r.read(1 << 16)
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_BYTES:
                raise ValueError("archivo demasiado grande")
            f.write(chunk)


def _parse_manifest(manifest: dict) -> dict:
    files = manifest.get("files")
    if not isinstance(files, dict):
        raise ValueError("el manifest no trae 'files'")
    wanted = {}
    for name in WEB_FILES:                       # solo nombres conocidos, nunca rutas del manifest
        sha = str(files.get(name, "")).lower()
        if not _SHA_RE.match(sha):
            raise ValueError(f"el manifest no tiene un sha256 valido para {name}")
        wanted[name] = sha
    return wanted


# ---------------------------------------------------------------- interfaz del launcher

def enabled() -> bool:
    return os.environ.get("AZU_NO_WEB_SYNC") != "1"


def current_version() -> str:
    info = _engine_set()
    return str(info.get("version") or "synced") if info else "bundled"


def web_path(relative_path: str):
    """Ruta sincronizada si existe el juego completo; None -> el launcher usa el ejecutable."""
    rel = relative_path.replace("\\", "/")
    if rel not in WEB_FILES:
        return None
    if _engine_set() is None:
        return None
    return os.path.join(_engine_dir(), rel)


def seed() -> None:
    """Aplica lo que quedo 'staged' en la sesion anterior. Nunca lanza."""
    try:
        pend = _pending_dir()
        info = _verified(pend)
        if info is None:
            return
        if info.get("bundled") != _bundled_stamp():
            # Se bajo con otro ejecutable (posiblemente mas viejo que este): se descarta.
            shutil.rmtree(pend, ignore_errors=True)
            return
        eng = _engine_dir()
        os.makedirs(eng, exist_ok=True)
        version_file = os.path.join(eng, VERSION_FILE)
        # Sin version_file el set de engine cuenta como incompleto: si algo falla a medias,
        # web_path() devuelve None y el launcher usa el ejecutable.
        if os.path.exists(version_file):
            os.remove(version_file)
        for name in WEB_FILES:
            tmp = os.path.join(eng, name + ".tmp")
            shutil.copy2(os.path.join(pend, name), tmp)
            os.replace(tmp, os.path.join(eng, name))
        _write_json(version_file, info)
        shutil.rmtree(pend, ignore_errors=True)
    except Exception:
        pass


def sync(log=print) -> dict:
    if not enabled():
        return {"ok": True, "status": "disabled", "version": current_version()}

    part = _pending_dir() + ".part"
    try:
        manifest = _fetch_json(f"{BASE_URL}/{MANIFEST_NAME}")
        wanted = _parse_manifest(manifest)
        version = str(manifest.get("version") or "")[:40]

        # Lo que la app esta usando ahora (engine si esta completo, si no el del ejecutable)
        in_use = _engine_dir() if _engine_set() else _bundled_dir()
        local = {}
        for name in WEB_FILES:
            p = os.path.join(in_use, name)
            local[name] = _sha_file(p) if os.path.isfile(p) else None

        if all(local[n] == wanted[n] for n in WEB_FILES):
            shutil.rmtree(_pending_dir(), ignore_errors=True)
            return {"ok": True, "status": "up-to-date", "version": current_version()}

        stamp = _bundled_stamp()
        pend = _verified(_pending_dir())
        if pend and pend["files"] == wanted and pend.get("bundled") == stamp:
            return {"ok": True, "status": "staged", "version": version}

        shutil.rmtree(part, ignore_errors=True)
        os.makedirs(part)
        for name in WEB_FILES:
            dest = os.path.join(part, name)
            if local[name] == wanted[name]:
                shutil.copy2(os.path.join(in_use, name), dest)
                continue
            log(f"[web-sync] descargando {name}")
            _download(f"{BASE_URL}/{name}", dest)
            if _sha_file(dest) != wanted[name]:
                raise ValueError(f"{name}: el sha256 no coincide con el manifest")
        _write_json(os.path.join(part, VERSION_FILE), {"version": version, "files": wanted, "bundled": stamp})
        shutil.rmtree(_pending_dir(), ignore_errors=True)
        os.replace(part, _pending_dir())
        log(f"[web-sync] version {version} lista; se aplica al reabrir")
        return {"ok": True, "status": "staged", "version": version}

    except urllib.error.HTTPError as e:
        return {"ok": False, "status": "error", "message": f"HTTP {e.code} al consultar {e.url}",
                "version": current_version()}
    except urllib.error.URLError as e:
        return {"ok": False, "status": "offline", "message": str(e.reason),
                "version": current_version()}
    except Exception as e:
        return {"ok": False, "status": "error", "message": str(e), "version": current_version()}
    finally:
        shutil.rmtree(part, ignore_errors=True)

