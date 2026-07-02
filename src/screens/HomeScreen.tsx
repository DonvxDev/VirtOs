import { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, PanResponder, ScrollView, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import type { AppName } from '../../app/index';

const { width: W, height: H } = Dimensions.get('window');
const COLS = 4;
const ICON = (W - 32 - (COLS - 1) * 14) / COLS;

const APPS: { id: AppName | string; label: string; icon: string; c1: string; c2: string; screen?: AppName }[] = [
  { id: 'camera',      label: 'Camera',      icon: '📷', c1: '#1c1c30', c2: '#0d0d1e', screen: 'camera' },
  { id: 'virt-ai',     label: 'Virt AI',     icon: '✦',  c1: '#0a84ff', c2: '#0044aa', screen: 'virt-ai' },
  { id: 'clock',       label: 'Clock',       icon: '🕐', c1: '#1e2c3a', c2: '#0d1a24', screen: 'clock' },
  { id: 'calculator',  label: 'Calculator',  icon: '⌗',  c1: '#0a2e14', c2: '#051a0a', screen: 'calculator' },
  { id: 'settings',    label: 'Settings',    icon: '⚙',  c1: '#2a2a2a', c2: '#111111', screen: 'settings' },
  { id: 'virt-store',  label: 'Virt Store',  icon: '🛍', c1: '#1a3a1a', c2: '#0a1a0a', screen: 'virt-store' },
  { id: 'gallery',     label: 'Gallery',     icon: '🖼', c1: '#3a1a4a', c2: '#1a0a2a' },
  { id: 'files',       label: 'Files',       icon: '📁', c1: '#2a2000', c2: '#1a1400' },
  { id: 'browser',     label: 'Browser',     icon: '🌐', c1: '#002244', c2: '#001122' },
  { id: 'music',       label: 'Music',       icon: '🎵', c1: '#3a0010', c2: '#1e0008' },
];

const DOCK: { id: AppName; icon: string; c1: string; c2: string }[] = [
  { id: 'virt-ai',    icon: '✦',  c1: '#0a84ff', c2: '#0044aa' },
  { id: 'camera',     icon: '📷', c1: '#1c1c30', c2: '#0d0d1e' },
  { id: 'virt-store', icon: '🛍', c1: '#1a3a1a', c2: '#0a1a0a' },
  { id: 'settings',   icon: '⚙',  c1: '#2a2a2a', c2: '#111111' },
];

const STARS = Array.from({ length: 50 }, (_, i) => ({
  x: `${(i * 11.3) % 100}%`, y: `${(i * 17.7) % 60}%`,
  size: (i % 3) + 1, op: 0.06 + (i % 5) * 0.1,
}));

const QUICK_TOGGLES = [
  { id: 'wifi',       icon: '📶', label: 'Wi-Fi',      on: true },
  { id: 'bt',         icon: '📡', label: 'Bluetooth',   on: true },
  { id: 'airplane',   icon: '✈',  label: 'Airplane',    on: false },
  { id: 'dnd',        icon: '🔕', label: 'Do Not Disturb', on: false },
  { id: 'torch',      icon: '🔦', label: 'Flashlight',  on: false },
  { id: 'rotate',     icon: '🔄', label: 'Rotation',    on: true },
];

const NOTIFS = [
  { id: '1', app: 'Virt AI',    title: 'Hello! Ask me anything.',          time: 'now', icon: '✦' },
  { id: '2', app: 'Clock',      title: 'Timer finished!',                   time: '2m',  icon: '🕐' },
  { id: '3', app: 'Virt Store', title: 'New: Subway Surfers free today!',   time: '5m',  icon: '🛍' },
];

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function nowDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function HomeScreen({ onOpenApp }: { onOpenApp: (a: AppName) => void }) {
  const [time, setTime] = useState(nowTime());
  const [toggles, setToggles] = useState(QUICK_TOGGLES);
  const [notifOpen, setNotifOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [recentOpen, setRecentOpen] = useState(false);
  const [search, setSearch] = useState('');

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const notifY    = useRef(new Animated.Value(-H * 0.65)).current;
  const drawerY   = useRef(new Animated.Value(H)).current;
  const recentY   = useRef(new Animated.Value(H)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    const t = setInterval(() => setTime(nowTime()), 10000);
    return () => clearInterval(t);
  }, []);

  // ── Notification panel ──
  const notifPan = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 8,
    onPanResponderMove: (_, g) => {
      const val = notifOpen ? g.dy : -H * 0.65 + g.dy;
      notifY.setValue(Math.min(0, Math.max(-H * 0.65, val)));
    },
    onPanResponderRelease: (_, g) => {
      if (!notifOpen && g.dy > 60)  { openNotif(); return; }
      if (notifOpen  && g.dy < -40) { closeNotif(); return; }
      Animated.spring(notifY, { toValue: notifOpen ? 0 : -H * 0.65, useNativeDriver: true }).start();
    },
  });

  const openNotif = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifOpen(true);
    Animated.spring(notifY, { toValue: 0, useNativeDriver: true, tension: 55, friction: 12 }).start();
  };
  const closeNotif = () => {
    setNotifOpen(false);
    Animated.spring(notifY, { toValue: -H * 0.65, useNativeDriver: true }).start();
  };

  // ── App Drawer ──
  const drawerPan = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => g.dy < -10,
    onPanResponderMove: (_, g) => {
      if (g.dy < 0) drawerY.setValue(Math.max(0, H + g.dy));
    },
    onPanResponderRelease: (_, g) => {
      if (g.dy < -80) openDrawer(); else closeDrawer();
    },
  });
  const openDrawer  = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setDrawerOpen(true);  Animated.spring(drawerY, { toValue: 0, useNativeDriver: true, tension: 60, friction: 14 }).start(); };
  const closeDrawer = () => { setDrawerOpen(false); Animated.spring(drawerY, { toValue: H, useNativeDriver: true }).start(); setSearch(''); };

  const openRecent  = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setRecentOpen(true);  Animated.spring(recentY, { toValue: 0, useNativeDriver: true, tension: 60, friction: 14 }).start(); };
  const closeRecent = () => { setRecentOpen(false); Animated.spring(recentY, { toValue: H, useNativeDriver: true }).start(); };

  const flipToggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setToggles(t => t.map(x => x.id === id ? { ...x, on: !x.on } : x));
  };

  const filtered = APPS.filter(a => a.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
      <LinearGradient colors={['#040720', '#0a1540', '#0d0a2e', '#04111a']} style={StyleSheet.absoluteFillObject} />

      {/* Glow blobs */}
      <View style={[styles.glow, { top: '-8%', left: '-20%', backgroundColor: 'rgba(10,132,255,0.16)' }]} />
      <View style={[styles.glow, { bottom: '8%', right: '-15%', backgroundColor: 'rgba(191,90,242,0.12)' }]} />

      {/* Stars */}
      {STARS.map((s, i) => (
        <View key={i} style={{ position: 'absolute', left: s.x as any, top: s.y as any, width: s.size, height: s.size, borderRadius: s.size, backgroundColor: `rgba(255,255,255,${s.op})` }} />
      ))}

      {/* Notif pull zone */}
      <View style={styles.notifZone} {...notifPan.panHandlers}>
        <TouchableOpacity onPress={openNotif} style={styles.notifPull} activeOpacity={1}>
          <View style={styles.notifPullBar} />
        </TouchableOpacity>
      </View>

      {/* Status bar */}
      <View style={styles.statusBar} pointerEvents="none">
        <Text style={styles.statusTime}>{time}</Text>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          <Text style={{ fontSize: 11 }}>📶</Text>
          <Text style={{ fontSize: 11 }}>🔋</Text>
        </View>
      </View>

      {/* Clock + date widget */}
      <View style={styles.clockWidget}>
        <Text style={styles.clockTxt}>{time}</Text>
        <Text style={styles.dateTxt}>{nowDate()}</Text>
      </View>

      {/* Weather widget */}
      <View style={styles.weatherWrap}>
        <BlurView intensity={20} tint="dark" style={styles.weatherBlur}>
          <Text style={{ fontSize: 24 }}>🌙</Text>
          <View>
            <Text style={styles.weatherTemp}>65°F</Text>
            <Text style={styles.weatherDesc}>Clear Night · New York</Text>
          </View>
        </BlurView>
      </View>

      {/* App grid */}
      <View style={styles.grid}>
        {APPS.map(a => (
          <AppIcon key={a.id} icon={a.icon} label={a.label} c1={a.c1} c2={a.c2}
            onPress={() => { if (a.screen) onOpenApp(a.screen as AppName); }} />
        ))}
      </View>

      {/* Swipe-up handle for drawer */}
      <View style={styles.swipeHandle} {...drawerPan.panHandlers}>
        <View style={styles.swipeBar} />
      </View>

      {/* Dock */}
      <View style={styles.dockWrap}>
        <BlurView intensity={55} tint="dark" style={styles.dock}>
          {DOCK.map(a => (
            <DockIcon key={a.id} icon={a.icon} c1={a.c1} c2={a.c2} onPress={() => onOpenApp(a.id)} />
          ))}
          {/* Recent apps button */}
          <TouchableOpacity onPress={openRecent} activeOpacity={0.75} style={styles.dockRecentBtn}>
            <BlurView intensity={18} tint="light" style={styles.dockRecentInner}>
              <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }}>⊟</Text>
            </BlurView>
          </TouchableOpacity>
        </BlurView>
      </View>
      <View style={styles.homeBar} />

      {/* ── NOTIFICATION PANEL ── */}
      <Animated.View style={[styles.notifPanel, { transform: [{ translateY: notifY }] }]} {...notifPan.panHandlers}>
        <BlurView intensity={70} tint="dark" style={styles.panelInner}>
          <TouchableOpacity onPress={closeNotif} style={{ alignSelf: 'center' }}>
            <View style={styles.panelHandle} />
          </TouchableOpacity>
          <Text style={styles.panelTime}>{time}</Text>
          <Text style={styles.panelDate}>{nowDate()}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
            {toggles.map(t => (
              <TouchableOpacity key={t.id} onPress={() => flipToggle(t.id)} style={[styles.toggle, t.on && styles.toggleOn]}>
                <Text style={styles.toggleIcon}>{t.icon}</Text>
                <Text style={[styles.toggleLabel, t.on && { color: '#0a84ff' }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.notifSection}>NOTIFICATIONS</Text>
          {NOTIFS.map(n => (
            <View key={n.id} style={styles.notifCard}>
              <View style={styles.notifCardIcon}><Text>{n.icon}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifApp}>{n.app}</Text>
                <Text style={styles.notifTitle}>{n.title}</Text>
              </View>
              <Text style={styles.notifTime}>{n.time}</Text>
            </View>
          ))}
        </BlurView>
      </Animated.View>

      {/* ── APP DRAWER ── */}
      <Animated.View style={[styles.drawer, { transform: [{ translateY: drawerY }] }]}>
        <BlurView intensity={75} tint="dark" style={styles.drawerInner}>
          <TouchableOpacity onPress={closeDrawer} style={{ alignSelf: 'center' }}>
            <View style={styles.panelHandle} />
          </TouchableOpacity>
          <Text style={styles.drawerTitle}>All Apps</Text>
          <View style={styles.drawerSearch}>
            <Text style={{ color: 'rgba(255,255,255,0.35)', marginRight: 8 }}>🔍</Text>
            <TextInput value={search} onChangeText={setSearch} placeholder="Search apps…"
              placeholderTextColor="rgba(255,255,255,0.28)" style={styles.drawerInput} />
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.drawerGrid}>
              {filtered.map(a => (
                <TouchableOpacity key={a.id} onPress={() => { closeDrawer(); if (a.screen) onOpenApp(a.screen as AppName); }}
                  style={styles.drawerItem} activeOpacity={0.75}>
                  <LinearGradient colors={[a.c1, a.c2]} style={styles.drawerIcon}>
                    <Text style={{ fontSize: 28, color: '#fff' }}>{a.icon}</Text>
                  </LinearGradient>
                  <Text style={styles.drawerLabel}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </BlurView>
      </Animated.View>

      {/* ── RECENT APPS ── */}
      <Animated.View style={[styles.recent, { transform: [{ translateY: recentY }] }]}>
        <LinearGradient colors={['#050a1a', '#040720']} style={StyleSheet.absoluteFillObject} />
        <TouchableOpacity onPress={closeRecent} style={{ alignSelf: 'center', marginTop: 14 }}>
          <View style={styles.panelHandle} />
        </TouchableOpacity>
        <Text style={styles.recentTitle}>Recent Apps</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
          {APPS.slice(0, 5).map(a => (
            <TouchableOpacity key={a.id} onPress={() => { closeRecent(); if (a.screen) onOpenApp(a.screen as AppName); }} activeOpacity={0.85}>
              <View style={styles.recentCard}>
                <LinearGradient colors={[a.c1, a.c2]} style={StyleSheet.absoluteFillObject} />
                <View style={styles.recentCardHeader}>
                  <Text style={{ fontSize: 18 }}>{a.icon}</Text>
                  <Text style={styles.recentCardName}>{a.label}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={closeRecent} style={styles.recentHomeBtn}>
          <View style={styles.recentHomeBar} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

function AppIcon({ icon, label, c1, c2, onPress }: { icon: string; label: string; c1: string; c2: string; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const tap = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.87, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    setTimeout(onPress, 80);
  };
  return (
    <TouchableOpacity onPress={tap} activeOpacity={1} style={styles.appWrap}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <LinearGradient colors={[c1, c2]} style={[styles.appIcon, { width: ICON, height: ICON }]}>
          <Text style={styles.appEmoji}>{icon}</Text>
        </LinearGradient>
        <Text style={styles.appLabel} numberOfLines={1}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function DockIcon({ icon, c1, c2, onPress }: { icon: string; c1: string; c2: string; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const tap = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.86, duration: 70, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 70, useNativeDriver: true }),
    ]).start();
    setTimeout(onPress, 70);
  };
  return (
    <TouchableOpacity onPress={tap} activeOpacity={1}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <LinearGradient colors={[c1, c2]} style={styles.dockIcon}>
          <Text style={styles.dockEmoji}>{icon}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1 },
  glow:          { position: 'absolute', width: '80%', height: '55%', borderRadius: 999 },
  notifZone:     { position: 'absolute', top: 0, left: 0, right: 0, height: 28, zIndex: 50 },
  notifPull:     { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4 },
  notifPullBar:  { width: 50, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.22)' },
  statusBar:     { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 2 },
  statusTime:    { fontSize: 12, fontWeight: '600', color: '#fff' },
  clockWidget:   { alignItems: 'center', paddingTop: 14, paddingBottom: 8, gap: 4 },
  clockTxt:      { fontSize: 58, fontWeight: '200', color: '#fff', letterSpacing: -2 },
  dateTxt:       { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  weatherWrap:   { alignSelf: 'center', borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  weatherBlur:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingVertical: 9 },
  weatherTemp:   { fontSize: 18, fontWeight: '600', color: '#fff' },
  weatherDesc:   { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  grid:          { flex: 1, flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 14, alignContent: 'flex-start', paddingTop: 4 },
  appWrap:       { alignItems: 'center', gap: 5 },
  appIcon:       { borderRadius: 18, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  appEmoji:      { fontSize: 28, color: '#fff' },
  appLabel:      { fontSize: 11, color: '#fff', textAlign: 'center', maxWidth: ICON },
  swipeHandle:   { alignItems: 'center', paddingVertical: 6 },
  swipeBar:      { width: 60, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)' },
  dockWrap:      { paddingHorizontal: 20, paddingBottom: 20 },
  dock:          { borderRadius: 30, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' },
  dockIcon:      { width: 56, height: 56, borderRadius: 15, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  dockEmoji:     { fontSize: 26, color: '#fff' },
  dockRecentBtn: { width: 56, height: 56 },
  dockRecentInner: { flex: 1, borderRadius: 15, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  homeBar:       { width: 120, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginBottom: 8 },
  // Notification panel
  notifPanel:    { position: 'absolute', top: 0, left: 0, right: 0, height: H * 0.67, zIndex: 100, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden' },
  panelInner:    { flex: 1, padding: 20, paddingTop: 10 },
  panelHandle:   { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: 12 },
  panelTime:     { fontSize: 44, fontWeight: '200', color: '#fff', textAlign: 'center' },
  panelDate:     { fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginBottom: 4 },
  toggle:        { alignItems: 'center', width: 72, paddingVertical: 10, marginRight: 8, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  toggleOn:      { backgroundColor: 'rgba(10,132,255,0.2)', borderColor: 'rgba(10,132,255,0.4)' },
  toggleIcon:    { fontSize: 20 },
  toggleLabel:   { fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 3, textAlign: 'center' },
  notifSection:  { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  notifCard:     { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 12, marginBottom: 8 },
  notifCardIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  notifApp:      { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2 },
  notifTitle:    { fontSize: 13, color: '#fff', fontWeight: '500' },
  notifTime:     { fontSize: 11, color: 'rgba(255,255,255,0.3)' },
  // App Drawer
  drawer:        { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 },
  drawerInner:   { flex: 1, paddingTop: 10, paddingHorizontal: 20 },
  drawerTitle:   { fontSize: 26, fontWeight: '700', color: '#fff', marginBottom: 12, marginTop: 4 },
  drawerSearch:  { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  drawerInput:   { flex: 1, color: '#fff', fontSize: 15 },
  drawerGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  drawerItem:    { width: (W - 40 - 30) / 4, alignItems: 'center', marginBottom: 8 },
  drawerIcon:    { width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  drawerLabel:   { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 5, textAlign: 'center' },
  // Recent Apps
  recent:        { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 95 },
  recentTitle:   { fontSize: 18, fontWeight: '600', color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 16, marginTop: 8 },
  recentScroll:  { paddingHorizontal: 24, gap: 16, alignItems: 'center', paddingTop: 10 },
  recentCard:    { width: W * 0.62, height: H * 0.52, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', elevation: 12 },
  recentCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, backgroundColor: 'rgba(0,0,0,0.35)' },
  recentCardName: { fontSize: 13, fontWeight: '600', color: '#fff' },
  recentHomeBtn:  { alignItems: 'center', paddingBottom: 24, paddingTop: 16 },
  recentHomeBar:  { width: 120, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
});
