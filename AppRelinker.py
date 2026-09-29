#!/usr/bin/env python3
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


_FINGERPRINT_MARKERS = ('"hasDefinition"', '"getDefinition"')

_METHOD_BLOCK_RE = re.compile(r"method\b.*?end\s*;\s*method", re.DOTALL)


def export_class_pcode(ffdec_path, swf_path, class_name, out_dir):
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
    for match in _METHOD_BLOCK_RE.finditer(class_pcode_text):
        block = match.group(0)
        if all(marker in block for marker in _FINGERPRINT_MARKERS):
            return block, match.start(), match.end()

    raise inj.InjectError(
        "No se encontro ningun metodo con el patron de AzuMod dentro de la clase "
        f"({inj.CLASS_NAME}). O el swf no tiene nada inyectado todavia, o el "
        "juego cambio la estructura del constructor."
    )


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
    text = method_block
    total_replacements = 0

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

    text, n = re.subn(
        r'(getlocal 5\s*\n\s*getproperty QName\(PackageNamespace\("","4"\),")([^"]*)("\)\s*\n\s*setlocal 7)',
        lambda m: m.group(1) + new_vec + m.group(3),
        text,
        count=1,
    )
    if n:
        log(f"  - ColorSwapVector (header getproperty): {n} reemplazo")
        total_replacements += n

    text, n = re.subn(
        r'(getproperty MultinameL\(\[PackageNamespace\("","3"\)\]\)\s*\n\s*'
        r'coerce QName\(PackageNamespace\("","4"\),")([^"]*)("\)\s*\n\s*setlocal 13)',
        lambda m: m.group(1) + new_cls + m.group(3),
        text,
    )
    if n:
        log(f"  - ColorSwapClass (por bloque de color normal): {n} reemplazo(s)")
        total_replacements += n

    text, n = re.subn(
        r'(coerce QName\(PackageNamespace\("","4"\),"Array"\)\s*\n\s*'
        r'initproperty QName\(PackageNamespace\("","4"\),")([^"]*)("\))',
        lambda m: m.group(1) + new_arr + m.group(3),
        text,
    )
    if n:
        log(f"  - ColorSwapArray (por bloque de color): {n} reemplazo(s)")
        total_replacements += n

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


def update_color_values(
    brawlhalla_air_swf_path=None,
    mainmenu_swf_path=None,
    allinone_path=None,
    ffdec_path=None,
    class_name=None,
    base_dir=None,
    log=print,
):
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
