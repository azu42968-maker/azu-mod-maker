"""src/azumod/services/identifiers.py

Identificadores de BrawlhallaAir.swf (clase, vector, array y team props).

- Valores por defecto: src/azumod/data/identifiers.json (viaja dentro del exe, solo lectura).
- Valores actualizados: carpeta de config del usuario (escribible, tiene prioridad).
Así la app ya no reescribe su propio código fuente.
"""
import json
import os
from pathlib import Path

_DEFAULTS_FILE = Path(__file__).resolve().parent.parent / "data" / "identifiers.json"


def _user_file():
    from azumod.config import get_config_dir  # import local: evita ciclos

    folder = Path(get_config_dir())
    folder.mkdir(parents=True, exist_ok=True)
    return folder / "identifiers.json"


def _read(path):
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def load():
    data = _read(_DEFAULTS_FILE)
    data.update(_read(_user_file()))
    return data


def get_identifiers():
    """(class, vector, array). Se lee en cada llamada: nunca queda desactualizado."""
    d = load()
    return d["class"], d["vector"], d["array"]


def get_team_props():
    """Dict slot -> identificador. Conserva el orden del JSON."""
    return dict(load().get("team", {}))


def save(cls, vec, arr, team):
    """Guarda los identificadores nuevos. True si hubo cambios."""
    new = {"class": cls, "vector": vec, "array": arr, "team": dict(team)}
    path = _user_file()
    if _read(path) == new:
        return False
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(new, indent=2, ensure_ascii=False), encoding="utf-8")
    os.replace(tmp, path)  # escritura atómica
    return True


# ------------------------------------------------------------------
# Cambios en otros archivos
# ------------------------------------------------------------------
# public.py:
#   - borra DEFAULT_CLASS / DEFAULT_VECTOR / DEFAULT_ARR / DEFAULT_TEAM_PROPS
#   - arriba: from azumod.services.identifiers import get_identifiers, get_team_props
#   - cada uso de DEFAULT_TEAM_PROPS pasa a get_team_props()
#   - borra tu get_identifiers() actual (ahora viene del import)
#
# relinker.py, refresh_identifiers (ya sin allinone_path):
#
#   def refresh_identifiers(air_path, log=print):
#       try:
#           cls, vec, arr, team = find_new_identifiers(air_path)
#       except SystemExit as e:
#           upd.log(f"SystemExit code={e.code}")
#           raise IdentifierError("No se pudieron extraer los identificadores "
#                                 f"desde BrawlhallaAir.swf. Log: {upd.LOGFILE}") from e
#       except Exception as e:
#           upd.log_exc("Fallo extrayendo identificadores")
#           raise IdentifierError(f"Fallo extrayendo identificadores: {e}. "
#                                 f"Log: {upd.LOGFILE}") from e
#       log(f'Nuevos identificadores -> Class="{cls}" Vector="{vec}" Array="{arr}"')
#       log(f"Nuevos identificadores de team colors -> {team}")
#       changed = identifiers.save(cls, vec, arr, team)
#       log("Identificadores guardados." if changed else "Identificadores ya al día.")
#       return cls, vec, arr, team
#
# updater.py: borra write_identifiers_to_allinone, write_team_identifiers_to_allinone
#             y _TEAM_PROPS_BLOCK_RE.
# relinker.py: quita el parámetro allinone_path y el "Paso 2/4" de update_color_values.
# main.py: en _update_color_values_gamebanana ya no pasa AllInOne.__file__.
