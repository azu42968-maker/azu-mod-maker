"""
Azu Modification - AppLauncher (punto de entrada de escritorio)
------------------------------------------
Abre index.html en una ventana nativa (sin navegador), usando pywebview.

Instalación (una sola vez):
    pip install pywebview

Ejecutar:
    python launcher.py

Para convertirlo en un .exe (Windows), ver instrucciones al final de este archivo.
"""

import base64
import hashlib
import importlib.util
import os
import re
import shutil
import subprocess
import sys
import traceback
from pathlib import Path


def _base_dir_for_log():
    """Carpeta donde vive el .exe/.py real (no la temporal de PyInstaller),
    para poder escribir ahí el log de error."""
    if hasattr(sys, "_MEIPASS"):
        return os.path.dirname(os.path.abspath(sys.executable))
    return os.path.dirname(os.path.abspath(__file__))


def _show_fatal_error(title, message):
    """Muestra el error en una ventana nativa (para que doble-clic no se
    cierre en silencio) y lo guarda en launcher_error.log junto al programa."""
    log_path = None
    try:
        log_path = os.path.join(_base_dir_for_log(), "launcher_error.log")
        with open(log_path, "a", encoding="utf-8") as f:
            f.write("\n" + "=" * 70 + "\n")
            f.write(message)
    except Exception:
        log_path = None

    full_message = message
    if log_path:
        full_message += f"\n\n(Guardado en: {log_path})"

    shown = False
    # 1) Intento nativo de Windows (no requiere ninguna dependencia extra).
    try:
        import ctypes
        ctypes.windll.user32.MessageBoxW(0, full_message, title, 0x10)  # MB_ICONERROR
        shown = True
    except Exception:
        pass

    # 2) Si no es Windows (o falló), intento con tkinter, que viene con Python.
    if not shown:
        try:
            import tkinter as tk
            from tkinter import messagebox
            root = tk.Tk()
            root.withdraw()
            messagebox.showerror(title, full_message)
            root.destroy()
            shown = True
        except Exception:
            pass

    # 3) Último recurso: si hay consola visible, dejarla abierta.
    if not shown:
        print(full_message)
        try:
            input("\nPresiona Enter para cerrar...")
        except Exception:
            pass


# ----------------------------------------------------------------------
# Prerequisitos externos (Java + FFDec): se instalan solos si no estan.
# ----------------------------------------------------------------------

def _prereqs_dir():
    """Carpeta persistente para lo que se descargue aca (JRE portable,
    FFDec). Igual que _persistent_module_dir() mas abajo: en modo .exe
    empaquetado va a AppData (sobrevive entre aperturas), en modo script
    va junto a este archivo."""
    if hasattr(sys, "_MEIPASS"):
        base = os.getenv("APPDATA") or os.path.expanduser("~")
        path = os.path.join(base, "AzuModification", "prerequisites")
    else:
        path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "prerequisites")
    os.makedirs(path, exist_ok=True)
    return path


