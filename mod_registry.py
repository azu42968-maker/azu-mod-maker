"""
Keeps track of what each mod install changed inside the Brawlhalla folder,
so it can be undone later.

Mods overwrite game files in place, so before ANY file is written the
current version is copied into a backup store under AppData:

    %LOCALAPPDATA%\\AcidModLoader\\installed_mods.json   (the registry)
    %LOCALAPPDATA%\\AcidModLoader\\backups\\<mod id>\\<relative path>

Every install is one record: which files it touched, and for each one the
backup of what was there before (or None if the mod created the file).

Several mods can touch the same file. Records are kept in install order and
each backup holds "the file as it was right before this mod", which forms a
chain per file. Uninstalling the newest mod that touched a file restores its
backup; uninstalling an older one hands its backup to the next mod in the
chain, so the file keeps the newer mod's content and the newer mod will
still restore all the way back to the original later.
"""
from __future__ import annotations

import json
import shutil
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path

from appdirs import get_appdata_dir

REGISTRY_PATH = get_appdata_dir() / "installed_mods.json"
BACKUPS_DIR = get_appdata_dir() / "backups"

_lock = threading.RLock()
_local = threading.local()  # the tracker of the install running in this thread


# ---------------------------------------------------------------------
# Registry file
# ---------------------------------------------------------------------
def _load() -> dict:
    if REGISTRY_PATH.exists():
        try:
            data = json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))
            if isinstance(data, dict) and isinstance(data.get("mods"), list):
                return data
        except (OSError, json.JSONDecodeError):
            # Keep the unreadable file around instead of silently losing it.
            try:
                REGISTRY_PATH.replace(REGISTRY_PATH.with_suffix(".json.corrupt"))
            except OSError:
                pass
    return {"mods": []}


def _save(data: dict) -> None:
    tmp = REGISTRY_PATH.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.replace(REGISTRY_PATH)


# ---------------------------------------------------------------------
# Tracking while an install runs
# ---------------------------------------------------------------------
class Tracker:
    """Collects the backups for ONE install (one call to Api.install_mod)."""

    def __init__(self, root: Path):
        self.root = root
        self.mod_id = uuid.uuid4().hex[:12]
        self.files: dict[str, str | None] = {}  # rel path -> backup rel path | None
        self.created_dirs: list[str] = []       # rel paths, shallowest first

    def _rel(self, path: Path) -> str | None:
        try:
            return path.resolve().relative_to(self.root.resolve()).as_posix()
        except (ValueError, OSError):
            return None

    def before_write(self, dest: Path) -> None:
        rel = self._rel(dest)
        if rel is None or rel in self.files:
            return  # outside the game folder, or already backed up by this install

        # Folders that don't exist yet and will be created for this file.
        missing = []
        p = dest.parent
        while not p.exists() and p != p.parent:
            missing.append(p)
            p = p.parent
        for d in reversed(missing):
            d_rel = self._rel(d)
            if d_rel and d_rel not in self.created_dirs:
                self.created_dirs.append(d_rel)

        if dest.is_file():
            backup = BACKUPS_DIR / self.mod_id / rel
            backup.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(dest, backup)
            self.files[rel] = f"{self.mod_id}/{rel}"
        else:
            self.files[rel] = None  # the mod creates this file


def begin(root: Path) -> Tracker:
    tracker = Tracker(root)
    _local.tracker = tracker
    return tracker


def end() -> None:
    _local.tracker = None


def before_overwrite(dest: Path) -> None:
    """Call right before something else (e.g. FFDec) rewrites `dest`."""
    tracker = getattr(_local, "tracker", None)
    if tracker is not None:
        tracker.before_write(dest)


def write_bytes(dest: Path, data: bytes) -> None:
    """Drop-in for dest.write_bytes(data) that backs up the old file first
    and creates any missing parent folders."""
    before_overwrite(dest)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)


def commit(tracker: Tracker, name: str, source_url: str, filename: str, partial: bool = False) -> dict | None:
    """Saves the install as a registry record. Returns None (and cleans up)
    if the install didn't touch any file."""
    if not tracker.files:
        shutil.rmtree(BACKUPS_DIR / tracker.mod_id, ignore_errors=True)
        return None
    record = {
        "id": tracker.mod_id,
        "name": name,
        "filename": filename,
        "source": source_url,
        "installed_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "root": str(tracker.root),
        "partial": partial,
        "created_dirs": tracker.created_dirs,
        "files": [{"rel": rel, "backup": bk} for rel, bk in tracker.files.items()],
    }
    with _lock:
        data = _load()
        data["mods"].append(record)
        _save(data)
    return record


