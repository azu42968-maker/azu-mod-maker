@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ============================================
echo   Azu Modification - Empaquetado a .exe
echo ============================================
echo.

where python >nul 2>&1
if errorlevel 1 (
    echo ERROR: No se encontro Python en el PATH.
    echo Instala Python desde https://www.python.org/downloads/ y vuelve a intentar.
    pause
    exit /b 1
)

echo Instalando/actualizando dependencias...
python -m pip install --upgrade pip >nul 2>&1
python -m pip install --upgrade pyinstaller pywebview xmltodict Pillow
if errorlevel 1 (
    echo.
    echo ERROR: Fallo la instalacion de dependencias.
    pause
    exit /b 1
)

echo.
echo Limpiando builds anteriores...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
if exist AppLauncher.spec del /q AppLauncher.spec

set ICON_FLAG=
if exist "icon.ico" set ICON_FLAG=--icon=icon.ico

set MODO=%~1
if /i "%MODO%"=="" set MODO=public

if /i "%MODO%"=="allinone" (
    if not exist "AppAllInOne.py" (
        echo ERROR: pediste empaquetar AppAllInOne.py pero no se encuentra en esta carpeta.
        pause
        exit /b 1
    )
    echo Empaquetando con AppAllInOne.py ^(modo elegido: allinone^)...
    set ENGINE_FLAG=--add-data "AppAllInOne.py;."
) else if /i "%MODO%"=="public" (
    if not exist "AppPublic.py" (
        echo ERROR: no se encontro AppPublic.py en esta carpeta.
        pause
        exit /b 1
    )
    echo Empaquetando con AppPublic.py ^(modo por defecto: public^)...
    set ENGINE_FLAG=--add-data "AppPublic.py;."
) else (
    echo ERROR: parametro "%MODO%" no reconocido. Uso:
    echo   %~nx0            -^> empaqueta AppPublic.py
    echo   %~nx0 allinone   -^> empaqueta AppAllInOne.py
    pause
    exit /b 1
)

set FFDEC_FLAG=
if exist "ffdec\ffdec.bat" (
    echo Se encontro la carpeta ffdec\ - se incluira dentro del .exe.
    set FFDEC_FLAG=--add-data "ffdec;ffdec"
    if not exist "ffdec\jre" (
        echo AVISO: ffdec\ no trae una carpeta "jre" adentro, o sea que
        echo la version de FFDec que tenes necesita Java instalado en la
        echo PC de quien use el .exe. Si queres que de verdad no necesiten
        echo instalar nada, descarga la version de FFDec "con JRE incluido"
        echo desde su pagina y reemplaza la carpeta ffdec\ por esa.
    )
) else (
    echo AVISO: no se encontro la carpeta ffdec\ffdec.bat junto a este
    echo script. La funcion de instalar/quitar colores en Brawlhalla no
    echo va a andar hasta que el usuario indique su propio FFDec a mano.
    echo Si tenes FFDec, copialo a una carpeta llamada "ffdec" aca al
    echo lado de este .bat, con "ffdec.bat" adentro, y volve a correr esto.
)

REM PreRenders y SpriteTypes ya NO se empaquetan: AppSync.py los baja de
REM GitHub al abrir el programa (ver AppLauncher.py / AppSync.py).

echo.
echo Generando el ejecutable (esto puede tardar unos minutos)...
python -m PyInstaller --noconfirm --onefile --windowed %ICON_FLAG% ^
    --name "AzuModification" ^
    --add-data "index.html;." ^
    --add-data "styles.css;." ^
    --add-data "codemirror.bundle.js;." ^
    --add-data "app.js;." ^
    %ENGINE_FLAG% ^
    %FFDEC_FLAG% ^
    AppLauncher.py

if errorlevel 1 (
    echo.
    echo ERROR: PyInstaller fallo. Revisa el mensaje de arriba.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Listo! El ejecutable quedo en:
echo   dist\AzuModification.exe
echo ============================================
echo.
echo Para distribuirlo, solo hace falta copiar ese .exe: los .py,
echo index.html, codemirror.bundle.js, app.js y styles.css ^(y ffdec, si
echo estaba presente^) quedaron empacados adentro.
echo.
echo Nota: PreRenders y SpriteTypes NO van dentro del .exe. Al abrir el
echo programa se descargan desde GitHub ^(azu42968-maker/azu-mod-maker^) a
echo %%APPDATA%%\AzuModification\PreRenders y \SpriteTypes, y se actualizan
echo solos cuando subis cambios al repo. Sin internet, la galeria queda
echo con lo que ya se haya descargado antes.
echo.
echo Nota: "Update Color Values" ahora guarda su copia editable en
echo %%APPDATA%%\AzuModification\engine (no en el .exe), para que los
echo cambios sobrevivan al cerrar y reabrir el programa.
echo.
pause
