@echo off
setlocal EnableDelayedExpansion

REM Trabaja siempre en la carpeta donde esta este .bat
cd /d "%~dp0"

echo ========================================
echo   Subir web a GitHub
echo   Carpeta: %cd%
echo ========================================
echo.

REM --- Comprobar que Git esta instalado ---
where git >nul 2>&1
if not errorlevel 1 goto git_ok
if exist "%ProgramFiles%\Git\cmd\git.exe" set "PATH=%PATH%;%ProgramFiles%\Git\cmd"
where git >nul 2>&1
if not errorlevel 1 goto git_ok
echo [ERROR] Git no esta instalado o Windows no lo encuentra.
echo Descargalo en https://git-scm.com/download/win
echo Despues de instalarlo, cierra esta ventana y vuelve a ejecutar el script.
pause
exit /b 1
:git_ok

REM --- Nombre y correo de Git, solo si faltan ---
set "GIT_NAME="
for /f "delims=" %%A in ('git config --global user.name 2^>nul') do set "GIT_NAME=%%A"
if not defined GIT_NAME (
    set /p GIT_NAME=Tu nombre para los commits: 
    git config --global user.name "!GIT_NAME!"
)
set "GIT_MAIL="
for /f "delims=" %%A in ('git config --global user.email 2^>nul') do set "GIT_MAIL=%%A"
if not defined GIT_MAIL (
    set /p GIT_MAIL=Tu correo de GitHub: 
    git config --global user.email "!GIT_MAIL!"
)

REM --- Inicializar repositorio la primera vez ---
if not exist ".git" (
    echo Primera vez: inicializando repositorio...
    git init
    git branch -M main
)

REM --- Pedir la URL del repo la primera vez ---
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo.
    echo Crea antes un repo VACIO en GitHub, sin README ni .gitignore.
    set /p REPO_URL=Pega la URL del repo, por ejemplo https://github.com/usuario/mi-web.git : 
    if "!REPO_URL!"=="" (
        echo [ERROR] No escribiste ninguna URL.
        pause
        exit /b 1
    )
    git remote add origin "!REPO_URL!"
)

REM --- Anadir cambios y hacer commit ---
git add -A
git diff --cached --quiet
if errorlevel 1 (
    set "MSG="
    set /p MSG=Mensaje del commit, Enter para usar fecha y hora: 
    if "!MSG!"=="" set "MSG=Actualizacion %date% %time%"
    git commit -m "!MSG!"
) else (
    echo No hay cambios nuevos que commitear.
)

REM --- Subir ---
echo.
echo Subiendo a GitHub...
git push -u origin main
if errorlevel 1 (
    echo.
    echo [ERROR] El push fallo. Revisa la URL del repo, tu login o si el repo remoto no esta vacio.
    pause
    exit /b 1
)

echo.
echo Listo, web subida correctamente.
pause
