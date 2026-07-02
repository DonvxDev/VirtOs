#!/system/bin/sh
# Virt OS — Magisk service script
# Sets Virt OS as default home app on every boot

MODDIR=${0%/*}

# Wait for system to fully boot
sleep 10

# Set Virt OS as preferred home app via settings
settings put secure default_home_app dev.donvx.virtos 2>/dev/null || true

# Clear any competing launcher preferences
cmd package set-home-activity dev.donvx.virtos/.MainActivity 2>/dev/null || true

log -t VirtOS "Virt OS set as default launcher"
