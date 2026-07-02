import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Linking, TextInput, Dimensions, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import AppHeader from '../../components/AppHeader';

const { width: W } = Dimensions.get('window');

// ──────────────────────────────────────────────────────────────
// Real free apps — legal links to official / APKPure sources
// ──────────────────────────────────────────────────────────────
interface StoreApp {
  id: string; name: string; developer: string; icon: string;
  category: string; rating: number; size: string; free: boolean;
  description: string; color: [string, string];
  downloadUrl: string; // official or APKPure listing
}

const STORE_APPS: StoreApp[] = [
  {
    id: 'subway',
    name: 'Subway Surfers',
    developer: 'Sybo Games',
    icon: '🏃',
    category: 'Games',
    rating: 4.5,
    size: '123 MB',
    free: true,
    description: 'Run, jump and surf through subways in this endless runner. Dodge trains and collect coins!',
    color: ['#f5a623', '#c07d10'],
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.kiloo.subwaysurf',
  },
  {
    id: 'geometry',
    name: 'Geometry Dash Lite',
    developer: 'RobTop Games',
    icon: '⬛',
    category: 'Games',
    rating: 4.6,
    size: '89 MB',
    free: true,
    description: 'Jump and fly your way through danger in this rhythm-based action platformer. Free version!',
    color: ['#6c5ce7', '#4a3bb5'],
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.robtopx.geometryjumplite',
  },
  {
    id: 'minecraft_trial',
    name: 'Minecraft Trial',
    developer: 'Mojang Studios',
    icon: '⛏',
    category: 'Games',
    rating: 4.5,
    size: '158 MB',
    free: true,
    description: 'Official free trial of Minecraft. Mine, craft and survive in a blocky world!',
    color: ['#5d8a3c', '#3d6025'],
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.mojang.minecrafttrialpe',
  },
  {
    id: 'brawl',
    name: 'Brawl Stars',
    developer: 'Supercell',
    icon: '⭐',
    category: 'Games',
    rating: 4.3,
    size: '201 MB',
    free: true,
    description: 'Fast-paced 3v3 multiplayer battles and more. Choose your Brawler and jump in!',
    color: ['#e84393', '#a0106a'],
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.supercell.brawlstars',
  },
  {
    id: 'roblox',
    name: 'Roblox',
    developer: 'Roblox Corporation',
    icon: '🎮',
    category: 'Games',
    rating: 4.2,
    size: '112 MB',
    free: true,
    description: 'Millions of games made by a global community. Play, create, and explore!',
    color: ['#e03a2f', '#9e1f16'],
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.roblox.client',
  },
  {
    id: 'among',
    name: 'Among Us',
    developer: 'InnerSloth',
    icon: '🚀',
    category: 'Games',
    rating: 4.1,
    size: '67 MB',
    free: true,
    description: 'Work together — or not! Find the impostors among the crew in space.',
    color: ['#c51111', '#8b0b0b'],
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.innersloth.spacemafia',
  },
  {
    id: 'clash',
    name: 'Clash of Clans',
    developer: 'Supercell',
    icon: '🏰',
    category: 'Games',
    rating: 4.5,
    size: '230 MB',
    free: true,
    description: 'Build your village, raise a clan and compete in epic Clan Wars!',
    color: ['#4a90d9', '#2c5f9e'],
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.supercell.clashofclans',
  },
  {
    id: 'ff',
    name: 'Free Fire',
    developer: 'Garena',
    icon: '🔥',
    category: 'Games',
    rating: 4.0,
    size: '710 MB',
    free: true,
    description: '50-player battle royale on a shrinking island. Be the last one standing!',
    color: ['#ff6b00', '#c44d00'],
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.dts.freefireth',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    developer: 'Spotify AB',
    icon: '🎵',
    category: 'Music',
    rating: 4.3,
    size: '45 MB',
    free: true,
    description: 'Listen to music, podcasts and more. Free tier available.',
    color: ['#1db954', '#148038'],
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.spotify.music',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    developer: 'Google LLC',
    icon: '▶',
    category: 'Video',
    rating: 4.2,
    size: '55 MB',
    free: true,
    description: 'Watch videos, subscribe to channels and share content worldwide.',
    color: ['#ff0000', '#b30000'],
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.google.android.youtube',
  },
  {
    id: 'discord',
    name: 'Discord',
    developer: 'Discord Inc.',
    icon: '💬',
    category: 'Social',
    rating: 4.4,
    size: '78 MB',
    free: true,
    description: 'Talk, video chat and hang out with your friends and communities.',
    color: ['#5865f2', '#3d4fc9'],
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.discord',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    developer: 'TikTok Pte. Ltd.',
    icon: '🎬',
    category: 'Social',
    rating: 4.4,
    size: '90 MB',
    free: true,
    description: 'Watch and create short videos. Discover trending content from around the world.',
    color: ['#010101', '#1a1a1a'],
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.zhiliaoapp.musically',
  },
];

