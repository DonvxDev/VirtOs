import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import BootScreen from '@/screens/BootScreen';
import LockScreen from '@/screens/LockScreen';
import HomeScreen from '@/screens/HomeScreen';
import CameraScreen from '@/screens/apps/CameraScreen';
import SettingsScreen from '@/screens/apps/SettingsScreen';
import VirtAIScreen from '@/screens/apps/VirtAIScreen';
import ClockScreen from '@/screens/apps/ClockScreen';
import CalculatorScreen from '@/screens/apps/CalculatorScreen';

export type AppName = 'camera' | 'settings' | 'virt-ai' | 'clock' | 'calculator';

export default function App() {
  const [phase, setPhase] = useState<'boot' | 'lock' | 'home'>('boot');
  const [openApp, setOpenApp] = useState<AppName | null>(null);

  return (
    <View style={styles.root}>
      {phase === 'boot' && <BootScreen onDone={() => setPhase('lock')} />}
      {phase === 'lock' && <LockScreen onUnlock={() => setPhase('home')} />}
      {phase === 'home' && (
        <>
          <HomeScreen onOpenApp={(a) => setOpenApp(a)} />
          {openApp === 'camera'     && <CameraScreen     onClose={() => setOpenApp(null)} />}
          {openApp === 'settings'   && <SettingsScreen   onClose={() => setOpenApp(null)} />}
          {openApp === 'virt-ai'    && <VirtAIScreen     onClose={() => setOpenApp(null)} />}
          {openApp === 'clock'      && <ClockScreen      onClose={() => setOpenApp(null)} />}
          {openApp === 'calculator' && <CalculatorScreen onClose={() => setOpenApp(null)} />}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: '#000' } });
