#!/usr/bin/env python3
"""
build_exe.py -- genera el ejecutable de AzuModification para el sistema donde lo corras.

  Linux   : python3 build_exe.py   ->  Ejecutables/AzuModificationLin
  Windows : python build_exe.py    ->  Ejecutables/AzuModificationWin.exe
  macOS   : python3 build_exe.py   ->  Ejecutables/AzuModificationMac.zip  (contiene el .app)

PyInstaller NO compila de un sistema a otro: el .exe de Windows se hace en Windows
(o en GitHub Actions, ver .github/workflows/build.yml, que construye los dos solo).

Opciones:  --dry-run  (solo muestra el comando)   --keep  (conserva la carpeta temporal de PyInstaller)
Para agregar otra app, anade una entrada a APPS.
"""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

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
        # Carpetas completas
        "data_dirs": ["PreRenders", "SpriteTypes"],
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
    cmd = [
        sys.executable, "-m", "PyInstaller", "--noconfirm", "--clean",
        "--name", name,
        "--distpath", str(dist), "--workpath", str(work), "--specpath", str(work),
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
    for d in cfg["data_dirs"]:
        if (HERE / d).is_dir():
            cmd += ["--add-data", f"{HERE / d}{os.pathsep}{d}"]
    for h in cfg["hidden_imports"]:
        if h.startswith("App") and not (HERE / f"{h}.py").exists():
            continue                         # modulo propio que no esta en la carpeta
        cmd += ["--hidden-import", h]

    cmd.append(str(entry))
    run(cmd, dry)
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
