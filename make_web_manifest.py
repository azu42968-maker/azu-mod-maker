#!/usr/bin/env python3
"""
make_web_manifest.py -- genera web_manifest.json (hashes de la interfaz web).

Correlo ANTES de cada commit/push que toque index.html, app.js, styles.css o
codemirror.bundle.js. AppWebSync.py compara contra este archivo para saber si hay
algo nuevo que descargar:

    python3 make_web_manifest.py
    git add web_manifest.json index.html app.js styles.css codemirror.bundle.js
    git commit -m "web: ..." && git push
"""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
WEB_FILES = ("index.html", "app.js", "styles.css", "codemirror.bundle.js")


def sha(path: Path) -> str:
    # Mismo criterio que AppWebSync._sha_file: CRLF -> LF
    return hashlib.sha256(path.read_bytes().replace(b"\r\n", b"\n")).hexdigest()


def main() -> None:
    files = {}
    for name in WEB_FILES:
        p = HERE / name
        if not p.is_file():
            raise SystemExit(f"[ERROR] Falta {name}")
        files[name] = sha(p)
    version = hashlib.sha256("".join(files[n] for n in WEB_FILES).encode()).hexdigest()[:10]
    out = HERE / "web_manifest.json"
    out.write_text(json.dumps({"version": version, "files": files}, indent=2) + "\n", encoding="utf-8")
    print(f"[OK] {out.name}  version {version}")


if __name__ == "__main__":
    main()
