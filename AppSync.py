"""
AppSync.py  --  Azu Modification
--------------------------------
Mantiene PreRenders/ y SpriteTypes/ al dia descargandolos desde GitHub en vez
de empaquetarlos dentro del .exe.

  * Incremental: compara el commit remoto con el guardado y baja SOLO archivos
    nuevos o modificados (desde raw.githubusercontent.com fijado al SHA del
    commit, asi no hay cache vieja). Cada archivo se verifica con su SHA de git.
  * Nunca pisa archivos propios: si en disco ya hay un archivo con ese nombre
    que no instalo este modulo y su contenido es distinto, lo deja como esta.
    (Si es identico al del repo, por ejemplo uno que venia en un .exe viejo, lo
    adopta sin volver a descargarlo.)
  * Solo borra lo que el propio modulo instalo y que ya no existe en el repo.
  * Sin conexion / rate limit / error: falla en silencio, la app sigue igual.

Solo libreria estandar.
"""
from __future__ import annotations

import hashlib
import json
import os
import threading
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path, PurePosixPath

OWNER = "azu42968-maker"
REPO = "azu-mod-maker"
BRANCH = "main"

_API = f"https://api.github.com/repos/{OWNER}/{REPO}"
_RAW = f"https://raw.githubusercontent.com/{OWNER}/{REPO}"
_ALLOWED_HOSTS = ("api.github.com", "raw.githubusercontent.com")
_UA = "AzuModification-Sync/1.0"
MAX_FILE_BYTES = 50 * 1024 * 1024
TIMEOUT = 30


class SyncError(Exception):
    pass


def _git_blob_sha(data: bytes) -> str:
    h = hashlib.sha1()
    h.update(b"blob %d\0" % len(data))
    h.update(data)
    return h.hexdigest()


def _http_get(url: str, accept: str | None = None) -> bytes:
    host = url.split("/")[2]
    if not url.startswith("https://") or host not in _ALLOWED_HOSTS:
        raise SyncError(f"Host no permitido: {host}")
    headers = {"User-Agent": _UA}
    if accept:
        headers["Accept"] = accept
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=TIMEOUT) as r:
            return r.read(MAX_FILE_BYTES + 1)
    except urllib.error.HTTPError as e:
        if e.code in (403, 429):
            raise SyncError("GitHub limito las consultas (rate limit); se reintenta en el proximo arranque.") from e
        raise SyncError(f"GitHub respondio {e.code} para {url}") from e
    except urllib.error.URLError as e:
        raise SyncError(f"Sin conexion a GitHub: {e.reason}") from e


