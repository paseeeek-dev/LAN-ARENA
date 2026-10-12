@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 pause & exit /b 1
)
echo Starting LAN ARENA at http://localhost:3000
call npm run dev
pause
