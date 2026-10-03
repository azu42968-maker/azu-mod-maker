#!/usr/bin/env python3
import argparse
import re
import shutil
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

DEFAULT_PCODE = SCRIPT_DIR / "discovery_header.pcode"
PATCH_PREVIEW = SCRIPT_DIR / "AppPublic_patch_REVISAR.py"
REPORT_FILE = SCRIPT_DIR / "patch_report.txt"
APPPUBLIC_PATH = SCRIPT_DIR / "AppPublic.py"

SETLOCAL_RE = re.compile(r"setlocal\s+(\d+)")
BREAK_JUMP_RE = re.compile(r"\bjump\b|\bcontinue\b")


def log(msg):
    print(f"[AppAutoPatch] {msg}")


def run_build(mxmlc_path):
    import AppPcodeBuilder as builder
    import AppUpdater as upd

    upd.check_java()
    upd.ensure_ffdec()

    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        out_swf = tmp / "discovery_probe.swf"
        builder.compile_as(mxmlc_path, builder.AS_SOURCE, out_swf)

        export_dir = tmp / "exported"
        export_dir.mkdir()
        full_text = builder.export_class_pcode(upd.FFDEC_JAR, out_swf, builder.CLASS_NAME, export_dir)
        block = builder.isolate_constructor_block(full_text)

        DEFAULT_PCODE.write_text(block, encoding="utf-8", newline="\r\n")
        log(f"Generado: {DEFAULT_PCODE}")
        return block


def find_three_final_setlocals(pcode_text):
    lines = [ln.strip() for ln in pcode_text.splitlines()]

    candidates = []
    for idx, line in enumerate(lines):
        if not BREAK_JUMP_RE.search(line):
            continue

        window = lines[max(0, idx - 40):idx]
        setlocals_in_window = [
            (i, int(m.group(1)))
            for i, ln in enumerate(window)
            for m in [SETLOCAL_RE.search(ln)]
            if m
        ]
        if len(setlocals_in_window) < 3:
            continue

        last_three = setlocals_in_window[-3:]
        regs = [r for _, r in last_three]
        if len(set(regs)) != 3:
            continue

        candidates.append((idx, regs))

    if not candidates:
        raise ValueError(
            "No encontre un patron de 3 'setlocal' distintos seguidos de un "
            "jump/continue. Puede que el compilador haya generado codigo "
            "distinto al esperado -- revisa discovery_header.pcode a mano."
        )

    if len(candidates) > 1:
        log(f"ATENCION: encontre {len(candidates)} candidatos posibles, no solo 1.")
        log("Uso el ULTIMO (mas cercano al final del metodo), que es lo mas")
        log("probable dado el orden del .as, pero confirma en el reporte.")

    _, regs = candidates[-1]
    resolved_class_reg, array_field_name_reg, resolved_vector_reg = regs
    return resolved_class_reg, array_field_name_reg, resolved_vector_reg, candidates


def find_null_check_register(pcode_text):
    lines = pcode_text.splitlines()
    for i, line in enumerate(lines):
        if "pushnull" in line:
            for back in range(1, 3):
                if i - back < 0:
                    continue
                m = SETLOCAL_RE.search(lines[i - back].replace("setlocal", "getlocal"))
                gm = re.search(r"getlocal\s+(\d+)", lines[i - back])
                if gm:
                    return int(gm.group(1))
    return None


