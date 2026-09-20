"""
AppConfig.py
------------
Fuente unica de la carpeta de Brawlhalla que el usuario indica a mano
(desde el boton de ajustes de la app, el engranaje en el header).

Si esta guardada, TODOS los scripts la usan: AppCodeInstaller.
find_brawlhalla_dir() la revisa primero, antes de cualquier
autodeteccion (Steam/Epic/libraryfolders.vdf/barrido de unidades). Como
AppRelinker.py, AppUpdater.py y AppLauncher.py resuelven la carpeta del
juego llamando (directa o indirectamente) a find_brawlhalla_dir(), no
hace falta tocar cada script por separado: guardar la ruta una vez ahi
alcanza para que la usen todos.

Se guarda en el mismo AppData\\AzuModification que ya usa AppLauncher.py
para installed_schemes.json, en un archivo aparte (config.json) para no
mezclar datos de configuracion con datos de colores instalados.
"""

from __future__ import annotations

import json
import os
from pathlib import Path


def get_config_dir() -> Path:
    """Misma carpeta que AppLauncher.get_data_dir() (AppData\\AzuModification
    en Windows, ~/AzuModification en otros sistemas). Se duplica aca en vez
    de importar AppLauncher.py para que scripts de consola (AppCodeInstaller,
    AppUpdater, AppRelinker) puedan leer la ruta guardada sin arrastrar la
    dependencia de pywebview que tiene AppLauncher.py."""
    base = os.getenv("APPDATA") or os.path.expanduser("~")
    path = Path(base) / "AzuModification"
    path.mkdir(parents=True, exist_ok=True)
    return path


def _config_file() -> Path:
    return get_config_dir() / "config.json"


def _read() -> dict:
    f = _config_file()
    if not f.exists():
        return {}
    try:
        return json.loads(f.read_text(encoding="utf-8"))
    except Exception:
        return {}


def get_saved_brawlhalla_path() -> Path | None:
    """Devuelve la carpeta que el usuario guardo a mano, o None si nunca
    guardo ninguna o si la que tenia guardada ya no existe (instalacion
    movida o desinstalada), para que el caller vuelva a autodetectar o
    se lo vuelva a pedir."""
    raw = _read().get("brawlhalla_dir")
    if not raw:
        return None
    p = Path(raw)
    return p if p.is_dir() else None


def set_brawlhalla_path(path) -> None:
    """Guarda la carpeta a mano. No valida que sea Brawlhalla de verdad;
    eso lo hace el caller (AppLauncher.py) antes de llamar a esto."""
    data = _read()
    data["brawlhalla_dir"] = str(path)
    _config_file().write_text(json.dumps(data, indent=2), encoding="utf-8")


def clear_brawlhalla_path() -> None:
    """Borra la ruta guardada a mano, para volver a la autodeteccion."""
    data = _read()
    if "brawlhalla_dir" in data:
        del data["brawlhalla_dir"]
        _config_file().write_text(json.dumps(data, indent=2), encoding="utf-8")
