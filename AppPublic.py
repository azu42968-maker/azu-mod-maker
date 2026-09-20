"""
AllInOne.py
===========
Combina en un solo script los 3 pasos que antes corrian por separado:

  1) ValuesFinder.py   -> ya no hace falta: ColorSwapClass/Vector/Array
                           quedan hardcodeados en DEFAULT_CLASS/DEFAULT_VECTOR/
                           DEFAULT_ARRAY, y update_dumb.sh los reescribe
                           directamente aca cada vez que el juego actualiza
                           (ver update_dumb.sh).
  2) Execute.py         -> pipeline SVG -> XML -> .pcode (uno por color) + PNG preview.
  3) BuildMultiColorSwap_EN.py -> junta todos los .pcode de export/ en un
                           unico MultiColorSwap.pcode (interactivo, como antes).

No inyecta nada en el .swf: el resultado final (MultiColorSwap.pcode)
queda listo en export/ para inyectarlo a mano con FFDec cuando quieras.

Se puede colocar y ejecutar en CUALQUIER carpeta: todas las rutas
(import/, export/, img/) se calculan a partir de la ubicacion del propio
.py, no de una estructura fija de carpetas.

    CualquierCarpeta/
      AllInOne.py       <- este archivo (va donde quieras)
      import/           (SVGs y/o XMLs de origen)
      export/           (se genera solo)
      img/              (se genera solo)

Uso:
    python AllInOne.py
"""

import json
import os
import re
import shutil
import sys
from os import walk
from pathlib import Path

import xmltodict
import xml.etree.cElementTree as ET
from PIL import Image, ImageDraw, ImageColor, ImageFont


# ============================================================================
# Rutas
# ============================================================================
# Por defecto, todo relativo a este script (uso normal por consola: "python
# AllInOne.py"). Cuando se llama desde el launcher/.exe con GUI se debe
# invocar configure_paths(base_dir) ANTES de correr cualquier paso, para que
# import/export/etc. apunten a una carpeta persistente (no a la carpeta
# temporal que crea PyInstaller en cada arranque).
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = SCRIPT_DIR
IMG_DIR = os.path.join(PROJECT_DIR, "img")
EXPORT_DIR = os.path.join(PROJECT_DIR, "export")
IMPORT_DIR = os.path.join(PROJECT_DIR, "import")
OUTPUT_FILE = os.path.join(EXPORT_DIR, "MultiColorSwap.pcode")
TEAM_OUTPUT_FILE = os.path.join(EXPORT_DIR, "TeamColorSwap.pcode")

# import/export/img se crean/buscan siempre junto al .py,
# sin importar en que carpeta lo copies o ejecutes.
PUSHBYTE_MAP_FILE = os.path.join(SCRIPT_DIR, "pushbyte_map.json")


def configure_paths(base_dir):
    """Redirige SCRIPT_DIR/IMG_DIR/EXPORT_DIR/IMPORT_DIR/OUTPUT_FILE a una
    carpeta persistente. Hay que llamarla ANTES de correr cualquier paso
    del pipeline cuando se usa desde el launcher/.exe (si no, PyInstaller
    apunta todo a una carpeta temporal que desaparece al cerrar)."""
    global SCRIPT_DIR, PROJECT_DIR, IMG_DIR, EXPORT_DIR, IMPORT_DIR
    global OUTPUT_FILE, TEAM_OUTPUT_FILE, PUSHBYTE_MAP_FILE
    SCRIPT_DIR = base_dir
    PROJECT_DIR = SCRIPT_DIR
    IMG_DIR = os.path.join(PROJECT_DIR, "img")
    EXPORT_DIR = os.path.join(PROJECT_DIR, "export")
    IMPORT_DIR = os.path.join(PROJECT_DIR, "import")
    OUTPUT_FILE = os.path.join(EXPORT_DIR, "MultiColorSwap.pcode")
    TEAM_OUTPUT_FILE = os.path.join(EXPORT_DIR, "TeamColorSwap.pcode")
    PUSHBYTE_MAP_FILE = os.path.join(SCRIPT_DIR, "pushbyte_map.json")


# ============================================================================
# Logging
# ============================================================================
# Con VERBOSE_LOG = False (default) no se imprime ni se loguea nada que
# revele identificadores internos, rutas de FFDec/SWF, nombres de clase,
# etc. Poné VERBOSE_LOG = True (o la env var AZUMOD_VERBOSE=1) solo para
# debug local.
VERBOSE_LOG = os.environ.get("AZUMOD_VERBOSE", "") == "1"


def _silent(*_args, **_kwargs):
    pass


def _dbg(*args, **kwargs):
    if VERBOSE_LOG:
        print(*args, **kwargs)


# ColorSwapClass/Vector/Array actuales. update_dumb.sh reescribe estas 3
# lineas automaticamente cada vez que decompila una version nueva del
# juego (busca la clase con NO_COLOR_SCHEME en el dump y actualiza estos
# valores) — no hace falta tocarlos a mano.
DEFAULT_CLASS = "_-o31"
DEFAULT_VECTOR = "_-YO"
DEFAULT_ARRAY = "_-t25"

OLD_COLOR_NAMES = [
    "Blue", "Yellow", "Green", "Brown", "Purple", "Orange", "Cyan", "Sunset",
    "Gray", "Pink", "Red", "In Love", "Heartfelt", "Lucky Clover",
    "Clover Patch", "Verdant Bloom", "Hibiscus", "OG", "Raven Honor",
    "Bifrost", "Art Deco", "Blood Moon", "Heatwave", "Pool Party",
    "Home Team", "Team Reunion", "Haunting", "Ghoulish", "Gala",
    "Winter Holiday", "Holly Jolly", "Soul Fire", "Synthwave",
    "Frozen Forest", "Coat of Lions", "Starlight", "Willow Leaves",
    "Pact of Poison", "Darkheart", "Armageddon", "Kirakira",
    "Ancient Curse", "Neon Hanafuda", "Dragon Fire", "tint glass", "White", "Black",
    "Skyforged", "Goldforged", "Crystalforged", "RGB","CMYK", "Blacklight",
    "Community V1", "Community V2", "ES", "ES 2", "ES 3", "ES 4", "ES 5",
    "ES 6", "ES 7", "Guild"
]

# Rango de pushbytes "seguro" para tus colores custom: desde "Soul Fire"
# hasta "CMYK" (igual que AppPublic.py), asi quedan afuera los colores
# base 1-11 (Blue, Yellow, Green, etc., que el juego usa activamente en
# otros lados) y los del final (Blacklight en adelante). Cambia estos dos
# nombres si queres mover el rango a otra franja de OLD_COLOR_NAMES.
PUSHBYTE_RANGE_FIRST_NAME = "Soul Fire"
PUSHBYTE_RANGE_LAST_NAME = "CMYK"
PUSHBYTE_RANGE_START = OLD_COLOR_NAMES.index(PUSHBYTE_RANGE_FIRST_NAME) + 1
PUSHBYTE_RANGE_END = OLD_COLOR_NAMES.index(PUSHBYTE_RANGE_LAST_NAME) + 1

# Nombres dentro del rango de arriba que NO se ofrecen como opcion para
# instalar (ni en la GUI ni en el modo consola), aunque su numero caiga
# dentro de PUSHBYTE_RANGE_START..END. Agregá o sacá nombres aca para
# ocultar/mostrar mas colores del selector de instalacion.
# (Vacío = todos los pushbytes del rango permitido quedan disponibles.)
HIDDEN_PUSHBYTE_NAMES = {"White", "Black", "Skyforged", "Goldforged", "Crystalforged"}

# Igual que arriba pero para los 16 slots de team color: si esta en True,
# get_team_slot_options() devuelve [] (no aparecen en "Install to
# Brawlhalla") y list_installed_team_schemes() tambien devuelve [] (no
# aparecen en "Quitar color"). No borra la funcionalidad -- install/
# uninstall team scheme siguen andando si se llaman directo -- solo los
# oculta de los selectores, igual que AppPublic.py.
HIDE_TEAM_COLORS = True


def get_allowed_pushbytes():
    """Numeros del rango PUSHBYTE_RANGE_START..END que ademas no estan en
    HIDDEN_PUSHBYTE_NAMES. Es la unica fuente de verdad para que numeros
    se pueden elegir al instalar (GUI y consola usan esto)."""
    return [
        i for i in range(PUSHBYTE_RANGE_START, PUSHBYTE_RANGE_END + 1)
        if OLD_COLOR_NAMES[i - 1] not in HIDDEN_PUSHBYTE_NAMES
    ]


