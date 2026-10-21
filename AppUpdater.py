#!/usr/bin/env python3
import datetime
import glob
import os
import re
import shutil
import subprocess
import sys
import tempfile
import traceback
import urllib.request
import zipfile

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

BRAWLHALLA_AIR_SWF_NAME = "BrawlhallaAir.swf"
FFDEC_DIR = os.path.join(SCRIPT_DIR, "ffdec")
IS_WIN = sys.platform.startswith("win")


def _data_root():
    if IS_WIN:
        base = os.getenv("APPDATA") or os.path.expanduser("~")
    elif sys.platform == "darwin":
        base = os.path.expanduser("~/Library/Application Support")
    else:
        base = os.getenv("XDG_DATA_HOME") or os.path.expanduser("~/.local/share")
    return os.path.join(base, "AzuModification")


def _resolve_ffdec_jar():
    """Busca ffdec.jar: ./ffdec, prerequisites/ffdec (lo que baja AppLauncher) o junto al ffdec del PATH."""
    candidates = [
        os.path.join(FFDEC_DIR, "ffdec.jar"),
        os.path.join(SCRIPT_DIR, "prerequisites", "ffdec", "ffdec.jar"),
        os.path.join(_data_root(), "prerequisites", "ffdec", "ffdec.jar"),
    ]
    for name in ("ffdec", "ffdec.sh", "ffdec.bat"):
        found = shutil.which(name)
        if found:
            candidates.append(os.path.join(os.path.dirname(os.path.realpath(found)), "ffdec.jar"))
    for c in candidates:
        if os.path.isfile(c):
            return c
    return os.path.join(FFDEC_DIR, "ffdec.jar")


FFDEC_JAR = _resolve_ffdec_jar()
FFDEC_VERSION_TAG = "version25.0.0"
FFDEC_ZIP_NAME = "ffdec_25.0.0.zip"
def _log_path():
    """update.log en una ruta persistente (en el exe SCRIPT_DIR es una carpeta temporal que se borra)."""
    d = _data_root()
    try:
        os.makedirs(d, exist_ok=True)
    except Exception:
        d = tempfile.gettempdir()
    return os.path.join(d, "update.log")


LOGFILE = _log_path()


def _default_swf_path():
    try:
        from AppCodeInstaller import find_brawlhalla_dir
        game_dir = find_brawlhalla_dir()
        if game_dir is not None:
            candidate = game_dir / BRAWLHALLA_AIR_SWF_NAME
            if candidate.exists():
                return str(candidate)
    except Exception:
        pass
    if IS_WIN:
        return r"C:/Program Files (x86)/Steam/steamapps/common/Brawlhalla/BrawlhallaAir.swf"
    return os.path.join(
        os.path.expanduser("~"), ".local", "share", "Steam", "steamapps", "common",
        "Brawlhalla", BRAWLHALLA_AIR_SWF_NAME,
    )

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


def log_exc(prefix="EXCEPCION"):
    log(f"{prefix}:\n{traceback.format_exc()}")


def fail(msg, code=1):
    log(f"ERROR: {msg}")
    sys.exit(code)


class UpdateError(Exception):
    pass


JAVA_BIN = None


def _find_java():
    """Busca java: PATH, JAVA_HOME, JRE portable que baja AppLauncher y rutas comunes (brew, /usr/lib/jvm)."""
    found = shutil.which("java")
    if found:
        return found
    exe = "java.exe" if IS_WIN else "java"
    candidates = []
    jh = os.environ.get("JAVA_HOME")
    if jh:
        candidates.append(os.path.join(jh, "bin", exe))
    roots = [
        os.path.join(_data_root(), "prerequisites", "jre"),
        os.path.join(SCRIPT_DIR, "prerequisites", "jre"),
    ]
    for root in roots:
        if os.path.isdir(root):
            for dirpath, _dirs, files in os.walk(root):
                if os.path.basename(dirpath) == "bin" and exe in files:
                    candidates.append(os.path.join(dirpath, exe))
    if not IS_WIN:
        candidates += [
            "/home/linuxbrew/.linuxbrew/bin/java",
            os.path.expanduser("~/.linuxbrew/bin/java"),
            "/usr/bin/java",
            "/usr/local/bin/java",
        ]
        for base in ("/usr/lib/jvm", "/usr/lib64/jvm"):
            if os.path.isdir(base):
                for d in sorted(os.listdir(base)):
                    candidates.append(os.path.join(base, d, "bin", "java"))
    for c in candidates:
        if os.path.isfile(c) and os.access(c, os.X_OK):
            return c
    log(f"_find_java: no encontrado. PATH={os.environ.get('PATH')} JAVA_HOME={jh}")
    return None


