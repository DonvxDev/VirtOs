import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import VirtStatusBar from './StatusBar';

interface Props { title: string; onClose: () => void; dark?: boolean }

export default function AppHeader({ title, onClose, dark = false }: Props) {
  return (
    <View style={styles.wrap}>
      <VirtStatusBar dark={dark} />
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.back} activeOpacity={0.6}>
          <Text style={styles.chevron}>‹</Text>
          <Text style={styles.backTxt}>Zurück</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: dark ? '#000' : '#fff' }]}>{title}</Text>
        <View style={{ width: 70 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 44 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 44,
  },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 70 },
  chevron: { fontSize: 30, color: '#0a84ff', lineHeight: 34, marginTop: -2 },
  backTxt: { fontSize: 16, color: '#0a84ff' },
  title: { fontSize: 17, fontWeight: '600' },
});
