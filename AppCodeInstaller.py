"""
AppCodeInstaller.py

Reemplaza el cuerpo completo del instance initializer de la clase
"a_BattlePassSplashArtButton" (dentro de UI_MainMenu.swf) por el pcode
exportado en export/MultiColorSwap.pcode, usando el CLI de FFDec.

Ademas soporta un segundo flujo, "team colors" (TeamRed1..4, TeamBlue1..4,
TeamYellow1..4, TeamPurple1..4): reemplaza el instance initializer de OTRA
clase (TEAM_CLASS_NAME, todavia sin completar mas abajo) por
export/TeamColorSwap.pcode, con la misma logica pero via
inject_team_color_swap().

Equivale a lo que se hace manualmente en la GUI de FFDec:
  1. Abrir el SWF
  2. Ir a la clase objetivo -> instance initializer (P-code)
  3. Borrar el pcode actual (getlocal0 / pushscope / getlocal0 / constructsuper 0 / returnvoid)
  4. Pegar el contenido del .pcode correspondiente
  5. Guardar

Requiere: FFDec instalado (ffdec.jar o ffdec.bat/ffdec-cli.exe) y Java en PATH.

Uso:
    python AppCodeInstaller.py
    python AppCodeInstaller.py --ffdec "C:\ruta\a\ffdec.bat"
    python AppCodeInstaller.py --mode team --class-name NombreDeLaClase
"""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

# ----------------------------------------------------------------------
# Configuración (ajustable)
# ----------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).resolve().parent

# Carpeta del juego (tal como la diste)
BRAWLHALLA_DIR = Path(r"C:\Program Files (x86)\Steam\steamapps\common\Brawlhalla")

# SWF objetivo dentro de esa carpeta
SWF_NAME = "UI_MainMenu.swf"
SWF_PATH = BRAWLHALLA_DIR / SWF_NAME

# pcode de reemplazo, dentro de la carpeta export/ junto al script
PCODE_DIR = SCRIPT_DIR / "export"
PCODE_FILE = PCODE_DIR / "MultiColorSwap.pcode"

# pcode de los team colors (TeamRed1..4, TeamBlue1..4, etc.), generado por
# AppAllInOne.build_merged_team_pcode()
TEAM_PCODE_FILE = PCODE_DIR / "TeamColorSwap.pcode"

# Clase objetivo (paquete por defecto -> solo el nombre de clase)
CLASS_NAME = "a_BattlePassSplashArtButton"

# Clase objetivo para el pcode de team colors: desde que AppAllInOne.py
# fusiona colores normales + team colors en UN solo pcode combinado
# (write_combined_pcode), este flujo tambien se inyecta en CLASS_NAME
# (a_BattlePassSplashArtButton) -- ya no en una clase separada, porque un
# solo constructor no puede tener dos pcodes instalados sin que el
# segundo pise al primero. inject_team_color_swap() se deja disponible
# para uso manual/standalone, pero el launcher ya no la llama.
TEAM_CLASS_NAME = CLASS_NAME

# Nombre del método buscado dentro de esa clase (constructor / instance initializer)
CONSTRUCTOR_SIGNATURE = f"public function {CLASS_NAME}("

# Ubicaciones típicas donde puede estar instalado FFDec en Windows
FFDEC_CANDIDATES = [
    r"C:\Program Files (x86)\FFDec\ffdec.bat",
    r"C:\Program Files\FFDec\ffdec.bat",
    r"C:\FFDec\ffdec.bat",
    str(SCRIPT_DIR / "ffdec" / "ffdec.bat"),
    str(SCRIPT_DIR / "tools" / "ffdec" / "ffdec.bat"),
]


# ----------------------------------------------------------------------
# Utilidades
# ----------------------------------------------------------------------

class InjectError(Exception):
    """Error de inyección que NO debe matar el proceso (a diferencia de
    sys.exit, que si esto corre dentro del launcher/.exe con GUI se
    llevaría puesta toda la app). El CLI (main()) la atrapa y recien ahi
    hace sys.exit; cualquier caller como AppAllInOne.py la atrapa el mismo
    y la reporta en el dict de resultado."""
    pass


def find_ffdec(explicit: str | None) -> str:
    """Localiza el ejecutable de FFDec (ffdec.bat / ffdec-cli.exe / ffdec.jar)."""
    if explicit:
        p = Path(explicit)
        if p.exists():
            return str(p)
        raise InjectError(f"No se encontró FFDec en la ruta indicada: {explicit}")

    # 1) PATH del sistema
    for name in ("ffdec.bat", "ffdec-cli.exe", "ffdec"):
        found = shutil.which(name)
        if found:
            return found

    # 2) Rutas típicas
    for candidate in FFDEC_CANDIDATES:
        if Path(candidate).exists():
            return candidate

    # 3) Barrido por todas las unidades, cualquier carpeta que empiece
    #    con "ffdec" (cubre versiones portables descomprimidas en D:, etc.)
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