# ============================================================================
# TEAM COLORS: identificadores de los 16 slots (TeamRed1..4, TeamBlue1..4,
# TeamYellow1..4, TeamPurple1..4)
# ============================================================================
# A diferencia de los colores custom "normales" (que se guardan como un
# elemento mas adentro del Vector _-R16 y se acceden por pushbyte), cada
# team color es una propiedad PROPIA de la clase ColorSwapClass (_-14V),
# con su propio nombre ofuscado (ej: TeamRed1 -> "_-e3j"). Se accede por
# nombre directo (getproperty), no por indice, y el Array de 35 colores se
# escribe con initproperty sobre esa propiedad usando el MISMO nombre de
# Array (_-J58 / DEFAULT_ARRAY) que los colores normales.
#
# ATENCION: estos nombres ofuscados cambian con cada actualizacion del
# juego, igual que DEFAULT_CLASS/DEFAULT_VECTOR/DEFAULT_ARRAY. Si
# update_dumb.sh no los reescribe automaticamente todavia, hay que
# actualizarlos a mano aca cuando el juego saque una version nueva
# (dumpeando de nuevo la clase NO_COLOR_SCHEME y buscando a que propiedad
# apunta cada TeamRed/TeamBlue/TeamYellow/TeamPurple).
DEFAULT_TEAM_PROPS = {
    "TeamRed1": "_-42w", "TeamRed2": "_-v3F", "TeamRed3": "_-v5T", "TeamRed4": "_-Xt",
    "TeamBlue1": "_-u1M", "TeamBlue2": "_-o5J", "TeamBlue3": "_-W1l", "TeamBlue4": "_-L3v",
    "TeamYellow1": "_-L2z", "TeamYellow2": "_-R60", "TeamYellow3": "_-m3B", "TeamYellow4": "_-D2T",
    "TeamPurple1": "_-N59", "TeamPurple2": "_-41D", "TeamPurple3": "_-p5a", "TeamPurple4": "_-V5n",
}

# Orden/etiquetas para mostrar en la GUI (agrupado por color de equipo).
TEAM_SLOT_LABELS = {
    "TeamRed1": "TeamRed 1", "TeamRed2": "TeamRed 2", "TeamRed3": "TeamRed 3", "TeamRed4": "TeamRed 4",
    "TeamBlue1": "TeamBlue 1", "TeamBlue2": "TeamBlue 2", "TeamBlue3": "TeamBlue 3", "TeamBlue4": "TeamBlue 4",
    "TeamYellow1": "TeamYellow 1", "TeamYellow2": "TeamYellow 2", "TeamYellow3": "TeamYellow 3", "TeamYellow4": "TeamYellow 4",
    "TeamPurple1": "TeamPurple 1", "TeamPurple2": "TeamPurple 2", "TeamPurple3": "TeamPurple 3", "TeamPurple4": "TeamPurple 4",
}

TEAM_SLOT_ORDER = [
    "TeamRed1", "TeamRed2", "TeamRed3", "TeamRed4",
    "TeamBlue1", "TeamBlue2", "TeamBlue3", "TeamBlue4",
    "TeamYellow1", "TeamYellow2", "TeamYellow3", "TeamYellow4",
    "TeamPurple1", "TeamPurple2", "TeamPurple3", "TeamPurple4",
]


def get_team_identifiers():
    """Devuelve el mapa {slot: propiedad_ofuscada} actual para team colors."""
    return dict(DEFAULT_TEAM_PROPS)


def get_team_slot_options():
    """Para el selector "Instalar en slot de equipo" del launcher: devuelve
    [{"slot": "TeamRed1", "label": "Rojo 1"}, ...] en TEAM_SLOT_ORDER.
    Vacio si HIDE_TEAM_COLORS esta activo."""
    if HIDE_TEAM_COLORS:
        return []
    return [
        {"slot": slot, "label": TEAM_SLOT_LABELS.get(slot, slot)}
        for slot in TEAM_SLOT_ORDER
    ]


# ============================================================================
# PASO 1: identificadores ColorSwapClass/Vector/Array
# ============================================================================
# Ya no se leen de dumb.txt ni de last_values.json en tiempo de ejecucion:
# viven hardcodeados en DEFAULT_CLASS/DEFAULT_VECTOR/DEFAULT_ARRAY, y
# update_dumb.sh es quien los actualiza (reescribiendo esas 3 lineas de
# este archivo) cada vez que sale una version nueva del juego.
def get_identifiers():
    """Devuelve el ColorSwapClass/Vector/Array actuales."""
    return DEFAULT_CLASS, DEFAULT_VECTOR, DEFAULT_ARRAY


# ============================================================================
# PASO 2: Execute -> SVG/XML -> .pcode individuales + PNG preview
# ============================================================================
def _as_list(value):
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def parse_svg(full_filename):
    assert full_filename.endswith(".svg"), "File must be an SVG file"

    with open(full_filename, "r") as svg:
        filename = full_filename[:-4]
        root = ET.Element("ColorSchemeTypes")
        doc = ET.SubElement(root, "ColorSchemeType")
        doc.attrib["ColorSchemeName"] = filename.split("/")[-1].split("\\")[-1]
        xml_tree = xmltodict.parse(svg.read())

        groups = _as_list(xml_tree["svg"]["g"])
        if len(groups) < 2:
            raise ValueError(
                f'"{full_filename}" no tiene el segundo grupo <g> esperado '
                f'(tiene {len(groups)} grupo(s) <g> en total).'
            )
        rects = _as_list(groups[1].get("rect"))
        if not rects:
            raise ValueError(f'"{full_filename}" no tiene ningun <rect> dentro del segundo <g>.')

        for color in rects:
            fill = dict(
                [entry.split(":") for entry in color["@style"].split(";")]
            )["fill"]
            color_id = color["@id"]
            ET.SubElement(doc, color_id).text = fill

        tree = ET.ElementTree(root)
        tree.write(filename + ".xml")


def convert_all_svgs(import_dir):
    f = []
    for dirpath, dirnames, filenames in walk(import_dir):
        f.extend(filenames)
        break

    for svg_file in f:
        if not svg_file.endswith(".svg"):
            continue
        _dbg("SVG ->", svg_file)
        try:
            parse_svg(os.path.join(import_dir, svg_file))
        except Exception as e:
            _dbg(f'  ERROR convirtiendo "{svg_file}", se omite este archivo: {e}')


class PCode:
    def __init__(self, ClassName, CstVector, U32Array):
        self.ClassName = ClassName
        self.CstVector = CstVector
        self.U32Array = U32Array

    def __GenerateHeader(self):
        return f"""
method
    name null
    returns null

    body
        maxstack 37
        localcount 14
        initscopedepth 10
        maxscopedepth 11

        code
            getlocal0
            pushscope
            getlocal0
            constructsuper 0
            pushstring "{self.ClassName}"
            coerce_s
            setlocal 6
            getlex QName(PackageNamespace("flash.system"),"ApplicationDomain")
            getproperty QName(PackageNamespace("","4"),"currentDomain")
            coerce QName(PackageNamespace("flash.system"),"ApplicationDomain")
            setlocal 4
            getlocal 4
            getlocal 6
            callproperty QName(PackageNamespace("","4"),"hasDefinition"), 1
            iffalse InvalidClass
            getlocal 4
            getlocal 6
            callproperty QName(PackageNamespace("","4"),"getDefinition"), 1
            setlocal 5
            getlocal 5
            getproperty QName(PackageNamespace("","4"),"{self.CstVector}")
            pushbyte 1
            getproperty MultinameL([PackageNamespace("","3")])
            coerce QName(PackageNamespace("","4"),"{self.ClassName}")
            setlocal 13
        """

    def __GenerateTable(self, colors):
        if len(colors) != 35:
            _dbg("Invalid number of colors. target is 35, got " + str(len(colors)))
            return ""

        code = "getlocal 13"
        for color in colors:
            code += f"""\n            pushuint {color}"""
        code += f"""
            newarray 35
            coerce QName(PackageNamespace("","4"),"Array")
            initproperty QName(PackageNamespace("","4"),"{self.U32Array}")
        """
        return code

    def __GenerateFooter(self):
        return """
InvalidClass:
            returnvoid
        end ; code
    end ; body
end ; method"""

    def Generate(self, colors):
        pcode = ""
        pcode += self.__GenerateHeader()
        pcode += self.__GenerateTable(colors)
        pcode += self.__GenerateFooter()
        return pcode