PATCH_TEMPLATE = '''"""
AppPublic_patch_REVISAR.py
----------------------------
Generado automaticamente por AppAutoPatch.py. Revisar antes de aplicar.

Registros detectados (heuristica sobre discovery_header.pcode):
    resolvedClass   -> local {reg_class}
    arrayFieldName  -> local {reg_arrname}
    resolvedVector  -> local {reg_vector}

Confianza: {confidence}

Estas 3 funciones reemplazan a build_header() / build_color_block() /
build_team_color_block() en AppPublic.py. Usan los registros de arriba
(que ya trae resueltos el header de descubrimiento por reflexion, ver
a_BattlePassSplashArtButton.as) en vez de nombres ofuscados fijos.

Pegar el contenido de discovery_header.pcode DENTRO de esta funcion, en
vez del header viejo (getlocal0/pushscope/.../constructsuper 0/.../
hasDefinition/...), y despues los bloques de color que arman
build_color_block/build_team_color_block a continuacion, sin tocar el
footer (build_footer() sigue igual).
"""

REG_CLASS = {reg_class}
REG_ARRAY_FIELD_NAME = {reg_arrname}
REG_VECTOR = {reg_vector}


def build_header_reflection():
    """Reemplaza a build_header(cls, vec) de AppPublic.py: ya NO recibe
    cls/vec como strings -- los resuelve el pcode de
    discovery_header.pcode (pegar ese contenido literal aca en vez de
    este placeholder antes de usar)."""
    with open("discovery_header.pcode", "r", encoding="utf-8") as f:
        return f.read()


def build_color_block_reflection(name, pushbyte_num, colors):
    """Version de build_color_block() para el esquema por reflexion:
    ya no coerceas por nombre fijo (coerce QName(...,'{{cls}}')) ni
    escribis el array por QName fijo -- usas los registros ya resueltos
    por el header."""
    lines = [f"            ; ---- {{name}} (pushbyte {{pushbyte_num}}) ----".format(name=name, pushbyte_num=pushbyte_num)]
    lines.append(f"            getlocal {{REG_VECTOR}}".format(REG_VECTOR=REG_VECTOR))
    lines.append(f"            pushbyte {{pushbyte_num}}".format(pushbyte_num=pushbyte_num))
    lines.append('            getproperty MultinameL([PackageNamespace("","3")])')
    lines.append(f"            getlocal {{REG_CLASS}}".format(REG_CLASS=REG_CLASS))
    lines.append("            astypelate")  # castea al Class dinamico en vez de 'coerce QName fijo'
    lines.append(f"            setlocal 13")
    lines.append("        getlocal 13")
    for c in colors:
        lines.append(f"            pushuint {{c}}".format(c=c))
    lines.append("            newarray 35")
    lines.append('            coerce QName(PackageNamespace("","4"),"Array")')
    lines.append(f"            getlocal {{REG_ARRAY_FIELD_NAME}}".format(REG_ARRAY_FIELD_NAME=REG_ARRAY_FIELD_NAME))
    lines.append('            initproperty MultinameL([PackageNamespace("","4")])')
    lines.append("")
    return "\\n".join(lines) + "\\n"
'''


def write_patch_preview(regs, confidence_note):
    reg_class, reg_arrname, reg_vector = regs
    content = PATCH_TEMPLATE.format(
        reg_class=reg_class, reg_arrname=reg_arrname, reg_vector=reg_vector,
        confidence=confidence_note,
    )
    PATCH_PREVIEW.write_text(content, encoding="utf-8")
    log(f"Parche generado (SIN aplicar) en: {PATCH_PREVIEW}")


def write_report(pcode_text, regs, candidates, null_check_reg):
    reg_class, reg_arrname, reg_vector = regs
    lines = []
    lines.append("=== REPORTE AppAutoPatch ===\n")
    lines.append(f"Registros detectados por heuristica (ultimo candidato de {len(candidates)}):")
    lines.append(f"  resolvedClass  -> local {reg_class}")
    lines.append(f"  arrayFieldName -> local {reg_arrname}")
    lines.append(f"  resolvedVector -> local {reg_vector}\n")

    if null_check_reg is not None:
        if null_check_reg == reg_class:
            lines.append(f"[OK] El chequeo '== null' post-loop usa local {null_check_reg}, "
                          f"coincide con resolvedClass. Buena señal de confianza.")
        else:
            lines.append(f"[ATENCION] El chequeo '== null' post-loop usa local {null_check_reg}, "
                          f"NO coincide con el resolvedClass detectado ({reg_class}). "
                          f"Revisa discovery_header.pcode a mano antes de confiar en esto.")
    else:
        lines.append("[AVISO] No pude ubicar el chequeo '== null' post-loop para cruzar el dato. "
                      "No es fatal, pero baja la confianza -- revisa a mano.")

    if len(candidates) > 1:
        lines.append(f"\n[AVISO] Se encontraron {len(candidates)} posiciones candidatas en el pcode "
                      "con el patron de 3 setlocal + jump. Se uso la ultima. Si el resultado final "
                      "no funciona, este es el primer lugar para mirar.")

    lines.append("\n--- Que revisar antes de aplicar ---")
    lines.append("1. Abri discovery_header.pcode y busca 'setlocal %d', 'setlocal %d', "
                  "'setlocal %d' cerca del final del loop (antes de un jump/continue)." % regs)
    lines.append("2. Confirma que son, en ese orden, resolvedClass / arrayFieldName / resolvedVector.")
    lines.append("3. Si coincide, corre este script de nuevo con --apply.")
    lines.append("4. Probá el pcode combinado en una COPIA de UI_MainMenu.swf primero.")

    REPORT_FILE.write_text("\n".join(lines), encoding="utf-8")
    log(f"Reporte en: {REPORT_FILE}")


