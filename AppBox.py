"""
AppBox.py  --  Azu Modification
--------------------------------
Abre la app dentro de tu distrobox (donde tienes Java, FFDec y pywebview).

Como funciona: al arrancar AppLauncher.py en el host, si hay un box elegido
se relanza el mismo script con `distrobox enter <box> -- python3 AppLauncher.py`.
Dentro del box tu /home es el mismo, asi que los datos, la carpeta de
Brawlhalla (Steam) y los .swf son los mismos que en el host.

Que box usa (en este orden):
  1. variable de entorno AZU_BOX=<nombre>
  2. "distrobox" guardado en config.json (AppConfig.set_box_name)
  3. el box llamado "acid" si existe
  4. si solo existe un box, ese
Para no usar el box (ejecutar en el host): AZU_NO_BOX=1
Solo libreria estandar.
"""
from __future__ import annotations

import os
import shutil
import subprocess
import sys

ENV_BOX = "AZU_BOX"
ENV_SKIP = "AZU_NO_BOX"
DEFAULT_BOX = "acid"


def inside_container() -> bool:
    """True si ya estamos dentro de un distrobox/toolbox/podman."""
    return bool(os.environ.get("CONTAINER_ID")) or os.path.exists("/run/.containerenv")


def list_boxes() -> list[str]:
    """Nombres de los distrobox existentes (vacio si no hay distrobox)."""
    if not shutil.which("distrobox"):
        return []
    try:
        out = subprocess.run(
            ["distrobox", "list", "--no-color"],
            capture_output=True, text=True, timeout=30,
        ).stdout
    except Exception:
        return []
    names = []
    for line in out.splitlines():
        parts = [p.strip() for p in line.split("|")]
        if len(parts) < 2 or parts[1].upper() == "NAME" or not parts[1]:
            continue
        names.append(parts[1])
    return names


def pick_box() -> str | None:
    name = os.environ.get(ENV_BOX)
    if name:
        return name.strip()
    try:
        import AppConfig
        saved = AppConfig.get_box_name()
        if saved:
            return saved
    except Exception:
        pass
    boxes = list_boxes()
    if DEFAULT_BOX in boxes:
        return DEFAULT_BOX
    if len(boxes) == 1:
        return boxes[0]
    if len(boxes) > 1:
        print(
            "[box] Hay varios distrobox: " + ", ".join(boxes) + ".\n"
            "[box] Elige uno con:  AZU_BOX=<nombre> python3 AppLauncher.py\n"
            "[box] (o guardalo: python3 -c \"import AppConfig; AppConfig.set_box_name('<nombre>')\")"
        )
    return None


def relaunch_in_box_if_needed() -> None:
    """Si corresponde, ejecuta esta misma app dentro del box y termina el proceso."""
    if not sys.platform.startswith("linux"):
        return
    if hasattr(sys, "_MEIPASS"):          # binario empaquetado: no se relanza
        return
    if os.environ.get(ENV_SKIP) or inside_container():
        return
    if not shutil.which("distrobox"):
        return

    box = pick_box()
    if not box:
        return

    script = os.path.abspath(sys.argv[0])
    cmd = ["distrobox", "enter", box, "--", "python3", script, *sys.argv[1:]]
    print(f"[box] Abriendo '{box}' y ejecutando {os.path.basename(script)} adentro...")
    try:
        rc = subprocess.call(cmd)
    except KeyboardInterrupt:
        rc = 130
    except OSError as e:
        print(f"[box] No pude abrir el box ({e}); sigo en el host.")
        return
    sys.exit(rc)
