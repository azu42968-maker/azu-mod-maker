#!/usr/bin/env python3
"""
AppRelinker.py
------------------
NO reconstruye MultiColorSwap.pcode desde installed_schemes.json (eso ya
lo hace AppAllInOne.py/AppUpdater.py y requiere la app). Este script
es para el caso contrario: alguien tiene su UI_MainMenu.swf YA modificado
(con colores custom inyectados por AzuMod en algun momento) pero no tiene
la app ni sus archivos de configuracion, y despues de una actualizacion
de Brawlhalla el ColorSwapClass/Vector/Array cambiaron de nombre, asi que
el codigo ya inyectado quedo roto (apunta a identificadores que ya no
existen en el BrawlhallaAir.swf nuevo).

La solucion: entrar al UI_MainMenu.swf, exportar el pcode EXACTO del
metodo ya inyectado (con sus colores y todo, tal cual esta), reemplazar
SOLO las 3 strings de identificador (ColorSwapClass/Vector/Array) por las
nuevas, y reinyectar ese mismo pcode editado en el mismo lugar. Los
colores ya instalados no se tocan para nada.

No hace falta saber los identificadores VIEJOS de antemano: el script los
ubica solo, por posicion estructural dentro del pcode (son siempre el
mismo patron fijo que genera AppAllInOne.py: pushstring antes de coerce_s
para la clase, getproperty QName(...) para el vector, coerce QName(...)
para la clase repetida en cada bloque de color, initproperty QName(...)
para el array).

Requiere: AppUpdater.py y AppCodeInstaller.py en la misma carpeta.
NO requiere AppAllInOne.py ni installed_schemes.json.

Uso:
    python AppRelinker.py [ruta_BrawlhallaAir.swf] [ruta_UI_MainMenu.swf] [base_dir]

Por defecto ambas rutas se autodetectan (Steam/Epic), igual que
AppUpdater.py y AppCodeInstaller.py. base_dir (carpeta con
installed_team_schemes.json) por defecto es la carpeta de este script;
solo hace falta pasarlo si tenes team colors instalados y tu
installed_team_schemes.json vive en otro lado.
"""

import json
import os
import re
import sys
import tempfile
from pathlib import Path

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

import AppUpdater as upd
import AppCodeInstaller as inj


def log(msg):
    upd.log(msg)


# ----------------------------------------------------------------------
# Paso 1 (logica de AppUpdater.py): identificadores NUEVOS
# ----------------------------------------------------------------------
def find_new_identifiers(brawlhalla_air_swf_path):
    upd.check_java()
    upd.ensure_ffdec()

    if not os.path.isfile(brawlhalla_air_swf_path):
        upd.fail(f"No se encontro BrawlhallaAir.swf en '{brawlhalla_air_swf_path}'.")

    with tempfile.TemporaryDirectory() as workdir:
        export_dir = os.path.join(workdir, "decompiled")
        os.makedirs(export_dir, exist_ok=True)

        upd.export_scripts(brawlhalla_air_swf_path, export_dir)

        best = upd.find_target_as_file(export_dir)
        if best is None:
            upd.fail(
                "No se encontro ninguna clase con exactamente esos 4 imports. "
                "Puede que el juego haya cambiado la estructura interna.",
                code=2,
            )

        with open(best, "r", encoding="utf-8", errors="ignore") as f:
            dump_text = f.read()

        values = upd.find_values(dump_text)
        if not values:
            upd.fail(
                f'no se encontro la clase con "NO_COLOR_SCHEME" (o sus campos) en {best}',
                code=2,
            )

        team_values = upd.find_team_values(dump_text)
        if not team_values:
            upd.fail(
                f'no se encontraron los 16 identificadores de team colors en {best} '
                '(el juego pudo haber cambiado esa estructura).',
                code=2,
            )

        return values["class_name"], values["vector_name"], values["array_name"], team_values