class ColorSchemeType:
    def __init__(self, xml_dict):
        self.xml_dict = xml_dict
        self.name = self.xml_dict["@ColorSchemeName"]
        self.colors = [0] * 35
        self.__ParseXmlDict()

    def __GetKey(self, key):
        val = "000000"
        try:
            val = self.xml_dict[key]
            val = val.removeprefix("#")
            val = val.removeprefix("0x")
            val = val.removeprefix("0X")
        except Exception:
            _dbg('Failed Getting Key "{0}" for "{1}"'.format(key, self.name))
        return self.__DecodeColor(val)

    def __DecodeColor(self, color):
        num = 0
        try:
            barr = bytearray.fromhex(color)
            num = int.from_bytes(barr, byteorder="big", signed=False)
        except Exception as e:
            _dbg('Failed Decoding Color "{0}" for "{1}"'.format(color, self.name))
            _dbg(e)
        return num

    def __ParseXmlDict(self):
        self.colors[1] = self.__GetKey("HairLt_Swap")
        self.colors[2] = self.__GetKey("Hair_Swap")
        self.colors[3] = self.__GetKey("HairDk_Swap")
        self.colors[4] = self.__GetKey("Body1VL_Swap")
        self.colors[5] = self.__GetKey("Body1Lt_Swap")
        self.colors[6] = self.__GetKey("Body1_Swap")
        self.colors[7] = self.__GetKey("Body1Dk_Swap")
        self.colors[8] = self.__GetKey("Body1VD_Swap")
        self.colors[9] = self.__GetKey("Body1Acc_Swap")
        self.colors[10] = self.__GetKey("Body2VL_Swap")
        self.colors[11] = self.__GetKey("Body2Lt_Swap")
        self.colors[12] = self.__GetKey("Body2_Swap")
        self.colors[13] = self.__GetKey("Body2Dk_Swap")
        self.colors[14] = self.__GetKey("Body2VD_Swap")
        self.colors[15] = self.__GetKey("Body2Acc_Swap")
        self.colors[16] = self.__GetKey("SpecialVL_Swap")
        self.colors[17] = self.__GetKey("SpecialLt_Swap")
        self.colors[18] = self.__GetKey("Special_Swap")
        self.colors[19] = self.__GetKey("SpecialDk_Swap")
        self.colors[20] = self.__GetKey("SpecialVD_Swap")
        self.colors[21] = self.__GetKey("SpecialAcc_Swap")
        self.colors[26] = self.__GetKey("ClothVL_Swap")
        self.colors[27] = self.__GetKey("ClothLt_Swap")
        self.colors[28] = self.__GetKey("Cloth_Swap")
        self.colors[29] = self.__GetKey("ClothDk_Swap")
        self.colors[30] = self.__GetKey("WeaponVL_Swap")
        self.colors[31] = self.__GetKey("WeaponLt_Swap")
        self.colors[32] = self.__GetKey("Weapon_Swap")
        self.colors[33] = self.__GetKey("WeaponDk_Swap")
        self.colors[34] = self.__GetKey("WeaponAcc_Swap")

    def ExportToPCode(self, PClass, PVector, PArray):
        pcode = PCode(PClass, PVector, PArray)
        return pcode.Generate(self.colors)


class PaletteRenderer:
    fnt_header = None
    fnt_body = None
    img_size = 500
    rect_size = 50
    margin = 7

    def __init__(self, xml_dict):
        if PaletteRenderer.fnt_header is None:
            try:
                PaletteRenderer.fnt_header = ImageFont.truetype("arial.ttf", 46, encoding="unic")
                PaletteRenderer.fnt_body = ImageFont.truetype("arial.ttf", 28, encoding="unic")
            except Exception:
                PaletteRenderer.fnt_header = ImageFont.load_default()
                PaletteRenderer.fnt_body = ImageFont.load_default()

        self.img = Image.new("RGB", (self.img_size, self.img_size), color=ImageColor.getrgb("#9b9b9b"))
        self.context = ImageDraw.Draw(self.img, "RGBA")
        self.xml_dict = xml_dict
        self.title = self.xml_dict["@ColorSchemeName"]

    def Render(self, name):
        self.__RenderTitle()
        self.__RenderText()
        self.__RenderTiles()
        self.SaveAs(name)

    def __RenderTitle(self):
        x, y = (10, 10)
        color = (255, 255, 255, 255)
        self.context.text((x - 1, y), self.title, font=self.fnt_header, fill=(0, 0, 0, 255))
        self.context.text((x + 1, y), self.title, font=self.fnt_header, fill=(0, 0, 0, 255))
        self.context.text((x, y - 1), self.title, font=self.fnt_header, fill=(0, 0, 0, 255))
        self.context.text((x, y + 1), self.title, font=self.fnt_header, fill=(0, 0, 0, 255))
        self.context.text((x, y), self.title, font=self.fnt_header, fill=color)

    def __RenderText(self):
        offsetX = 10
        offsetY = 90
        names = ["Hair", "Body", "Body2", "Special", "Cloth", "Weapon"]
        for idx in range(0, len(names)):
            px = offsetX
            py = idx * (self.rect_size + self.margin) + offsetY
            self.context.text((px, py), names[idx], font=self.fnt_body, fill=(0, 0, 0, 255))

    def __RenderTiles(self):
        offsetX = 150
        offsetY = 90
        colorMap = self.__GetColorMap()
        for y in range(0, 6):
            for x in range(0, 6):
                color = colorMap[y][x]
                inverted = (255 - color[0], 255 - color[1], 255 - color[2], 255)
                if color == (0, 0, 0, 255):
                    continue
                px = x * (self.rect_size + self.margin) + offsetX
                py = y * (self.rect_size + self.margin) + offsetY
                self.context.rectangle(
                    [(px, py), (px + self.rect_size, py + self.rect_size)],
                    fill=color, outline=inverted, width=1,
                )

    def __GetColorMap(self):
        colors = [[(0, 0, 0, 255) for x in range(6)] for y in range(6)]
        colors[0][1] = self.__GetKey("HairLt_Swap")
        colors[0][2] = self.__GetKey("Hair_Swap")
        colors[0][3] = self.__GetKey("HairDk_Swap")
        colors[1][0] = self.__GetKey("Body1VL_Swap")
        colors[1][1] = self.__GetKey("Body1Lt_Swap")
        colors[1][2] = self.__GetKey("Body1_Swap")
        colors[1][3] = self.__GetKey("Body1Dk_Swap")
        colors[1][4] = self.__GetKey("Body1VD_Swap")
        colors[1][5] = self.__GetKey("Body1Acc_Swap")
        colors[2][0] = self.__GetKey("Body2VL_Swap")
        colors[2][1] = self.__GetKey("Body2Lt_Swap")
        colors[2][2] = self.__GetKey("Body2_Swap")
        colors[2][3] = self.__GetKey("Body2Dk_Swap")
        colors[2][4] = self.__GetKey("Body2VD_Swap")
        colors[2][5] = self.__GetKey("Body2Acc_Swap")
        colors[3][0] = self.__GetKey("SpecialVL_Swap")
        colors[3][1] = self.__GetKey("SpecialLt_Swap")
        colors[3][2] = self.__GetKey("Special_Swap")
        colors[3][3] = self.__GetKey("SpecialDk_Swap")
        colors[3][4] = self.__GetKey("SpecialVD_Swap")
        colors[3][5] = self.__GetKey("SpecialAcc_Swap")
        colors[4][0] = self.__GetKey("ClothVL_Swap")
        colors[4][1] = self.__GetKey("ClothLt_Swap")
        colors[4][2] = self.__GetKey("Cloth_Swap")
        colors[4][3] = self.__GetKey("ClothDk_Swap")
        colors[5][0] = self.__GetKey("WeaponVL_Swap")
        colors[5][1] = self.__GetKey("WeaponLt_Swap")
        colors[5][2] = self.__GetKey("Weapon_Swap")
        colors[5][3] = self.__GetKey("WeaponDk_Swap")
        colors[5][5] = self.__GetKey("WeaponAcc_Swap")
        return colors

    def __GetKey(self, key):
        val = "000000"
        try:
            val = self.xml_dict[key]
            val = val.removeprefix("#")
            val = val.removeprefix("0x")
            val = val.removeprefix("0X")
        except Exception:
            _dbg('Failed Getting Key "{0}" for {1}'.format(key, self.title))

        num = 0
        try:
            barr = bytearray.fromhex(val)
            num = int.from_bytes(barr, byteorder="big", signed=False)
        except Exception as e:
            _dbg('Failed Decoding Color "{0}" for "{1}"'.format(val, self.title))
            _dbg(e)

        return ((num >> 16) & 0xFF, (num >> 8) & 0xFF, num & 0xFF, 255)

    def SaveAs(self, filename):
        export_path = os.path.dirname(filename)
        if export_path and not os.path.exists(export_path):
            try:
                os.makedirs(export_path)
            except Exception as e:
                _dbg("Failed Creating Export Directory")
                _dbg(e)
                return
        self.img.save(filename)

    def Save(self):
        self.SaveAs(os.path.join(IMG_DIR, "output.png"))


