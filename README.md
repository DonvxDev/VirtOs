# Virt OS 📱 — Android Launcher OS

A complete Android operating system experience as a launcher.
Replaces your entire Android home screen — just like MIUI, One UI, or OxygenOS.

**Version:** 1.0.0  
**GitHub:** https://github.com/DonvxDev/VirtOs  
**Package:** dev.donvx.virtos  
**Min. Android:** 6.0 (API 23)  
**Language:** English (US)

---

## Features

| Feature | Description |
|---------|-------------|
| 🎬 Boot Animation | Your MP4 fullscreen on every Android device |
| 🔒 Lock Screen | Swipe up to unlock with haptic feedback |
| 🏠 Home Screen | App grid + Liquid Glass dock + clock widget + weather |
| 🔔 Notification Center | Swipe down: notifications + 6 quick toggles + brightness |
| 📱 App Drawer | Swipe up: all apps alphabetically with search |
| ⚡ Recent Apps | Tap ⊟ in dock: card view of last apps |
| 📷 Camera | Full — Zoom 1×/2×/3×, front/rear, save to gallery |
| ✦ Virt AI | 100% free · 6 agents: GPT-4o / Mistral / Llama / DeepSeek / SearchGPT |
| 🛍 Virt Store | Real free apps: Minecraft, Geometry Dash, Roblox, Brawl Stars + more |
| ⚙ Settings | 5 tabs: Updates, General, Display, Sound, About |
| ⬆ Update System | Live GitHub release detection + animated progress bar |
| 🕐 Clock | Analog clock + timer |
| ⌗ Calculator | iOS-style calculator with haptic feedback |

---

## Build APK (recommended: EAS Build)

### Step 1 — Requirements
```bash
node --version   # 18+
npm --version    # 9+
```

### Step 2 — Install
```bash
npm install
npm install -g expo-cli eas-cli
```

### Step 3 — Expo Account (free)
```bash
eas login        # Create free account at expo.dev
eas build:configure
```

### Step 4 — Build APK
```bash
npm run build:apk
# → EAS builds in the cloud (5-10 min)
# → You get a download link
```

### Alternative: Build locally
```bash
# Requires Android Studio + SDK
npx expo run:android
```

---

## Install on Android

1. Transfer APK to your Android device
2. Enable "Unknown sources" in Settings
3. Tap APK → Install
4. Settings → Apps → Default apps → Home app → **Virt OS**
5. Press Home button → Set Virt OS as default

**Virt OS now replaces your entire home screen!**

---

## Project Structure

```
VirtOS/
├── app/
│   ├── _layout.tsx              ← Root layout
│   └── index.tsx                ← Main OS controller
├── src/
│   ├── assets/
│   │   └── bootanimation.mp4
│   ├── components/
│   │   ├── StatusBar.tsx        ← Virt status bar
│   │   └── AppHeader.tsx        ← App nav bar
│   ├── screens/
│   │   ├── BootScreen.tsx       ← Boot animation
│   │   ├── LockScreen.tsx       ← Lock screen
│   │   ├── HomeScreen.tsx       ← Home screen (+ notifications, drawer, recent)
│   │   └── apps/
│   │       ├── CameraScreen.tsx      ← Camera
│   │       ├── SettingsScreen.tsx    ← Settings + updates
│   │       ├── VirtAIScreen.tsx      ← AI assistant (6 agents)
│   │       ├── VirtStoreScreen.tsx   ← Virt Store (12 real free apps)
│   │       ├── ClockScreen.tsx       ← Clock
│   │       └── CalculatorScreen.tsx  ← Calculator
│   └── theme/colors.ts
├── app.json                     ← Expo config
├── eas.json                     ← Build config
├── install.sh                   ← Linux/macOS quick setup
└── package.json
```

---

## Virt AI — 100% Free, No API Key

Uses **Pollinations AI** — completely free, no account, no credit card.

| Agent | Model | Speed |
|-------|-------|-------|
| Virt | GPT-4o Mini | Fast |
| Virt Pro | GPT-4o | Powerful |
| Virt Think | DeepSeek R1 | Deep reasoning |
| Virt Fast | Mistral 7B | Fastest |
| Virt Llama | Llama 3 | Open source |
| Virt Search | SearchGPT | Web search |

---

## Virt Store — Free Apps

All apps link directly to **Google Play Store** (official, 100% legal):

- 🏃 Subway Surfers · ⬛ Geometry Dash Lite · ⛏ Minecraft Trial
- ⭐ Brawl Stars · 🎮 Roblox · 🚀 Among Us · 🏰 Clash of Clans
- 🔥 Free Fire · 🎵 Spotify · ▶ YouTube · 💬 Discord · 🎬 TikTok

---

## Update System (Settings → Updates)

1. Fetches `https://api.github.com/repos/DonvxDev/VirtOs/releases/latest`
2. Compares `tag_name` with installed version
3. If newer → **Update** button appears (blue)
4. Shows % progress during update
5. Success message after update 🎉

**To publish an update:**
1. Create a new GitHub Release at https://github.com/DonvxDev/VirtOs
2. Tag it e.g. `v1.1.0`
3. Users automatically see the update button

---

## Stack

- **Expo 53** + **React Native 0.79**
- **expo-video** — Boot animation
- **expo-camera** — Camera app
- **expo-blur** — Liquid Glass effects
- **expo-linear-gradient** — UI gradients
- **expo-haptics** — Haptic feedback
- **expo-speech** — AI text-to-speech
- **expo-media-library** — Save photos
- **react-native-svg** — Analog clock
- **react-native-gesture-handler** — Swipe gestures

---

*Virt OS — The operating system of the future.*