# ----------------------------------------------------------------------
# Paso 2: exportar el pcode YA inyectado desde UI_MainMenu.swf
# ----------------------------------------------------------------------
# Fingerprint unico del metodo que inyecta AppAllInOne.py (build_header):
# ambas llamadas (hasDefinition/getDefinition) son las unicas 2 lineas
# que ningun otro metodo del juego deberia tener juntas. OJO: la
# etiqueta que usa build_header como "InvalidClass" se pierde al
# reexportar (FFDec la renombra a algo tipo "ofsNNNN:"), asi que NO se
# puede usar como parte del fingerprint.
_FINGERPRINT_MARKERS = ('"hasDefinition"', '"getDefinition"')

_METHOD_BLOCK_RE = re.compile(r"method\b.*?end\s*;\s*method", re.DOTALL)


def export_class_pcode(ffdec_path, swf_path, class_name, out_dir):
    """Exporta TODOS los metodos de class_name como p-code (mismo formato
    que espera -replace) usando -format script:pcode. Devuelve el texto
    completo del archivo exportado."""
    inj.run_ffdec(
        ffdec_path,
        [
            "-format", "script:pcode",
            "-selectclass", class_name,
            "-export", "script",
            str(out_dir),
            str(swf_path),
        ],
    )

    candidates = list(Path(out_dir).rglob(f"{class_name}.*"))
    if not candidates:
        # algunas versiones de FFDec igual usan .as como extension aunque
        # el contenido sea pcode -> buscar cualquier archivo que matchee
        candidates = [
            f for f in Path(out_dir).rglob("*")
            if f.is_file() and f.stem == class_name
        ]
    if not candidates:
        raise inj.InjectError(
            f"FFDec no genero ningun archivo exportado para la clase {class_name} "
            f"(revisa que -format script:pcode sea soportado por tu version de FFDec)."
        )

    return candidates[0].read_text(encoding="utf-8", errors="replace")


def find_injected_method_block(class_pcode_text):
    """De todo el pcode de la clase (varios metodos concatenados), aisla
    el bloque del metodo que AppAllInOne.py inyecto, por su fingerprint
    unico (busqueda dinamica de ColorSwapClass via ApplicationDomain +
    label InvalidClass, que ningun otro metodo del juego deberia tener)."""
    for match in _METHOD_BLOCK_RE.finditer(class_pcode_text):
        block = match.group(0)
        if all(marker in block for marker in _FINGERPRINT_MARKERS):
            return block, match.start(), match.end()

    raise inj.InjectError(
        "No se encontro ningun metodo con el patron de AzuMod dentro de la clase "
        f"({inj.CLASS_NAME}). O el swf no tiene nada inyectado todavia, o el "
        "juego cambio la estructura del constructor."
    )


# ----------------------------------------------------------------------
# Paso 3: reemplazar SOLO los identificadores viejos por los nuevos
# ----------------------------------------------------------------------
# Fingerprint de un bloque de team color instalado (ver
# AppAllInOne.build_team_color_block): a diferencia de Class/Vector/Array
# (un unico identificador global, repetido igual en cada bloque), CADA
# team color tiene su PROPIO identificador ofuscado, distinto por slot. Se
# ubica por el comentario que build_team_color_block siempre deja arriba
# de cada bloque, que incluye el nombre logico del slot (ej "TeamRed1") --
# ese nombre SI es estable entre versiones, a diferencia del identificador.
# Fingerprint estructural de un bloque de team color ya inyectado (ver
# AppAllInOne.build_team_color_block): getlocal 5 (la clase) + getproperty
# QName(...) por nombre + coerce QName(...) + setlocal 13. A diferencia de
# la version anterior de este regex, esto NO depende de ningun comentario:
# se verifico empiricamente que FFDec NO conserva comentarios ";" al
# reexportar un metodo ya compilado (se probo inyectando un bloque con un
# comentario y reexportandolo: el comentario desaparecio del todo). Por
# eso cada team color se identifica solo por FORMA, y para saber a que
# slot (TeamRed1, TeamBlue3, etc.) corresponde cada match hace falta el
# ORDEN en que AppAllInOne.py los genero -- ver _load_team_slot_order().
_TEAM_BLOCK_RE = re.compile(
    r'getlocal 5\s*\n'
    r'\s*getproperty QName\(PackageNamespace\("","4"\),"(?P<prop>[^"]*)"\)\s*\n'
    r'\s*coerce QName\(PackageNamespace\("","4"\),"(?P<cls>[^"]*)"\)\s*\n'
    r'\s*setlocal 13'
)

