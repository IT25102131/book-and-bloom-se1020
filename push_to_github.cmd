@echo off
setlocal
echo ========================================================
echo   Book ^& Bloom - GitHub Repository Push Script (6 Members)
echo ========================================================
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/repo.git): "
if "%REPO_URL%"=="" (
    echo Error: Repository URL cannot be empty.
    pause
    exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0push_to_github.ps1" -RepoUrl "%REPO_URL%"
pause