def RenderColorSchemes(colorschemes):
    for colorscheme in colorschemes:
        render = PaletteRenderer(colorscheme.xml_dict)
        render.Render(os.path.join(IMG_DIR, colorscheme.name + ".png"))


def ExportColorSchemes(colorschemes, cls, vec, arr):
    for colorscheme in colorschemes:
        data = colorscheme.ExportToPCode(cls, vec, arr)
        filename = os.path.join(EXPORT_DIR, colorscheme.name + ".pcode")

        export_path = os.path.dirname(filename)
        if export_path and not os.path.exists(export_path):
            try:
                os.makedirs(export_path)
            except Exception as e:
                _dbg("Failed Creating Export Directory")
                _dbg(e)
                return

        with open(filename, "w") as fd:
            fd.write(data)


def GenerateColorSchemes(xml_tree):
    colorschemes = []
    colorschemetype = xml_tree["ColorSchemeTypes"]["ColorSchemeType"]
    if isinstance(colorschemetype, list):
        for colorscheme in colorschemetype:
            colorschemes.append(ColorSchemeType(colorscheme))
    else:
        colorschemes.append(ColorSchemeType(colorschemetype))
    return colorschemes


def LoadXML(xml_file_name):
    xml_tree = {}
    try:
        xml_file = open(xml_file_name, "r")
    except Exception as e:
        _dbg("Failed Opening XML File")
        _dbg(e)
    else:
        try:
            xml_tree = xmltodict.parse(xml_file.read())
        except Exception as e:
            _dbg("Failed Parsing XML File")
            _dbg(e)
        xml_file.close()
    return xml_tree


def run_execute_pipeline(cls, vec, arr, import_dir):
    if not os.path.isdir(import_dir):
        os.makedirs(import_dir, exist_ok=True)
        _dbg(f'  [!] No existia la carpeta "import", se creo vacia en:')
        _dbg(f'      {import_dir}')
        _dbg('      Poné ahi tus SVG/XML y volvé a correr el script.')

    convert_all_svgs(import_dir)

    f = []
    for dirpath, dirnames, filenames in walk(import_dir):
        f.extend(filenames)
        break

    for xml_file_name in f:
        if not xml_file_name.endswith(".xml"):
            continue
        try:
            xml_tree = LoadXML(os.path.join(import_dir, xml_file_name))
            colorschemes = GenerateColorSchemes(xml_tree)
            ExportColorSchemes(colorschemes, cls, vec, arr)
            RenderColorSchemes(colorschemes)
            _dbg("Procesado:", xml_file_name)
        except Exception as e:
            _dbg(f'ERROR procesando "{xml_file_name}", se omite este archivo: {e}')


# ============================================================================
# PASO 3: BuildMultiColorSwap -> junta los .pcode de export/ en uno solo
# ============================================================================
def old_color_name(pushbyte_num):
    idx = pushbyte_num - 1
    if 0 <= idx < len(OLD_COLOR_NAMES):
        return OLD_COLOR_NAMES[idx]
    return "Unknown (out of range)"


def find_pcode_files(folder):
    if not os.path.isdir(folder):
        raise FileNotFoundError(
            f'No se encontro la carpeta "export".\n'
            f'  Se esperaba exactamente aca: {folder}'
        )

    files = [
        f for f in os.listdir(folder)
        if f.lower().endswith(".pcode") and f != os.path.basename(OUTPUT_FILE)
    ]
    files.sort(key=lambda s: s.lower())

    if not files:
        raise FileNotFoundError(f'No hay archivos .pcode dentro de "{folder}/".')

    return files


def extract_colors(filepath):
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    match = re.search(r"getlocal 13\s*(.*?)newarray 35", content, re.S)
    if not match:
        raise ValueError(f'No se encontro la tabla de colores en "{filepath}".')

    block = match.group(1)
    nums = re.findall(r"pushuint\s+(\d+)", block)

    if len(nums) != 35:
        raise ValueError(f'"{filepath}" tiene {len(nums)} colores, se esperaban 35.')

    return [int(n) for n in nums]