_TEAM_SLOT_ORDER = [
    "TeamRed1", "TeamRed2", "TeamRed3", "TeamRed4",
    "TeamBlue1", "TeamBlue2", "TeamBlue3", "TeamBlue4",
    "TeamYellow1", "TeamYellow2", "TeamYellow3", "TeamYellow4",
    "TeamPurple1", "TeamPurple2", "TeamPurple3", "TeamPurple4",
]


def _load_team_slot_order(base_dir):
    """Lee installed_team_schemes.json de base_dir y devuelve la lista de
    slots en el MISMO orden en que AppAllInOne.build_combined_pcode() los
    escribio (_TEAM_SLOT_ORDER filtrado a los que estan instalados). Como
    ya no se puede identificar cada bloque de team color por comentario
    (ver nota arriba de _TEAM_BLOCK_RE), esta es la unica forma de saber
    a que slot corresponde el Nesimo bloque encontrado en el swf: es la
    MISMA fuente de datos que uso AppAllInOne.py para generarlos, en el
    mismo orden.

    Devuelve [] si el archivo no existe o esta vacio/corrupto (sin
    lanzar): eso simplemente significa "no hay team colors instalados",
    y relink_identifiers no deberia encontrar ningun bloque de team color
    tampoco en ese caso."""
    store_path = os.path.join(base_dir, "installed_team_schemes.json")
    if not os.path.isfile(store_path):
        return []
    try:
        with open(store_path, "r", encoding="utf-8") as f:
            installed_team = json.load(f)
    except Exception:
        return []
    return [s for s in _TEAM_SLOT_ORDER if s in installed_team]