def check_java():
    global JAVA_BIN
    JAVA_BIN = _find_java()
    if JAVA_BIN is None:
        fail("No se encontro 'java'. Instala un JDK (en Bazzite: dentro de tu distrobox, o brew install openjdk) y vuelve a intentar.")
    # que los subprocess (ffdec.sh, etc.) tambien lo encuentren
    jdir = os.path.dirname(JAVA_BIN)
    if jdir not in os.environ.get("PATH", "").split(os.pathsep):
        os.environ["PATH"] = jdir + os.pathsep + os.environ.get("PATH", "")
    log(f"java: {JAVA_BIN}")


def ensure_ffdec():
    global FFDEC_JAR
    FFDEC_JAR = _resolve_ffdec_jar()
    if os.path.isfile(FFDEC_JAR):
        return
    log("FFDec no encontrado, descargando (una sola vez)...")
    # En el exe SCRIPT_DIR es una carpeta temporal que se borra al cerrar: ahi se bajaria en cada
    # ejecucion. Se instala en la carpeta de datos, que _resolve_ffdec_jar() ya revisa.
    install_dir = (os.path.join(_data_root(), "prerequisites", "ffdec")
                   if getattr(sys, "frozen", False) else FFDEC_DIR)
    os.makedirs(install_dir, exist_ok=True)
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
            zf.extractall(install_dir)
    FFDEC_JAR = _resolve_ffdec_jar()
    if not os.path.isfile(FFDEC_JAR):
        fail(f"se descargo FFDec pero no aparece ffdec.jar en {install_dir}")
    log(f"FFDec instalado en {install_dir}")


def _clean_env():
    """En un exe de PyInstaller, java hereda un LD_LIBRARY_PATH con las libs del bundle y puede crashear."""
    env = os.environ.copy()
    if getattr(sys, "frozen", False):
        for var in ("LD_LIBRARY_PATH", "DYLD_LIBRARY_PATH"):
            orig = env.get(var + "_ORIG")
            if orig is not None:
                env[var] = orig
            else:
                env.pop(var, None)
    return env


def export_scripts(swf_path, export_dir):
    log(f"Decompilando '{swf_path}' (puede tardar 1-3 minutos en un archivo grande)...")
    cmd = [
        JAVA_BIN or "java", "-jar", FFDEC_JAR,
        "-onerror", "ignore",
        "-exportFileTimeout", "15",
        "-exportTimeout", "1100",
        "-export", "script", export_dir, swf_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, env=_clean_env())
    if result.returncode != 0:
        log("ERROR: la decompilacion fallo.")
        log(result.stdout)
        log(result.stderr)
        fail("revisa el log de arriba", code=1)

    total = len(glob.glob(os.path.join(export_dir, "**", "*.as"), recursive=True))
    log(f"Decompilados {total} scripts.")


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
        log("find_values: ninguna clase contiene NO_COLOR_SCHEME")
        return None

    class_name, body = target
    fields = extract_fields(body)
    vector_fields = [f for f in fields if f["is_static"] and f["type"].startswith("Vector.<")]
    array_fields = [f for f in fields if not f["is_static"] and f["type"] == "Array"]
    log(f"find_values: {len(fields)} campos, {len(vector_fields)} vectores static, {len(array_fields)} arrays")
    vector_name = vector_fields[-1]["name"] if vector_fields else None
    array_name = array_fields[-1]["name"] if array_fields else None
    if not vector_name or not array_name:
        log(f"find_values: faltan campos (vector={vector_name}, array={array_name})")
        return None

    return {
        "class_name": strip_marker(class_name),
        "vector_name": strip_marker(vector_name),
        "array_name": strip_marker(array_name),
    }


def find_team_values(dump_text):
    result = {}
    for name in TEAM_COLOR_NAMES:
        pattern = re.compile(_TEAM_FIELD_RE_TEMPLATE.format(name=re.escape(name)))
        m = pattern.search(dump_text)
        if not m:
            log(f"find_team_values: no encontre {name}")
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


def main():
    swf_path = sys.argv[1] if len(sys.argv) > 1 else _default_swf_path()
    allinone_py = sys.argv[2] if len(sys.argv) > 2 else os.path.join(SCRIPT_DIR, "AppAllInOne.py")
    log(f"Usando SWF: {swf_path}")
    log(f"frozen={getattr(sys, 'frozen', False)} SCRIPT_DIR={SCRIPT_DIR} FFDEC_JAR={FFDEC_JAR} java={JAVA_BIN} LOGFILE={LOGFILE}")

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
