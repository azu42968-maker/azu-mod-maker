from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent

BRAWLHALLA_DIR = Path(r"C:\Program Files (x86)\Steam\steamapps\common\Brawlhalla")

SWF_NAME = "UI_MainMenu.swf"
SWF_PATH = BRAWLHALLA_DIR / SWF_NAME

PCODE_DIR = SCRIPT_DIR / "export"
PCODE_FILE = PCODE_DIR / "MultiColorSwap.pcode"

TEAM_PCODE_FILE = PCODE_DIR / "TeamColorSwap.pcode"

CLASS_NAME = "a_BattlePassSplashArtButton"

TEAM_CLASS_NAME = CLASS_NAME

CONSTRUCTOR_SIGNATURE = f"public function {CLASS_NAME}("

FFDEC_CANDIDATES = [
    r"C:\Program Files (x86)\FFDec\ffdec.bat",
    r"C:\Program Files\FFDec\ffdec.bat",
    r"C:\FFDec\ffdec.bat",
    str(SCRIPT_DIR / "ffdec" / "ffdec.bat"),
    str(SCRIPT_DIR / "tools" / "ffdec" / "ffdec.bat"),
]


class InjectError(Exception):
    pass


def find_ffdec(explicit: str | None) -> str:
    if explicit:
        p = Path(explicit)
        if p.exists():
            return str(p)
        raise InjectError(f"No se encontró FFDec en la ruta indicada: {explicit}")

    for name in ("ffdec.bat", "ffdec-cli.exe", "ffdec"):
        found = shutil.which(name)
        if found:
            return found

    for candidate in FFDEC_CANDIDATES:
        if Path(candidate).exists():
            return candidate

    for letter in _all_drive_letters():
        root = Path(f"{letter}:\\")
        try:
            for entry in root.iterdir():
                if entry.is_dir() and entry.name.lower().startswith("ffdec"):
                    for exe_name in ("ffdec.bat", "ffdec.exe"):
                        exe = entry / exe_name
                        if exe.exists():
                            return str(exe)
        except (PermissionError, OSError):
            continue

    raise InjectError(
        "No pude encontrar FFDec automáticamente. Instálalo o pasa la ruta "
        "manualmente (ffdec_path)."
    )


def run_ffdec(ffdec_path: str, args: list[str]) -> subprocess.CompletedProcess:
    cmd = [ffdec_path] + args
    print("[*] Ejecutando:", " ".join(f'"{a}"' if " " in a else a for a in cmd))
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.stdout.strip():
        print(result.stdout.strip())
    if result.stderr.strip():
        print(result.stderr.strip())
    return result


def _find_as_file(tmp_dir: Path, class_name: str):
    for f in tmp_dir.rglob("*.as"):
        if f.stem == class_name:
            return f
    return None


def get_method_body_index(ffdec_path: str, swf_path: Path, class_name: str) -> int:
    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        base = ["-config", "showMethodBodyId=true"]
        r1 = run_ffdec(
            ffdec_path,
            base + ["-selectclass", class_name, "-export", "script", str(tmp_dir), str(swf_path)],
        )
        as_file = _find_as_file(tmp_dir, class_name)

        r2 = None
        if as_file is None:
            print("[*] -selectclass no exporto nada, reintentando con export completo...")
            full_dir = tmp_dir / "full"
            full_dir.mkdir()
            r2 = run_ffdec(
                ffdec_path,
                base + ["-onerror", "ignore", "-export", "script", str(full_dir), str(swf_path)],
            )
            as_file = _find_as_file(full_dir, class_name)

        if as_file is None:
            all_as = list(tmp_dir.rglob("*.as"))
            similar = sorted({f.stem for f in all_as if "battlepass" in f.stem.lower() or "splashart" in f.stem.lower()})[:10]
            out = ((r2 or r1).stdout or "") + "\n" + ((r2 or r1).stderr or "")
            tail = "\n".join([ln for ln in out.splitlines() if ln.strip()][-6:])
            raise InjectError(
                f"No se encontró el .as exportado para la clase {class_name} "
                f"(SWF: {swf_path}, scripts exportados: {len(all_as)}, "
                f"código FFDec: {(r2 or r1).returncode}). "
                + (f"Clases parecidas: {', '.join(similar)}. " if similar else
                   "No hay ninguna clase parecida: el juego pudo haber renombrado/quitado la clase (actualizá con 'Update Color Values'). ")
                + (f"Salida de FFDec: {tail}" if tail else "FFDec no imprimió nada (¿Java instalado / SWF válido?).")
            )

        content = as_file.read_text(encoding="utf-8", errors="replace")

        constructor_signature = f"public function {class_name}("
        idx = content.find(constructor_signature)
        if idx == -1:
            raise InjectError(
                f"No se encontró el constructor '{constructor_signature}' en el .as exportado."
            )

        snippet = content[idx: idx + 400]
        match = re.search(r"method body index:\s*(\d+)", snippet)
        if not match:
            raise InjectError(
                "No se encontró el comentario 'method body index' cerca del constructor."
            )

        return int(match.group(1))


