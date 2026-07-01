#!/bin/bash
set -e

echo ""
echo "╔══════════════════════════════════╗"
echo "║         Virt OS Installer         ║"
echo "╚══════════════════════════════════╝"
echo ""

# Check node
if ! command -v node &>/dev/null; then
  echo "❌ Node.js nicht gefunden. Bitte installiere Node.js 18+:"
  echo "   https://nodejs.org"
  exit 1
fi

NODE_VER=$(node -e "console.log(parseInt(process.version.slice(1)))")
if [ "$NODE_VER" -lt 18 ]; then
  echo "❌ Node.js 18+ erforderlich (aktuell: $(node -v))"
  exit 1
fi

echo "✅ Node.js $(node -v) gefunden"
echo ""

echo "📦 Installiere Abhängigkeiten..."
npm install

echo ""
echo "📱 Installiere Expo & EAS CLI..."
npm install -g expo-cli eas-cli 2>/dev/null || true

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  Virt OS ist bereit! Nächste Schritte:       ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  1. eas login          (Expo Account)        ║"
echo "║  2. npm run build:apk  (APK in der Cloud)    ║"
echo "║  3. APK auf Android installieren             ║"
echo "║  4. Als Standard-Launcher setzen             ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "Für Entwicklung:"
echo "  npx expo start --android"
echo ""
