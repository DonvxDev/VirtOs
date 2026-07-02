# Virt OS — ROM / Flashable Package

Two ways to install Virt OS as a system app:

---

## Method 1: Magisk Module (Recommended ✅)

Works on **any Android 6.0+ device** with Magisk installed. No wipe required.

### Requirements
- Android 6.0+ (API 23+)
- [Magisk](https://github.com/topjohnwu/Magisk/releases) v20.4+

### Steps
1. Download `VirtOS_Magisk_v1.0.0.zip`
2. Open **Magisk app** → Modules → Install from storage
3. Select the ZIP → Flash
4. **Reboot**
5. Press Home button → Select **"Virt OS"** → **"Always"**

---

## Method 2: TWRP Flash (Traditional ROM)

For devices with custom recovery (TWRP, OrangeFox, SKYHAWK).

### Requirements
- TWRP, OrangeFox, or SKYHAWK recovery
- Android 6.0+

### Steps
1. Download `VirtOS_TWRP_v1.0.0.zip`
2. Boot into TWRP recovery:
   - Hold **Power + Volume Down** (varies by device)
3. In TWRP: **Install** → Select ZIP → Swipe to Flash
4. **Reboot System**
5. Press Home → Select **"Virt OS"** → **"Always"**

---

## Build the APK first

The flashable ZIPs need the compiled `VirtOS.apk`.

### Build via EAS (Cloud, recommended)
```bash
npm install
npm install -g eas-cli
eas login
npm run build:apk
# Download APK from the link EAS gives you
# Place it at: rom/system/priv-app/VirtOS/VirtOS.apk
```

### Build locally (Android Studio)
```bash
npx expo run:android --variant release
# APK location: android/app/build/outputs/apk/release/app-release.apk
# Copy to: rom/system/priv-app/VirtOS/VirtOS.apk
```

Then run the packaging script:
```bash
node scripts/package-rom.js
```

---

## GitHub Actions (Automatic)

Push a tag to trigger automatic build + packaging:
```bash
git tag v1.0.1
git push origin v1.0.1
# GitHub Action builds APK + packages ROM ZIP + creates release
```

Required GitHub secret: `EXPO_TOKEN` (from expo.dev)

---

## Set as Default OS Experience

After installation, to make it feel like a true OS:

1. **Settings → Apps → Default apps → Home app → Virt OS**
2. **Settings → Display → Navigation bar** (hide if possible)
3. **Settings → Battery → Virt OS → Unrestricted** (background apps)
4. Enjoy your Virt OS experience! 🚀
