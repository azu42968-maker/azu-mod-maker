#!/usr/bin/env python3
"""
AppUpdater.py
---------------
Busca dentro de un SWF (Brawlhalla, compilado con Haxe) la clase que
contiene EXACTAMENTE estos 4 imports y ningun otro:

    import haxe.IMap;
    import haxe.ds.EnumValueMap;
    import haxe.ds.IntMap;
    import haxe.ds.StringMap;

...y con eso reescribe directamente DEFAULT_CLASS/DEFAULT_VECTOR/
DEFAULT_ARRAY dentro de AppAllInOne.py. Ya no genera dumb.txt ni backups
.bak: AppAllInOne.py queda actualizado in place y listo para usar.

No depende del nombre ofuscado de la clase (eso cambia en cada
actualizacion del juego): busca por la "firma" de imports, que es
estable entre versiones.

Uso:
    python AppUpdater.py [ruta_al_swf] [ruta_AppAllInOne.py]

Por defecto:
    ruta_al_swf      = C:/Program Files (x86)/Steam/steamapps/common/Brawlhalla/BrawlhallaAir.swf
    ruta_AppAllInOne.py = ./AppAllInOne.py

NOTA sobre la ruta por defecto:
    - En Windows funciona tal cual.
    - En WSL, pasa la ruta como primer argumento, algo como:
      /mnt/c/Program Files (x86)/Steam/steamapps/common/Brawlhalla/BrawlhallaAir.swf
"""

import datetime
import glob
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request
import zipfile

# ---------- Configuracion ----------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

BRAWLHALLA_AIR_SWF_NAME = "BrawlhallaAir.swf"
FFDEC_DIR = os.path.join(SCRIPT_DIR, "ffdec")
FFDEC_JAR = os.path.join(FFDEC_DIR, "ffdec.jar")
FFDEC_VERSION_TAG = "version25.0.0"
FFDEC_ZIP_NAME = "ffdec_25.0.0.zip"
LOGFILE = os.path.join(SCRIPT_DIR, "update.log")


def _default_swf_path():
    """Ubica BrawlhallaAir.swf reutilizando la misma deteccion (Steam
    libraryfolders.vdf + barrido de unidades) que usa
    AppCodeInstaller.py para UI_MainMenu.swf, asi ambos scripts
    encuentran el juego sin importar en que disco/carpeta este
    instalado. Si no lo encuentra, cae al valor fijo de siempre (C:\\)
    como ultimo recurso, para no romper el uso con --swf manual."""
    try:
        from AppCodeInstaller import find_brawlhalla_dir
        game_dir = find_brawlhalla_dir()
        if game_dir is not None:
            candidate = game_dir / BRAWLHALLA_AIR_SWF_NAME
            if candidate.exists():
                return str(candidate)
    except Exception:
        pass
    return r"C:/Program Files (x86)/Steam/steamapps/common/Brawlhalla/BrawlhallaAir.swf"

REQUIRED_IMPORTS = [
    "import haxe.IMap;",
    "import haxe.ds.EnumValueMap;",
    "import haxe.ds.IntMap;",
    "import haxe.ds.StringMap;",
]

FIELD_PATTERN = re.compile(
    r'public\s+(?P<static>static\s+)?var\s+(?P<name>[^\s:]+)\s*:\s*(?P<type>[^;=]+?)\s*[;=]'
)
CLASS_PATTERN = re.compile(r'class\s+(?P<name>[^\s{]+)')

# ---------- Team colors (TeamRed1..4, TeamBlue1..4, TeamYellow1..4, TeamPurple1..4) ----------
# El identificador ofuscado de cada campo cambia en cada build, pero el
# nombre logico ("TeamRed1", etc.) es un string literal estable que Haxe
# siempre usa en el mismo patron fijo dentro de la MISMA clase con
# NO_COLOR_SCHEME (la que ya ubica find_target_as_file):
#
#   §Clase§.§<ofuscado>§ = "TeamRed1" in StringMap.reserved
#       ? _locN_.getReserved("TeamRed1")
#       : _locN_.h["TeamRed1"];
#
# Buscando por el nombre logico (que NO cambia) se obtiene el identificador
# ofuscado (que SI cambia) sin tener que adivinar su valor de antemano.
TEAM_COLOR_NAMES = [
    "TeamRed1", "TeamRed2", "TeamRed3", "TeamRed4",
    "TeamBlue1", "TeamBlue2", "TeamBlue3", "TeamBlue4",
    "TeamYellow1", "TeamYellow2", "TeamYellow3", "TeamYellow4",
    "TeamPurple1", "TeamPurple2", "TeamPurple3", "TeamPurple4",
]