def load_pushbyte_map():
    """Mapa persistente {nombre_color: pushbyte} para que cada color custom
    siempre reemplace el mismo slot viejo, sin importar el orden en que
    esten los archivos en import/ ni si sacaste/agregaste alguno."""
    if not os.path.exists(PUSHBYTE_MAP_FILE):
        return {}
    try:
        with open(PUSHBYTE_MAP_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return {k: int(v) for k, v in data.items()}
    except Exception as e:
        _dbg(f'  [!] No se pudo leer "{PUSHBYTE_MAP_FILE}": {e}')
        return {}


def save_pushbyte_map(mapping):
    try:
        with open(PUSHBYTE_MAP_FILE, "w", encoding="utf-8") as f:
            json.dump(mapping, f, indent=2, ensure_ascii=False)
    except Exception as e:
        _dbg(f'  [!] No se pudo guardar "{PUSHBYTE_MAP_FILE}": {e}')


def print_old_color_options():
    print("\n" + "=" * 50)
    print("COLORES DISPONIBLES (elegi el numero del que va a ser reemplazado)")
    print("=" * 50)
    for i in get_allowed_pushbytes():
        print(f"  {i:>2}. {OLD_COLOR_NAMES[i - 1]}")


def ask_pushbyte_numbers(names):
    """Asigna un pushbyte fijo por NOMBRE (no por posicion en la carpeta),
    tomado del rango PUSHBYTE_RANGE_START..PUSHBYTE_RANGE_END (Soul Fire..
    CMYK por defecto). Una vez que un nombre tiene pushbyte asignado, se
    guarda en pushbyte_map.json y se reusa siempre: sacar o agregar otro
    color no le mueve el slot a los demas."""
    print_old_color_options()

    saved_map = load_pushbyte_map()
    used = set(saved_map.values())
    allowed = get_allowed_pushbytes()

    def next_free():
        for n in allowed:
            if n not in used:
                return n
        return None

    print(
        f"\nSugerencia automatica: cada color nuevo usa un numero fijo dentro "
        f"del rango {PUSHBYTE_RANGE_START}-{PUSHBYTE_RANGE_END} "
        f'("{PUSHBYTE_RANGE_FIRST_NAME}".."{PUSHBYTE_RANGE_LAST_NAME}"), '
        f"guardado en pushbyte_map.json. Si un nombre ya tenia numero "
        f"asignado en una corrida anterior, se mantiene igual."
    )
    print("Para cada color nuevo, escribi el numero (de la lista de arriba) del")
    print("color existente que deberia reemplazar.")
    print("(Dejalo vacio y apreta Enter para usar la sugerencia)\n")

    manual = {}
    for name in names:
        suggested = saved_map.get(name)
        if suggested is None:
            suggested = next_free()
            if suggested is None:
                raise ValueError(
                    f'No queda ningun numero libre (sin contar los ocultos) en el '
                    f'rango {PUSHBYTE_RANGE_START}-{PUSHBYTE_RANGE_END} para '
                    f'asignarle a "{name}". Liberá alguno en pushbyte_map.json, '
                    f'sacá un nombre de HIDDEN_PUSHBYTE_NAMES o agrandá '
                    f'PUSHBYTE_RANGE_FIRST_NAME/PUSHBYTE_RANGE_LAST_NAME.'
                )

        while True:
            val = input(f"  {name} -> pushbyte [{suggested}]: ").strip()
            chosen = int(val) if val else suggested
            if chosen in allowed:
                break
            print(
                f"  [!] Solo se permiten numeros entre {PUSHBYTE_RANGE_START} y "
                f"{PUSHBYTE_RANGE_END} ({PUSHBYTE_RANGE_FIRST_NAME}..{PUSHBYTE_RANGE_LAST_NAME}), "
                f"sin contar los ocultos ({', '.join(sorted(HIDDEN_PUSHBYTE_NAMES))}). "
                f"Probá de nuevo."
            )

        manual[name] = chosen
        used.add(chosen)
        saved_map[name] = chosen

    save_pushbyte_map(saved_map)
    return manual


def build_header(cls, vec):
    return f"""
method
    name null
    returns null

    body
        maxstack 37
        localcount 14
        initscopedepth 10
        maxscopedepth 11

        code
            getlocal0
            pushscope
            getlocal0
            constructsuper 0
            pushstring "{cls}"
            coerce_s
            setlocal 6
            getlex QName(PackageNamespace("flash.system"),"ApplicationDomain")
            getproperty QName(PackageNamespace("","4"),"currentDomain")
            coerce QName(PackageNamespace("flash.system"),"ApplicationDomain")
            setlocal 4
            getlocal 4
            getlocal 6
            callproperty QName(PackageNamespace("","4"),"hasDefinition"), 1
            iffalse InvalidClass
            getlocal 4
            getlocal 6
            callproperty QName(PackageNamespace("","4"),"getDefinition"), 1
            setlocal 5
            getlocal 5
            getproperty QName(PackageNamespace("","4"),"{vec}")
            setlocal 7
"""


def build_color_block(name, pushbyte_num, colors, cls, arr):
    lines = [f"            ; ---- {name} (pushbyte {pushbyte_num}) ----"]
    lines.append("            getlocal 7")
    lines.append(f"            pushbyte {pushbyte_num}")
    lines.append('            getproperty MultinameL([PackageNamespace("","3")])')
    lines.append(f'            coerce QName(PackageNamespace("","4"),"{cls}")')
    lines.append("            setlocal 13")
    lines.append("        getlocal 13")
    for c in colors:
        lines.append(f"            pushuint {c}")
    lines.append("            newarray 35")
    lines.append('            coerce QName(PackageNamespace("","4"),"Array")')
    lines.append(f'            initproperty QName(PackageNamespace("","4"),"{arr}")')
    lines.append("")
    return "\n".join(lines) + "\n"


def build_footer():
    return """InvalidClass:
            returnvoid
        end ; code
    end ; body
end ; method"""


# ============================================================================
# TEAM COLORS: generacion de pcode (mismo footer que arriba, header/bloque
# distintos porque se accede por nombre de propiedad, no por pushbyte en
# el Vector)
# ============================================================================
def build_team_header(cls):
    """Igual que build_header, pero sin la parte de "getproperty vec /
    setlocal 7": los team colors no viven en el Vector, se leen como
    propiedad directa de la clase (local 5), asi que no hace falta
    guardar el Vector en ningun local."""
    return f"""
method
    name null
    returns null

    body
        maxstack 37
        localcount 14
        initscopedepth 10
        maxscopedepth 11

        code
            getlocal0
            pushscope
            getlocal0
            constructsuper 0
            pushstring "{cls}"
            coerce_s
            setlocal 6
            getlex QName(PackageNamespace("flash.system"),"ApplicationDomain")
            getproperty QName(PackageNamespace("","4"),"currentDomain")
            coerce QName(PackageNamespace("flash.system"),"ApplicationDomain")
            setlocal 4
            getlocal 4
            getlocal 6
            callproperty QName(PackageNamespace("","4"),"hasDefinition"), 1
            iffalse InvalidClass
            getlocal 4
            getlocal 6
            callproperty QName(PackageNamespace("","4"),"getDefinition"), 1
            setlocal 5
"""


def build_team_color_block(slot_name, prop_name, colors, cls, arr):
    """slot_name: "TeamRed1", etc (solo para el comentario). prop_name: el
    nombre ofuscado real (ej "_-e3j") de DEFAULT_TEAM_PROPS[slot_name].
    A diferencia de build_color_block, aca se llega al objeto por
    getproperty directo sobre local 5 (la clase), no por pushbyte+Vector."""
    lines = [f"            ; ---- {slot_name} ({prop_name}) — acceso directo por nombre, no por indice ----"]
    lines.append("            getlocal 5")
    lines.append(f'            getproperty QName(PackageNamespace("","4"),"{prop_name}")')
    lines.append(f'            coerce QName(PackageNamespace("","4"),"{cls}")')
    lines.append("            setlocal 13")
    lines.append("        getlocal 13")
    for c in colors:
        lines.append(f"            pushuint {c}")
    lines.append("            newarray 35")
    lines.append('            coerce QName(PackageNamespace("","4"),"Array")')
    lines.append(f'            initproperty QName(PackageNamespace("","4"),"{arr}")')
    lines.append("")
    return "\n".join(lines) + "\n"


def build_merged_team_pcode(cls, arr, installed_team):
    """installed_team: dict {slot_name: {"colors": [35 ints], "scheme_name": str}}.
    Arma el pcode completo de TODOS los team colors instalados, en
    TEAM_SLOT_ORDER (el orden no afecta el resultado, pero mantiene el
    archivo legible), como string, sin escribir nada a disco."""
    team_props = get_team_identifiers()
    ordered_slots = [s for s in TEAM_SLOT_ORDER if s in installed_team]
    out = build_team_header(cls)
    for slot in ordered_slots:
        entry = installed_team[slot]
        prop_name = team_props.get(slot)
        if not prop_name:
            _dbg(f'  [!] Slot "{slot}" no tiene propiedad ofuscada conocida, se omite.')
            continue
        out += build_team_color_block(slot, prop_name, entry["colors"], cls, arr)
    out += build_footer()
    return out


def build_combined_pcode(cls, vec, arr, installed_normal, installed_team):
    """Arma UN SOLO metodo con TODOS los colores normales (por pushbyte,
    via build_color_block) Y TODOS los team colors (por propiedad, via
    build_team_color_block), compartiendo un unico build_header()/
    build_footer(). build_header ya deja tanto local 5 (la clase, para
    los team colors) como local 7 (el Vector, para los colores normales)
    listos, asi que ambos tipos de bloque conviven sin problema dentro
    del mismo constructor.

    Esto reemplaza generar dos pcodes separados (MultiColorSwap.pcode /
    TeamColorSwap.pcode) e inyectarlos por separado en la MISMA clase:
    como cada inyeccion reemplaza el body ENTERO del metodo, inyectar el
    segundo pcode borraba lo que habia dejado el primero (solo quedaba
    "instalado" el ultimo tipo que se inyecto). Con un solo pcode
    combinado, una sola inyeccion, ese problema desaparece.
    """
    team_props = get_team_identifiers()

    normal_names = sorted(installed_normal.keys(), key=lambda n: installed_normal[n]["pushbyte"])
    team_slots = [s for s in TEAM_SLOT_ORDER if s in installed_team]

    out = build_header(cls, vec)
    for name in normal_names:
        entry = installed_normal[name]
        out += build_color_block(name, entry["pushbyte"], entry["colors"], cls, arr)
    for slot in team_slots:
        entry = installed_team[slot]
        prop_name = team_props.get(slot)
        if not prop_name:
            _dbg(f'  [!] Slot "{slot}" no tiene propiedad ofuscada conocida, se omite.')
            continue
        out += build_team_color_block(slot, prop_name, entry["colors"], cls, arr)
    out += build_footer()
    return out


def write_combined_pcode(base_dir, cls, vec, arr):
    """Lee installed_schemes.json + installed_team_schemes.json (los dos
    stores, normal y team) y escribe export/MultiColorSwap.pcode con
    build_combined_pcode(). Es lo que deben llamar TODOS los puntos que
    instalan/quitan un color (normal o de equipo), para que el pcode
    final siempre refleje ambos stores a la vez y nunca se pisen entre
    si. Devuelve la ruta del archivo escrito."""
    normal_store = os.path.join(base_dir, "installed_schemes.json")
    team_store = os.path.join(base_dir, "installed_team_schemes.json")
    installed_normal = load_installed_schemes(normal_store)
    installed_team = load_installed_schemes(team_store)

    merged_pcode = build_combined_pcode(cls, vec, arr, installed_normal, installed_team)

    export_dir = os.path.join(base_dir, "export")
    os.makedirs(export_dir, exist_ok=True)
    output_path = os.path.join(export_dir, "MultiColorSwap.pcode")
    with open(output_path, "w", newline="\r\n") as f:
        f.write(merged_pcode)
    return output_path


def run_build_multicolor(cls, vec, arr):
    _dbg("\n=== Paso 3: combinando .pcode en MultiColorSwap.pcode ===\n")

    files = find_pcode_files(EXPORT_DIR)
    names = [os.path.splitext(f)[0] for f in files]
    name_to_file = dict(zip(names, files))

    colors_by_name = {}
    for name in names:
        filepath = os.path.join(EXPORT_DIR, name_to_file[name])
        colors_by_name[name] = extract_colors(filepath)

    pushbytes = ask_pushbyte_numbers(names)

    ordered_names = sorted(names, key=lambda n: pushbytes[n])

    out = build_header(cls, vec)
    for name in ordered_names:
        colors = colors_by_name[name]
        out += build_color_block(name, pushbytes[name], colors, cls, arr)
    out += build_footer()

    with open(OUTPUT_FILE, "w", newline="\r\n") as f:
        f.write(out)

    full_path = os.path.abspath(OUTPUT_FILE)
    print(f"\nListo. Pcode generado en:\n  {full_path}")
    _dbg("\nResumen (color nuevo -> color viejo que reemplaza):")
    for name in ordered_names:
        old_name = old_color_name(pushbytes[name])
        _dbg(f"  {name} -> {old_name}  (pushbyte {pushbytes[name]})")

    return full_path


# ============================================================================
# Colores desde XML directo en memoria (para el boton "Install" del launcher)
# ============================================================================
# Mismo orden/indices que ColorSchemeType.__ParseXmlDict, pero expuesto como
# datos (no atado a la clase) para poder usarlo sobre un dict cualquiera.
SWAP_KEY_TO_INDEX = {
    "HairLt_Swap": 1, "Hair_Swap": 2, "HairDk_Swap": 3,
    "Body1VL_Swap": 4, "Body1Lt_Swap": 5, "Body1_Swap": 6, "Body1Dk_Swap": 7,
    "Body1VD_Swap": 8, "Body1Acc_Swap": 9,
    "Body2VL_Swap": 10, "Body2Lt_Swap": 11, "Body2_Swap": 12, "Body2Dk_Swap": 13,
    "Body2VD_Swap": 14, "Body2Acc_Swap": 15,
    "SpecialVL_Swap": 16, "SpecialLt_Swap": 17, "Special_Swap": 18, "SpecialDk_Swap": 19,
    "SpecialVD_Swap": 20, "SpecialAcc_Swap": 21,
    "ClothVL_Swap": 26, "ClothLt_Swap": 27, "Cloth_Swap": 28, "ClothDk_Swap": 29,
    "WeaponVL_Swap": 30, "WeaponLt_Swap": 31, "Weapon_Swap": 32, "WeaponDk_Swap": 33,
    "WeaponAcc_Swap": 34,
}


def _decode_swap_hex(val):
    if not val:
        return 0
    val = str(val).removeprefix("#").removeprefix("0x").removeprefix("0X")
    try:
        barr = bytearray.fromhex(val)
        return int.from_bytes(barr, byteorder="big", signed=False)
    except Exception:
        return 0


def colors_from_xml_dict(xml_dict):
    """xml_dict: el resultado de xmltodict.parse() sobre un
    <ColorSchemeType>...</ColorSchemeType> (o el dict interno que trae ese
    tag). Devuelve la lista de 35 colores en el mismo orden que espera el
    pcode, sin tocar el disco para nada."""
    colors = [0] * 35
    for key, idx in SWAP_KEY_TO_INDEX.items():
        colors[idx] = _decode_swap_hex(xml_dict.get(key))
    return colors


def load_installed_schemes(store_path):
    """Recuerda, entre una instalacion y la siguiente, los colores y el
    pushbyte de cada scheme ya instalado (para no perderlos al agregar uno
    nuevo)."""
    if not os.path.exists(store_path):
        return {}
    try:
        with open(store_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def save_installed_schemes(store_path, installed):
    os.makedirs(os.path.dirname(store_path), exist_ok=True)
    with open(store_path, "w", encoding="utf-8") as f:
        json.dump(installed, f, indent=2, ensure_ascii=False)


def build_merged_pcode(cls, vec, arr, installed):
    """installed: dict {nombre: {"colors": [35 ints], "pushbyte": int}}.
    Arma el MultiColorSwap.pcode completo (todos los schemes instalados,
    ordenados por pushbyte) como string, sin escribir nada a disco."""
    ordered_names = sorted(installed.keys(), key=lambda n: installed[n]["pushbyte"])
    out = build_header(cls, vec)
    for name in ordered_names:
        entry = installed[name]
        out += build_color_block(name, entry["pushbyte"], entry["colors"], cls, arr)
    out += build_footer()
    return out


def _safe_filename(name):
    cleaned = re.sub(r'[\\/:*?"<>|]+', '', name).strip()
    return cleaned or "ColourScheme"


def get_pushbyte_options():
    """Para el selector "Install to Brawlhalla" del launcher: devuelve solo
    los pushbytes dentro del rango permitido (PUSHBYTE_RANGE_START..END,
    "Soul Fire".."CMYK" por defecto) y que ademas no esten en
    HIDDEN_PUSHBYTE_NAMES, como [{"pushbyte": int, "name": str}, ...]. Asi
    la UI nunca ofrece pisar un color real del juego (Blue, Yellow, etc.)
    ni ninguno de los ocultos (White, Black, Skyforged, Goldforged,
    Crystalforged), solo los slots reservados para colores custom."""
    return [
        {"pushbyte": i, "name": OLD_COLOR_NAMES[i - 1]}
        for i in get_allowed_pushbytes()
    ]


def list_installed_schemes(base_dir):
    """Para el selector de "Quitar color" en la UI: devuelve
    [{"name": ..., "pushbyte": ..., "old_name": ...}, ...] ordenado por
    pushbyte. old_name es el nombre del color viejo que reemplaza (de
    OLD_COLOR_NAMES), para que la UI muestre algo legible."""
    store_path = os.path.join(base_dir, "installed_schemes.json")
    installed = load_installed_schemes(store_path)
    result = []
    for name, entry in installed.items():
        pushbyte = entry.get("pushbyte")
        old_name = None
        if isinstance(pushbyte, int) and 1 <= pushbyte <= len(OLD_COLOR_NAMES):
            old_name = OLD_COLOR_NAMES[pushbyte - 1]
        result.append({"name": name, "pushbyte": pushbyte, "old_name": old_name})
    result.sort(key=lambda e: (e["pushbyte"] is None, e["pushbyte"]))
    return result


def uninstall_scheme(
    scheme_name,
    base_dir,
    log=print,
    do_inject=True,
    ffdec_path=None,
    swf_path=None,
    class_name=None,
    **_unused_kwargs,
):
    """Contraparte de install_scheme_and_inject: saca UN scheme instalado
    (lo borra de installed_schemes.json) y reconstruye+reinyecta el pcode
    con los que queden. No requiere restaurar el backup: cada inyeccion ya
    reemplaza el cuerpo del metodo completo, asi que el scheme sacado
    simplemente deja de estar en la nueva version.

    Devuelve el mismo shape que install_scheme_and_inject:
    {"success", "message", "output_path", "injected"}.
    """
    if not VERBOSE_LOG:
        log = _silent
    try:
        store_path = os.path.join(base_dir, "installed_schemes.json")
        installed = load_installed_schemes(store_path)

        if scheme_name not in installed:
            return {
                "success": False,
                "message": f'"{scheme_name}" no esta instalado.',
                "output_path": None,
                "injected": False,
            }

        log(f'--- Quitando "{scheme_name}" ---')
        del installed[scheme_name]
        save_installed_schemes(store_path, installed)

        log("--- Identificadores (ColorSwapClass/Vector/Array) ---")
        cls, vec, arr = get_identifiers()

        log("--- Reconstruyendo MultiColorSwap.pcode sin ese color (colores normales + team colors) ---")
        output_path = write_combined_pcode(base_dir, cls, vec, arr)
        log(f"--- Pcode actualizado en: {output_path} ---")

        if not do_inject:
            return {
                "success": True,
                "message": f'"{scheme_name}" quitado. Pcode actualizado en {output_path}.',
                "output_path": output_path,
                "injected": False,
            }

        if not installed:
            log(
                "[i] Ya no queda ningun color instalado. Si queres garantizar "
                "que el swf vuelva a estar exactamente como el original, usa "
                '"Resetear todos los colores" en vez de quitarlos uno por uno.'
            )

        log("--- Reinyectando en Brawlhalla (FFDec) ---")
        import AppCodeInstaller as inj

        inject_kwargs = {"log": log}
        if ffdec_path:
            inject_kwargs["ffdec_path"] = ffdec_path
        if swf_path:
            inject_kwargs["swf_path"] = swf_path
        if class_name:
            inject_kwargs["class_name"] = class_name

        try:
            patched_swf = inj.inject_multicolor_swap(output_path, **inject_kwargs)
            return {
                "success": True,
                "message": f'"{scheme_name}" quitado y reinyectado en {patched_swf}.',
                "output_path": output_path,
                "injected": True,
            }
        except inj.InjectError as e:
            return {
                "success": True,
                "message": (
                    f'"{scheme_name}" quitado y pcode actualizado en {output_path}, '
                    f"pero la reinyeccion automatica fallo: {e} "
                    "Podes inyectarlo a mano con FFDec."
                ),
                "output_path": output_path,
                "injected": False,
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"Fallo al quitar el color: {e}",
            "output_path": None,
            "injected": False,
        }


def list_installed_team_schemes(base_dir):
    """Para el selector de "Quitar color de equipo" en la UI: devuelve
    [{"slot": "TeamRed1", "label": "Rojo 1", "scheme_name": ...}, ...] en
    TEAM_SLOT_ORDER. Vacio si HIDE_TEAM_COLORS esta activo."""
    if HIDE_TEAM_COLORS:
        return []
    store_path = os.path.join(base_dir, "installed_team_schemes.json")
    installed = load_installed_schemes(store_path)
    result = []
    for slot in TEAM_SLOT_ORDER:
        entry = installed.get(slot)
        if not entry:
            continue
        result.append({
            "slot": slot,
            "label": TEAM_SLOT_LABELS.get(slot, slot),
            "scheme_name": entry.get("scheme_name"),
        })
    return result


def install_team_scheme_and_inject(
    xml_text,
    scheme_name,
    team_slot,
    base_dir,
    log=print,
    do_inject=True,
    ffdec_path=None,
    swf_path=None,
    class_name=None,
    **_unused_kwargs,
):
    """Equivalente a install_scheme_and_inject pero para un slot de team
    color (TeamRed1, TeamBlue3, etc.) en vez de un pushbyte de color
    "normal". Cada slot solo puede tener UN color instalado a la vez
    (instalar de nuevo en el mismo slot lo reemplaza).

    - xml_text: el <ColorSchemeType>...</ColorSchemeType> del editor.
    - scheme_name: nombre a mostrar (solo informativo, se guarda junto al
      slot en installed_team_schemes.json).
    - team_slot: una de las claves de DEFAULT_TEAM_PROPS (ej "TeamRed1").
    - base_dir: carpeta donde viven installed_team_schemes.json y export/.

    Genera/actualiza export/TeamColorSwap.pcode con TODOS los team colors
    instalados y, si do_inject=True, lo inyecta con
    AppCodeInstaller.inject_team_color_swap() (si esa funcion no existe
    todavia en AppCodeInstaller.py, el pcode se genera igual y queda listo
    para inyectar a mano con FFDec).

    Devuelve {"success", "message", "output_path", "injected"}. Nunca lanza.
    """
    if not VERBOSE_LOG:
        log = _silent
    try:
        if team_slot not in DEFAULT_TEAM_PROPS:
            return {
                "success": False,
                "message": f'"{team_slot}" no es un slot de equipo valido.',
                "output_path": None,
                "injected": False,
            }

        log("--- Leyendo los colores del scheme ---")
        xml_dict = xmltodict.parse(xml_text)
        root_key = "ColorSchemeType" if "ColorSchemeType" in xml_dict else next(iter(xml_dict))
        colors = colors_from_xml_dict(xml_dict[root_key])

        store_path = os.path.join(base_dir, "installed_team_schemes.json")
        installed_team = load_installed_schemes(store_path)
        installed_team[team_slot] = {"colors": colors, "scheme_name": scheme_name}
        save_installed_schemes(store_path, installed_team)

        log("--- Identificadores (ColorSwapClass/Vector/Array) ---")
        cls, vec, arr = get_identifiers()

        log("--- Armando MultiColorSwap.pcode (colores normales + team colors) ---")
        output_path = write_combined_pcode(base_dir, cls, vec, arr)
        log(f"--- Pcode generado en: {output_path} ---")

        if not do_inject:
            return {
                "success": True,
                "message": f'"{scheme_name}" instalado en {team_slot}. Pcode generado en {output_path}.',
                "output_path": output_path,
                "injected": False,
            }

        log("--- Inyectando en Brawlhalla (FFDec) ---")
        import AppCodeInstaller as inj

        inject_kwargs = {"log": log}
        if ffdec_path:
            inject_kwargs["ffdec_path"] = ffdec_path
        if swf_path:
            inject_kwargs["swf_path"] = swf_path
        if class_name:
            inject_kwargs["class_name"] = class_name

        try:
            # OJO: mismo metodo/clase que los colores "normales"
            # (inject_multicolor_swap, no inject_team_color_swap) porque
            # ahora es UN solo pcode combinado el que vive ahi.
            patched_swf = inj.inject_multicolor_swap(output_path, **inject_kwargs)
            return {
                "success": True,
                "message": f'"{scheme_name}" instalado en {team_slot} e inyectado en {patched_swf}.',
                "output_path": output_path,
                "injected": True,
            }
        except inj.InjectError as e:
            return {
                "success": True,
                "message": (
                    f'"{scheme_name}" instalado en {team_slot} y pcode generado en '
                    f"{output_path}, pero la inyeccion automatica fallo: {e} "
                    "Podes inyectarlo a mano con FFDec."
                ),
                "output_path": output_path,
                "injected": False,
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"Fallo la generacion: {e}",
            "output_path": None,
            "injected": False,
        }


def uninstall_team_scheme(
    team_slot,
    base_dir,
    log=print,
    do_inject=True,
    ffdec_path=None,
    swf_path=None,
    class_name=None,
    **_unused_kwargs,
):
    """Contraparte de install_team_scheme_and_inject: vacia UN slot de
    equipo y reconstruye+reinyecta TeamColorSwap.pcode con los que queden.

    Devuelve el mismo shape que install_team_scheme_and_inject.
    """
    if not VERBOSE_LOG:
        log = _silent
    try:
        store_path = os.path.join(base_dir, "installed_team_schemes.json")
        installed_team = load_installed_schemes(store_path)

        if team_slot not in installed_team:
            return {
                "success": False,
                "message": f'"{team_slot}" no tiene ningun color instalado.',
                "output_path": None,
                "injected": False,
            }

        log(f'--- Quitando color de "{team_slot}" ---')
        del installed_team[team_slot]
        save_installed_schemes(store_path, installed_team)

        cls, vec, arr = get_identifiers()

        log("--- Reconstruyendo MultiColorSwap.pcode sin ese color (colores normales + team colors) ---")
        output_path = write_combined_pcode(base_dir, cls, vec, arr)
        log(f"--- Pcode actualizado en: {output_path} ---")

        if not do_inject:
            return {
                "success": True,
                "message": f'"{team_slot}" vaciado. Pcode actualizado en {output_path}.',
                "output_path": output_path,
                "injected": False,
            }

        log("--- Reinyectando en Brawlhalla (FFDec) ---")
        import AppCodeInstaller as inj

        inject_kwargs = {"log": log}
        if ffdec_path:
            inject_kwargs["ffdec_path"] = ffdec_path
        if swf_path:
            inject_kwargs["swf_path"] = swf_path
        if class_name:
            inject_kwargs["class_name"] = class_name

        try:
            # Mismo pcode combinado / misma clase que los colores normales.
            patched_swf = inj.inject_multicolor_swap(output_path, **inject_kwargs)
            return {
                "success": True,
                "message": f'"{team_slot}" vaciado y reinyectado en {patched_swf}.',
                "output_path": output_path,
                "injected": True,
            }
        except inj.InjectError as e:
            return {
                "success": True,
                "message": (
                    f'"{team_slot}" vaciado y pcode actualizado en {output_path}, pero '
                    f"la reinyeccion automatica fallo: {e} Podes inyectarlo a mano con FFDec."
                ),
                "output_path": output_path,
                "injected": False,
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"Fallo al quitar el color de equipo: {e}",
            "output_path": None,
            "injected": False,
        }


def reset_all_schemes(base_dir, ffdec_path=None, swf_path=None, log=print):
    """Deshace TODO: restaura el .swf original desde el backup (.bak) que
    AppCodeInstaller crea la primera vez que inyecta algo, y vacia
    installed_schemes.json + el pcode generado. A diferencia de
    uninstall_scheme (que reconstruye el pcode sin un color), esto
    garantiza que el swf vuelva a estar byte a byte como antes de instalar
    nada, sin depender de que el pcode vacio compile igual al original.

    Devuelve {"success", "message"}. Nunca lanza.
    """
    try:
        import AppCodeInstaller as inj

        log("--- Ubicando el swf y su backup ---")
        try:
            resolved_ffdec = inj.find_ffdec(ffdec_path)
        except inj.InjectError as e:
            return {"success": False, "message": str(e)}

        if swf_path:
            resolved_swf = Path(swf_path)
        else:
            resolved_swf = inj.find_brawlhalla_swf()
            if resolved_swf is None:
                return {
                    "success": False,
                    "message": (
                        "No pude encontrar UI_MainMenu.swf automaticamente. "
                        "Indica la ruta de instalacion de Brawlhalla a mano."
                    ),
                }

        backup_path = resolved_swf.with_suffix(resolved_swf.suffix + ".bak")

        store_path = os.path.join(base_dir, "installed_schemes.json")
        installed = load_installed_schemes(store_path)

        if not backup_path.exists():
            if not installed:
                return {
                    "success": True,
                    "message": "No hay ningun color instalado, nada que resetear.",
                }
            return {
                "success": False,
                "message": (
                    f"No encontre el backup ({backup_path.name}). Sin el backup no "
                    "puedo garantizar restaurar el swf original; no se toco nada."
                ),
            }

        log(f"--- Restaurando {resolved_swf.name} desde el backup ---")
        shutil.copy2(backup_path, resolved_swf)

        save_installed_schemes(store_path, {})

        pcode_path = os.path.join(base_dir, "export", "MultiColorSwap.pcode")
        if os.path.exists(pcode_path):
            os.remove(pcode_path)

        team_store_path = os.path.join(base_dir, "installed_team_schemes.json")
        if os.path.exists(team_store_path):
            os.remove(team_store_path)
        team_pcode_path = os.path.join(base_dir, "export", "TeamColorSwap.pcode")
        if os.path.exists(team_pcode_path):
            os.remove(team_pcode_path)

        log("--- Todos los colores fueron reseteados ---")
        return {
            "success": True,
            "message": f"Swf restaurado a su version original desde {backup_path.name}.",
        }
    except Exception as e:
        return {"success": False, "message": f"Fallo el reseteo: {e}"}


def reinject_installed(base_dir, log=print, ffdec_path=None, swf_path=None, class_name=None):
    """Reconstruye MultiColorSwap.pcode a partir de TODO lo que ya este
    guardado en installed_schemes.json + installed_team_schemes.json
    dentro de base_dir, y lo reinyecta en swf_path. A diferencia de
    install_scheme_and_inject/uninstall_scheme, no agrega ni quita
    ningun color: solo vuelve a inyectar los que YA estaban guardados.

    Pensada para el flujo de GameBanana (boton "Update Color Values" con
    ese perfil activado): ahi el swf aislado se tira y se recrea desde
    cero (ver AppLauncher._update_color_values_gamebanana), asi que
    llega sin ningun color instalado y hay que reinyectarle los que ya
    tenia guardados su propio installed_schemes.json, ya con los
    identificadores nuevos.

    Devuelve {"success": bool, "message": str, "output_path": str|None,
    "injected": bool}. Nunca lanza: cualquier error se captura y se
    reporta en el dict (mismo estilo que install_scheme_and_inject)."""
    if not VERBOSE_LOG:
        log = _silent
    try:
        log("--- Identificadores (ColorSwapClass/Vector/Array) ---")
        cls, vec, arr = get_identifiers()

        log("--- Reconstruyendo MultiColorSwap.pcode desde lo ya guardado ---")
        output_path = write_combined_pcode(base_dir, cls, vec, arr)
        log(f"--- Pcode generado en: {output_path} ---")

        log("--- Inyectando en el swf (FFDec) ---")
        import AppCodeInstaller as inj

        inject_kwargs = {"log": log}
        if ffdec_path:
            inject_kwargs["ffdec_path"] = ffdec_path
        if swf_path:
            inject_kwargs["swf_path"] = swf_path
        if class_name:
            inject_kwargs["class_name"] = class_name

        try:
            patched_swf = inj.inject_multicolor_swap(output_path, **inject_kwargs)
            return {
                "success": True,
                "message": f"Colores ya guardados reinyectados en {patched_swf}.",
                "output_path": output_path,
                "injected": True,
            }
        except inj.InjectError as e:
            return {
                "success": False,
                "message": (
                    f"Pcode reconstruido en {output_path}, pero la reinyeccion "
                    f"automatica fallo: {e} Podes inyectarlo a mano con FFDec."
                ),
                "output_path": output_path,
                "injected": False,
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"Fallo reconstruyendo/reinyectando los colores guardados: {e}",
            "output_path": None,
            "injected": False,
        }


def install_scheme_and_inject(
    xml_text,
    scheme_name,
    pushbyte_num,
    base_dir,
    log=print,
    do_inject=True,
    ffdec_path=None,
    swf_path=None,
    class_name=None,
    **_unused_kwargs,
):
    """Orquestador para el boton "Install" del launcher/.exe. Genera
    export/MultiColorSwap.pcode y, si do_inject=True (default), lo inyecta
    directo en Brawlhalla llamando a AppCodeInstaller.inject_multicolor_swap()
    (requiere FFDec instalado). Si la inyeccion falla (FFDec no encontrado,
    SWF no encontrado, etc.) el pcode generado NO se pierde: queda en
    export/ igual, listo para inyectarlo a mano.

    - xml_text: el <ColorSchemeType>...</ColorSchemeType> que arma el
      editor (scheme.generateXML() en index.html).
    - scheme_name: nombre del scheme (clave dentro de installed_schemes.json;
      reinstalar el mismo nombre lo actualiza en vez de duplicarlo).
    - pushbyte_num: numero de color viejo (1-60, ver OLD_COLOR_NAMES) que
      este scheme va a reemplazar en el juego.
    - base_dir: carpeta donde viven installed_schemes.json y export/.
    - do_inject: si False, solo genera el pcode (comportamiento viejo).
    - ffdec_path / swf_path: rutas explicitas opcionales; si se omiten,
      inject_multicolor_swap() autodetecta FFDec (PATH + rutas tipicas) y
      el SWF (Steam/Epic).
    - class_name: clase AS3 objetivo; por defecto la de AppCodeInstaller.

    Devuelve {"success": bool, "message": str, "output_path": str|None,
    "injected": bool}. Nunca lanza: cualquier error se captura y se
    reporta en el dict.
    """
    if not VERBOSE_LOG:
        log = _silent
    try:
        log("--- Leyendo los colores del scheme ---")
        xml_dict = xmltodict.parse(xml_text)
        root_key = "ColorSchemeType" if "ColorSchemeType" in xml_dict else next(iter(xml_dict))
        colors = colors_from_xml_dict(xml_dict[root_key])

        safe_name = _safe_filename(scheme_name)
        store_path = os.path.join(base_dir, "installed_schemes.json")
        installed = load_installed_schemes(store_path)
        installed[safe_name] = {"colors": colors, "pushbyte": int(pushbyte_num)}
        save_installed_schemes(store_path, installed)

        log("--- Identificadores (ColorSwapClass/Vector/Array) ---")
        cls, vec, arr = get_identifiers()

        log("--- Armando MultiColorSwap.pcode (colores normales + team colors) ---")
        output_path = write_combined_pcode(base_dir, cls, vec, arr)
        log(f"--- Pcode generado en: {output_path} ---")

        if not do_inject:
            return {
                "success": True,
                "message": f'"{scheme_name}" agregado. Pcode generado en {output_path}.',
                "output_path": output_path,
                "injected": False,
            }

        log("--- Inyectando en Brawlhalla (FFDec) ---")
        import AppCodeInstaller as inj

        inject_kwargs = {"log": log}
        if ffdec_path:
            inject_kwargs["ffdec_path"] = ffdec_path
        if swf_path:
            inject_kwargs["swf_path"] = swf_path
        if class_name:
            inject_kwargs["class_name"] = class_name

        try:
            patched_swf = inj.inject_multicolor_swap(output_path, **inject_kwargs)
            return {
                "success": True,
                "message": f'"{scheme_name}" instalado e inyectado en {patched_swf}.',
                "output_path": output_path,
                "injected": True,
            }
        except inj.InjectError as e:
            # El pcode SI se genero bien; solo fallo el paso de FFDec.
            # No perdemos el trabajo del usuario, avisamos que lo inyecte
            # a mano.
            return {
                "success": True,
                "message": (
                    f'"{scheme_name}" agregado y pcode generado en {output_path}, '
                    f"pero la inyeccion automatica fallo: {e} "
                    "Podes inyectarlo a mano con FFDec."
                ),
                "output_path": output_path,
                "injected": False,
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"Fallo la generacion: {e}",
            "output_path": None,
            "injected": False,
        }


# ============================================================================
# Orquestador principal
# ============================================================================
def main():
    _dbg("=== AllInOne: Values + Execute + BuildMultiColorSwap ===\n")

    _dbg("--- Paso 1: identificadores (hardcodeados en el .py) ---")
    cls, vec, arr = get_identifiers()

    _dbg("\n--- Paso 2: pipeline SVG/XML -> .pcode individuales ---")
    run_execute_pipeline(cls, vec, arr, IMPORT_DIR)

    _dbg("\n--- Paso 3: combinar todo en MultiColorSwap.pcode ---")
    final_path = run_build_multicolor(cls, vec, arr)

    print(f"\nListo. Copia el contenido de:\n  {final_path}\nen tu .txt de destino.")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        _dbg("\nOcurrio un error!")
        _dbg(f"  {e}")
    input("\nApreta Enter para salir...")