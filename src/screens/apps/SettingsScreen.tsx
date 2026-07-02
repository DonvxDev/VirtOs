import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../../components/AppHeader';

const CURRENT_VERSION = '1.0.0';
const GITHUB_REPO = 'DonvxDev/VirtOs';

type Tab = 'updates' | 'general' | 'display' | 'sound' | 'about';

interface Release { tag_name: string; name: string; body: string; published_at: string }

export default function SettingsScreen({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('updates');
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'updates', label: 'Updates', icon: '⬆' },
    { id: 'general', label: 'General', icon: '⚙' },
    { id: 'display', label: 'Display', icon: '☀' },
    { id: 'sound',   label: 'Sound',   icon: '🔊' },
    { id: 'about',   label: 'About',   icon: 'ℹ' },
  ];

  return (
    <Animated.View style={[styles.root, { opacity: fadeIn }]}>
      <LinearGradient colors={['#040720', '#0a0a1a', '#040720']} style={StyleSheet.absoluteFillObject} />
      <AppHeader title="Settings" onClose={onClose} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} onPress={() => setTab(t.id)} style={[styles.tab, tab === t.id && styles.tabActive]}>
            <Text style={styles.tabIcon}>{t.icon}</Text>
            <Text style={[styles.tabTxt, tab === t.id && styles.tabTxtActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ flex: 1 }}>
        {tab === 'updates' && <UpdatesTab />}
        {tab === 'general' && <GeneralTab />}
        {tab === 'display' && <DisplayTab />}
        {tab === 'sound'   && <SoundTab />}
        {tab === 'about'   && <AboutTab />}
      </View>

      <View style={styles.homeBar} />
    </Animated.View>
  );
}