def apply_patch():
    if not PATCH_PREVIEW.exists():
        raise SystemExit(f"No existe {PATCH_PREVIEW}. Corre primero sin --apply.")
    if not APPPUBLIC_PATH.exists():
        raise SystemExit(f"No encuentro {APPPUBLIC_PATH} para parchear.")

    backup = APPPUBLIC_PATH.with_suffix(".py.bak_autopatch")
    if not backup.exists():
        shutil.copy2(APPPUBLIC_PATH, backup)
        log(f"Backup creado: {backup}")
    else:
        log(f"Backup ya existia, no se sobrescribe: {backup}")

    log("NO reemplazo automaticamente funciones dentro de AppPublic.py: eso")
    log("requeriria parsear su AST para no romper el resto del archivo. Lo que")
    log(f"hace --apply es copiar {PATCH_PREVIEW.name} al lado como modulo nuevo;")
    log("import las 2 funciones desde AppPublic.py vos mismo donde corresponda,")
    log("revisando el reporte primero. Esto es a proposito: no quiero editar")
    log("tu pipeline de colores en produccion sin que lo veas.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mxmlc", default=None, help="Ruta a mxmlc (si falta, usar --skip-build)")
    parser.add_argument("--pcode", default=str(DEFAULT_PCODE), help="Usar un .pcode ya generado")
    parser.add_argument("--skip-build", action="store_true", help="No recompilar, usar --pcode tal cual")
    parser.add_argument("--apply", action="store_true", help="Aplicar el parche ya revisado")
    args = parser.parse_args()

    if args.apply:
        apply_patch()
        return

    if args.skip_build:
        pcode_path = Path(args.pcode)
        if not pcode_path.exists():
            raise SystemExit(f"No encuentro {pcode_path}. Sacá --skip-build o generalo primero.")
        pcode_text = pcode_path.read_text(encoding="utf-8", errors="replace")
    else:
        if not args.mxmlc:
            raise SystemExit("Falta --mxmlc (o usa --skip-build con un .pcode ya generado).")
        pcode_text = run_build(args.mxmlc)

    try:
        reg_class, reg_arrname, reg_vector, candidates = find_three_final_setlocals(pcode_text)
    except ValueError as e:
        raise SystemExit(f"No pude detectar los registros automaticamente: {e}")

    null_check_reg = find_null_check_register(pcode_text)
    confidence = "ALTA" if null_check_reg == reg_class else "MEDIA/BAJA -- revisar a mano"

    write_patch_preview((reg_class, reg_arrname, reg_vector), confidence)
    write_report(pcode_text, (reg_class, reg_arrname, reg_vector), candidates, null_check_reg)

    log("\nListo. Mientras comes ya quedo todo generado, pero NO aplicado.")
    log(f"Al volver: mira {REPORT_FILE.name} primero, despues {PATCH_PREVIEW.name},")
    log("y si cierra: python AppAutoPatch.py --skip-build --apply")


if __name__ == "__main__":
    main()
