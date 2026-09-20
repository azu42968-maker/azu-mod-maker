@echo off
cd /d "%~dp0"

echo Instalando dependencias necesarias...
python -m pip install --upgrade pip >nul 2>&1
python -m pip install pywebview xmltodict Pillow

if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudo instalar pywebview. Verifica que Python este instalado y en el PATH.
    pause
    exit /b 1
)

echo.
echo Verificando FFDec...

set "FFDEC_VERSION=26.2.1"
set "FFDEC_DIR=%~dp0ffdec"
set "FFDEC_ZIP=%~dp0ffdec_temp.zip"
set "FFDEC_URL=https://github.com/jindrapetrik/jpexs-decompiler/releases/download/version%FFDEC_VERSION%/ffdec_%FFDEC_VERSION%.zip"

if exist "%FFDEC_DIR%\ffdec.bat" (
    echo FFDec ya esta instalado en "%FFDEC_DIR%".
    goto :ffdec_done
)

where java >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ADVERTENCIA: No se encontro Java en el PATH. FFDec necesita Java para funcionar.
    echo Descarga Java desde https://adoptium.net/ e instalalo antes de usar FFDec.
    echo.
)

echo Descargando FFDec %FFDEC_VERSION%...
powershell -NoProfile -Command "try { Invoke-WebRequest -Uri '%FFDEC_URL%' -OutFile '%FFDEC_ZIP%' -UseBasicParsing } catch { exit 1 }"

if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudo descargar FFDec. Verifica tu conexion a internet.
    echo Puedes descargarlo manualmente desde:
    echo https://github.com/jindrapetrik/jpexs-decompiler/releases
    pause
    exit /b 1
)

echo Extrayendo FFDec...
mkdir "%FFDEC_DIR%" >nul 2>&1
powershell -NoProfile -Command "try { Expand-Archive -Path '%FFDEC_ZIP%' -DestinationPath '%FFDEC_DIR%' -Force } catch { exit 1 }"

if %errorlevel% neq 0 (
    echo.
    echo ERROR: No se pudo extraer FFDec.
    del "%FFDEC_ZIP%" >nul 2>&1
    pause
    exit /b 1
)

del "%FFDEC_ZIP%" >nul 2>&1
echo FFDec instalado correctamente en "%FFDEC_DIR%".

:ffdec_done

echo.
echo Dependencias listas. Iniciando Azu Modification...
python AppLauncher.py

pause
