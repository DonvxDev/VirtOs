import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props { dark?: boolean }

export default function VirtStatusBar({ dark = false }: Props) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = time.getHours().toString().padStart(2, '0');
  const m = time.getMinutes().toString().padStart(2, '0');
  const c = dark ? 'rgba(0,0,0,0.85)' : '#fff';
  return (
    <View style={styles.bar}>
      <Text style={[styles.time, { color: c }]}>{h}:{m}</Text>
      <View style={styles.right}>
        <View style={styles.signal}>
          {[0.35, 0.55, 0.75, 1].map((op, i) => (
            <View key={i} style={{ width: 3, height: 5 + i * 2.5, borderRadius: 1, backgroundColor: c, opacity: op, marginLeft: 2 }} />
          ))}
        </View>
        <Text style={{ color: c, fontSize: 13, marginLeft: 5 }}>WiFi</Text>
        <View style={[styles.battOuter, { borderColor: c }]}>
          <View style={[styles.battInner, { backgroundColor: c, width: '78%' }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 44,
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 6, zIndex: 200,
  },
  time: { fontSize: 15, fontWeight: '600' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  signal: { flexDirection: 'row', alignItems: 'flex-end', height: 14 },
  battOuter: {
    width: 22, height: 11, borderRadius: 2.5, borderWidth: 1.2,
    padding: 1.5, overflow: 'hidden', marginLeft: 4,
  },
  battInner: { height: '100%', borderRadius: 1 },
});
