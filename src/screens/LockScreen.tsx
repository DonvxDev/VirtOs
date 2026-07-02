import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const H = Dimensions.get('window').height;

const STARS = Array.from({ length: 50 }, (_, i) => ({
  x: `${(i * 13.7) % 100}%`, y: `${(i * 17.3) % 100}%`,
  size: (i % 3) + 1, op: 0.08 + (i % 5) * 0.12,
}));

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [time, setTime] = useState(new Date());
  const ty = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const hintOp = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => {
      if (g.dy < 0) {
        ty.setValue(g.dy);
        hintOp.setValue(Math.max(0, 1 + g.dy / 100));
      }
    },
    onPanResponderRelease: (_, g) => {
      if (g.dy < -80) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Animated.parallel([
          Animated.timing(ty, { toValue: -H, duration: 360, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 360, useNativeDriver: true }),
        ]).start(() => onUnlock());
      } else {
        Animated.spring(ty, { toValue: 0, useNativeDriver: true }).start();
        Animated.timing(hintOp, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      }
    },
  })).current;

  const h = time.getHours().toString().padStart(2, '0');
  const m = time.getMinutes().toString().padStart(2, '0');
  const date = time.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Animated.View style={[styles.root, { opacity, transform: [{ translateY: ty }] }]} {...pan.panHandlers}>
      <LinearGradient colors={['#040720', '#0a1540', '#0d0a2e', '#04111a']} style={StyleSheet.absoluteFillObject} />
      <View style={[styles.glow, { top: '-12%', left: '-22%', backgroundColor: 'rgba(10,132,255,0.14)' }]} />
      <View style={[styles.glow, { bottom: '-8%', right: '-18%', backgroundColor: 'rgba(191,90,242,0.11)' }]} />
      {STARS.map((s, i) => (
        <View key={i} style={{ position: 'absolute', left: s.x as any, top: s.y as any, width: s.size, height: s.size, borderRadius: s.size, backgroundColor: `rgba(255,255,255,${s.op})` }} />
      ))}

      <View style={styles.timeBlock}>
        <Text style={styles.time}>{h}:{m}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>

      <Animated.View style={[styles.hint, { opacity: hintOp }]}>
        <View style={styles.pill} />
        <Text style={styles.hintTxt}>Nach oben wischen zum Entsperren</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'space-between', paddingTop: 80, paddingBottom: 60 },
  glow: { position: 'absolute', width: '75%', height: '55%', borderRadius: 999 },
  timeBlock: { alignItems: 'center', gap: 8 },
  time: { fontSize: 90, fontWeight: '200', color: '#fff', letterSpacing: -3 },
  date: { fontSize: 16, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.3 },
  hint: { alignItems: 'center', gap: 10 },
  pill: { width: 40, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  hintTxt: { fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 },
});
