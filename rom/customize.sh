#!/system/bin/sh
# Virt OS — Magisk installation customize script

ui_print "============================================"
ui_print "     Virt OS v1.0.0 — Magisk Module"
ui_print "     github.com/DonvxDev/VirtOs"
ui_print "============================================"
ui_print " "
ui_print "▶ Installing Virt OS as system launcher..."

# Check Android version
if [ "$API" -lt 23 ]; then
  abort "Virt OS requires Android 6.0+ (API 23). Your device: API $API"
fi

ui_print "  Android API: $API ✓"
ui_print "  Architecture: $ARCH ✓"
ui_print " "
ui_print "▶ Applying permissions..."
set_perm_recursive "$MODPATH/system/priv-app/VirtOS" root root 0644 0755
set_perm "$MODPATH/system/etc/permissions/privapp-permissions-VirtOS.xml" root root 0644

ui_print " "
ui_print "✓ Virt OS installed via Magisk!"
ui_print " "
ui_print "▶ Reboot your device."
ui_print "▶ Tap Home → Select 'Virt OS' → Always"
ui_print "============================================"
