# Virt OS 📱 — Android Launcher OS

Ein vollständiges Android-Betriebssystem-Erlebnis als Launcher.
Ersetzt den kompletten Android-Homescreen — genau wie MIUI, One UI oder OxygenOS.

**Version:** 1.0.0  
**GitHub:** https://github.com/DonvxDev/VirtOs  
**Package:** dev.donvx.virtos  
**Min. Android:** 6.0 (API 23)

---

## Features

| Feature | Beschreibung |
|---------|-------------|
| 🎬 Boot-Animation | Dein MP4, fullscreen auf jedem Android-Gerät |
| 🔒 Lock Screen | Wischgeste nach oben zum Entsperren + Haptic |
| 🏠 Home Screen | App-Grid, Liquid Glass Dock, Live-Uhr, Sternenhimmel |
| 📷 Kamera | Vollständig — Zoom 1×/2×/3×, Front/Rück, Speichern in Galerie |
| ✦ Virt KI | 100% kostenlos · 6 Agents wählbar · GPT-4o/Mistral/Llama/DeepSeek/SearchGPT |
| ⚙ Einstellungen | 5 Tabs: Updates, Allgemein, Display, Ton, Über |
| ⬆ Update-System | Echte GitHub-Release-Erkennung + Fortschrittsbalken |
| 🕐 Uhr | Analoge Uhr + Timer |
| # Rechner | iOS-Style Rechner mit Haptic Feedback |

---

## APK bauen (empfohlen: EAS Build)

### Schritt 1 — Voraussetzungen
```bash
node --version   # 18+
npm --version    # 9+
```

### Schritt 2 — Installieren
```bash
npm install
npm install -g expo-cli eas-cli
```

### Schritt 3 — Expo Account
```bash
eas login        # Expo-Account erstellen auf expo.dev (kostenlos)
eas build:configure
```

### Schritt 4 — APK bauen
```bash
npm run build:apk
# → EAS baut die APK in der Cloud (5-10 Min)
# → Du bekommst einen Download-Link
```

### Alternative: Lokal bauen
```bash
# Android Studio + SDK erforderlich
npx expo run:android
```

---

## APK installieren auf Android

1. APK auf dein Android-Gerät übertragen
2. "Unbekannte Quellen" in den Einstellungen erlauben
3. APK tippen → Installieren
4. Einstellungen → Apps → Standard-Apps → Home-App → **Virt OS**
5. Home-Button drücken → Virt OS als Standard setzen

**Virt OS ersetzt jetzt deinen kompletten Homescreen!**

---

## Projektstruktur

```
virt-os-android/
├── app/
│   ├── _layout.tsx          ← Root Layout
│   └── index.tsx            ← Haupt-OS-Controller
├── src/
│   ├── assets/
│   │   └── bootanimation.mp4
│   ├── components/
│   │   ├── StatusBar.tsx    ← Virt Statusleiste
│   │   └── AppHeader.tsx    ← App-Navigationsleiste
│   ├── screens/
│   │   ├── BootScreen.tsx   ← Boot-Animation
│   │   ├── LockScreen.tsx   ← Sperrbildschirm
│   │   ├── HomeScreen.tsx   ← Homescreen
│   │   └── apps/
│   │       ├── CameraScreen.tsx     ← Kamera
│   │       ├── SettingsScreen.tsx   ← Einstellungen + Updates
│   │       ├── VirtAIScreen.tsx     ← KI-Assistent
│   │       ├── ClockScreen.tsx      ← Uhr
│   │       └── CalculatorScreen.tsx ← Rechner
│   └── theme/colors.ts
├── virt-ki/
│   ├── virt_ki_android.js   ← Android KI-Client
│   ├── virt.py              ← Desktop CLI
│   └── README.md
├── app.json                 ← Expo-Konfiguration
├── eas.json                 ← Build-Konfiguration
└── package.json
```

---

## Update-System (Einstellungen → Updates)

1. Ruft `https://api.github.com/repos/DonvxDev/VirtOs/releases/latest` ab
2. Vergleicht `tag_name` mit installierter Version
3. Wenn neuer Release → **Update**-Button erscheint (Blau)
4. Fortschritt in % während des Updates
5. Nach Update: Erfolgsmeldung 🎉

**So veröffentlichst du ein Update:**
1. Neues GitHub Release erstellen auf https://github.com/DonvxDev/VirtOs
2. Tag z.B. `v1.1.0` vergeben
3. Nutzer sehen automatisch den Update-Button

---

## Stack

- **Expo 53** + **React Native 0.79**
- **expo-video** — Boot-Animation
- **expo-camera** — Kamera-App
- **expo-blur** — Liquid Glass Effekte
- **expo-linear-gradient** — UI-Gradienten
- **expo-haptics** — Haptisches Feedback
- **expo-speech** — KI Text-to-Speech
- **expo-media-library** — Fotos speichern
- **react-native-svg** — Analoge Uhr
- **react-native-gesture-handler** — Wischgesten

---

*Virt OS — Das Betriebssystem der Zukunft.*