def replace_method_body(
    ffdec_path: str, swf_in: Path, swf_out: Path, class_name: str,
    pcode_file: Path, method_body_index: int
) -> None:
    result = run_ffdec(
        ffdec_path,
        [
            "-replace",
            str(swf_in),
            str(swf_out),
            class_name,
            str(pcode_file),
            str(method_body_index),
        ],
    )
    if result.returncode != 0:
        raise InjectError("FFDec devolvió un error al reemplazar el pcode.")


def _steam_library_paths() -> list[Path]:
    vdf_candidates = [
        Path(r"C:\Program Files (x86)\Steam\steamapps\libraryfolders.vdf"),
        Path(r"C:\Program Files\Steam\steamapps\libraryfolders.vdf"),
    ]
    paths = []
    for vdf in vdf_candidates:
        if not vdf.exists():
            continue
        try:
            text = vdf.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        for m in re.finditer(r'"path"\s*"([^"]+)"', text):
            raw = m.group(1).replace("\\\\", "\\")
            paths.append(Path(raw))
    return paths


def _all_drive_letters() -> list[str]:
    import string
    drives = []
    for letter in string.ascii_uppercase:
        if Path(f"{letter}:\\").exists():
            drives.append(letter)
    return drives


def find_brawlhalla_dir() -> Path | None:
    try:
        import AppConfig
        saved = AppConfig.get_saved_brawlhalla_path()
        if saved is not None:
            return saved
    except Exception:
        pass

    candidates = [
        Path(r"C:\Program Files (x86)\Steam\steamapps\common\Brawlhalla"),
        Path(r"C:\Program Files\Steam\steamapps\common\Brawlhalla"),
        Path(r"C:\Program Files\Epic Games\Brawlhalla"),
        Path(r"C:\Program Files (x86)\Epic Games\Brawlhalla"),
    ]
    for c in candidates:
        if c.exists():
            return c

    for lib in _steam_library_paths():
        c = lib / "steamapps" / "common" / "Brawlhalla"
        if c.exists():
            return c

    for letter in _all_drive_letters():
        for sub in (
            r"SteamLibrary\steamapps\common\Brawlhalla",
            r"Steam\steamapps\common\Brawlhalla",
            r"Epic Games\Brawlhalla",
        ):
            c = Path(f"{letter}:\\{sub}")
            if c.exists():
                return c

    return None


def find_brawlhalla_swf() -> Path | None:
    game_dir = find_brawlhalla_dir()
    if game_dir is None:
        return None
    swf = game_dir / SWF_NAME
    return swf if swf.exists() else None


def inject_multicolor_swap(
    pcode_path,
    ffdec_path=None,
    swf_path=None,
    class_name=CLASS_NAME,
    make_backup=True,
    log=print,
):
    pcode_path = Path(pcode_path)
    if not pcode_path.exists():
        raise InjectError(f"No se encontró el pcode a inyectar: {pcode_path}")

    resolved_ffdec = find_ffdec(ffdec_path)

    if swf_path:
        resolved_swf = Path(swf_path)
    else:
        resolved_swf = find_brawlhalla_swf()
        if resolved_swf is None:
            raise InjectError(
                "No pude encontrar UI_MainMenu.swf automaticamente (Steam/Epic). "
                "Indica la ruta de instalacion de Brawlhalla a mano."
            )

    if not resolved_swf.exists():
        raise InjectError(f"No se encontró el SWF: {resolved_swf}")

    log(f"[*] SWF objetivo:   {resolved_swf}")
    log(f"[*] pcode fuente:   {pcode_path}")
    log(f"[*] Clase objetivo: {class_name}")

    log("[*] Detectando method body index del constructor...")
    body_index = get_method_body_index(resolved_ffdec, resolved_swf, class_name)
    log(f"[*] method body index encontrado: {body_index}")

    if make_backup:
        backup_path = resolved_swf.with_suffix(resolved_swf.suffix + ".bak")
        if not backup_path.exists():
            shutil.copy2(resolved_swf, backup_path)
            log(f"[*] Backup creado: {backup_path}")
        else:
            log(f"[*] Backup ya existía, no se sobrescribe: {backup_path}")

    tmp_out = resolved_swf.with_name(resolved_swf.stem + "_tmp_patched.swf")
    if tmp_out.exists():
        tmp_out.unlink()

    log("[*] Reemplazando pcode del constructor...")
    replace_method_body(resolved_ffdec, resolved_swf, tmp_out, class_name, pcode_path, body_index)

    if not tmp_out.exists():
        raise InjectError("FFDec no generó el archivo de salida. Revisa el log de arriba.")

    shutil.move(str(tmp_out), str(resolved_swf))
    log(f"[OK] SWF parcheado guardado en: {resolved_swf}")
    return str(resolved_swf)