def get_method_body_index(ffdec_path: str, swf_path: Path, class_name: str) -> int:
    """
    Exporta el script de la clase con los IDs de method body visibles
    (-config showMethodBodyId=true) y extrae el índice del constructor
    (instance initializer).
    """
    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        run_ffdec(
            ffdec_path,
            [
                "-config",
                "showMethodBodyId=true",
                "-selectclass",
                class_name,
                "-export",
                "script",
                str(tmp_dir),
                str(swf_path),
            ],
        )

        as_file = None
        for f in tmp_dir.rglob("*.as"):
            if f.stem == class_name:
                as_file = f
                break

        if as_file is None:
            raise InjectError(
                f"No se encontró el .as exportado para la clase {class_name}. "
                "Revisa que el nombre de la clase sea exacto (case-sensitive)."
            )

        content = as_file.read_text(encoding="utf-8", errors="replace")

        # Buscamos el constructor y el comentario de method body index que
        # FFDec agrega justo después de la firma, ej:
        #   public function a_BattlePassSplashArtButton()
        #   {
        #      // method body index: 2 method index: 2
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
    """Lee libraryfolders.vdf (donde Steam anota TODAS sus bibliotecas,
    en cualquier disco) y devuelve la lista de rutas base de cada una.
    Si no encuentra el archivo o falla el parseo, devuelve lista vacia
    (el caller sigue con los demas metodos de busqueda)."""
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
        # Cada biblioteca tiene una linea tipo:  "path"		"D:\\SteamLibrary"
        for m in re.finditer(r'"path"\s*"([^"]+)"', text):
            raw = m.group(1).replace("\\\\", "\\")
            paths.append(Path(raw))
    return paths


def _all_drive_letters() -> list[str]:
    """Devuelve las letras de unidad presentes en el sistema (Windows)."""
    import string
    drives = []
    for letter in string.ascii_uppercase:
        if Path(f"{letter}:\\").exists():
            drives.append(letter)
    return drives


def find_brawlhalla_dir() -> Path | None:
    """Busca la carpeta de instalacion de Brawlhalla. Orden de busqueda:
    0) Ruta guardada a mano por el usuario (boton de ajustes de la app,
       ver AppConfig.py). Si esta guardada y todavia existe, se usa esa
       y no se hace ninguna autodeteccion.
    1) Rutas fijas tipicas en C:\\ (Steam/Epic).
    2) Bibliotecas de Steam registradas en libraryfolders.vdf, sin
       importar en que disco esten (cubre D:\\SteamLibrary, etc.).
    3) Barrido de "<unidad>:\\SteamLibrary\\steamapps\\common\\Brawlhalla"
       y "<unidad>:\\Epic Games\\Brawlhalla" en TODAS las unidades, por
       si el usuario nombro la carpeta distinto o no esta en el vdf.
    Devuelve la carpeta (Path) o None si no encuentra nada. Esta funcion
    es la fuente unica de verdad para ubicar el juego: tanto
    find_brawlhalla_swf() (UI_MainMenu.swf) como update_dumb.py
    (BrawlhallaAir.swf) la reutilizan, para no tener que arreglar la
    deteccion en mas de un lugar cuando cambie una instalacion — por la
    misma razon, guardar la ruta a mano en AppConfig alcanza para que
    la usen todos los scripts, sin tener que tocar cada uno."""
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

    # Bibliotecas Steam registradas (cualquier disco, cualquier nombre de carpeta)
    for lib in _steam_library_paths():
        c = lib / "steamapps" / "common" / "Brawlhalla"
        if c.exists():
            return c

    # Barrido por todas las unidades como ultimo recurso
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
    """Busca UI_MainMenu.swf reutilizando find_brawlhalla_dir(). Devuelve
    None si no encuentra la carpeta del juego (el caller debe pedirle la
    ruta al usuario en ese caso)."""
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
    """Version "libreria" del flujo de main(): pensada para llamarse desde
    AppAllInOne.py / AppLauncher.py (proceso con GUI) sin matar la app entera si
    algo falla. NUNCA llama a sys.exit; en vez de eso levanta InjectError,
    que el caller debe atrapar.

    - pcode_path: ruta al .pcode ya generado (export/MultiColorSwap.pcode).
    - ffdec_path: ruta explicita a ffdec.bat/ffdec-cli.exe/ffdec.jar, o None
      para autodetectar (PATH + ubicaciones tipicas).
    - swf_path: ruta explicita a UI_MainMenu.swf, o None para autodetectar
      (Steam/Epic). Si no se encuentra, levanta InjectError pidiendo que
      se pase a mano.
    - make_backup: si True (default), crea un .bak del swf original la
      primera vez que se inyecta (nunca lo pisa si ya existe).

    Devuelve la ruta (str) del swf ya parcheado. Levanta InjectError con
    un mensaje legible ante cualquier fallo.
    """
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

    # FFDec -replace no permite mismo archivo in/out de forma segura -> usamos temporal
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
    """Version "team colors" de inject_multicolor_swap(): reemplaza el
    instance initializer de OTRA clase (TEAM_CLASS_NAME, distinta de
    a_BattlePassSplashArtButton) por el pcode de export/TeamColorSwap.pcode.
    Misma logica, mismo .bak compartido (es el mismo swf), NUNCA llama a
    sys.exit -> levanta InjectError, que el caller (AppAllInOne.py) atrapa.

    - class_name: si se omite, usa TEAM_CLASS_NAME. Si TEAM_CLASS_NAME
      todavia esta vacio (no se completo con la clase real), levanta
      InjectError pidiendo que se complete o se pase a mano.
    """
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


# ----------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------

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
