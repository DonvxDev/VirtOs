#!/system/bin/sh
# Virt OS — Magisk post-fs-data script
# Runs early in boot to ensure Virt OS is installed as priv-app

MODDIR=${0%/*}

# Ensure correct SELinux context on the APK
chcon -R u:object_r:system_file:s0 "$MODDIR/system/priv-app/VirtOS/" 2>/dev/null || true

log -t VirtOS "Virt OS priv-app mounted"
