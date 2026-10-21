#!/usr/bin/env python3
"""
build_exe.py -- genera el ejecutable de AzuModification para el sistema donde lo corras.

  Linux   : python3 build_exe.py   ->  Ejecutables/AzuModificationLin
  Windows : python build_exe.py    ->  Ejecutables/AzuModificationWin.exe
  macOS   : python3 build_exe.py   ->  Ejecutables/AzuModificationMac.zip  (contiene el .app)

PyInstaller NO compila de un sistema a otro: el .exe de Windows se hace en Windows
(o en GitHub Actions, ver .github/workflows/build.yml, que construye los dos solo).

Opciones:  --dry-run  (solo muestra el comando)   --keep  (conserva la carpeta temporal de PyInstaller)
           --no-jre   (no incluye Java)           --jre-dir RUTA  (usa un JRE ya descargado en vez de bajarlo)
           --full     (incluye ffdec y PreRenders dentro del ejecutable; por defecto van FUERA para
                       que el .exe pese menos: la app los descarga sola la primera vez)

El ejecutable lleva dentro un JRE 17 (Temurin) y, al arrancar, lo pone en el PATH: asi ffdec funciona
aunque el equipo no tenga Java.
Para agregar otra app, anade una entrada a APPS.
"""
from __future__ import annotations

import io
import json
import os
import platform
import shutil
import subprocess
import sys
import tarfile
import tempfile
import zipfile
from pathlib import Path
from urllib.request import Request, urlopen

HERE = Path(__file__).resolve().parent
IS_WIN = sys.platform.startswith("win")
IS_MAC = sys.platform == "darwin"
OS_TAG = "windows" if IS_WIN else ("macos" if IS_MAC else "linux")
FINAL_SUFFIX = "Win" if IS_WIN else ("Mac" if IS_MAC else "Lin")

APPS = {
    "AzuModification": {
        "entry": "AppLauncher.py",
        # Archivos que el launcher lee en tiempo de ejecucion (van como datos, en la raiz del bundle)
        "data_files": [
            "AppAllInOne.py", "AppPublic.py", "index.html", "app.js",
            "styles.css", "codemirror.bundle.js",
        ],
        # Carpetas completas que SIEMPRE van dentro del ejecutable
        "data_dirs": ["SpriteTypes"],
        # Carpetas pesadas: solo van dentro con --full. Sin --full la app las baja sola la primera vez.
        # ("ffdec": AppUpdater la busca en <bundle>/ffdec/ffdec.jar; se omite si no existe.)
        "heavy_dirs": ["PreRenders", "ffdec"],
        # Modulos que PyInstaller no ve (imports dentro de funciones o cargados con exec)
        "hidden_imports": [
            "AppBox", "AppConfig", "AppCodeInstaller", "AppRelinker", "AppUpdater",
            "AppSync", "AppWebSync", "AppAllInOne", "AppPublic",
            "xmltodict", "PIL", "PIL.Image", "PIL.ImageDraw", "PIL.ImageColor", "PIL.ImageFont",
            "xml.etree.ElementTree",
        ],
        "icon_win": "icon.ico",
        "icon_mac": "icon.icns",
    },
}


ADOPTIUM_API = (
    "https://api.adoptium.net/v3/assets/latest/17/hotspot"
    "?image_type=jre&os={os}&architecture={arch}&vendor=eclipse"
)
_HEADERS = {"User-Agent": "AzuModBuildScript/1.0"}

# Se ejecuta al arrancar el ejecutable (antes que la app): deja el JRE incluido en el PATH.
RUNTIME_HOOK = """import os, sys
_base = getattr(sys, "_MEIPASS", None)
if _base:
    _jre = os.path.join(_base, "jre")
    _bin = os.path.join(_jre, "bin")
    if os.path.isdir(_bin):
        if os.name != "nt":
            # los datos empaquetados pueden perder el bit de ejecutable
            for _d, _names in ((_bin, os.listdir(_bin)), (os.path.join(_jre, "lib"), ("jspawnhelper", "jexec"))):
                for _n in _names:
                    _p = os.path.join(_d, _n)
                    if os.path.isfile(_p):
                        try:
                            os.chmod(_p, os.stat(_p).st_mode | 0o111)
                        except OSError:
                            pass
        os.environ["JAVA_HOME"] = _jre
        os.environ["PATH"] = _bin + os.pathsep + os.environ.get("PATH", "")
"""


def _adoptium_os_arch() -> tuple[str, str]:
    os_name = "windows" if IS_WIN else ("mac" if IS_MAC else "linux")
    machine = platform.machine().lower()
    if machine in ("amd64", "x86_64"):
        return os_name, "x64"
    if machine in ("arm64", "aarch64"):
        return os_name, "aarch64"
    sys.exit(f"[ERROR] Arquitectura no soportada para el JRE: {machine}")


def _java_bin(jre: Path) -> Path:
    return jre / "bin" / ("java.exe" if IS_WIN else "java")


