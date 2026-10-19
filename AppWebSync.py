"""
AppWebSync.py  --  version minima (stub) para poder arrancar en Linux.

El AppWebSync.py original (el que sincroniza la web desde GitHub) no estaba en
la carpeta. Esta version NO descarga nada: la app usa el index.html / app.js
locales y el auto-update de la web queda desactivado.

Si pones aqui el AppWebSync.py original adaptado a Linux, reemplaza a este.
Interfaz que usa AppLauncher.py: seed(), web_path(rel), sync(log), current_version(), enabled().
"""
from __future__ import annotations

import os
import sys


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


def enabled() -> bool:
    return False


def current_version() -> str:
    return "local"


def seed() -> None:
    """Sin nada que sembrar: se usan los archivos locales."""
    return None


def web_path(relative_path: str):
    """Devuelve la ruta sincronizada si existe; None -> AppLauncher usa la carpeta local."""
    candidate = os.path.join(_engine_dir(), relative_path)
    return candidate if os.path.exists(candidate) else None


def sync(log=print) -> dict:
    return {"ok": True, "status": "disabled", "version": current_version()}