def _download_and_extract_zip(url, dest_dir, log):
    import tempfile
    import urllib.request
    import zipfile

    os.makedirs(dest_dir, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        zip_path = os.path.join(tmp, "download.zip")
        log(f"[*] Descargando {url} ...")
        urllib.request.urlretrieve(url, zip_path)
        log("[*] Descarga completa, extrayendo...")
        with zipfile.ZipFile(zip_path) as zf:
            zf.extractall(dest_dir)
    log(f"[*] Listo en {dest_dir}")


def _find_file(root, filename):
    if not os.path.isdir(root):
        return None
    for dirpath, _dirnames, filenames in os.walk(root):
        if filename in filenames:
            return os.path.join(dirpath, filename)
    return None


def _prepend_to_path(folder):
    os.environ["PATH"] = folder + os.pathsep + os.environ.get("PATH", "")


def ensure_java(log=print):
    """Si 'java' no esta en el PATH, descarga un JRE portable (Eclipse
    Temurin, sin instalador ni permisos de admin) y agrega su carpeta
    bin/ al PATH de ESTE proceso -- alcanza para que FFDec (que a su vez
    llama a 'java' internamente) y AppUpdater.py lo encuentren sin tocar
    nada mas del codigo."""
    if shutil.which("java"):
        return True

    jre_dir = os.path.join(_prereqs_dir(), "jre")
    java_exe = _find_file(jre_dir, "java.exe") or _find_file(jre_dir, "java")
    if java_exe:
        _prepend_to_path(os.path.dirname(java_exe))
        return True

    log("[*] Java no encontrado, descargando un JRE portable (una sola vez, puede tardar)...")
    url = "https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jre/hotspot/normal/eclipse?project=jdk"
    try:
        _download_and_extract_zip(url, jre_dir, log)
    except Exception as e:
        log(f"[!] No se pudo instalar Java automaticamente: {e}. "
            "Instala un JDK/JRE a mano si el resto falla.")
        return False

    java_exe = _find_file(jre_dir, "java.exe") or _find_file(jre_dir, "java")
    if not java_exe:
        log("[!] Se descargo el JRE pero no se encontro java(.exe) adentro.")
        return False

    _prepend_to_path(os.path.dirname(java_exe))
    log(f"[*] Java portable listo: {java_exe}")
    return True


def ensure_ffdec(log=print):
    """Si FFDec no esta disponible (PATH, Program Files, ni la copia
    junto al script -- ver AppCodeInstaller.find_ffdec), lo descarga
    (mismo release que usa AppUpdater.py) a una carpeta persistente y
    agrega esa carpeta al PATH, para que find_ffdec() lo detecte solo
    la proxima vez que llame shutil.which('ffdec.bat')."""
    try:
        import AppCodeInstaller as inj
        inj.find_ffdec(None)
        return True  # ya esta instalado
    except Exception:
        pass

    ffdec_dir = os.path.join(_prereqs_dir(), "ffdec")
    bat = _find_file(ffdec_dir, "ffdec.bat")
    if bat:
        _prepend_to_path(os.path.dirname(bat))
        return True

    log("[*] FFDec no encontrado, descargando (una sola vez)...")
    url = (
        "https://github.com/jindrapetrik/jpexs-decompiler/releases/download/"
        "version25.0.0/ffdec_25.0.0.zip"
    )
    try:
        _download_and_extract_zip(url, ffdec_dir, log)
    except Exception as e:
        log(f"[!] No se pudo instalar FFDec automaticamente: {e}. "
            "Instalalo a mano (jindrapetrik/jpexs-decompiler en GitHub).")
        return False

    bat = _find_file(ffdec_dir, "ffdec.bat")
    if not bat:
        log("[!] Se descargo FFDec pero no se encontro ffdec.bat adentro.")
        return False

    _prepend_to_path(os.path.dirname(bat))
    log(f"[*] FFDec listo: {bat}")
    return True


def ensure_prerequisites(log=print):
    """Se llama una sola vez al arrancar el launcher. Nunca lanza: si
    algo falla, deja un aviso en el log y sigue -- los botones que
    dependan de FFDec/Java van a fallar igual que antes (con el mensaje
    detallado que ya devuelve AppCodeInstaller), no rompe el arranque."""
    try:
        ensure_java(log=log)
    except Exception as e:
        log(f"[!] Fallo verificando/instalando Java: {e}")
    try:
        ensure_ffdec(log=log)
    except Exception as e:
        log(f"[!] Fallo verificando/instalando FFDec: {e}")


try:
    import webview
except Exception:
    _show_fatal_error(
        "Azu Modification — Error al iniciar",
        "No se pudo cargar una dependencia necesaria (falta instalar algo "
        "o el WebView2 Runtime de Windows).\n\n" + traceback.format_exc(),
    )
    sys.exit(1)

def _persistent_module_dir():
    """Carpeta FIJA (fuera de la temporal que PyInstaller borra al cerrar)
    donde vive la copia editable de AppAllInOne.py/AppPublic.py cuando
    corremos como .exe empaquetado. Necesaria porque "Update Color Values"
    reescribe DEFAULT_CLASS/DEFAULT_VECTOR/DEFAULT_ARRAY directamente en
    ese archivo: si el archivo vive en _MEIPASS (la carpeta temporal que
    PyInstaller crea de cero en cada arranque y borra al cerrar), el
    cambio se pierde apenas se cierra la app, aunque el botón no muestre
    ningún error. Guardando la copia editable en AppData en cambio, el
    archivo es real y sobrevive entre una apertura del .exe y la
    siguiente (misma idea que mover los scripts a mano a una carpeta
    fija, pero automático)."""
    base = os.getenv("APPDATA") or os.path.expanduser("~")
    path = os.path.join(base, "AzuModification", "engine")
    os.makedirs(path, exist_ok=True)
    return path


def _bundle_fingerprint():
    """Hash de los archivos que trae ESTE .exe (ya extraidos en
    _MEIPASS): el motor (AppAllInOne.py o AppPublic.py), mas
    index.html/app.js/styles.css/codemirror.bundle.js. Cambia solo
    cuando se compila un .exe con codigo distinto, sin necesitar
    mantener un numero de version a mano. None en modo script (python
    AppLauncher.py), donde este chequeo no aplica."""
    if not hasattr(sys, "_MEIPASS"):
        return None
    names = (
        "AppAllInOne.py", "AppPublic.py", "index.html", "app.js",
        "styles.css", "codemirror.bundle.js",
    )
    h = hashlib.sha256()
    for name in names:
        path = os.path.join(sys._MEIPASS, name)
        try:
            with open(path, "rb") as f:
                h.update(f.read())
        except OSError:
            pass
    return h.hexdigest()


def _reset_stale_cache_if_new_build():
    """Si el .exe recien abierto trae codigo distinto al de la ultima
    apertura (fingerprint distinto), borra:
      - engine/     copia persistente editable de AllInOne/Public. Si no
                     se borra, un .exe nuevo sigue arrancando con el
                     motor (y los DEFAULT_CLASS/VECTOR/ARRAY) de la
                     version VIEJA, aunque el .exe nuevo traiga otros.
      - webview_data/  perfil/cache de WebView2. Puede quedar sirviendo
                     HTML/JS viejo despues de actualizar el .exe.
    NO toca installed_schemes.json ni config.json (carpeta de
    Brawlhalla guardada, dentro de AzuModification/ pero fuera de esas
    dos subcarpetas), asi que actualizar el .exe no hace perder eso.
    Se llama ANTES de que _persistent_module_dir()/get_storage_path()
    creen esas carpetas para esta ejecucion."""
    fingerprint = _bundle_fingerprint()
    if fingerprint is None:
        return  # modo script: no hay ".exe nuevo" que detectar

    base = os.getenv("APPDATA") or os.path.expanduser("~")
    root = os.path.join(base, "AzuModification")
    os.makedirs(root, exist_ok=True)
    marker_path = os.path.join(root, "build_fingerprint.txt")

    try:
        previous = Path(marker_path).read_text(encoding="utf-8").strip()
    except OSError:
        previous = None

    if previous == fingerprint:
        return  # mismo build de siempre, no tocar nada

    for folder in ("engine", "webview_data"):
        shutil.rmtree(os.path.join(root, folder), ignore_errors=True)

    try:
        Path(marker_path).write_text(fingerprint, encoding="utf-8")
    except OSError:
        pass


def _load_allinone_module():
    """Devuelve el módulo AppAllInOne (o AppPublic si el primero no
    existe) con las funciones/constantes que el launcher necesita.

    - Modo script (python AppLauncher.py): import normal de siempre;
      el .py real está al lado de este archivo y ya persiste sin nada
      especial.
    - Modo .exe empaquetado: en vez de usar la copia que PyInstaller
      extrae en _MEIPASS (efímera, se borra al cerrar), la primera vez
      se copia ese archivo a una carpeta fija en AppData
      (_persistent_module_dir) y se carga desde ahí con importlib. Así
      "Update Color Values" reescribe la copia persistente de verdad,
      y las próximas aperturas del .exe siguen usando esa misma copia
      (con los identificadores ya actualizados) en vez de volver a
      partir de cero cada vez.

      Si el .exe es una version nueva (codigo distinto al de la ultima
      apertura), _reset_stale_cache_if_new_build() borra esa copia
      persistente (y el cache de WebView2) ANTES de sembrarla de
      nuevo, para no seguir arrastrando el motor/cache de una version
      vieja.
    """
    _reset_stale_cache_if_new_build()

    if not hasattr(sys, "_MEIPASS"):
        try:
            import AppAllInOne as AllInOne
            return AllInOne
        except ImportError:
            import AppPublic as AllInOne
            return AllInOne

    persistent_dir = _persistent_module_dir()

    # ¿Ya existe una copia persistente de una ejecución anterior? Si sí,
    # se sigue usando esa (con los identificadores que "Update Color
    # Values" ya haya guardado ahí), NO se vuelve a pisar con la
    # original empaquetada.
    for name in ("AppAllInOne.py", "AppPublic.py"):
        dst = os.path.join(persistent_dir, name)
        if os.path.exists(dst):
            module_name = name[:-3]
            spec = importlib.util.spec_from_file_location(module_name, dst)
            module = importlib.util.module_from_spec(spec)
            sys.modules[module_name] = module
            spec.loader.exec_module(module)
            return module

    # Primera vez: sembrar la copia persistente desde la que trae el
    # propio .exe (extraída en _MEIPASS gracias a --add-data).
    for name in ("AppAllInOne.py", "AppPublic.py"):
        src = os.path.join(sys._MEIPASS, name)
        if os.path.exists(src):
            dst = os.path.join(persistent_dir, name)
            shutil.copy2(src, dst)
            module_name = name[:-3]
            spec = importlib.util.spec_from_file_location(module_name, dst)
            module = importlib.util.module_from_spec(spec)
            sys.modules[module_name] = module
            spec.loader.exec_module(module)
            return module

    raise ImportError(
        "No se encontró AppAllInOne.py ni AppPublic.py dentro del .exe "
        "(revisa que el .bat de empaquetado los incluya con --add-data)."
    )


try:
    AllInOne = _load_allinone_module()
except Exception:
    _show_fatal_error(
        "Azu Modification — Error al iniciar",
        "No se encontró AppAllInOne.py ni AppPublic.py (o falló al "
        "cargarlos).\n\n" + traceback.format_exc(),
    )
    sys.exit(1)

# Instala Java/FFDec solos si faltan (ver ensure_prerequisites() arriba).
# Nunca bloquea el arranque: si falla, los botones que los necesiten van
# a mostrar el error detallado de siempre en vez de romper la app.
ensure_prerequisites(log=print)

# AppPublic.py (a diferencia de AppAllInOne.py) no trae las funciones de
# "team colors" (TeamRed1..4, etc.). Cuando el launcher cae en AppPublic
# (porque AppAllInOne.py no está o no se pudo importar), estas 4 llamadas
# se deshabilitan mandando resultados vacios/neutros en vez de reventar
# con AttributeError. El frontend (app.js) ya maneja esto: si
# get_team_slot_options/list_installed_team_schemes devuelven vacio, el
# selector de "Team Colours" directamente no aparece.
TEAM_COLORS_SUPPORTED = hasattr(AllInOne, "get_team_slot_options")


def resource_path(relative_path):
    """Devuelve la ruta correcta tanto en modo script como empaquetado (PyInstaller)."""
    if hasattr(sys, "_MEIPASS"):
        base_path = sys._MEIPASS
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, relative_path)