def prepare_jre(dry: bool) -> Path | None:
    """Devuelve la carpeta de un JRE listo para empaquetar (lo baja la primera vez y lo guarda en cache)."""
    if "--no-jre" in sys.argv:
        print("[aviso] --no-jre: el ejecutable no llevara Java")
        return None
    if "--jre-dir" in sys.argv:
        custom = Path(sys.argv[sys.argv.index("--jre-dir") + 1]).expanduser().resolve()
        if not _java_bin(custom).is_file():
            sys.exit(f"[ERROR] No hay bin/java en {custom}")
        return custom

    os_name, arch = _adoptium_os_arch()
    jre = Path.home() / ".cache" / "azumod-build" / f"jre-17-{os_name}-{arch}"
    if _java_bin(jre).is_file():
        print(f"[*] JRE en cache: {jre}")
        return jre
    if dry:
        print(f"[dry-run] se bajaria el JRE 17 de Adoptium ({os_name}/{arch}) a {jre}")
        return jre

    print(f"[*] Buscando el JRE 17 (Temurin) para {os_name}/{arch}...")
    with urlopen(Request(ADOPTIUM_API.format(os=os_name, arch=arch), headers=_HEADERS), timeout=30) as r:
        assets = json.load(r)
    if not assets:
        sys.exit("[ERROR] Adoptium no devolvio ningun JRE para este sistema")
    pkg = assets[0]["binary"]["package"]
    print(f"[*] Descargando {pkg['name']} ...")
    with urlopen(Request(pkg["link"], headers=_HEADERS), timeout=180) as r:
        data = r.read()

    jre.parent.mkdir(parents=True, exist_ok=True)
    tmp = Path(tempfile.mkdtemp(prefix="jre-", dir=jre.parent))
    try:
        if pkg["link"].endswith(".zip"):
            with zipfile.ZipFile(io.BytesIO(data)) as zf:
                top = zf.namelist()[0].split("/")[0]
                zf.extractall(tmp)
        else:
            with tarfile.open(fileobj=io.BytesIO(data)) as tf:
                top = tf.getnames()[0].split("/")[0]
                try:
                    tf.extractall(tmp, filter="data")
                except TypeError:            # Python sin soporte de filter=
                    tf.extractall(tmp)
        home = tmp / top
        if (home / "Contents" / "Home").is_dir():   # macOS
            home = home / "Contents" / "Home"
        if jre.exists():
            shutil.rmtree(jre)
        shutil.move(str(home), str(jre))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    if not _java_bin(jre).is_file():
        sys.exit(f"[ERROR] Se descargo el JRE pero no hay bin/java en {jre}")
    print(f"[*] JRE listo: {jre}")
    return jre


# Librerias del sistema que NO deben ir dentro del ejecutable de Linux: si se empaquetan las de
# Ubuntu 22.04, chocan con los drivers de video de distros mas nuevas (Bazzite/Fedora) y Qt se cae.
SYSTEM_LIBS = ("libstdc++.so", "libgcc_s.so")

SPEC_FILTER = """
# --- excluir librerias del sistema (agregado por build_exe.py) ---
_SYSTEM_LIBS = %r
a.binaries = [b for b in a.binaries if not os.path.basename(b[0]).startswith(_SYSTEM_LIBS)]
# -----------------------------------------------------------------
"""


def make_spec(opts: list[str], spec_dir: Path, name: str, dry: bool) -> Path:
    """Genera el .spec con pyi-makespec y le anade el filtro de librerias del sistema."""
    spec = spec_dir / f"{name}.spec"
    run([sys.executable, "-c",
         "from PyInstaller.utils.cliutils.makespec import run; run()"] + opts, dry)
    if dry:
        return spec
    txt = spec.read_text(encoding="utf-8")
    marker = "pyz = PYZ("
    if marker not in txt:
        sys.exit("[ERROR] No pude parchear el .spec (formato de PyInstaller distinto al esperado)")
    if not txt.startswith("import os") and "\nimport os" not in txt:
        txt = "import os\n" + txt
    txt = txt.replace(marker, SPEC_FILTER % (SYSTEM_LIBS,) + marker, 1)
    spec.write_text(txt, encoding="utf-8")
    return spec


def run(cmd: list[str], dry: bool) -> None:
    print("\n$ " + " ".join(f'"{c}"' if " " in c else c for c in cmd) + "\n")
    if not dry:
        subprocess.run(cmd, check=True, cwd=HERE)


def ensure_pyinstaller(dry: bool) -> None:
    try:
        import PyInstaller  # noqa: F401
    except ImportError:
        print("[*] Instalando PyInstaller...")
        run([sys.executable, "-m", "pip", "install", "pyinstaller"], dry)