# ---------------------------------------------------------------------
# Queries
# ---------------------------------------------------------------------
def list_mods() -> list[dict]:
    """Newest first, trimmed down to what the UI needs."""
    with _lock:
        mods = _load()["mods"]
    return [
        {
            "id": m["id"],
            "name": m.get("name") or m.get("filename") or "(unnamed)",
            "filename": m.get("filename", ""),
            "source": m.get("source", ""),
            "installed_at": m.get("installed_at", ""),
            "file_count": len(m.get("files", [])),
            "partial": bool(m.get("partial")),
        }
        for m in reversed(mods)
    ]


def find_by_source(url: str) -> dict | None:
    with _lock:
        for m in _load()["mods"]:
            if m.get("source") == url:
                return m
    return None


# ---------------------------------------------------------------------
# Uninstall
# ---------------------------------------------------------------------
def _remove_empty_dirs(root: Path, rels: list[str]) -> None:
    for rel in sorted(rels, key=lambda r: r.count("/"), reverse=True):
        d = root / rel
        try:
            if d.is_dir() and not any(d.iterdir()):
                d.rmdir()
        except OSError:
            pass


def uninstall(mod_id: str, log) -> bool:
    """Restores the game files this mod changed. Returns True if the mod is
    fully gone. Files that couldn't be restored (e.g. the game is running and
    has them locked) stay in the record so the uninstall can be retried."""
    with _lock:
        data = _load()
        mods = data["mods"]
        idx = next((i for i, m in enumerate(mods) if m["id"] == mod_id), None)
        if idx is None:
            log("[X] That mod isn't in the installed list.")
            return False

        mod = mods[idx]
        later = mods[idx + 1:]
        root = Path(mod["root"])
        log(f"[i] Uninstalling: {mod.get('name')}")

        if not root.is_dir():
            log(f"[X] The Brawlhalla folder this mod was installed into no longer exists: {root}")
            return False

        failed: list[dict] = []
        kept_backups: set[str] = set()  # backups handed over to a later mod

        for f in mod["files"]:
            rel, backup = f["rel"], f.get("backup")
            dest = root / rel

            # Did a later mod overwrite this same file? Then leave the file as
            # it is and make that mod restore to what we would have restored.
            successor = None
            for m in later:
                successor = next((sf for sf in m["files"] if sf["rel"] == rel), None)
                if successor:
                    break
            if successor is not None:
                old = successor.get("backup")
                if old:
                    (BACKUPS_DIR / old).unlink(missing_ok=True)
                successor["backup"] = backup
                if backup:
                    kept_backups.add(backup)
                log(f"   OK {rel}  (kept: a newer mod also changes it)")
                continue

            try:
                if backup:
                    src = BACKUPS_DIR / backup
                    if not src.is_file():
                        log(f"   [!] {rel}: backup is missing, can't restore it. "
                            "Use Steam > Verify integrity of game files to get the original back.")
                        continue
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(src, dest)
                    log(f"   OK {rel}  (restored)")
                else:
                    dest.unlink(missing_ok=True)
                    log(f"   OK {rel}  (removed)")
            except OSError as e:
                log(f"   [X] {rel}: {e}")
                failed.append(f)

        # Backups still needed: handed to a later mod, or belonging to a file
        # that failed to restore.
        keep = kept_backups | {f["backup"] for f in failed if f.get("backup")}
        for f in mod["files"]:
            b = f.get("backup")
            if b and b not in keep:
                (BACKUPS_DIR / b).unlink(missing_ok=True)

        if failed:
            mod["files"] = failed
            _save(data)
            log(f"[X] {len(failed)} file(s) couldn't be restored - close Brawlhalla and try again.")
            return False

        _remove_empty_dirs(root, mod.get("created_dirs", []))
        mods.pop(idx)
        _save(data)

        mod_dir = BACKUPS_DIR / mod_id
        if mod_dir.is_dir():
            # Prune empty folders left behind; anything handed over stays.
            for d in sorted((p for p in mod_dir.rglob("*") if p.is_dir()),
                            key=lambda p: len(p.parts), reverse=True):
                try:
                    d.rmdir()
                except OSError:
                    pass
            try:
                mod_dir.rmdir()
            except OSError:
                pass

        log("[i] Done.")
        return True


def uninstall_all(log) -> tuple[int, int]:
    """Newest first, so overlapping mods unwind cleanly. Returns (removed, failed)."""
    ids = [m["id"] for m in list_mods()]  # already newest first
    removed = failed = 0
    for mod_id in ids:
        if uninstall(mod_id, log):
            removed += 1
        else:
            failed += 1
        log("")
    return removed, failed
