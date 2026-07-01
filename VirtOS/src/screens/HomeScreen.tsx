import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import VirtStatusBar from '../components/StatusBar';
import type { AppName } from '../../app/index';

const { width: W } = Dimensions.get('window');
const COLS = 4;
const ICON = (W - 32 - (COLS - 1) * 14) / COLS;

const APPS = [
  { id: 'camera'     as AppName, label: 'Kamera',       icon: '📷', c1: '#1c1c30', c2: '#0d0d1e' },
  { id: 'virt-ai'   as AppName, label: 'Virt KI',       icon: '✦',  c1: '#0a84ff', c2: '#0044aa' },
  { id: 'clock'     as AppName, label: 'Uhr',            icon: '🕐', c1: '#1e2c3a', c2: '#0d1a24' },
  { id: 'calculator'as AppName, label: 'Rechner',        icon: '#',  c1: '#0a2e14', c2: '#051a0a' },
  { id: 'settings'  as AppName, label: 'Einstellungen',  icon: '⚙',  c1: '#2a2a2a', c2: '#111' },
];

const DOCK = [
  { id: 'virt-ai'   as AppName, icon: '✦',  c1: '#0a84ff', c2: '#0044aa' },
  { id: 'camera'    as AppName, icon: '📷', c1: '#1c1c30', c2: '#0d0d1e' },
  { id: 'settings'  as AppName, icon: '⚙',  c1: '#2a2a2a', c2: '#111' },
];

const STARS = Array.from({ length: 45 }, (_, i) => ({
  x: `${(i * 11.3) % 100}%`, y: `${(i * 17.7) % 100}%`,
  size: (i % 3) + 1, op: 0.06 + (i % 5) * 0.1,
}));

export default function HomeScreen({ onOpenApp }: { onOpenApp: (a: AppName) => void }) {
  const [time, setTime] = useState(new Date());
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const h = time.getHours().toString().padStart(2, '0');
  const m = time.getMinutes().toString().padStart(2, '0');
  const date = time.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
      <LinearGradient colors={['#040720', '#0a1540', '#0d0a2e', '#04111a']} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.glow, { top: '-8%', left: '-20%', backgroundColor: 'rgba(10,132,255,0.16)' }]} />
      <View style={[styles.glow, { bottom: '8%', right: '-15%', backgroundColor: 'rgba(191,90,242,0.12)' }]} />
      {STARS.map((s, i) => (
        <View key={i} style={{ position: 'absolute', left: s.x as any, top: s.y as any, width: s.size, height: s.size, borderRadius: s.size, backgroundColor: `rgba(255,255,255,${s.op})` }} />
      ))}

      <VirtStatusBar />

      {/* Clock widget */}
      <View style={styles.clockWidget}>
        <Text style={styles.clockTxt}>{h}:{m}</Text>
        <Text style={styles.dateTxt}>{date}</Text>
      </View>

      {/* App grid */}
      <View style={styles.grid}>
        {APPS.map(a => <AppIcon key={a.id} app={a} onPress={() => onOpenApp(a.id)} />)}
      </View>

      {/* Dock */}
      <View style={styles.dockWrap}>
        <BlurView intensity={55} tint="dark" style={styles.dock}>
          {DOCK.map(a => <DockIcon key={a.id} app={a} onPress={() => onOpenApp(a.id)} />)}
        </BlurView>
      </View>

      <View style={styles.homeBar} />
    </Animated.View>
  );
}

function AppIcon({ app, onPress }: { app: typeof APPS[0]; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const isEmoji = /\p{Emoji}/u.test(app.icon);
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
        <LinearGradient colors={[app.c1, app.c2]} style={[styles.appIcon, { width: ICON, height: ICON }]}>
          <Text style={[styles.appEmoji, !isEmoji && { fontSize: 26, fontWeight: '700' }]}>{app.icon}</Text>
        </LinearGradient>
        <Text style={styles.appLabel} numberOfLines={1}>{app.label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function DockIcon({ app, onPress }: { app: typeof DOCK[0]; onPress: () => void }) {
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
        <LinearGradient colors={[app.c1, app.c2]} style={styles.dockIcon}>
          <Text style={styles.dockEmoji}>{app.icon}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  glow: { position: 'absolute', width: '80%', height: '55%', borderRadius: 999 },
  clockWidget: { alignItems: 'center', paddingTop: 56, paddingBottom: 8, gap: 4 },
  clockTxt: { fontSize: 60, fontWeight: '200', color: '#fff', letterSpacing: -2 },
  dateTxt: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 14, alignContent: 'flex-start', paddingTop: 8 },
  appWrap: { alignItems: 'center', gap: 5 },
  appIcon: { borderRadius: 18, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  appEmoji: { fontSize: 30, color: '#fff' },
  appLabel: { fontSize: 11, color: '#fff', textAlign: 'center', maxWidth: ICON },
  dockWrap: { paddingHorizontal: 20, paddingBottom: 28 },
  dock: { borderRadius: 30, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
  dockIcon: { width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  dockEmoji: { fontSize: 28, color: '#fff' },
  homeBar: { width: 120, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginBottom: 8 },
});