def relink_identifiers(method_block, new_cls, new_vec, new_arr, new_team=None, team_slot_order=None, log=print):
    """Reemplaza in-place, dentro del texto del metodo ya inyectado, los
    identificadores viejos por los nuevos, ubicandolos por posicion
    estructural (no hace falta saber los valores viejos). No toca nada
    mas: colores, pushbytes, cantidad de bloques, etc. quedan exactamente
    igual.

    Desde que AppAllInOne.write_combined_pcode() junta colores "normales"
    y team colors en UN solo metodo, este puede tener bloques de ambos
    tipos a la vez (antes eran 2 formatos mutuamente excluyentes). Los
    pasos 2/3 (Vector, Class por bloque normal) y el paso 5 (team colors)
    son cada uno opcionales: no es un error que falten, solo indica que
    no hay colores de ese tipo instalados. Se levanta error solo si, al
    final, no se reemplazo nada en absoluto.

    new_team: dict opcional {nombre_logico: identificador_nuevo} (el que
    devuelve AppUpdater.find_team_values()).

    team_slot_order: lista opcional de slots (ej. ["TeamRed1", "TeamBlue3"])
    en el MISMO orden en que build_combined_pcode() escribio los bloques
    de team color la primera vez (ver _load_team_slot_order()). Hace
    falta porque, a diferencia de Class/Vector/Array o de los colores
    normales (que se ubican por su propio pushbyte visible en el pcode),
    todos los bloques de team color tienen la MISMA forma en bytecode: lo
    unico que los distinguia entre si era un comentario, y se verifico
    que FFDec NO conserva comentarios al reexportar un metodo ya
    compilado. Sin team_slot_order, si el metodo tiene bloques de team
    color se levanta InjectError en vez de arriesgarse a asignar cada
    bloque al slot equivocado."""
    text = method_block
    total_replacements = 0

    # 1) Clase, en el header: pushstring "X" -> coerce_s -> setlocal 6
    #    (comun a AMBOS formatos: build_header y build_team_header)
    text, n = re.subn(
        r'(pushstring\s+")([^"]*)(")',
        lambda m: m.group(1) + new_cls + m.group(3),
        text,
        count=1,
    )
    if n == 0:
        raise inj.InjectError("No se encontro el 'pushstring' de ColorSwapClass en el header (patron inesperado).")
    log(f"  - ColorSwapClass (header pushstring): {n} reemplazo")
    total_replacements += n

    # 2) Vector: getlocal 5 -> getproperty QName(...,"X") -> setlocal 7
    #    SOLO existe en el formato "normal" (build_header). Que no aparezca
    #    no es un error: indica que este metodo es de team colors.
    text, n = re.subn(
        r'(getlocal 5\s*\n\s*getproperty QName\(PackageNamespace\("","4"\),")([^"]*)("\)\s*\n\s*setlocal 7)',
        lambda m: m.group(1) + new_vec + m.group(3),
        text,
        count=1,
    )
    if n:
        log(f"  - ColorSwapVector (header getproperty): {n} reemplazo")
        total_replacements += n

    # 3) Clase repetida, una vez por color "normal" instalado:
    #    getproperty MultinameL(...) -> coerce QName(...,"X") -> setlocal 13
    #    Tampoco es un error que no aparezca: indica que no hay colores
    #    "normales" instalados en este metodo (solo team colors, o ninguno).
    text, n = re.subn(
        r'(getproperty MultinameL\(\[PackageNamespace\("","3"\)\]\)\s*\n\s*'
        r'coerce QName\(PackageNamespace\("","4"\),")([^"]*)("\)\s*\n\s*setlocal 13)',
        lambda m: m.group(1) + new_cls + m.group(3),
        text,
    )
    if n:
        log(f"  - ColorSwapClass (por bloque de color normal): {n} reemplazo(s)")
        total_replacements += n

    # 4) Array, una vez por color instalado:
    #    coerce QName(...,"Array") -> initproperty QName(...,"X")
    #    (comun a AMBOS formatos: build_color_block y build_team_color_block)
    text, n = re.subn(
        r'(coerce QName\(PackageNamespace\("","4"\),"Array"\)\s*\n\s*'
        r'initproperty QName\(PackageNamespace\("","4"\),")([^"]*)("\))',
        lambda m: m.group(1) + new_arr + m.group(3),
        text,
    )
    if n:
        log(f"  - ColorSwapArray (por bloque de color): {n} reemplazo(s)")
        total_replacements += n

    # 5) Team colors: uno por slot instalado. A diferencia de Class/Vector/
    #    Array (un identificador global) o los colores "normales" (que se
    #    ubican por su propio pushbyte, visible en el pcode), todos los
    #    bloques de team color tienen la MISMA forma -- lo unico que los
    #    distinguia era un comentario que NO sobrevive a un re-export real
    #    (verificado empiricamente). Por eso se matchean por posicion: el
    #    Nesimo bloque encontrado en el texto corresponde al Nesimo slot de
    #    team_slot_order (mismo orden en que build_combined_pcode los
    #    escribio la primera vez).
    matches = list(_TEAM_BLOCK_RE.finditer(text))
    if matches:
        if not team_slot_order:
            raise inj.InjectError(
                f"El metodo tiene {len(matches)} bloque(s) de team color instalado(s) "
                "en el swf, pero no encontre installed_team_schemes.json (o esta "
                "vacio) para saber a que slot corresponde cada uno. Sin eso no puedo "
                "relinkearlos de forma segura -- podria terminar escribiendole el "
                "color equivocado a un slot. Revisa que base_dir apunte a la carpeta "
                "correcta (la misma que usa el launcher, con installed_team_schemes.json "
                "adentro)."
            )
        if len(matches) != len(team_slot_order):
            raise inj.InjectError(
                f"El metodo tiene {len(matches)} bloque(s) de team color en el swf, "
                f"pero installed_team_schemes.json dice que deberian ser "
                f"{len(team_slot_order)} ({', '.join(team_slot_order)}). No relinkeo "
                "nada de team colors para no arriesgarme a mezclar los slots; revisa "
                "que ambos esten sincronizados (o corre 'Resetear todos los colores' "
                "y volve a instalarlos)."
            )
        # De atras para adelante, para que reemplazar un bloque no corra
        # los indices/offsets de los bloques que todavia faltan procesar.
        n_blocks = len(matches)
        for i in range(n_blocks - 1, -1, -1):
            m = matches[i]
            slot = team_slot_order[i]
            if not new_team or slot not in new_team:
                raise inj.InjectError(
                    f'Hay un bloque de team color instalado ("{slot}") pero no tengo '
                    "un identificador nuevo para el (revisa que find_team_values() "
                    "haya devuelto ese slot)."
                )
            new_prop = new_team[slot]
            old_prop = m.group("prop")
            old_cls_in_block = m.group("cls")
            block = m.group(0)
            block = block.replace(f'"{old_prop}"', f'"{new_prop}"', 1)
            block = block.replace(f'"{old_cls_in_block}"', f'"{new_cls}"', 1)
            start, end = m.span()
            text = text[:start] + block + text[end:]
            log(f'  - team color "{slot}" (bloque #{i + 1}): "{old_prop}" -> "{new_prop}"')
        total_replacements += n_blocks

    if total_replacements == 0:
        raise inj.InjectError(
            "No se encontro ningun bloque de color (ni normal ni de team color) "
            "dentro del metodo inyectado. El patron pudo haber cambiado."
        )

    return text, total_replacements