def build(name: str, cfg: dict, dry: bool, keep: bool) -> Path:
    entry = HERE / cfg["entry"]
    if not entry.exists():
        sys.exit(f"[ERROR] No existe {entry}")

    # Carpeta temporal fuera del proyecto: no quedan build/ ni dist/ por ahi
    cache = Path.home() / ".cache" / "azumod-build"   # no /tmp: suele ser RAM
    cache.mkdir(parents=True, exist_ok=True)
    tmp = Path(tempfile.mkdtemp(prefix="azumod-build-", dir=cache))
    work = tmp / "build"
    dist = tmp / "dist"
    build_opts = ["--noconfirm", "--clean", "--distpath", str(dist), "--workpath", str(work)]
    cmd = [
        "--name", name,
        "--specpath", str(work),
        "--paths", str(HERE),
        "--collect-all", "webview",          # js/dll/recursos de pywebview
    ]
    if IS_MAC:
        # En macOS --onefile + --windowed esta deprecado: se hace un .app (onedir)
        cmd += ["--windowed", "--onedir", "--hidden-import", "webview.platforms.cocoa"]
        icns = HERE / cfg.get("icon_mac", "")
        if cfg.get("icon_mac") and icns.exists():
            cmd += ["--icon", str(icns)]
    elif IS_WIN:
        cmd += ["--onefile", "--windowed"]   # sin consola negra
        icon = HERE / cfg.get("icon_win", "")
        if cfg.get("icon_win") and icon.exists():
            cmd += ["--icon", str(icon)]
    else:
        cmd += ["--onefile", "--hidden-import", "webview.platforms.qt", "--hidden-import", "qtpy"]
        # Evita meter en el ejecutable bindings que no se usan (PySide6, GTK, Tk...):
        # sin esto el .pkg pesa varios GB y el empaquetado parece colgado.
        for m in ("PySide6", "PySide2", "PyQt5", "tkinter", "gi"):
            cmd += ["--exclude-module", m]
        os.environ["QT_API"] = "pyqt6"

    for f in cfg["data_files"]:
        if (HERE / f).is_file():
            cmd += ["--add-data", f"{HERE / f}{os.pathsep}."]
        else:
            print(f"[aviso] no esta {f}, se omite")
    heavy = cfg.get("heavy_dirs", []) if "--full" in sys.argv else []
    if not heavy and cfg.get("heavy_dirs"):
        print(f"[*] Build liviano: {', '.join(cfg['heavy_dirs'])} NO van en el ejecutable (usa --full para incluirlas)")
    for d in list(cfg["data_dirs"]) + list(heavy):
        if d == "ffdec" and not (HERE / d / "ffdec.jar").is_file():
            print("[aviso] ffdec/ffdec.jar no esta, no se incluye FFDec en el ejecutable")
            continue
        if (HERE / d).is_dir():
            cmd += ["--add-data", f"{HERE / d}{os.pathsep}{d}"]
    for h in cfg["hidden_imports"]:
        if h.startswith("App") and not (HERE / f"{h}.py").exists():
            continue                         # modulo propio que no esta en la carpeta
        cmd += ["--hidden-import", h]

    jre = prepare_jre(dry)
    if jre is not None:
        hook = tmp / "rthook_java.py"
        hook.write_text(RUNTIME_HOOK, encoding="utf-8")
        cmd += ["--add-data", f"{jre}{os.pathsep}jre", "--runtime-hook", str(hook)]

    cmd.append(str(entry))
    py = [sys.executable, "-m", "PyInstaller"]
    if IS_WIN or IS_MAC:
        run(py + build_opts + cmd, dry)
    else:
        # Linux: con .spec para poder sacar libstdc++/libgcc del bundle
        work.mkdir(parents=True, exist_ok=True)
        spec = make_spec(cmd, work, name, dry)
        run(py + build_opts + [str(spec)], dry)
    if dry:
        shutil.rmtree(tmp, ignore_errors=True)

    exe = dist / (name + (".exe" if IS_WIN else (".app" if IS_MAC else "")))
    out_dir = HERE / "Ejecutables"
    final = out_dir / f"{name}{FINAL_SUFFIX}{'.exe' if IS_WIN else ('.zip' if IS_MAC else '')}"
    if not dry:
        if not exe.exists():
            sys.exit(f"[ERROR] PyInstaller no genero {exe}")
        out_dir.mkdir(exist_ok=True)
        if IS_MAC:
            # ditto conserva permisos y firma del .app (zip normal los rompe)
            subprocess.run(["ditto", "-c", "-k", "--keepParent", str(exe), str(final)], check=True)
        else:
            shutil.copy2(exe, final)
        if not IS_WIN and not IS_MAC:
            final.chmod(final.stat().st_mode | 0o111)
        if keep:
            print(f"[*] Temporales conservados en {tmp}")
        else:
            shutil.rmtree(tmp, ignore_errors=True)
        print(f"\n[OK] Ejecutable: {final}")
    return final


def main() -> None:
    dry = "--dry-run" in sys.argv
    keep = "--keep" in sys.argv
    ensure_pyinstaller(dry)
    for name, cfg in APPS.items():
        build(name, cfg, dry, keep)


if __name__ == "__main__":
    main()