def get_storage_path():
    """
    Carpeta FIJA (fuera de la carpeta temporal que crea el .exe en cada arranque)
    donde WebView2 guarda su perfil: localStorage, cookies, etc.
    Sin esto, cada apertura del .exe usa un perfil nuevo y las paletas guardadas
    con localStorage se pierden al cerrar la app.
    """
    base = os.getenv("APPDATA") or os.path.expanduser("~")
    path = os.path.join(base, "AzuModification", "webview_data")
    os.makedirs(path, exist_ok=True)
    return path


def get_data_dir():
    """Unica carpeta que necesita el flujo de Install: guarda ahí un solo
    archivo, installed_schemes.json, con los colores y el pushbyte de cada
    scheme ya instalado (para no perderlos al instalar uno nuevo). No hay
    import/export/ind_export/img — todo lo demás pasa en memoria."""
    base = os.getenv("APPDATA") or os.path.expanduser("~")
    path = os.path.join(base, "AzuModification")
    os.makedirs(path, exist_ok=True)
    return path


def get_dump_path():
    """dumb.txt (dump de FFDec con los identificadores ofuscados) se busca
    al lado del .exe/script real -- NO dentro de la carpeta temporal que
    PyInstaller crea en cada arranque (_MEIPASS), porque esa carpeta se
    borra al cerrar y ademas nunca se le agrega dumb.txt via --add-data.
    Si no existe, install_scheme_and_inject cae en los valores por
    defecto (DEFAULT_CLASS/VECTOR/ARRAY)."""
    if hasattr(sys, "_MEIPASS"):
        # Congelado (.exe): usar la carpeta donde vive el .exe de verdad,
        # no sys._MEIPASS.
        base_path = os.path.dirname(os.path.abspath(sys.executable))
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, "dumb.txt")


def get_gamebanana_dir():
    """Carpeta aislada para el build secundario (el que se sube a
    GameBanana): tiene su propio installed_schemes.json y su propia copia
    de UI_MainMenu.swf, totalmente separados de tu build personal."""
    base = os.getenv("APPDATA") or os.path.expanduser("~")
    path = os.path.join(base, "AzuModification", "GameBananaBuild")
    os.makedirs(path, exist_ok=True)
    return path


def get_gamebanana_swf_path():
    return os.path.join(get_gamebanana_dir(), "UI_MainMenu.swf")


def _ensure_gamebanana_swf(swf_path_override=None):
    """Crea (solo si todavia no existe) la copia aislada de
    UI_MainMenu.swf que usa el build de GameBanana. Siempre parte de una
    version limpia: el .bak de tu Brawlhalla real si ya existe (es decir,
    si ya instalaste colores ahi antes), o el swf real si todavia nunca
    fue parcheado. Asi el build de GameBanana nunca arrastra tus colores
    personales."""
    target = get_gamebanana_swf_path()
    if os.path.exists(target):
        return target

    import AppCodeInstaller as inj

    if swf_path_override:
        real_swf = Path(swf_path_override)
    else:
        real_swf = inj.find_brawlhalla_swf()
        if real_swf is None:
            raise FileNotFoundError(
                "No pude encontrar UI_MainMenu.swf automaticamente para "
                "crear el build de GameBanana. Indica la ruta a mano."
            )

    backup = real_swf.with_suffix(real_swf.suffix + ".bak")
    source = backup if backup.exists() else real_swf
    shutil.copy2(source, target)
    return target


def _resolve_profile(profile, swf_path=None):
    """Traduce el perfil elegido en la UI a (base_dir, swf_path).

    profile == "gamebanana" -> carpeta + swf aislados del build
    secundario, para juntar tus colores + los de tus amigos + los de
    GameBanana sin tocar tu Brawlhalla real.
    Cualquier otro valor (o None) -> tu build normal de siempre."""
    if profile == "gamebanana":
        resolved_swf = _ensure_gamebanana_swf(swf_path)
        return get_gamebanana_dir(), str(resolved_swf)
    return get_data_dir(), swf_path


def _real_base_dir():
    """Carpeta donde vive el .exe/.py real -- NO la temporal que
    PyInstaller crea en cada arranque (_MEIPASS), porque esa se borra
    al cerrar. Misma logica que get_dump_path()."""
    if hasattr(sys, "_MEIPASS"):
        return os.path.dirname(os.path.abspath(sys.executable))
    return os.path.dirname(os.path.abspath(__file__))


def get_sprite_types_dir():
    """Carpeta donde la gente puede soltar archivos .xml (formato
    ColorSchemeType, el mismo que exporta 'Download XML' o que acepta
    'Paste Colour Scheme Code') para que aparezcan como sprite types
    nuevos en el selector, sin tocar ningun script. Un archivo por
    sprite type; el nombre del archivo (sin .xml) se usa como nombre a
    menos que el XML traiga ColorSchemeName. Vive en AppData (junto a
    installed_schemes.json y PreRenders, ver get_data_dir), no al lado
    del .exe/.py real -- asi no deja carpetas sueltas en dist\\ ni en la
    carpeta del proyecto cada vez que la app arranca."""
    path = os.path.join(get_data_dir(), "SpriteTypes")
    os.makedirs(path, exist_ok=True)
    return path