class ContentSync:
    """prerenders_dir / sprite_types_dir: carpetas destino (las mismas que lee
    AppLauncher). state_dir: donde se guarda el manifest."""

    def __init__(self, prerenders_dir, sprite_types_dir, state_dir):
        self.roots = {"PreRenders": Path(prerenders_dir), "SpriteTypes": Path(sprite_types_dir)}
        self.state_dir = Path(state_dir)
        self.state_dir.mkdir(parents=True, exist_ok=True)
        self.manifest_path = self.state_dir / "content_manifest.json"
        self._lock = threading.Lock()

    # ---- manifest ----
    def _load(self) -> dict:
        try:
            return json.loads(self.manifest_path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return {"commit": None, "files": {}}

    def _save(self, m: dict) -> None:
        tmp = self.manifest_path.with_suffix(".tmp")
        tmp.write_text(json.dumps(m, indent=1), encoding="utf-8")
        os.replace(tmp, self.manifest_path)

    # ---- repo path -> disco (None = ignorar) ----
    def _dest_for(self, repo_path: str) -> Path | None:
        p = PurePosixPath(repo_path)
        if p.is_absolute() or ".." in p.parts or len(p.parts) < 2 or p.parts[0] not in self.roots:
            return None
        root = self.roots[p.parts[0]]
        dest = root.joinpath(*p.parts[1:])
        try:
            dest.resolve().relative_to(root.resolve())
        except ValueError:
            return None
        return dest

    # ---- GitHub ----
    def _remote_commit(self) -> str:
        sha = _http_get(f"{_API}/commits/{BRANCH}", accept="application/vnd.github.sha")
        sha = sha.decode("ascii", "ignore").strip()
        if len(sha) != 40:
            raise SyncError("Respuesta inesperada de GitHub al consultar el commit.")
        return sha

    def _remote_files(self, commit: str) -> dict:
        data = json.loads(_http_get(f"{_API}/git/trees/{commit}?recursive=1"))
        if data.get("truncated"):
            raise SyncError("El arbol del repo es demasiado grande para listarlo de una vez.")
        return {e["path"]: {"sha": e["sha"], "size": e.get("size", 0)}
                for e in data.get("tree", [])
                if e.get("type") == "blob" and self._dest_for(e["path"]) is not None}

    def _plan(self, remote: dict, files: dict):
        """Devuelve (a_descargar, a_borrar). Adopta en `files` los archivos que
        ya estan en disco identicos al repo."""
        to_get = []
        for path, info in remote.items():
            dest = self._dest_for(path)
            if files.get(path) == info["sha"] and dest.exists():
                continue
            if path not in files and dest.exists():
                try:
                    same = _git_blob_sha(dest.read_bytes()) == info["sha"]
                except OSError:
                    same = False
                if same:
                    files[path] = info["sha"]          # ya estaba (ej. venia en un .exe viejo)
                # distinto y no es nuestro -> es del usuario, no se toca
                continue
            to_get.append(path)
        to_del = [p for p in files if p not in remote]
        return to_get, to_del

    # ---- API ----
    def sync(self, progress=None) -> dict:
        """Chequea y actualiza. Seguro de llamar en cada arranque (hilo aparte)."""
        if not self._lock.acquire(blocking=False):
            return {"ok": False, "message": "Ya hay una sincronizacion en curso."}
        try:
            m = self._load()
            files = dict(m.get("files", {}))
            commit = self._remote_commit()
            if commit == m.get("commit") and all(
                    (self._dest_for(p) is not None and self._dest_for(p).exists()) for p in files):
                return {"ok": True, "updated": 0, "removed": 0, "failed": [], "commit": commit}

            remote = self._remote_files(commit)
            to_get, to_del = self._plan(remote, files)
            total, done, failed = len(to_get), 0, []

            def fetch(path):
                dest = self._dest_for(path)
                data = _http_get(f"{_RAW}/{commit}/{path}")
                if len(data) > MAX_FILE_BYTES:
                    raise SyncError("supera el tamano maximo permitido")
                if _git_blob_sha(data) != remote[path]["sha"]:
                    raise SyncError("el contenido no coincide con el SHA esperado")
                dest.parent.mkdir(parents=True, exist_ok=True)
                tmp = dest.with_name(dest.name + ".part")
                tmp.write_bytes(data)
                os.replace(tmp, dest)

            with ThreadPoolExecutor(max_workers=4) as pool:
                futs = {pool.submit(fetch, p): p for p in to_get}
                for fut in as_completed(futs):
                    p = futs[fut]
                    try:
                        fut.result()
                        files[p] = remote[p]["sha"]
                    except Exception as e:
                        failed.append(f"{p}: {e}")
                    done += 1
                    if progress:
                        try:
                            progress(done, total, p)
                        except Exception:
                            pass

            removed = 0
            for p in to_del:                              # solo lo que instalo este modulo
                dest = self._dest_for(p)
                try:
                    if dest is not None and dest.is_file():
                        dest.unlink()
                        removed += 1
                except OSError:
                    pass
                files.pop(p, None)

            # con fallos NO avanzamos el commit: el proximo arranque reintenta lo que falte
            self._save({"commit": None if failed else commit, "files": files})
            return {"ok": not failed, "updated": total - len(failed), "removed": removed,
                    "failed": failed, "commit": commit}
        except SyncError as e:
            return {"ok": False, "message": str(e)}
        except Exception as e:                            # nunca debe romper la app
            return {"ok": False, "message": f"{type(e).__name__}: {e}"}
        finally:
            self._lock.release()
