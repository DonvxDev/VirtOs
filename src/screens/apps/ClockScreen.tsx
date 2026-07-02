import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line } from 'react-native-svg';
import AppHeader from '../../components/AppHeader';

type Tab = 'uhr' | 'alarm' | 'timer';

export default function ClockScreen({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('uhr');
  const [time, setTime] = useState(new Date());
  const [timerSec, setTimerSec] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInput, setTimerInput] = useState(60);
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!timerRunning) return;
    const t = setInterval(() => setTimerSec(s => { if (s <= 1) { setTimerRunning(false); return 0; } return s - 1; }), 1000);
    return () => clearInterval(t);
  }, [timerRunning]);

  const h = time.getHours(), m = time.getMinutes(), s = time.getSeconds();
  const hAngle = (h % 12) * 30 + m * 0.5, mAngle = m * 6, sAngle = s * 6;
  const r = 90;
  const hand = (angle: number, len: number) => ({
    x: 100 + Math.sin(angle * Math.PI / 180) * len,
    y: 100 - Math.cos(angle * Math.PI / 180) * len,
  });

  const fmt = (n: number) => n.toString().padStart(2, '0');
  const tMin = Math.floor(timerSec / 60), tSec = timerSec % 60;

  return (
    <Animated.View style={[styles.root, { opacity: fadeIn }]}>
      <LinearGradient colors={['#040720', '#0a1028', '#040720']} style={StyleSheet.absoluteFillObject} />
      <AppHeader title="Uhr" onClose={onClose} />

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['uhr', 'alarm', 'timer'] as Tab[]).map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabTxt, tab === t && styles.tabTxtActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {tab === 'uhr' && (
          <View style={styles.clockView}>
            <Svg width={200} height={200} viewBox="0 0 200 200">
              <Circle cx={100} cy={100} r={r} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
              {Array.from({ length: 12 }, (_, i) => {
                const ang = i * 30 * Math.PI / 180;
                return <Line key={i} x1={100 + Math.sin(ang) * 82} y1={100 - Math.cos(ang) * 82} x2={100 + Math.sin(ang) * 90} y2={100 - Math.cos(ang) * 90} stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" />;
              })}
              {/* Hour */}
              <Line x1={100} y1={100} x2={hand(hAngle, 52).x} y2={hand(hAngle, 52).y} stroke="#fff" strokeWidth={4} strokeLinecap="round" />
              {/* Minute */}
              <Line x1={100} y1={100} x2={hand(mAngle, 72).x} y2={hand(mAngle, 72).y} stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
              {/* Second */}
              <Line x1={100} y1={100} x2={hand(sAngle, 80).x} y2={hand(sAngle, 80).y} stroke="#ff453a" strokeWidth={1.5} strokeLinecap="round" />
              <Circle cx={100} cy={100} r={5} fill="#ff453a" />
            </Svg>
            <Text style={styles.digitalTime}>
              {fmt(h)}:{fmt(m)}:{fmt(s)}
            </Text>
            <Text style={styles.digitalDate}>
              {time.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
        )}

        {tab === 'alarm' && (
          <View style={styles.center}>
            <Text style={{ fontSize: 64 }}>⏰</Text>
            <Text style={styles.emptyTxt}>Kein Alarm gesetzt</Text>
            <TouchableOpacity style={styles.addBtn}>
              <Text style={styles.addBtnTxt}>+ Alarm hinzufügen</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'timer' && (
          <View style={styles.center}>
            <Text style={styles.timerDisplay}>{fmt(tMin)}:{fmt(tSec)}</Text>
            {!timerRunning && timerSec === 0 && (
              <View style={styles.timerAdjust}>
                <TouchableOpacity onPress={() => setTimerInput(i => Math.max(5, i - 15))} style={styles.adjBtn}>
                  <Text style={styles.adjTxt}>−15s</Text>
                </TouchableOpacity>
                <Text style={styles.adjVal}>{timerInput}s</Text>
                <TouchableOpacity onPress={() => setTimerInput(i => i + 15)} style={styles.adjBtn}>
                  <Text style={styles.adjTxt}>+15s</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {timerSec === 0 && !timerRunning ? (
                <TouchableOpacity onPress={() => { setTimerSec(timerInput); setTimerRunning(true); }} style={[styles.timerBtn, { backgroundColor: '#30d158' }]}>
                  <Text style={styles.timerBtnTxt}>Start</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity onPress={() => setTimerRunning(r => !r)} style={[styles.timerBtn, { backgroundColor: timerRunning ? '#ff9f0a' : '#30d158' }]}>
                    <Text style={styles.timerBtnTxt}>{timerRunning ? 'Pause' : 'Weiter'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setTimerSec(0); setTimerRunning(false); }} style={[styles.timerBtn, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
                    <Text style={styles.timerBtnTxt}>Reset</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
      </View>
      <View style={styles.homeBar} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 4, paddingBottom: 8 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: 'center' },
  tabActive: { backgroundColor: 'rgba(10,132,255,0.15)', borderWidth: 1, borderColor: 'rgba(10,132,255,0.3)' },
  tabTxt: { fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
  tabTxtActive: { color: '#0a84ff' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  clockView: { alignItems: 'center', gap: 20 },
  digitalTime: { fontSize: 48, fontWeight: '200', color: '#fff', letterSpacing: -1 },
  digitalDate: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  center: { alignItems: 'center', gap: 20 },
  emptyTxt: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
  addBtn: { backgroundColor: '#0a84ff', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
  addBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '600' },
  timerDisplay: { fontSize: 76, fontWeight: '200', color: '#fff', letterSpacing: -2 },
  timerAdjust: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  adjBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)' },
  adjTxt: { color: '#fff', fontSize: 14, fontWeight: '600' },
  adjVal: { color: '#fff', fontSize: 16, minWidth: 60, textAlign: 'center' },
  timerBtn: { paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
  timerBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '600' },
  homeBar: { width: 120, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 8 },
});