_TEAM_FIELD_RE_TEMPLATE = (
    r'\u00a7[^\u00a7]+\u00a7\.\u00a7(?P<field>[^\u00a7]+)\u00a7\s*=\s*'
    r'"{name}"\s+in\s+StringMap\.reserved'
)


def log(msg):
    line = f"[{datetime.datetime.now():%Y-%m-%d %H:%M:%S}] {msg}"
    print(line)
    try:
        with open(LOGFILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


def fail(msg, code=1):
    log(f"ERROR: {msg}")
    sys.exit(code)


class UpdateError(Exception):
    """Error de actualizacion que NO debe matar el proceso (a diferencia
    de fail()/sys.exit, que si esto corre dentro del launcher/.exe con
    GUI se llevaria puesta toda la app). La usan las funciones
    "libreria" pensadas para llamarse desde AppRelinker.py/AppLauncher.py
    (botón "Update Color Values"); el caller la atrapa y la reporta sin
    cerrar la app. main() (uso por CLI) sigue usando fail() como siempre."""
    pass


# ---------- 1. Verificar Java ----------
def check_java():
    if shutil.which("java") is None:
        fail("No se encontro 'java'. Instala un JDK y vuelve a intentar.")


# ---------- 2. Verificar / descargar FFDec ----------
def ensure_ffdec():
    if os.path.isfile(FFDEC_JAR):
        return
    log("FFDec no encontrado, descargando (una sola vez)...")
    os.makedirs(FFDEC_DIR, exist_ok=True)
    url = (
        "https://github.com/jindrapetrik/jpexs-decompiler/releases/download/"
        f"{FFDEC_VERSION_TAG}/{FFDEC_ZIP_NAME}"
    )
    with tempfile.TemporaryDirectory() as tmp:
        zip_path = os.path.join(tmp, "ffdec.zip")
        try:
            urllib.request.urlretrieve(url, zip_path)
        except Exception as e:
            fail(f"no se pudo descargar FFDec desde {url}: {e}")
        with zipfile.ZipFile(zip_path) as zf:
            zf.extractall(FFDEC_DIR)
    log(f"FFDec instalado en {FFDEC_DIR}")


# ---------- 4. Exportar todos los scripts AS3 a fuente ----------
def export_scripts(swf_path, export_dir):
    log(f"Decompilando '{swf_path}' (puede tardar 1-3 minutos en un archivo grande)...")
    cmd = [
        "java", "-jar", FFDEC_JAR,
        "-onerror", "ignore",
        "-exportFileTimeout", "15",
        "-exportTimeout", "1100",
        "-export", "script", export_dir, swf_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        log("ERROR: la decompilacion fallo.")
        log(result.stdout)
        log(result.stderr)
        fail("revisa el log de arriba", code=1)

    total = len(glob.glob(os.path.join(export_dir, "**", "*.as"), recursive=True))
    log(f"Decompilados {total} scripts.")


# ---------- 5. Buscar la clase con EXACTAMENTE esos 4 imports ----------
def find_target_as_file(export_dir):
    matches = []
    for path in glob.glob(os.path.join(export_dir, "**", "*.as"), recursive=True):
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        except Exception:
            continue

        import_lines = [ln.strip() for ln in text.splitlines() if ln.strip().startswith("import ")]
        if len(import_lines) != 4:
            continue
        if all(imp in import_lines for imp in REQUIRED_IMPORTS):
            matches.append(path)

    if not matches:
        return None

    if len(matches) > 1:
        log(f"ATENCION: se encontraron {len(matches)} clases candidatas (antes solo habia 1). Usando la mas pequena por defecto:")
        for m in matches:
            with open(m, "r", encoding="utf-8", errors="ignore") as f:
                nlines = sum(1 for _ in f)
            log(f"   - {m} ({nlines} lineas)")
        matches.sort(key=lambda p: os.path.getsize(p))

    best = matches[0]
    with open(best, "r", encoding="utf-8", errors="ignore") as f:
        nlines = sum(1 for _ in f)
    log(f"Clase encontrada: {os.path.basename(best)} ({nlines} lineas)")
    return best


# ---------- 6. Extraer identificadores y reescribir AppAllInOne.py ----------
def strip_marker(name):
    return name.replace("\u00a7", "")


def extract_class_body(text, start_idx):
    m = CLASS_PATTERN.match(text, start_idx)
    if not m:
        return None, None
    name = m.group("name")
    brace_start = text.find("{", m.end())
    if brace_start == -1:
        return name, None
    depth = 0
    i = brace_start
    while i < len(text):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                return name, text[brace_start + 1: i]
        i += 1
    return name, None


def find_all_classes(text):
    classes = []
    for m in re.finditer(r'\bclass\s+[^\s{]+', text):
        name, body = extract_class_body(text, m.start())
        if body is not None:
            classes.append((name, body))
    return classes


def extract_fields(class_body):
    fields = []
    for m in FIELD_PATTERN.finditer(class_body):
        fields.append({
            "name": m.group("name"),
            "type": m.group("type").strip(),
            "is_static": bool(m.group("static")),
        })
    return fields


def find_values(dump_text):
    target = None
    for name, body in find_all_classes(dump_text):
        if "NO_COLOR_SCHEME" in body:
            target = (name, body)
            break
    if not target:
        return None

    class_name, body = target
    fields = extract_fields(body)
    vector_fields = [f for f in fields if f["is_static"] and f["type"].startswith("Vector.<")]
    array_fields = [f for f in fields if not f["is_static"] and f["type"] == "Array"]
    vector_name = vector_fields[-1]["name"] if vector_fields else None
    array_name = array_fields[-1]["name"] if array_fields else None
    if not vector_name or not array_name:
        return None

    return {
        "class_name": strip_marker(class_name),
        "vector_name": strip_marker(vector_name),
        "array_name": strip_marker(array_name),
    }


def find_team_values(dump_text):
    """Extrae, desde el mismo .as de la clase con NO_COLOR_SCHEME, los 16
    identificadores ofuscados de los team colors. Devuelve un dict
    {nombre_logico: identificador_ofuscado} (ej. {"TeamRed1": "_-e3j", ...})
    o None si falta alguno (senal de que Haxe cambio esta estructura entre
    versiones, no solo los nombres ofuscados)."""
    result = {}
    for name in TEAM_COLOR_NAMES:
        pattern = re.compile(_TEAM_FIELD_RE_TEMPLATE.format(name=re.escape(name)))
        m = pattern.search(dump_text)
        if not m:
            return None
        result[name] = strip_marker(m.group("field"))
    return result


def patch_allinone(as_path, allinone_path):
    with open(as_path, "r", encoding="utf-8", errors="ignore") as f:
        dump_text = f.read()

    values = find_values(dump_text)
    if not values:
        fail(f'no se encontro la clase con "NO_COLOR_SCHEME" (o sus campos) en {as_path}', code=2)

    try:
        write_identifiers_to_allinone(
            values["class_name"], values["vector_name"], values["array_name"], allinone_path
        )
    except UpdateError as e:
        fail(str(e), code=2)


def write_identifiers_to_allinone(class_name, vector_name, array_name, allinone_path, log=log):
    """Version "libreria" de la mitad final de patch_allinone(): reescribe
    DEFAULT_CLASS/DEFAULT_VECTOR/DEFAULT_ARRAY en allinone_path con
    identificadores YA extraidos (no decompila ni parsea nada de nuevo).
    Pensada para reutilizarse desde AppRelinker.py (botón "Update Color
    Values"), que ya obtuvo estos 3 valores en su propio paso 1. A
    diferencia de patch_allinone()/fail(), nunca llama a sys.exit: ante
    cualquier problema levanta UpdateError.

    Devuelve True si el archivo cambio, False si ya estaba al dia."""
    with open(allinone_path, "r", encoding="utf-8") as f:
        text = f.read()

    new_text, n1 = re.subn(r'^DEFAULT_CLASS\s*=\s*".*?"', f'DEFAULT_CLASS = "{class_name}"', text, count=1, flags=re.M)
    new_text, n2 = re.subn(r'^DEFAULT_VECTOR\s*=\s*".*?"', f'DEFAULT_VECTOR = "{vector_name}"', new_text, count=1, flags=re.M)
    new_text, n3 = re.subn(r'^DEFAULT_ARRAY\s*=\s*".*?"', f'DEFAULT_ARRAY = "{array_name}"', new_text, count=1, flags=re.M)

    if not (n1 and n2 and n3):
        raise UpdateError(f"no encontre DEFAULT_CLASS/DEFAULT_VECTOR/DEFAULT_ARRAY en {allinone_path}")

    log(f'ColorSwapClass="{class_name}" Vector="{vector_name}" Array="{array_name}"')
    if new_text != text:
        with open(allinone_path, "w", encoding="utf-8") as f:
            f.write(new_text)
        log(f"AppAllInOne.py actualizado: {allinone_path}")
        return True

    log("AppAllInOne.py ya estaba al dia, sin cambios.")
    return False


_TEAM_PROPS_BLOCK_RE = re.compile(r'DEFAULT_TEAM_PROPS\s*=\s*\{.*?\n\}', re.DOTALL)


def write_team_identifiers_to_allinone(team_map, allinone_path, log=log):
    """Version "team colors" de write_identifiers_to_allinone(): reescribe
    el diccionario DEFAULT_TEAM_PROPS completo en allinone_path con los 16
    identificadores nuevos (dict {nombre_logico: identificador_ofuscado}
    que devuelve find_team_values()). Mismo estilo de salida (4 pares por
    linea, agrupados Red/Blue/Yellow/Purple) que el original, para que el
    diff quede legible. Nunca llama a sys.exit: levanta UpdateError.

    Devuelve True si el archivo cambio, False si ya estaba al dia."""
    with open(allinone_path, "r", encoding="utf-8") as f:
        text = f.read()

    pairs = list(team_map.items())
    lines = ["DEFAULT_TEAM_PROPS = {"]
    for i in range(0, len(pairs), 4):
        row = ", ".join(f'"{k}": "{v}"' for k, v in pairs[i:i + 4])
        lines.append(f"    {row},")
    lines.append("}")
    new_block = "\n".join(lines)

    new_text, n = _TEAM_PROPS_BLOCK_RE.subn(new_block, text, count=1)
    if n == 0:
        raise UpdateError(f"no encontre DEFAULT_TEAM_PROPS en {allinone_path}")

    log(f"DEFAULT_TEAM_PROPS actualizado ({len(team_map)} slots)")
    if new_text != text:
        with open(allinone_path, "w", encoding="utf-8") as f:
            f.write(new_text)
        log(f"AppAllInOne.py (team colors) actualizado: {allinone_path}")
        return True

    log("DEFAULT_TEAM_PROPS ya estaba al dia, sin cambios.")
    return False


# ---------- Orquestador ----------
def main():
    swf_path = sys.argv[1] if len(sys.argv) > 1 else _default_swf_path()
    allinone_py = sys.argv[2] if len(sys.argv) > 2 else os.path.join(SCRIPT_DIR, "AppAllInOne.py")
    log(f"Usando SWF: {swf_path}")

    check_java()
    ensure_ffdec()

    if not os.path.isfile(swf_path):
        fail(f"No se encontro el SWF en '{swf_path}'.")
    if not os.path.isfile(allinone_py):
        fail(f"No se encontro AppAllInOne.py en '{allinone_py}'.")

    with tempfile.TemporaryDirectory() as workdir:
        export_dir = os.path.join(workdir, "decompiled")
        os.makedirs(export_dir, exist_ok=True)

        export_scripts(swf_path, export_dir)

        best = find_target_as_file(export_dir)
        if best is None:
            log("No se encontro ninguna clase con exactamente esos 4 imports. Puede que el juego haya cambiado la estructura interna.")
            sys.exit(2)

        patch_allinone(best, allinone_py)

    log("Listo.")


if __name__ == "__main__":
    main()