# ----------------------------------------------------------------------
# Orquestador
# ----------------------------------------------------------------------
def relink_mainmenu(brawlhalla_air_swf_path, mainmenu_swf_path=None, ffdec_path=None, class_name=None, base_dir=None):
    class_name = class_name or inj.CLASS_NAME
    base_dir = base_dir or SCRIPT_DIR

    log("--- Paso 1/3: identificadores nuevos (BrawlhallaAir.swf actualizado) ---")
    new_cls, new_vec, new_arr, new_team = find_new_identifiers(brawlhalla_air_swf_path)
    log(f'Nuevos identificadores -> Class="{new_cls}" Vector="{new_vec}" Array="{new_arr}"')
    log(f'Nuevos identificadores de team colors -> {new_team}')

    team_slot_order = _load_team_slot_order(base_dir)
    if team_slot_order:
        log(f"Team colors instalados (orden): {', '.join(team_slot_order)}")

    resolved_ffdec = inj.find_ffdec(ffdec_path)
    resolved_swf = Path(mainmenu_swf_path) if mainmenu_swf_path else inj.find_brawlhalla_swf()
    if resolved_swf is None or not resolved_swf.exists():
        upd.fail("No se encontro UI_MainMenu.swf. Indica la ruta a mano.")

    log(f"\n--- Paso 2/3: exportando el pcode ya inyectado desde {resolved_swf.name} ---")
    with tempfile.TemporaryDirectory() as tmp:
        class_pcode_text = export_class_pcode(resolved_ffdec, resolved_swf, class_name, tmp)

        # Volcado de depuracion: se guarda SIEMPRE (no solo si falla) al
        # lado de este script, para poder revisar el formato real que
        # devuelve FFDec si algo no calza con lo esperado.
        debug_path = Path(SCRIPT_DIR) / "debug_class_pcode.txt"
        try:
            debug_path.write_text(class_pcode_text, encoding="utf-8")
            log(f"(debug) pcode exportado de la clase guardado en: {debug_path}")
        except Exception:
            pass

        try:
            block_text, start, end = find_injected_method_block(class_pcode_text)
        except inj.InjectError:
            log(
                f"\nNo se encontro el patron esperado. Revisa/comparti el contenido de "
                f"{debug_path} para ajustar la deteccion."
            )
            raise
        log("Metodo inyectado encontrado (bloque aislado por fingerprint).")

        log("\n--- Paso 3/3: reemplazando identificadores viejos por los nuevos ---")
        edited_block, n_total = relink_identifiers(
            block_text, new_cls, new_vec, new_arr,
            new_team=new_team, team_slot_order=team_slot_order, log=log,
        )

        edited_pcode_path = Path(tmp) / "relinked_method.pcode"
        edited_pcode_path.write_text(edited_block, encoding="utf-8", newline="\r\n")

        log(f"\n--- Reinyectando ({n_total} identificador(es) actualizados) ---")
        patched_swf = inj.inject_multicolor_swap(
            pcode_path=edited_pcode_path,
            ffdec_path=resolved_ffdec,
            swf_path=resolved_swf,
            class_name=class_name,
            log=log,
        )

    log(f"\nListo. {resolved_swf.name} actualizado en: {patched_swf}")
    log("Los colores ya instalados no se tocaron, solo los identificadores.")
    return patched_swf