def inject_team_color_swap(
    pcode_path,
    ffdec_path=None,
    swf_path=None,
    class_name=None,
    make_backup=True,
    log=print,
):
    resolved_class = class_name or TEAM_CLASS_NAME
    if not resolved_class:
        raise InjectError(
            "Todavia no esta configurada la clase objetivo para team colors "
            "(TEAM_CLASS_NAME esta vacio en AppCodeInstaller.py). Completala "
            "con el nombre de la clase donde vive el metodo de team colors, "
            "o pasa class_name a mano."
        )

    pcode_path = Path(pcode_path)
    if not pcode_path.exists():
        raise InjectError(f"No se encontró el pcode a inyectar: {pcode_path}")

    resolved_ffdec = find_ffdec(ffdec_path)

    if swf_path:
        resolved_swf = Path(swf_path)
    else:
        resolved_swf = find_brawlhalla_swf()
        if resolved_swf is None:
            raise InjectError(
                "No pude encontrar UI_MainMenu.swf automaticamente (Steam/Epic). "
                "Indica la ruta de instalacion de Brawlhalla a mano."
            )

    if not resolved_swf.exists():
        raise InjectError(f"No se encontró el SWF: {resolved_swf}")

    log(f"[*] SWF objetivo:   {resolved_swf}")
    log(f"[*] pcode fuente:   {pcode_path}")
    log(f"[*] Clase objetivo: {resolved_class}")

    log("[*] Detectando method body index del constructor...")
    body_index = get_method_body_index(resolved_ffdec, resolved_swf, resolved_class)
    log(f"[*] method body index encontrado: {body_index}")

    if make_backup:
        backup_path = resolved_swf.with_suffix(resolved_swf.suffix + ".bak")
        if not backup_path.exists():
            shutil.copy2(resolved_swf, backup_path)
            log(f"[*] Backup creado: {backup_path}")
        else:
            log(f"[*] Backup ya existía, no se sobrescribe: {backup_path}")

    tmp_out = resolved_swf.with_name(resolved_swf.stem + "_tmp_team_patched.swf")
    if tmp_out.exists():
        tmp_out.unlink()

    log("[*] Reemplazando pcode del constructor (team colors)...")
    replace_method_body(resolved_ffdec, resolved_swf, tmp_out, resolved_class, pcode_path, body_index)

    if not tmp_out.exists():
        raise InjectError("FFDec no generó el archivo de salida. Revisa el log de arriba.")

    shutil.move(str(tmp_out), str(resolved_swf))
    log(f"[OK] SWF parcheado (team colors) guardado en: {resolved_swf}")
    return str(resolved_swf)


def main():
    parser = argparse.ArgumentParser(description="Inyecta MultiColorSwap.pcode o TeamColorSwap.pcode en el SWF")
    parser.add_argument("--ffdec", help="Ruta a ffdec.bat / ffdec-cli.exe / ffdec.jar", default=None)
    parser.add_argument("--swf", help="Ruta al SWF de entrada", default=str(SWF_PATH))
    parser.add_argument(
        "--mode",
        choices=["multicolor", "team"],
        default="multicolor",
        help='"multicolor" (default) inyecta MultiColorSwap.pcode en CLASS_NAME; '
             '"team" inyecta TeamColorSwap.pcode en TEAM_CLASS_NAME.',
    )
    parser.add_argument("--pcode", help="Ruta al archivo .pcode de reemplazo (sobreescribe el default del --mode elegido)", default=None)
    parser.add_argument("--class-name", help="Clase objetivo (sobreescribe el default del --mode elegido)", default=None)
    args = parser.parse_args()

    if args.mode == "team":
        pcode = args.pcode or str(TEAM_PCODE_FILE)
        class_name = args.class_name or TEAM_CLASS_NAME
        inject_fn = inject_team_color_swap
    else:
        pcode = args.pcode or str(PCODE_FILE)
        class_name = args.class_name or CLASS_NAME
        inject_fn = inject_multicolor_swap

    try:
        inject_fn(
            pcode_path=pcode,
            ffdec_path=args.ffdec,
            swf_path=args.swf,
            class_name=class_name,
            log=print,
        )
    except InjectError as e:
        print(f"[!] {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
