#!/usr/bin/env python3
"""make_release.py — prepara una actualizacion para AppSelfUpdate.

Uso interactivo (te pregunta de a uno):
    py make_release.py

Uso directo:
    py make_release.py 1.0.1 --notes "Fix en el export de SVG"

Copia los archivos actualizables a ./update, escribe update/manifest.json (con sha256 de
cada uno) y deja un .gitattributes para que git no cambie los saltos de linea (si lo hiciera,
el hash del repo no coincidiria con el del manifest). Despues: subir_a_github.bat.

Por defecto publica la web + AppPublic.py, AppConfig.py y AppSync.py. AppAllInOne.py (build privado)
solo si lo agregas como archivo extra.
"""
import argparse
import hashlib
import json
import re
import shutil
import sys
from pathlib import Path

WEB_FILES = ["index.html", "app.js", "styles.css", "codemirror.bundle.js"]
# Modulos que SI se pueden actualizar sin .exe nuevo.
DEFAULT_PY = ["AppPublic.py", "AppConfig.py", "AppSync.py"]
# Estos nunca se publican (el launcher los rechazaria): ver NEVER_UPDATE en AppSelfUpdate.py.
NEVER = {"AppLauncher.py", "AppSelfUpdate.py", "AppCodeInstaller.py", "AppRelinker.py",
         "AppUpdater.py", "AppAutoPatch.py"}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def vkey(version: str):
    return tuple(int(x) for x in re.findall(r"\d+", version or "0")) or (0,)


def ask(prompt: str, default: str = "") -> str:
    suffix = f" [{default}]" if default else ""
    try:
        answer = input(f"{prompt}{suffix}: ").strip()
    except EOFError:
        answer = ""
    return answer or default


def ask_yes_no(prompt: str, default: bool) -> bool:
    hint = "S/n" if default else "s/N"
    while True:
        answer = ask(f"{prompt} ({hint})").lower()
        if not answer:
            return default
        if answer in ("s", "si", "sí", "y", "yes"):
            return True
        if answer in ("n", "no"):
            return False
        print("  Responde s o n.")


def current_version(out: Path) -> str:
    try:
        return str(json.loads((out / "manifest.json").read_text(encoding="utf-8")).get("version", ""))
    except Exception:
        return ""


def launcher_api(src: Path) -> int:
    try:
        text = (src / "AppSelfUpdate.py").read_text(encoding="utf-8")
        return int(re.search(r"^LAUNCHER_API\s*=\s*(\d+)", text, re.M).group(1))
    except Exception:
        return 1


def interactive(src: Path, out: Path):
    print("=== Nueva version de Azu Modification ===\n")

    published = current_version(out)
    if published:
        parts = published.split(".")
        parts[-1] = str(int(parts[-1]) + 1)
        suggestion = ".".join(parts)
        print(f"Version publicada actualmente: {published}")
    else:
        suggestion = "1.0.0"
        print("Todavia no hay ninguna version publicada.")

    while True:
        version = ask("1) Numero de version", suggestion)
        if not re.fullmatch(r"\d+(\.\d+)*", version):
            print("  Tiene que ser tipo 1.0.1 (solo numeros separados por puntos).")
        elif published and vkey(version) <= vkey(published):
            print(f"  Tiene que ser MAYOR que {published}, si no los usuarios no la reciben.")
        else:
            break

    notes = ask("2) Notas de la version (Enter para dejarlo vacio)")

    min_launcher = 1
    if ask_yes_no("3) ¿Esta version necesita que los usuarios bajen un .exe nuevo?", False):
        min_launcher = launcher_api(src) + 1

    include = []
    print("4) Archivos extra a publicar (nombre del archivo, Enter cuando no haya mas)")
    while True:
        name = ask("   Archivo")
        if not name:
            break
        if name in NEVER:
            print("   No se puede: ese archivo va dentro del .exe.")
        elif not (src / name).is_file():
            print("   No existe en esta carpeta.")
        elif name in include:
            print("   Ya lo agregaste.")
        else:
            include.append(name)

    print(f"\nResumen: version {version}"
          + (f", notas: {notes}" if notes else "")
          + (", requiere .exe nuevo" if min_launcher > 1 else "")
          + (f", extras: {', '.join(include)}" if include else ""))
    if not ask_yes_no("¿Crear la version?", True):
        print("Cancelado.")
        return None
    return version, notes, min_launcher, include


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("version", nargs="?", help="ej. 1.0.1 (si lo omites, te pregunta de a uno)")
    ap.add_argument("--notes", default="")
    ap.add_argument("--src", default=".", help="carpeta con los archivos fuente")
    ap.add_argument("--out", default="update", help="carpeta de salida (la que se sube al repo)")
    ap.add_argument("--min-launcher", type=int, default=1,
                    help="min_launcher_api: sube esto si la version requiere un .exe nuevo")
    ap.add_argument("--include", nargs="*", default=[], help="archivos extra a publicar")
    ap.add_argument("--exclude", nargs="*", default=[], help="archivos a omitir")
    args = ap.parse_args()

    src, out = Path(args.src).resolve(), Path(args.out).resolve()

    if args.version is None:
        result = interactive(src, out)
        if result is None:
            return 0
        version, notes, min_launcher, include = result
    else:
        version, notes, min_launcher, include = args.version, args.notes, args.min_launcher, args.include
        if not re.fullmatch(r"\d+(\.\d+)*", version):
            print("La version debe ser tipo 1.0.1")
            return 1

    names = [n for n in WEB_FILES if (src / n).is_file()]
    names += [n for n in DEFAULT_PY if (src / n).is_file()]
    bad = [n for n in include if n in NEVER]
    if bad:
        print("No se pueden publicar (van dentro del .exe):", ", ".join(bad))
        return 1
    names += [n for n in include if n not in names]
    names = [n for n in names if n not in set(args.exclude)]

    missing = [n for n in names if not (src / n).is_file()]
    if missing:
        print("No existen:", ", ".join(missing))
        return 1
    if not names:
        print("No hay archivos para publicar.")
        return 1

    for name in names:
        if name.endswith(".py"):
            try:
                compile((src / name).read_bytes(), name, "exec")
            except SyntaxError as e:
                print(f"Error de sintaxis en {name}: {e}")
                return 1

    out.mkdir(parents=True, exist_ok=True)
    for old in out.iterdir():
        if old.is_file() and old.name not in names and old.name != ".gitattributes":
            old.unlink()
    for name in names:
        shutil.copy2(src / name, out / name)

    manifest = {
        "version": version,
        "min_launcher_api": min_launcher,
        "notes": notes,
        "files": {name: sha256(out / name) for name in names},
    }
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    (out / ".gitattributes").write_text("* -text\n", encoding="utf-8")

    print(f"\nVersion {version} -> {out}")
    for name in names:
        print("  ", name)
    print("\nSiguiente paso: ejecuta subir_a_github.bat para publicarla.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
