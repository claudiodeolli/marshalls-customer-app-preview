@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js nao encontrado.
  echo  Instale o Node.js 20 ou superior em https://nodejs.org e tente de novo.
  echo.
  pause
  exit /b 1
)

echo.
echo  Iniciando Echo Lab...
echo  Feche esta janela ou pressione Ctrl+C para encerrar.
echo.
node server.mjs --open
pause
