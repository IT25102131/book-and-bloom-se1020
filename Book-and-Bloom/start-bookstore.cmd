@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -File "%~dp0tools\start.ps1"
if errorlevel 1 pause
