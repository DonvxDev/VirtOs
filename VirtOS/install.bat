@echo off
echo.
echo ╔══════════════════════════════════╗
echo ║         Virt OS Installer         ║
echo ╚══════════════════════════════════╝
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Fehler: Node.js nicht gefunden.
    echo Bitte installiere Node.js 18+: https://nodejs.org
    pause
    exit /b 1
)

echo Node.js gefunden.
echo.
echo Installiere Abhaengigkeiten...
npm install

echo.
echo Installiere Expo und EAS CLI...
npm install -g expo-cli eas-cli

echo.
echo ╔══════════════════════════════════════════════╗
echo ║  Virt OS ist bereit! Naechste Schritte:      ║
echo ╠══════════════════════════════════════════════╣
echo ║  1. eas login          (Expo Account)        ║
echo ║  2. npm run build:apk  (APK in der Cloud)    ║
echo ║  3. APK auf Android installieren             ║
echo ║  4. Als Standard-Launcher setzen             ║
echo ╚══════════════════════════════════════════════╝
echo.
pause
