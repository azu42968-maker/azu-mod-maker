from __future__ import annotations

import json
import os
from pathlib import Path


def get_config_dir() -> Path:
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
    raw = _read().get("brawlhalla_dir")
    if not raw:
        return None
    p = Path(raw)
    return p if p.is_dir() else None


def set_brawlhalla_path(path) -> None:
    data = _read()
    data["brawlhalla_dir"] = str(path)
    _config_file().write_text(json.dumps(data, indent=2), encoding="utf-8")


def clear_brawlhalla_path() -> None:
    data = _read()
    if "brawlhalla_dir" in data:
        del data["brawlhalla_dir"]
        _config_file().write_text(json.dumps(data, indent=2), encoding="utf-8")
