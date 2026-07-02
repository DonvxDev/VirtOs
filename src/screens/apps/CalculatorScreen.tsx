import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AppHeader from '../../components/AppHeader';

const BUTTONS = [
  ['AC', '+/-', '%', '÷'],
  ['7',  '8',  '9', '×'],
  ['4',  '5',  '6', '−'],
  ['1',  '2',  '3', '+'],
  ['0',  '.',  '='],
];

export default function CalculatorScreen({ onClose }: { onClose: () => void }) {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);
  const fadeIn = useRef(new Animated.Value(0)).current;

  useState(() => {
    const { default: { timing } } = { default: Animated };
    timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  });

  const press = (btn: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (btn === 'AC') { setDisplay('0'); setPrev(null); setOp(null); setFresh(true); return; }
    if (btn === '+/-') { setDisplay(d => String(-parseFloat(d))); return; }
    if (btn === '%') { setDisplay(d => String(parseFloat(d) / 100)); return; }
    if (['÷', '×', '−', '+'].includes(btn)) {
      setPrev(parseFloat(display)); setOp(btn); setFresh(true); return;
    }
    if (btn === '=') {
      if (prev === null || !op) return;
      const cur = parseFloat(display);
      let result = prev;
      if (op === '+') result = prev + cur;
      if (op === '−') result = prev - cur;
      if (op === '×') result = prev * cur;
      if (op === '÷') result = prev / cur;
      setDisplay(String(parseFloat(result.toFixed(10))));
      setPrev(null); setOp(null); setFresh(true);
      return;
    }
    if (btn === '.') {
      if (fresh) { setDisplay('0.'); setFresh(false); return; }
      if (!display.includes('.')) setDisplay(d => d + '.');
      return;
    }
    if (fresh) { setDisplay(btn); setFresh(false); }
    else if (display.length < 12) setDisplay(d => d === '0' ? btn : d + btn);
  };

  const isOp = (b: string) => ['÷', '×', '−', '+', '='].includes(b);
  const isGray = (b: string) => ['AC', '+/-', '%'].includes(b);

  return (
    <Animated.View style={[styles.root, { opacity: fadeIn }]}>
      <LinearGradient colors={['#1c1c1e', '#111', '#1c1c1e']} style={StyleSheet.absoluteFillObject} />
      <AppHeader title="Rechner" onClose={onClose} dark={false} />

      {/* Display */}
      <View style={styles.display}>
        {op && prev !== null && <Text style={styles.prevDisplay}>{prev} {op}</Text>}
        <Text style={[styles.displayTxt, display.length > 9 && { fontSize: 44 }, display.length > 12 && { fontSize: 34 }]} numberOfLines={1} adjustsFontSizeToFit>
          {display}
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.pad}>
        {BUTTONS.map((row, ri) => (
          <View key={ri} style={[styles.row, ri === 4 && styles.lastRow]}>
            {row.map(btn => {
              const active = op === btn && ['÷', '×', '−', '+'].includes(btn);
              return (
                <TouchableOpacity
                  key={btn}
                  onPress={() => press(btn)}
                  activeOpacity={0.7}
                  style={[
                    styles.btn,
                    btn === '0' && styles.btnWide,
                    isOp(btn) && styles.btnOp,
                    isGray(btn) && styles.btnGray,
                    active && styles.btnOpActive,
                  ]}
                >
                  <Text style={[styles.btnTxt, active && { color: '#ff9f0a' }]}>{btn}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
      <View style={styles.homeBar} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject },
  display: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingBottom: 12, alignItems: 'flex-end' },
  prevDisplay: { fontSize: 20, color: 'rgba(255,255,255,0.3)', marginBottom: 4 },
  displayTxt: { fontSize: 72, fontWeight: '200', color: '#fff', letterSpacing: -2 },
  pad: { padding: 12, gap: 10 },
  row: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  lastRow: { justifyContent: 'flex-end' },
  btn: { flex: 1, height: 72, borderRadius: 36, backgroundColor: '#2c2c2e', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  btnWide: { flex: 2 },
  btnOp: { backgroundColor: '#ff9f0a' },
  btnGray: { backgroundColor: '#636366' },
  btnOpActive: { backgroundColor: '#fff' },
  btnTxt: { fontSize: 28, color: '#fff', fontWeight: '400' },
  homeBar: { width: 120, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 8 },
});