def get_prerenders_dir():
    """Carpeta en AppData (junto a installed_schemes.json, ver
    get_data_dir) donde el boton 'PreRenders' guarda los sprites que la
    persona sube a mano desde ahi -- separada de SpriteTypes (que guarda
    paletas/XML, no imagenes). Tiene una subcarpeta por sprite type (la
    key activa en el selector: 'color', 'dash', 'gc', 'lastjump' o
    'custom:<archivo>.xml') para que la galeria pueda filtrar por tipo
    sin mezclar sprites de distintos tipos."""
    path = os.path.join(get_data_dir(), "PreRenders")
    os.makedirs(path, exist_ok=True)
    return path


def _prerenders_type_dir(sprite_type):
    """Subcarpeta de get_prerenders_dir() para un sprite type dado. El
    nombre del tipo (puede traer ':' o nombres de archivo si es un
    custom:*.xml) se sanitiza igual que save_sprite_type_xml antes de
    usarlo como nombre de carpeta."""
    safe = re.sub(r'[\\/:*?"<>|]+', "_", (sprite_type or "color").strip())
    safe = safe or "color"
    path = os.path.join(get_prerenders_dir(), safe)
    os.makedirs(path, exist_ok=True)
    return path


_PRERENDER_MIME_BY_EXT = {
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
}


def _seed_bundled_prerenders():
    """Copia a AppData\\AzuModification\\PreRenders los PreRenders que
    hayan quedado empaquetados dentro del .exe (carpeta PreRenders al
    lado del script/.exe -- ver Empaquetar_AzuModification.bat, mismo
    patron que la carpeta ffdec) -- para que quien instala el .exe ya
    vea sprites de ejemplo en la galeria 'PreRenders' desde el primer
    arranque, sin tener que subirlos a mano uno por uno. Solo copia lo
    que todavia no exista en AppData: nunca pisa (ni borra) un sprite
    que la persona ya guardo o saco por su cuenta desde "+ Add", asi que
    es seguro llamarlo en cada arranque, no solo la primera vez."""
    bundled = resource_path("PreRenders")
    if not os.path.isdir(bundled):
        return
    dest_base = get_prerenders_dir()
    try:
        type_keys = os.listdir(bundled)
    except Exception:
        return
    for type_key in type_keys:
        src_folder = os.path.join(bundled, type_key)
        if not os.path.isdir(src_folder):
            continue
        dest_folder = os.path.join(dest_base, type_key)
        os.makedirs(dest_folder, exist_ok=True)
        try:
            filenames = os.listdir(src_folder)
        except Exception:
            continue
        for filename in filenames:
            src_file = os.path.join(src_folder, filename)
            if not os.path.isfile(src_file):
                continue
            dest_file = os.path.join(dest_folder, filename)
            if not os.path.exists(dest_file):
                try:
                    shutil.copy2(src_file, dest_file)
                except Exception:
                    pass


def _seed_bundled_sprite_types():
    """Copia a AppData\\AzuModification\\SpriteTypes los .xml de
    sprite types que hayan quedado empaquetados dentro del .exe
    (carpeta SpriteTypes al lado del script/.exe -- mismo patron que
    PreRenders y ffdec, ver Empaquetar_AzuModification.bat), para que
    quien instala el .exe ya vea esos sprite types en el selector desde
    el primer arranque. Solo copia lo que todavia no exista en AppData:
    nunca pisa un .xml que la persona ya guardo/reemplazo por su cuenta
    con 'Save as SpriteType', asi que es seguro llamarlo en cada
    arranque, no solo la primera vez."""
    bundled = resource_path("SpriteTypes")
    if not os.path.isdir(bundled):
        return
    dest = get_sprite_types_dir()
    try:
        filenames = os.listdir(bundled)
    except Exception:
        return
    for filename in filenames:
        if not filename.lower().endswith(".xml"):
            continue
        src_file = os.path.join(bundled, filename)
        if not os.path.isfile(src_file):
            continue
        dest_file = os.path.join(dest, filename)
        if not os.path.exists(dest_file):
            try:
                shutil.copy2(src_file, dest_file)
            except Exception:
                pass