# ----------------------------------------------------------------------
# Botón "Update Color Values": AppUpdater.py + AppRelinker.py en un paso
# ----------------------------------------------------------------------
def update_color_values(
    brawlhalla_air_swf_path=None,
    mainmenu_swf_path=None,
    allinone_path=None,
    ffdec_path=None,
    class_name=None,
    base_dir=None,
    log=print,
):
    """Combina en un solo paso lo que antes eran dos scripts separados:
    1) AppUpdater.py: extrae los identificadores nuevos desde
       BrawlhallaAir.swf y actualiza DEFAULT_CLASS/VECTOR/ARRAY (y
       DEFAULT_TEAM_PROPS) en AppAllInOne.py (o AppPublic.py, el que se
       le pase en allinone_path).
    2) AppRelinker.py: con ESOS MISMOS identificadores (no hace falta
       decompilar dos veces), relinkea el UI_MainMenu.swf que ya tiene
       colores instalados (normales y de equipo), sin tocarlos.

    - base_dir: carpeta donde viven installed_schemes.json e
      installed_team_schemes.json (la misma que usa AppAllInOne.py, ej.
      get_data_dir() del launcher). Hace falta para saber a que slot
      corresponde cada bloque de team color ya inyectado (ver
      _load_team_slot_order() / relink_identifiers()). Si se omite, usa
      SCRIPT_DIR (uso por consola, con los .json al lado del script).

    Version "libreria" pensada para el botón "Update Color Values" del
    launcher/.exe: a diferencia de relink_mainmenu()/main(), NUNCA
    lanza ni hace sys.exit. Siempre devuelve {"success", "message"}.
    Si el paso 1 (AppAllInOne.py) sale bien pero el paso 2 (relink del
    swf) falla, success sigue reflejando el resultado del swf, pero el
    mensaje aclara que AppAllInOne.py sí quedó actualizado.
    """
    class_name = class_name or inj.CLASS_NAME
    brawlhalla_air_swf_path = brawlhalla_air_swf_path or upd._default_swf_path()
    allinone_path = allinone_path or os.path.join(SCRIPT_DIR, "AppAllInOne.py")
    base_dir = base_dir or SCRIPT_DIR

    log("--- Paso 1/4: identificadores nuevos (BrawlhallaAir.swf actualizado) ---")
    try:
        new_cls, new_vec, new_arr, new_team = find_new_identifiers(brawlhalla_air_swf_path)
    except SystemExit:
        return {
            "success": False,
            "message": (
                "No se pudieron extraer los identificadores nuevos desde "
                "BrawlhallaAir.swf. Revisa update.log para más detalles."
            ),
        }
    except Exception as e:
        return {"success": False, "message": f"Fallo el paso 1 (identificadores nuevos): {e}"}
    log(f'Nuevos identificadores -> Class="{new_cls}" Vector="{new_vec}" Array="{new_arr}"')
    log(f'Nuevos identificadores de team colors -> {new_team}')

    log("\n--- Paso 2/4: actualizando AppAllInOne.py ---")
    try:
        upd.write_identifiers_to_allinone(new_cls, new_vec, new_arr, allinone_path, log=log)
        upd.write_team_identifiers_to_allinone(new_team, allinone_path, log=log)
    except upd.UpdateError as e:
        return {"success": False, "message": f"Fallo actualizando AppAllInOne.py: {e}"}
    except Exception as e:
        return {"success": False, "message": f"Fallo actualizando AppAllInOne.py: {e}"}

    try:
        resolved_ffdec = inj.find_ffdec(ffdec_path)
    except inj.InjectError as e:
        return {
            "success": False,
            "message": f"AppAllInOne.py se actualizó, pero no pude relinkear el swf: {e}",
        }

    resolved_swf = Path(mainmenu_swf_path) if mainmenu_swf_path else inj.find_brawlhalla_swf()
    if resolved_swf is None or not resolved_swf.exists():
        return {
            "success": False,
            "message": (
                "AppAllInOne.py se actualizó, pero no encontré UI_MainMenu.swf "
                "para relinkearlo. Indica la ruta a mano."
            ),
        }

    log(f"\n--- Paso 3/4: exportando el pcode ya inyectado desde {resolved_swf.name} ---")
    team_slot_order = _load_team_slot_order(base_dir)
    if team_slot_order:
        log(f"Team colors instalados (orden): {', '.join(team_slot_order)}")
    try:
        with tempfile.TemporaryDirectory() as tmp:
            class_pcode_text = export_class_pcode(resolved_ffdec, resolved_swf, class_name, tmp)

            debug_path = Path(SCRIPT_DIR) / "debug_class_pcode.txt"
            try:
                debug_path.write_text(class_pcode_text, encoding="utf-8")
                log(f"(debug) pcode exportado de la clase guardado en: {debug_path}")
            except Exception:
                pass

            try:
                block_text, start, end = find_injected_method_block(class_pcode_text)
            except inj.InjectError:
                return {
                    "success": False,
                    "message": (
                        "AppAllInOne.py se actualizó, pero UI_MainMenu.swf no tiene "
                        "nada inyectado todavía (nada que relinkear), o el patrón "
                        f"cambió. Revisa {debug_path}."
                    ),
                }

            log("\n--- Paso 4/4: reemplazando identificadores viejos por los nuevos ---")
            edited_block, n_total = relink_identifiers(
                block_text, new_cls, new_vec, new_arr,
                new_team=new_team, team_slot_order=team_slot_order, log=log,
            )

            edited_pcode_path = Path(tmp) / "relinked_method.pcode"
            edited_pcode_path.write_text(edited_block, encoding="utf-8", newline="\r\n")

            log(f"\n--- Reinyectando ({n_total} identificador(es) actualizados) ---")
            inj.inject_multicolor_swap(
                pcode_path=edited_pcode_path,
                ffdec_path=resolved_ffdec,
                swf_path=resolved_swf,
                class_name=class_name,
                log=log,
            )
    except inj.InjectError as e:
        return {
            "success": False,
            "message": f"AppAllInOne.py se actualizó, pero falló el relink del swf: {e}",
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"AppAllInOne.py se actualizó, pero falló el relink del swf: {e}",
        }

    return {
        "success": True,
        "message": (
            f"Listo: AppAllInOne.py y {resolved_swf.name} quedaron al día con los "
            f"identificadores nuevos ({n_total} actualizados en el swf). Los "
            "colores ya instalados no se tocaron."
        ),
    }


def main():
    swf_path = sys.argv[1] if len(sys.argv) > 1 else upd._default_swf_path()
    mainmenu_path = sys.argv[2] if len(sys.argv) > 2 else None
    base_dir = sys.argv[3] if len(sys.argv) > 3 else None

    log(f"=== AppRelinker: BrawlhallaAir.swf={swf_path} ===")
    try:
        relink_mainmenu(swf_path, mainmenu_path, base_dir=base_dir)
    except inj.InjectError as e:
        log(f"\nERROR: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
