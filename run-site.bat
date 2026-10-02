@echo off
chcp 65001 >nul
setlocal EnableExtensions
cd /d "%~dp0"
title LAN ARENA - Local Server

set "LOG=%~dp0run-log.txt"
>"%LOG%" echo ==== LAN ARENA launcher log ====
>>"%LOG%" echo Folder: %CD%
>>"%LOG%" echo Date: %DATE% %TIME%

echo ========================================
echo            LAN ARENA v0.1.2
echo ========================================
echo.
echo Project folder: %CD%
echo.

echo [1/5] Checking Node.js...
where node >>"%LOG%" 2>&1
if errorlevel 1 goto :NO_NODE
node -v
node -v >>"%LOG%" 2>&1

echo [2/5] Checking npm...
where npm >>"%LOG%" 2>&1
if errorlevel 1 goto :NO_NPM
call npm -v
call npm -v >>"%LOG%" 2>&1

echo [3/5] Checking project files...
if not exist "%~dp0package.json" goto :NO_PACKAGE

echo [4/5] Checking dependencies...
if not exist "%~dp0node_modules\next\package.json" (
    echo Dependencies are not installed yet.
    echo Installing them now. First launch can take a few minutes...
    echo.
    call npm install --ignore-scripts --no-audit --no-fund
    if errorlevel 1 goto :INSTALL_FAILED
)

echo [5/5] Starting website...
echo.
echo Website: http://localhost:3000
echo Keep THIS window open while you use the site.
echo Press Ctrl+C to stop the server.
echo.

REM Open the browser a few seconds later while the dev server starts below.
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 6; Start-Process 'http://localhost:3000'"

REM IMPORTANT: run Next.js directly in this same window so any error remains visible.
call npm run dev
set "DEVERR=%ERRORLEVEL%"
>>"%LOG%" echo npm run dev exit code: %DEVERR%

echo.
echo ========================================
echo The LAN ARENA server stopped.
echo Exit code: %DEVERR%
echo If you did not stop it with Ctrl+C, take a screenshot of the error above.
echo ========================================
pause
goto :END

:NO_NODE
echo.
echo [ERROR] Node.js was not found.
echo Install Node.js LTS x64 using the Windows .msi installer.
echo Then restart Windows and run this file again.
echo.
pause
goto :END

:NO_NPM
echo.
echo [ERROR] npm was not found.
echo Reinstall Node.js LTS using the Windows .msi installer.
echo.
pause
goto :END

:NO_PACKAGE
echo.
echo [ERROR] package.json is missing from:
echo %CD%
echo run-site.bat must be in the root of the LAN-ARENA project folder.
echo.
pause
goto :END

:INSTALL_FAILED
echo.
echo [ERROR] npm install failed.
echo The window will stay open. Take a screenshot of the error above.
echo Log file: %LOG%
echo.
pause
goto :END

:END
endlocal