class Api:
    """Puente entre el JS de index.html y el pipeline de AppAllInOne.py.
    Cada metodo publico queda expuesto en JS como
    window.pywebview.api.<nombre>(...) y devuelve una Promise."""

    def list_prerenders(self, sprite_type=None):
        """Lee get_prerenders_dir() y devuelve cada sprite guardado ya
        como data URL (base64), listo para pintarse directo en la
        grilla de la galeria 'PreRenders' sin pedirle nada a la
        persona. Si sprite_type es None, devuelve los de todos los
        tipos juntos; si no, solo los de ese tipo. Un archivo roto o
        con extension no soportada se saltea en vez de tirar abajo el
        resto de la lista."""
        results = []
        base = get_prerenders_dir()
        if sprite_type:
            type_keys = [sprite_type]
        else:
            try:
                type_keys = sorted(os.listdir(base))
            except Exception:
                type_keys = []
        for type_key in type_keys:
            safe = re.sub(r'[\\/:*?"<>|]+', "_", (type_key or "color").strip()) or "color"
            folder = os.path.join(base, safe)
            if not os.path.isdir(folder):
                continue
            try:
                filenames = sorted(os.listdir(folder))
            except Exception:
                continue
            for filename in filenames:
                fpath = os.path.join(folder, filename)
                if not os.path.isfile(fpath):
                    continue
                mime = _PRERENDER_MIME_BY_EXT.get(os.path.splitext(filename)[1].lower())
                if not mime:
                    continue
                try:
                    with open(fpath, "rb") as f:
                        raw = f.read()
                except Exception:
                    continue
                b64 = base64.b64encode(raw).decode("ascii")
                results.append({
                    "filename": filename,
                    "spriteType": type_key,
                    "dataUrl": f"data:{mime};base64,{b64}",
                })
        return results

    def save_prerender(self, data_url, filename, sprite_type):
        """Guarda un sprite (mandado desde JS como data URL, ya en
        base64 -- ver _fileToDataURL en app.js) en
        PreRenders/<sprite_type>/<nombre>, para que 'PreRenders' lo
        vuelva a mostrar en la galeria la proxima vez sin tener que
        resubirlo. Si ya existe un archivo con ese nombre en ese tipo,
        se le agrega un sufijo numerico en vez de pisarlo."""
        m = re.match(r'^data:([^;]+);base64,(.*)$', data_url or "", re.S)
        if not m:
            raise ValueError("data_url invalida")
        raw = base64.b64decode(m.group(2))
        safe_name = re.sub(r'[\\/:*?"<>|]+', "", (filename or "sprite").strip())
        safe_name = safe_name.rstrip(". ") or "sprite"
        folder = _prerenders_type_dir(sprite_type)
        stem, ext = os.path.splitext(safe_name)
        candidate = safe_name
        i = 1
        while os.path.exists(os.path.join(folder, candidate)):
            candidate = f"{stem} ({i}){ext}"
            i += 1
        with open(os.path.join(folder, candidate), "wb") as f:
            f.write(raw)
        return {"filename": candidate, "spriteType": sprite_type}

    def delete_prerender(self, sprite_type, filename):
        """Borra un sprite guardado en PreRenders (boton '\u00d7' de la
        galeria). No tira error si ya no existe -- simplemente devuelve
        False."""
        folder = _prerenders_type_dir(sprite_type)
        safe_name = os.path.basename(filename or "")
        fpath = os.path.join(folder, safe_name)
        try:
            if os.path.isfile(fpath):
                os.remove(fpath)
                return True
        except Exception:
            pass
        return False

    def list_custom_sprite_types(self):
        """Lee cada .xml de get_sprite_types_dir() y le pasa el texto
        crudo a JS (que ya sabe parsear ColorSchemeType XML, ver
        Scheme.loadXML en app.js) para no duplicar esa logica en
        Python. Un archivo roto no tira abajo a los demas: se reporta
        con error=... y JS decide si avisar o simplemente saltearlo."""
        results = []
        folder = get_sprite_types_dir()
        try:
            filenames = sorted(f for f in os.listdir(folder) if f.lower().endswith(".xml"))
        except Exception as e:
            return results
        for filename in filenames:
            entry = {"filename": filename, "name": os.path.splitext(filename)[0]}
            try:
                with open(os.path.join(folder, filename), "r", encoding="utf-8", errors="replace") as f:
                    entry["xml"] = f.read()
            except Exception as e:
                entry["error"] = str(e)
            results.append(entry)
        return results

    def save_sprite_type_xml(self, xml_text, name):
        """Guarda el ColorSchemeType XML del esquema actual como un
        archivo nuevo (o reemplazo) dentro de get_sprite_types_dir(),
        para que la persona no tenga que exportar el XML a mano y
        despues copiarlo/pegarlo a esa carpeta: la app lo genera y lo
        deja ahi directamente. El nombre pedido en la UI se sanitiza
        para usarlo como nombre de archivo -- y por lo tanto como
        nombre del sprite type en el selector, salvo que list_custom_
        sprite_types() encuentre un ColorSchemeName dentro del propio
        XML (ver parseSpriteTypeXML en app.js)."""
        safe = re.sub(r'[\\/:*?"<>|]+', "", (name or "").strip())
        safe = safe.rstrip(". ")
        if not safe:
            safe = "SpriteType"
        filename = safe if safe.lower().endswith(".xml") else safe + ".xml"
        folder = get_sprite_types_dir()
        path = os.path.join(folder, filename)
        with open(path, "w", encoding="utf-8") as f:
            f.write(xml_text)
        return {"filename": filename, "path": path}

    def open_sprite_types_folder(self):
        """Abre en el explorador la carpeta de sprite types custom, para
        que la persona sepa donde soltar sus .xml."""
        path = get_sprite_types_dir()
        try:
            if sys.platform.startswith("win"):
                os.startfile(path)
            elif sys.platform == "darwin":
                subprocess.run(["open", path])
            else:
                subprocess.run(["xdg-open", path])
        except Exception:
            pass
        return path

    def get_brawlhalla_status(self):
        """Le dice a la UI que carpeta de Brawlhalla se va a usar ahora
        mismo y de donde salio, para mostrar el path guardado (o pedirlo
        si no se encontro ninguno, ni guardado ni autodetectado)."""
        import AppConfig
        import AppCodeInstaller as inj

        saved = AppConfig.get_saved_brawlhalla_path()
        if saved is not None:
            return {"path": str(saved), "source": "saved"}

        auto = inj.find_brawlhalla_dir()
        if auto is not None:
            return {"path": str(auto), "source": "auto"}

        return {"path": None, "source": "none"}

    def _validate_and_save_brawlhalla_path(self, raw_path):
        import AppConfig

        if not raw_path:
            return {"success": False, "message": "No indicaste ninguna carpeta."}
        path = Path(raw_path)
        if not path.is_dir():
            return {"success": False, "message": f"'{raw_path}' no es una carpeta valida."}
        swf = path / "UI_MainMenu.swf"
        if not swf.exists():
            return {
                "success": False,
                "message": (
                    f"No encontre UI_MainMenu.swf dentro de '{raw_path}'. "
                    "Elegi la carpeta donde esta instalado Brawlhalla "
                    "(la que tiene BrawlhallaAir.exe adentro)."
                ),
            }
        AppConfig.set_brawlhalla_path(path)
        return {"success": True, "message": "Carpeta de Brawlhalla guardada.", "path": str(path)}

    def browse_brawlhalla_folder(self):
        """Abre el selector nativo de carpetas de Windows. Si el usuario
        elige una, la valida y la guarda en AppConfig (queda disponible
        para todos los scripts, no solo esta sesion)."""
        try:
            result = webview.windows[0].create_file_dialog(webview.FOLDER_DIALOG)
        except Exception as e:
            return {"success": False, "message": f"No pude abrir el selector de carpetas: {e}"}
        if not result:
            return {"success": False, "message": "cancelled"}
        return self._validate_and_save_brawlhalla_path(result[0])

    def set_brawlhalla_folder(self, raw_path):
        """Igual que browse_brawlhalla_folder pero con una ruta escrita a
        mano (para cuando el usuario prefiere pegarla en vez de navegar)."""
        return self._validate_and_save_brawlhalla_path(raw_path)

    def clear_brawlhalla_folder(self):
        """Borra la ruta guardada a mano y vuelve a la autodeteccion."""
        import AppConfig
        AppConfig.clear_brawlhalla_path()
        return self.get_brawlhalla_status()

    def install_scheme(self, xml_text, scheme_name, pushbyte_num,
                        do_inject=True, ffdec_path=None, swf_path=None,
                        profile=None):
        dump_path = get_dump_path()
        base_dir, resolved_swf = _resolve_profile(profile, swf_path)
        return AllInOne.install_scheme_and_inject(
            xml_text=xml_text,
            scheme_name=scheme_name,
            pushbyte_num=pushbyte_num,
            base_dir=base_dir,
            dump_path=dump_path if os.path.exists(dump_path) else None,
            log=print,
            do_inject=do_inject,
            ffdec_path=ffdec_path,
            swf_path=resolved_swf,
        )

    def get_old_color_names(self):
        """Le pasa a JS la misma lista de 60 colores viejos que usa
        AppAllInOne.py, para no tener que mantenerla duplicada a mano."""
        return AllInOne.OLD_COLOR_NAMES

    def get_pushbyte_options(self):
        """Solo los pushbytes disponibles para instalar colores custom
        (rango Soul Fire..CMYK), para que el selector "Install to
        Brawlhalla" no ofrezca pisar un color real del juego. Si el modo
        developer esta destrabado, devuelve todos los colores viejos."""
        return AllInOne.get_pushbyte_options()

    def get_dev_mode_status(self):
        """True si el modo developer (todos los colores, sin la
        restriccion de AppPublic) ya esta destrabado en esta maquina."""
        try:
            return AllInOne.is_dev_mode_unlocked()
        except AttributeError:
            # AppAllInOne.py no tiene restriccion que destrabar: ya
            # muestra todos los colores por defecto.
            return True

    def unlock_dev_mode(self, code):
        """Ingresa el codigo del modo developer. Si es correcto, saca la
        restriccion de solo-colores-permitidos (y team colors ocultos)
        de forma persistente en esta maquina."""
        try:
            return AllInOne.unlock_dev_mode(code)
        except AttributeError:
            return {"success": True, "message": "Esta build ya tiene todos los colores disponibles."}

    def get_team_slot_options(self):
        """Los 16 slots de team color (TeamRed1..4/TeamBlue1..4/
        TeamYellow1..4/TeamPurple1..4) para agregar al mismo selector
        "Install to Brawlhalla", como grupo aparte. Deshabilitado (lista
        vacia) si el modulo activo es AppPublic, que no trae team colors."""
        if not TEAM_COLORS_SUPPORTED:
            return []
        return AllInOne.get_team_slot_options()

    def install_team_scheme(self, xml_text, scheme_name, team_slot,
                             do_inject=True, ffdec_path=None, swf_path=None,
                             profile=None):
        """Equivalente a install_scheme pero para un slot de team color
        (TeamRed1, TeamBlue3, etc.) en vez de un pushbyte."""
        if not TEAM_COLORS_SUPPORTED:
            return {
                "success": False,
                "message": "Team colors no está disponible en esta build.",
                "output_path": None,
                "injected": False,
            }
        base_dir, resolved_swf = _resolve_profile(profile, swf_path)
        return AllInOne.install_team_scheme_and_inject(
            xml_text=xml_text,
            scheme_name=scheme_name,
            team_slot=team_slot,
            base_dir=base_dir,
            log=print,
            do_inject=do_inject,
            ffdec_path=ffdec_path,
            swf_path=resolved_swf,
        )

    def list_installed_schemes(self, profile=None):
        """Para poblar el selector de "Quitar color" en la UI."""
        base_dir, _ = _resolve_profile(profile)
        return AllInOne.list_installed_schemes(base_dir)

    def list_installed_team_schemes(self, profile=None):
        """Para agregar los team colors instalados al mismo selector de
        "Quitar color", como grupo aparte. Deshabilitado (lista vacia) si
        el modulo activo es AppPublic, que no trae team colors."""
        if not TEAM_COLORS_SUPPORTED:
            return []
        base_dir, _ = _resolve_profile(profile)
        return AllInOne.list_installed_team_schemes(base_dir)

    def uninstall_scheme(self, scheme_name, do_inject=True, ffdec_path=None,
                          swf_path=None, profile=None):
        """Quita UN color instalado y reinyecta el resto."""
        dump_path = get_dump_path()
        base_dir, resolved_swf = _resolve_profile(profile, swf_path)
        return AllInOne.uninstall_scheme(
            scheme_name=scheme_name,
            base_dir=base_dir,
            dump_path=dump_path if os.path.exists(dump_path) else None,
            log=print,
            do_inject=do_inject,
            ffdec_path=ffdec_path,
            swf_path=resolved_swf,
        )

    def uninstall_team_scheme(self, team_slot, do_inject=True, ffdec_path=None,
                               swf_path=None, profile=None):
        """Equivalente a uninstall_scheme pero para un slot de team color."""
        if not TEAM_COLORS_SUPPORTED:
            return {
                "success": False,
                "message": "Team colors no está disponible en esta build.",
            }
        base_dir, resolved_swf = _resolve_profile(profile, swf_path)
        return AllInOne.uninstall_team_scheme(
            team_slot=team_slot,
            base_dir=base_dir,
            log=print,
            do_inject=do_inject,
            ffdec_path=ffdec_path,
            swf_path=resolved_swf,
        )

    def reset_all_schemes(self, ffdec_path=None, swf_path=None, profile=None):
        """Restaura el swf original (desde el .bak) y vacia todos los
        colores instalados. Con profile="gamebanana" resetea el build
        secundario (borra la copia aislada), no tu Brawlhalla real."""
        if profile == "gamebanana":
            gb_dir = get_gamebanana_dir()
            gb_swf = get_gamebanana_swf_path()
            store_path = os.path.join(gb_dir, "installed_schemes.json")
            team_store_path = os.path.join(gb_dir, "installed_team_schemes.json")
            try:
                if os.path.exists(gb_swf):
                    os.remove(gb_swf)
                if os.path.exists(store_path):
                    os.remove(store_path)
                if os.path.exists(team_store_path):
                    os.remove(team_store_path)
                pcode_path = os.path.join(gb_dir, "export", "MultiColorSwap.pcode")
                if os.path.exists(pcode_path):
                    os.remove(pcode_path)
                team_pcode_path = os.path.join(gb_dir, "export", "TeamColorSwap.pcode")
                if os.path.exists(team_pcode_path):
                    os.remove(team_pcode_path)
                return {
                    "success": True,
                    "message": "Build de GameBanana reseteado. La proxima vez que instales un color se crea de nuevo, limpio.",
                }
            except Exception as e:
                return {"success": False, "message": f"Fallo el reseteo del build de GameBanana: {e}"}

        return AllInOne.reset_all_schemes(
            base_dir=get_data_dir(),
            ffdec_path=ffdec_path,
            swf_path=swf_path,
            log=print,
        )

    def update_color_values(self, brawlhalla_air_swf_path=None, ffdec_path=None,
                             swf_path=None, profile=None):
        """Botón "Update Color Values": en un solo paso, decompila
        BrawlhallaAir.swf, actualiza los identificadores dentro del
        módulo que esta build esté usando (AppAllInOne.py o AppPublic.py
        — se resuelve solo via AllInOne.__file__, sin hardcodear el
        nombre) y relinkea el UI_MainMenu.swf que ya tenga colores
        instalados, sin tocarlos.

        Con profile="gamebanana" NO relinkea la copia aislada tal cual
        esta: la regenera entera desde el swf real (o su .bak) y le
        reinyecta los colores que ya tenia guardados en su propio
        installed_schemes.json, ya con los identificadores nuevos. Asi
        se evita el problema de que esa copia haya quedado de una
        version vieja del juego (se crea una sola vez, la primera vez
        que se instala un color con el toggle de GameBanana activado, y
        nunca se refrescaba sola)."""
        if profile == "gamebanana":
            return self._update_color_values_gamebanana(
                brawlhalla_air_swf_path=brawlhalla_air_swf_path,
                ffdec_path=ffdec_path,
                swf_path=swf_path,
            )

        import AppRelinker as relinker
        base_dir, resolved_swf = _resolve_profile(profile, swf_path)
        return relinker.update_color_values(
            brawlhalla_air_swf_path=brawlhalla_air_swf_path,
            mainmenu_swf_path=resolved_swf,
            allinone_path=AllInOne.__file__,
            ffdec_path=ffdec_path,
            base_dir=base_dir,
            log=print,
        )

    def _update_color_values_gamebanana(self, brawlhalla_air_swf_path=None,
                                         ffdec_path=None, swf_path=None):
        """Version de update_color_values para el build de GameBanana.
        En vez de relinkear el pcode ya inyectado en la copia aislada
        (que puede corresponder a una version vieja del juego), la tira
        y la recrea desde el swf real/.bak actual, y sobre esa copia
        fresca reconstruye + reinyecta los colores que ya estaban en
        GameBananaBuild/installed_schemes.json, ya con los identificadores
        nuevos. Nunca lanza: siempre devuelve {"success", "message"}."""
        import AppRelinker as relinker

        log = print
        try:
            log("--- GameBanana: identificadores nuevos (BrawlhallaAir.swf) ---")
            air_path = brawlhalla_air_swf_path or relinker.upd._default_swf_path()
            new_cls, new_vec, new_arr, new_team = relinker.find_new_identifiers(air_path)
            log(f'Nuevos identificadores -> Class="{new_cls}" Vector="{new_vec}" Array="{new_arr}"')
            log(f'Nuevos identificadores de team colors -> {new_team}')
            relinker.upd.write_identifiers_to_allinone(
                new_cls, new_vec, new_arr, AllInOne.__file__, log=log
            )
            relinker.upd.write_team_identifiers_to_allinone(
                new_team, AllInOne.__file__, log=log
            )
        except SystemExit:
            return {
                "success": False,
                "message": (
                    "No se pudieron extraer los identificadores nuevos desde "
                    "BrawlhallaAir.swf. Revisa update.log para más detalles."
                ),
            }
        except Exception as e:
            return {"success": False, "message": f"Fallo actualizando identificadores: {e}"}

        log("--- GameBanana: regenerando el swf aislado desde el juego real ---")
        gb_swf = get_gamebanana_swf_path()
        try:
            if os.path.exists(gb_swf):
                os.remove(gb_swf)
            gb_backup = gb_swf + ".bak"
            if os.path.exists(gb_backup):
                os.remove(gb_backup)
            fresh_swf = _ensure_gamebanana_swf(swf_path)
        except Exception as e:
            return {
                "success": False,
                "message": (
                    "Identificadores actualizados, pero no pude regenerar el "
                    f"swf de GameBanana: {e}"
                ),
            }

        log("--- GameBanana: reinyectando los colores ya guardados ---")
        try:
            result = AllInOne.reinject_installed(
                base_dir=get_gamebanana_dir(),
                log=log,
                ffdec_path=ffdec_path,
                swf_path=str(fresh_swf),
            )
        except Exception as e:
            return {
                "success": False,
                "message": (
                    "Identificadores actualizados y swf de GameBanana regenerado, "
                    f"pero fallo la reinyeccion de los colores guardados: {e}"
                ),
            }
        prefix = "Identificadores actualizados y build de GameBanana regenerado desde cero. "
        if result.get("success"):
            result["message"] = prefix + result["message"]
        return result

    def open_gamebanana_build_folder(self):
        """Abre en el explorador la carpeta con el UI_MainMenu.swf del
        build secundario, listo para subir a GameBanana."""
        path = get_gamebanana_dir()
        try:
            if sys.platform.startswith("win"):
                os.startfile(path)
            elif sys.platform == "darwin":
                subprocess.run(["open", path])
            else:
                subprocess.run(["xdg-open", path])
        except Exception:
            pass
        return path

    def bulk_export_shapes_to_swf(self, shapes, ffdec_path=None):
        """Abre el selector nativo de archivos para elegir un .swf destino,
        y ahi inyecta -en bloque- cada shape recibida (ya recoloreada del
        lado JS, en la vista previa de "SWF Shapes"), reemplazando su
        DefineShape original.

        `shapes` es una lista de dicts {"characterId": int, "svg": str}
        -uno por cada shape que seguia marcada en el grid de preview-. El
        matcheo es por CharacterID real dentro del swf (lo mismo que ya
        usa AppCodeInstaller para el pcode, via FFDec -replace), asi que
        esto solo tiene sentido si el .swf elegido es el mismo (o una
        copia identica) del que salieron esas shapes originalmente.

        A diferencia de la version original (un -replace de FFDec por
        shape, encadenando la salida de uno como entrada del siguiente),
        esto agrupa TODOS los pares characterId/archivo.svg en TANDAS y
        hace un -replace por tanda: el CLI de FFDec soporta reemplazar
        varios tags en la misma invocacion (-replace <in> <out> <id1>
        <archivo1> [<id2> <archivo2> ...]), asi que cada tanda es una
        sola arrancada de la JVM en vez de una por shape (que es donde se
        iba casi todo el tiempo: el reemplazo en si es rapido, abrir Java
        una y otra vez no).

        El tamano de cada tanda se calcula dinamicamente para que la
        linea de comandos no supere ~7500 caracteres. Esto importa porque
        cuando ffdec_path apunta a "ffdec.bat" (el caso tipico en
        Windows), Windows no puede ejecutar un .bat directamente: lo
        corre via "cmd.exe /c", que tiene un limite de 8191 caracteres
        MUCHO mas chico que el limite general de CreateProcess (~32767).
        Con muchas shapes seleccionadas (sobre todo si algun CharacterID
        tiene 4+ digitos) un solo -replace gigante rompe ese limite con
        "La linea de comandos es demasiado larga". Encadenando tandas mas
        chicas (cada una usa la salida de la anterior como entrada) se
        evita el error sin volver a 1 proceso de FFDec por shape.

        Sobreescribe el .swf original en vez de dejar un "-recolored.swf"
        al lado (mismo criterio que inject_multicolor_swap en
        AppCodeInstaller.py): antes de tocarlo, crea un backup .bak si
        todavia no existe uno (nunca lo pisa si ya estaba), y recien
        despues mueve el resultado final sobre target_swf.
        """
        import tempfile
        import AppCodeInstaller as inj

        # Margen de seguridad bajo el limite de 8191 caracteres de
        # cmd.exe. Se aplica siempre (aunque ffdec_path no sea un .bat)
        # porque no cuesta nada ser conservador y evita tener que
        # detectar la extension del ejecutable de FFDec.
        MAX_CMDLINE_CHARS = 7500

        if not shapes:
            return {"success": False, "message": "No hay shapes seleccionadas para exportar."}

        try:
            result = webview.windows[0].create_file_dialog(
                webview.OPEN_DIALOG,
                file_types=("Archivos SWF (*.swf)", "Todos los archivos (*.*)"),
            )
        except Exception as e:
            return {"success": False, "message": f"No pude abrir el selector de archivos: {e}"}
        if not result:
            return {"success": False, "message": "cancelled"}

        target_swf = Path(result[0])
        if not target_swf.is_file():
            return {"success": False, "message": f"'{target_swf}' no es un archivo valido."}

        try:
            resolved_ffdec = inj.find_ffdec(ffdec_path)
        except inj.InjectError as e:
            return {"success": False, "message": str(e)}

        total = len(shapes)

        def _report_progress(done):
            """Empuja el progreso al overlay de la UI via evaluate_js —
            window.updateBulkExportProgress solo existe mientras
            bulkExportSWFShapesToSWF() esta corriendo del lado JS, asi que
            esto no hace nada (y no rompe nada) si se llama fuera de ese
            flujo o si la ventana ya se cerro."""
            try:
                webview.windows[0].evaluate_js(
                    f"window.updateBulkExportProgress && window.updateBulkExportProgress({done}, {total})"
                )
            except Exception:
                pass

        try:
            with tempfile.TemporaryDirectory() as tmp:
                tmp_dir = Path(tmp)

                # Escribe cada shape a su propio .svg temporal (FFDec
                # -replace pide un archivo por tag) y arma la lista de
                # pares validos.
                pairs = []
                skipped = 0
                for i, shape in enumerate(shapes):
                    char_id = shape.get("characterId")
                    svg_text = shape.get("svg")
                    if char_id is None or not svg_text:
                        skipped += 1
                        continue
                    svg_path = tmp_dir / f"shape_{i}.svg"
                    svg_path.write_text(svg_text, encoding="utf-8")
                    pairs.append((str(char_id), str(svg_path)))

                valid_count = len(pairs)
                if valid_count == 0:
                    return {"success": False, "message": "No hay shapes validas para exportar."}

                # Agrupa los pares en tandas cuyo -replace quede por
                # debajo de MAX_CMDLINE_CHARS. El largo base (ejecutable
                # + "-replace" + rutas in/out, con comillas si tienen
                # espacios) se descuenta primero. La salida final (ultima
                # tanda) va SIEMPRE a un archivo temporal, nunca directo
                # a target_swf: recien se mueve encima del original si
                # TODAS las tandas terminaron bien.
                final_tmp = tmp_dir / "final_result.swf"
                base_len = len(resolved_ffdec) + len("-replace") + len(str(target_swf)) + len(str(final_tmp)) + 40
                chunks = []
                current = []
                current_len = base_len
                for char_id, svg_path in pairs:
                    pair_len = len(char_id) + len(svg_path) + 2
                    if current and current_len + pair_len > MAX_CMDLINE_CHARS:
                        chunks.append(current)
                        current = []
                        current_len = base_len
                    current.append((char_id, svg_path))
                    current_len += pair_len
                if current:
                    chunks.append(current)

                current_in = target_swf
                done = 0
                for idx, chunk in enumerate(chunks):
                    is_last = idx == len(chunks) - 1
                    step_out = final_tmp if is_last else tmp_dir / f"step_{idx}.swf"

                    args = ["-replace", str(current_in), str(step_out)]
                    for char_id, svg_path in chunk:
                        args += [char_id, svg_path]

                    step_result = inj.run_ffdec(resolved_ffdec, args)
                    if step_result.returncode != 0 or not step_out.exists():
                        return {
                            "success": False,
                            "message": (
                                f"FFDec no pudo reemplazar la tanda {idx + 1}/{len(chunks)} "
                                "(revisa la consola para el detalle). El .swf original no fue tocado."
                            ),
                        }

                    current_in = step_out
                    done += len(chunk)
                    _report_progress(done)

                # Todas las tandas salieron bien: recien ahora se toca el
                # original. Backup .bak primero (nunca pisa uno ya
                # existente), despues se mueve el resultado encima.
                backup_path = target_swf.with_suffix(target_swf.suffix + ".bak")
                if not backup_path.exists():
                    shutil.copy2(target_swf, backup_path)

                shutil.move(str(final_tmp), str(target_swf))
        except Exception as e:
            return {"success": False, "message": f"Fallo el export a SWF: {e}"}

        message = f'{valid_count}/{total} shape(s) reemplazadas en "{target_swf.name}"'
        if len(chunks) > 1:
            message += f" ({len(chunks)} tandas de FFDec)"
        if skipped:
            message += f" ({skipped} omitidas por datos incompletos)"
        return {"success": True, "message": message, "path": str(target_swf)}