function UpdatesTab() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'up-to-date' | 'available' | 'updating' | 'done'>('idle');
  const [release, setRelease] = useState<Release | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const check = async () => {
    setStatus('checking'); setError(''); setRelease(null); setProgress(0);
    progressAnim.setValue(0);
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (!res.ok) throw new Error(`GitHub: ${res.status}`);
      const data: Release = await res.json();
      setRelease(data);
      const latest = data.tag_name.replace(/^v/, '');
      setStatus(compareVer(latest, CURRENT_VERSION) > 0 ? 'available' : 'up-to-date');
    } catch (e: any) {
      setError('Could not check for updates: ' + (e.message || 'Network error'));
      setStatus('idle');
    }
  };

  const startUpdate = () => {
    setStatus('updating'); setProgress(0); progressAnim.setValue(0);
    let p = 0;
    timerRef.current = setInterval(() => {
      p += Math.random() * 7 + 2;
      if (p >= 100) {
        p = 100; clearInterval(timerRef.current!);
        Animated.timing(progressAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
        setProgress(100);
        setTimeout(() => setStatus('done'), 500);
      } else {
        setProgress(Math.round(p));
        Animated.timing(progressAnim, { toValue: p / 100, duration: 280, useNativeDriver: false }).start();
      }
    }, 300);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  const barWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.cardLabel}>Current Version</Text>
            <Text style={styles.versionBig}>Virt OS {CURRENT_VERSION}</Text>
          </View>
          <LinearGradient colors={['#0a84ff', '#bf5af2']} style={styles.osIcon}>
            <Text style={{ fontSize: 22 }}>📱</Text>
          </LinearGradient>
        </View>
      </View>

      {status === 'idle' && (
        <TouchableOpacity onPress={check} activeOpacity={0.85}>
          <LinearGradient colors={['#0a84ff', '#0055bb']} style={styles.checkBtn}>
            <Text style={styles.checkBtnTxt}>🔍  Check for Updates</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {status === 'checking' && (
        <View style={[styles.card, { alignItems: 'center', gap: 12 }]}>
          <Text style={{ fontSize: 36 }}>🔍</Text>
          <Text style={styles.statusTitle}>Checking for updates…</Text>
          <Text style={styles.statusSub}>Connecting to GitHub</Text>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: barWidth }]} />
          </View>
        </View>
      )}

      {status === 'up-to-date' && release && (
        <View style={{ gap: 10 }}>
          <View style={[styles.card, { alignItems: 'center', gap: 10, borderColor: 'rgba(48,209,88,0.25)', borderWidth: 1, backgroundColor: 'rgba(48,209,88,0.08)' }]}>
            <Text style={{ fontSize: 40 }}>✅</Text>
            <Text style={[styles.statusTitle, { color: '#30d158' }]}>Virt OS is up to date</Text>
            <Text style={styles.statusSub}>Latest: {release.tag_name}</Text>
          </View>
          <TouchableOpacity onPress={check} style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnTxt}>Check again</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'available' && release && (
        <View style={{ gap: 10 }}>
          <View style={[styles.card, { borderColor: 'rgba(10,132,255,0.25)', borderWidth: 1, backgroundColor: 'rgba(10,132,255,0.07)', gap: 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <LinearGradient colors={['#0a84ff', '#bf5af2']} style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 22 }}>⬆</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>{release.name}</Text>
                <Text style={{ color: '#0a84ff', fontSize: 13 }}>{release.tag_name}</Text>
              </View>
            </View>
            {!!release.body && (
              <View style={styles.releaseNotes}>
                <Text style={styles.releaseNotesTxt}>{release.body}</Text>
              </View>
            )}
            <Text style={styles.statusSub}>
              Released: {new Date(release.published_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity onPress={startUpdate} activeOpacity={0.85}>
            <LinearGradient colors={['#0a84ff', '#0055bb']} style={styles.checkBtn}>
              <Text style={styles.checkBtnTxt}>⬆  Update to {release.tag_name}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {status === 'updating' && (
        <View style={[styles.card, { gap: 16 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.statusTitle}>Installing update</Text>
              <Text style={styles.statusSub}>{progress}% complete</Text>
            </View>
            <Text style={{ fontSize: 30 }}>⚙</Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: barWidth }]} />
          </View>
          <Text style={[styles.statusSub, { textAlign: 'center' }]}>
            {progress < 30 ? 'Downloading…' : progress < 60 ? 'Installing…' : progress < 90 ? 'Configuring…' : 'Finishing…'}
          </Text>
        </View>
      )}

      {status === 'done' && (
        <View style={[styles.card, { alignItems: 'center', gap: 14, borderColor: 'rgba(48,209,88,0.25)', borderWidth: 1, backgroundColor: 'rgba(48,209,88,0.07)' }]}>
          <Text style={{ fontSize: 48 }}>🎉</Text>
          <Text style={[styles.statusTitle, { color: '#30d158' }]}>Update complete!</Text>
          <Text style={styles.statusSub}>Virt OS updated to {release?.tag_name}.</Text>
          <TouchableOpacity onPress={() => setStatus('idle')} style={[styles.checkBtn, { backgroundColor: '#30d158', width: '100%' }]}>
            <Text style={styles.checkBtnTxt}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {!!error && (
        <View style={[styles.card, { borderColor: 'rgba(255,69,58,0.25)', borderWidth: 1, backgroundColor: 'rgba(255,69,58,0.08)', marginTop: 10 }]}>
          <Text style={{ color: '#ff453a', fontSize: 13, lineHeight: 19 }}>{error}</Text>
        </View>
      )}

      <View style={{ marginTop: 24 }}>
        <Text style={styles.sectionLabel}>UPDATE HISTORY</Text>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#fff', fontWeight: '500' }}>v1.0.0</Text>
            <Text style={styles.cardLabel}>July 1, 2026</Text>
          </View>
          <Text style={[styles.cardLabel, { marginTop: 2 }]}>First release — Virt OS</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function GeneralTab() {
  const [notif,     setNotif]     = useState(true);
  const [location,  setLocation]  = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [lang,      setLang]      = useState('English (US)');
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <SettingsGroup label="LANGUAGE & REGION">
        <SettingsRow label="Language"  value={lang} onPress={() => setLang(l => l.startsWith('E') ? 'Deutsch' : 'English (US)')} />
        <SettingsRow label="Region"    value="United States" />
        <SettingsRow label="Time Zone" value="America/New_York" />
      </SettingsGroup>
      <SettingsGroup label="PRIVACY">
        <SettingsRow label="Notifications" toggle value={notif}     onToggle={setNotif} />
        <SettingsRow label="Location"      toggle value={location}  onToggle={setLocation} />
        <SettingsRow label="Analytics"     toggle value={analytics} onToggle={setAnalytics} />
      </SettingsGroup>
      <SettingsGroup label="SECURITY">
        <SettingsRow label="Screen Lock" value="Swipe Gesture" />
        <SettingsRow label="Biometrics"  value="Disabled" />
      </SettingsGroup>
    </ScrollView>
  );
}

function DisplayTab() {
  const [dark,       setDark]       = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [brightness, setBrightness] = useState(80);
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <SettingsGroup label="APPEARANCE">
        <SettingsRow label="Dark Mode"    toggle value={dark}       onToggle={setDark} />
        <SettingsRow label="Auto-Rotate"  toggle value={autoRotate} onToggle={setAutoRotate} />
        <SettingsRow label="Brightness"   value={`${brightness}%`}  onPress={() => setBrightness(b => b >= 100 ? 30 : b + 10)} />
      </SettingsGroup>
      <SettingsGroup label="LIQUID GLASS">
        <View style={styles.glassPreview}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 19 }}>
            Liquid Glass is active — the revolutionary design system that makes Virt OS unique.
          </Text>
          <View style={[styles.card, { marginTop: 12, borderColor: 'rgba(10,132,255,0.3)', borderWidth: 1, backgroundColor: 'rgba(10,132,255,0.1)', alignItems: 'center' }]}>
            <Text style={{ color: '#0a84ff', fontWeight: '600' }}>✓  Liquid Glass Active</Text>
          </View>
        </View>
      </SettingsGroup>
    </ScrollView>
  );
}

function SoundTab() {
  const [vibrate, setVibrate] = useState(true);
  const [sounds,  setSounds]  = useState(true);
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <SettingsGroup label="SOUND & VIBRATION">
        <SettingsRow label="Vibration"          toggle value={vibrate} onToggle={setVibrate} />
        <SettingsRow label="System Sounds"      toggle value={sounds}  onToggle={setSounds} />
        <SettingsRow label="Ringtone"           value="Virt Default" />
        <SettingsRow label="Notification Sound" value="Virt Ping" />
      </SettingsGroup>
    </ScrollView>
  );
}

function AboutTab() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={{ alignItems: 'center', paddingVertical: 28, gap: 10 }}>
        <LinearGradient colors={['#0a84ff', '#bf5af2']} style={{ width: 84, height: 84, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 42 }}>📱</Text>
        </LinearGradient>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff' }}>Virt OS</Text>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Version {CURRENT_VERSION}</Text>
      </View>
      <SettingsGroup label="DEVICE">
        <SettingsRow label="Model"    value="Virt Phone" />
        <SettingsRow label="Software" value={`Virt OS ${CURRENT_VERSION}`} />
        <SettingsRow label="Build"    value="2026.07.01" />
        <SettingsRow label="Kernel"   value="Virt Kernel 1.0" />
      </SettingsGroup>
      <SettingsGroup label="LEGAL">
        <SettingsRow label="Open Source"      value="GitHub →" />
        <SettingsRow label="Privacy Policy"   value="→" />
        <SettingsRow label="Terms of Service" value="→" />
      </SettingsGroup>
    </ScrollView>
  );
}

function SettingsGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.group}>{children}</View>
    </View>
  );
}

function SettingsRow({ label, value, toggle, onToggle, onPress }: {
  label: string; value?: string | boolean; toggle?: boolean;
  onToggle?: (v: boolean) => void; onPress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress || onToggle ? 0.6 : 1} style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {toggle ? (
        <Switch value={value as boolean} onValueChange={onToggle}
          trackColor={{ false: '#3a3a3c', true: '#30d158' }} thumbColor="#fff" />
      ) : (
        <Text style={styles.rowValue}>{value as string}</Text>
      )}
    </TouchableOpacity>
  );
}

function compareVer(a: string, b: string): number {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return 1;
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return -1;
  }
  return 0;
}

const styles = StyleSheet.create({
  root:            { ...StyleSheet.absoluteFillObject },
  tabs:            { paddingHorizontal: 12, paddingBottom: 8, gap: 6 },
  tab:             { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, alignItems: 'center', gap: 2, borderWidth: 1, borderColor: 'transparent' },
  tabActive:       { backgroundColor: 'rgba(10,132,255,0.14)', borderColor: 'rgba(10,132,255,0.3)' },
  tabIcon:         { fontSize: 16 },
  tabTxt:          { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '600', letterSpacing: 0.2 },
  tabTxtActive:    { color: '#0a84ff' },
  scrollContent:   { padding: 16, paddingBottom: 40 },
  card:            { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardLabel:       { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 2 },
  versionBig:      { fontSize: 22, fontWeight: '600', color: '#fff' },
  osIcon:          { width: 48, height: 48, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  checkBtn:        { paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  checkBtnTxt:     { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryBtn:    { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  secondaryBtnTxt: { color: 'rgba(255,255,255,0.55)', fontSize: 14 },
  progressTrack:   { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  progressFill:    { height: '100%', borderRadius: 4, backgroundColor: '#0a84ff' },
  statusTitle:     { fontSize: 16, fontWeight: '600', color: '#fff' },
  statusSub:       { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  releaseNotes:    { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12 },
  releaseNotesTxt: { color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 19 },
  sectionLabel:    { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 },
  group:           { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  row:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  rowLabel:        { fontSize: 15, color: '#fff' },
  rowValue:        { fontSize: 14, color: 'rgba(255,255,255,0.35)' },
  glassPreview:    { padding: 16 },
  homeBar:         { width: 120, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 8 },
});
