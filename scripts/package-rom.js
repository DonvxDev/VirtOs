#!/usr/bin/env node
/**
 * Virt OS — ROM Packager
 * Packages the built APK into TWRP + Magisk flashable ZIPs
 *
 * Usage:
 *   node scripts/package-rom.js --apk path/to/VirtOS.apk [--version v1.0.0]
 */

const fs      = require('fs');
const path    = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const apkIdx = args.indexOf('--apk');
const verIdx = args.indexOf('--version');

const APK_PATH = apkIdx !== -1 ? args[apkIdx + 1] : null;
const VERSION  = verIdx !== -1 ? args[verIdx + 1] : 'v1.0.0';
const ROM_DIR  = path.join(__dirname, '..', 'rom');
const DIST_DIR = path.join(__dirname, '..', 'dist');

function log(msg) { console.log('\x1b[36m▶\x1b[0m ' + msg); }
function ok(msg)  { console.log('\x1b[32m✓\x1b[0m ' + msg); }
function err(msg) { console.error('\x1b[31m✗\x1b[0m ' + msg); process.exit(1); }

// ── Ensure zip is available ──────────────────────────────────
function ensureZip() {
  try { execSync('which zip', { stdio: 'ignore' }); return; } catch {}
  try { execSync('which 7z',  { stdio: 'ignore' }); return; } catch {}
  // Use Node.js built-in (adm-zip fallback)
  try { require('adm-zip'); } catch {
    log('Installing adm-zip...');
    execSync('npm install adm-zip', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  }
}

function createZip(sourceDir, extraFiles, outputPath) {
  const AdmZip = require('../node_modules/adm-zip') ||
                 require(path.join(__dirname, '../node_modules/adm-zip'));
  const zip = new AdmZip();

  function addDir(dir, prefix) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full  = path.join(dir, item.name);
      const entry = prefix ? prefix + '/' + item.name : item.name;
      if (item.isDirectory()) addDir(full, entry);
      else zip.addFile(entry, fs.readFileSync(full));
    }
  }

  addDir(sourceDir, '');
  for (const [zipPath, filePath] of Object.entries(extraFiles || {})) {
    if (fs.existsSync(filePath)) {
      zip.addFile(zipPath, fs.readFileSync(filePath));
    }
  }
  zip.writeZip(outputPath);
}

// ── Main ─────────────────────────────────────────────────────
(async () => {
  console.log('\n\x1b[1m  Virt OS ROM Packager\x1b[0m\n');

  ensureZip();
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Validate APK
  if (!APK_PATH || !fs.existsSync(APK_PATH)) {
    log('No APK provided. Creating placeholder structure...');
    log('Run with: node scripts/package-rom.js --apk path/to/VirtOS.apk');

    // Create placeholder APK for structure demo
    const apkDest = path.join(ROM_DIR, 'system', 'priv-app', 'VirtOS', 'VirtOS.apk');
    fs.mkdirSync(path.dirname(apkDest), { recursive: true });
    if (!fs.existsSync(apkDest)) {
      fs.writeFileSync(apkDest, Buffer.from('PLACEHOLDER - Replace with real VirtOS.apk'));
    }
  } else {
    log(`Using APK: ${APK_PATH}`);
    const apkDest = path.join(ROM_DIR, 'system', 'priv-app', 'VirtOS', 'VirtOS.apk');
    fs.mkdirSync(path.dirname(apkDest), { recursive: true });
    fs.copyFileSync(APK_PATH, apkDest);
    ok('APK copied to rom/system/priv-app/VirtOS/');
  }

  // ── Package TWRP ZIP ──────────────────────────────────────
  log('Packaging TWRP flashable ZIP...');
  const twrpZip = path.join(DIST_DIR, `VirtOS_TWRP_${VERSION}.zip`);
  createZip(ROM_DIR, {}, twrpZip);
  const twrpSize = (fs.statSync(twrpZip).size / 1024 / 1024).toFixed(1);
  ok(`TWRP ZIP: dist/VirtOS_TWRP_${VERSION}.zip (${twrpSize} MB)`);

  // ── Package Magisk Module ZIP ─────────────────────────────
  log('Packaging Magisk Module ZIP...');
  const magiskZip = path.join(DIST_DIR, `VirtOS_Magisk_${VERSION}.zip`);

  // Magisk module needs META-INF + system + scripts at root
  const magiskDir = path.join(ROM_DIR);
  createZip(magiskDir, {}, magiskZip);
  const magiskSize = (fs.statSync(magiskZip).size / 1024 / 1024).toFixed(1);
  ok(`Magisk ZIP: dist/VirtOS_Magisk_${VERSION}.zip (${magiskSize} MB)`);

  // ── Summary ───────────────────────────────────────────────
  console.log('\n\x1b[1m  Done! Flash one of these on your Android device:\x1b[0m');
  console.log('\n  TWRP   → dist/VirtOS_TWRP_' + VERSION + '.zip');
  console.log('  Magisk → dist/VirtOS_Magisk_' + VERSION + '.zip');
  console.log('\n  See rom/README.md for flashing instructions.\n');
})();