def main():
    # IMPORTANTE: hay que llamar a esto ANTES de cualquier paso del
    # pipeline (install_scheme_and_inject, etc.). Sin esto, last_values.json
    # se lee/escribe en la carpeta temporal que PyInstaller crea en cada
    # arranque (_MEIPASS) y se pierde al cerrar el .exe, en vez de quedar
    # guardado junto a installed_schemes.json en AppData\AzuModification.
    AllInOne.configure_paths(get_data_dir())
    _seed_bundled_prerenders()
    _seed_bundled_sprite_types()

    html_path = resource_path("index.html")

    if not os.path.exists(html_path):
        print(f"No se encontró el archivo: {html_path}")
        sys.exit(1)

    # Habilita que los archivos generados por la app (ej. ColourScheme.svg)
    # se guarden de verdad en el disco al hacer clic en "Download"
    webview.settings['ALLOW_DOWNLOADS'] = True

    api = Api()

    webview.create_window(
        title="Azu Modification — Brawlhalla Colour Scheme Editor",
        url=html_path,
        js_api=api,
        width=1280,
        height=800,
        resizable=True,
        min_size=(900, 600),
        maximized=True,   # abre la ventana ocupando toda la pantalla (con barra de título)
    )
    # debug=False: evita que se abran las DevTools automáticamente.
    # private_mode=False + storage_path fijo: hace que localStorage (donde se
    # guardan las paletas) persista entre una apertura del programa y la siguiente.
    webview.start(
        debug=False,
        private_mode=False,
        storage_path=get_storage_path(),
    )


if __name__ == "__main__":
    try:
        main()
    except Exception:
        _show_fatal_error(
            "Azu Modification — Error",
            "El programa encontró un error y tuvo que cerrarse.\n\n"
            + traceback.format_exc(),
        )
        sys.exit(1)

# ---------------------------------------------------------------------------
# Cómo convertirlo en un .exe standalone (Windows), para no depender de Python:
#
#   pip install pyinstaller
#   pyinstaller --onefile --windowed --icon=icon.ico --add-data "index.html;." --add-data "icon.ico;." launcher.py
#
# El ejecutable quedará en la carpeta dist/launcher.exe
# En macOS/Linux, usa "index.html:." en vez de "index.html;." en --add-data
#
# CodeMirror (codemirror.bundle.js) y JSZip (dentro de app.js/styles.css)
# ya están incluidos, no se cargan de un CDN, así que la app funciona sin
# conexión a internet sin necesitar ningún --add-data extra para eso.
# ---------------------------------------------------------------------------