const CATEGORIES = ['All', 'Games', 'Music', 'Video', 'Social'];

const FEATURED = STORE_APPS.slice(0, 3);

export default function VirtStoreScreen({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<StoreApp | null>(null);
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  const filtered = STORE_APPS.filter(a =>
    (category === 'All' || a.category === category) &&
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const openApp = (app: StoreApp) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(app);
  };

  const download = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Linking.openURL(url);
  };

  return (
    <Animated.View style={[styles.root, { opacity: fadeIn }]}>
      <LinearGradient colors={['#040720', '#0a0a1a', '#040720']} style={StyleSheet.absoluteFillObject} />
      <AppHeader title="Virt Store" onClose={onClose} />

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search apps & games…"
              placeholderTextColor="rgba(255,255,255,0.28)"
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Featured banner */}
        {!search && category === 'All' && (
          <View>
            <Text style={styles.sectionTitle}>Featured</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
              {FEATURED.map(app => (
                <TouchableOpacity key={app.id} onPress={() => openApp(app)} activeOpacity={0.85} style={styles.featuredCard}>
                  <LinearGradient colors={app.color} style={StyleSheet.absoluteFillObject} />
                  <Text style={styles.featuredIcon}>{app.icon}</Text>
                  <Text style={styles.featuredName}>{app.name}</Text>
                  <Text style={styles.featuredDev}>{app.developer}</Text>
                  <View style={styles.featuredGetBtn}>
                    <Text style={styles.featuredGetTxt}>GET FREE</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.catChip, category === c && styles.catChipActive]}>
              <Text style={[styles.catTxt, category === c && styles.catTxtActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* App list */}
        <Text style={styles.sectionTitle}>{category === 'All' ? 'All Apps' : category}</Text>
        <View style={styles.appList}>
          {filtered.map(app => (
            <TouchableOpacity key={app.id} onPress={() => openApp(app)} activeOpacity={0.8} style={styles.appRow}>
              <LinearGradient colors={app.color} style={styles.appRowIcon}>
                <Text style={styles.appRowEmoji}>{app.icon}</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.appRowName}>{app.name}</Text>
                <Text style={styles.appRowDev}>{app.developer}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Text style={styles.appRowRating}>{'★'.repeat(Math.round(app.rating))}</Text>
                  <Text style={styles.appRowRatingNum}>{app.rating}</Text>
                  <Text style={styles.appRowDot}>·</Text>
                  <Text style={styles.appRowSize}>{app.size}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => download(app.downloadUrl)} style={styles.getBtn} activeOpacity={0.8}>
                <LinearGradient colors={['#0a84ff', '#0055bb']} style={styles.getBtnInner}>
                  <Text style={styles.getBtnTxt}>GET</Text>
                </LinearGradient>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.homeBar} />

      {/* App detail modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        {selected && (
          <View style={styles.modalBg}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <LinearGradient colors={selected.color} style={styles.modalIcon}>
                <Text style={styles.modalIconEmoji}>{selected.icon}</Text>
              </LinearGradient>
              <Text style={styles.modalName}>{selected.name}</Text>
              <Text style={styles.modalDev}>{selected.developer}</Text>
              <View style={styles.modalMeta}>
                <View style={styles.modalMetaItem}>
                  <Text style={styles.modalMetaVal}>{selected.rating}★</Text>
                  <Text style={styles.modalMetaLabel}>Rating</Text>
                </View>
                <View style={styles.modalMetaDivider} />
                <View style={styles.modalMetaItem}>
                  <Text style={styles.modalMetaVal}>{selected.size}</Text>
                  <Text style={styles.modalMetaLabel}>Size</Text>
                </View>
                <View style={styles.modalMetaDivider} />
                <View style={styles.modalMetaItem}>
                  <Text style={[styles.modalMetaVal, { color: '#30d158' }]}>FREE</Text>
                  <Text style={styles.modalMetaLabel}>Price</Text>
                </View>
                <View style={styles.modalMetaDivider} />
                <View style={styles.modalMetaItem}>
                  <Text style={styles.modalMetaVal}>{selected.category}</Text>
                  <Text style={styles.modalMetaLabel}>Category</Text>
                </View>
              </View>
              <Text style={styles.modalDesc}>{selected.description}</Text>
              <TouchableOpacity onPress={() => download(selected.downloadUrl)} activeOpacity={0.85}>
                <LinearGradient colors={['#0a84ff', '#0055bb']} style={styles.modalDownload}>
                  <Text style={styles.modalDownloadTxt}>⬇  Download Free — Google Play</Text>
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.modalLegal}>
                Opens the official Google Play Store listing. All apps are 100% legal and free.
              </Text>
              <TouchableOpacity onPress={() => setSelected(null)} style={styles.modalClose}>
                <Text style={styles.modalCloseTxt}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root:              { ...StyleSheet.absoluteFillObject },
  searchRow:         { paddingHorizontal: 16, marginBottom: 12 },
  searchBox:         { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchIcon:        { fontSize: 15, marginRight: 8 },
  searchInput:       { flex: 1, color: '#fff', fontSize: 15 },
  sectionTitle:      { fontSize: 20, fontWeight: '700', color: '#fff', paddingHorizontal: 16, marginBottom: 10, marginTop: 4 },
  featuredScroll:    { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  featuredCard:      { width: W * 0.6, height: 170, borderRadius: 20, overflow: 'hidden', padding: 18, justifyContent: 'flex-end', elevation: 10 },
  featuredIcon:      { fontSize: 42, marginBottom: 6 },
  featuredName:      { fontSize: 18, fontWeight: '700', color: '#fff' },
  featuredDev:       { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 10 },
  featuredGetBtn:    { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start' },
  featuredGetTxt:    { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  catScroll:         { paddingHorizontal: 16, gap: 8, paddingVertical: 10 },
  catChip:           { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  catChipActive:     { backgroundColor: 'rgba(10,132,255,0.2)', borderColor: 'rgba(10,132,255,0.4)' },
  catTxt:            { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
  catTxtActive:      { color: '#0a84ff' },
  appList:           { paddingHorizontal: 16, gap: 2 },
  appRow:            { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  appRowIcon:        { width: 58, height: 58, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  appRowEmoji:       { fontSize: 28, color: '#fff' },
  appRowName:        { fontSize: 15, fontWeight: '600', color: '#fff' },
  appRowDev:         { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 1 },
  appRowRating:      { color: '#ffd60a', fontSize: 11 },
  appRowRatingNum:   { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
  appRowDot:         { color: 'rgba(255,255,255,0.2)', fontSize: 11 },
  appRowSize:        { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
  getBtn:            {},
  getBtnInner:       { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  getBtnTxt:         { color: '#fff', fontSize: 13, fontWeight: '700' },
  homeBar:           { width: 120, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 8 },
  // Modal
  modalBg:           { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalSheet:        { backgroundColor: '#0d0d1a', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 36, alignItems: 'center', borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalHandle:       { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)', marginBottom: 20 },
  modalIcon:         { width: 90, height: 90, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  modalIconEmoji:    { fontSize: 44 },
  modalName:         { fontSize: 24, fontWeight: '700', color: '#fff', textAlign: 'center' },
  modalDev:          { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 4, marginBottom: 16 },
  modalMeta:         { flexDirection: 'row', gap: 0, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', marginBottom: 16, width: '100%' },
  modalMetaItem:     { flex: 1, alignItems: 'center', paddingVertical: 12 },
  modalMetaVal:      { fontSize: 14, fontWeight: '700', color: '#fff' },
  modalMetaLabel:    { fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 3 },
  modalMetaDivider:  { width: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 10 },
  modalDesc:         { fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 21, textAlign: 'center', marginBottom: 20 },
  modalDownload:     { paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, width: W - 48, alignItems: 'center', marginBottom: 10 },
  modalDownloadTxt:  { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalLegal:        { fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginBottom: 14 },
  modalClose:        { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40 },
  modalCloseTxt:     { color: 'rgba(255,255,255,0.5)', fontSize: 15 },
});
