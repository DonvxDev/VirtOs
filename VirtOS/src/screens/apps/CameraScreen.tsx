import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
import VirtStatusBar from '../../components/StatusBar';

export default function CameraScreen({ onClose }: { onClose: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [zoom, setZoom] = useState(0);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const flashAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef<CameraView>(null);
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    if (!permission?.granted) requestPermission();
    if (!mediaPermission?.granted) requestMediaPermission();
  }, []);

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Flash overlay
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.92 });
      if (photo) {
        setLastPhoto(photo.uri);
        if (mediaPermission?.granted) await MediaLibrary.saveToLibraryAsync(photo.uri);
      }
    } catch {}
  };

  if (!permission) return <View style={styles.root} />;
  if (!permission.granted) {
    return (
      <View style={[styles.root, styles.permBox]}>
        <Text style={styles.permIcon}>📷</Text>
        <Text style={styles.permTxt}>Kamera-Zugriff benötigt</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permBtn}>
          <Text style={styles.permBtnTxt}>Zugriff erlauben</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={[styles.permBtn, { backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 8 }]}>
          <Text style={[styles.permBtnTxt, { color: 'rgba(255,255,255,0.6)' }]}>Zurück</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.root, { opacity: fadeIn }]}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        zoom={zoom}
        flash={flash}
      />

      {/* Flash overlay */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: '#fff', opacity: flashAnim }]} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onClose} style={styles.topBtn}>
          <Text style={styles.topBtnTxt}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.modeLabel}>{mode === 'photo' ? 'FOTO' : 'VIDEO'}</Text>
        <TouchableOpacity onPress={() => setFlash(f => f === 'off' ? 'on' : 'off')} style={styles.topBtn}>
          <Text style={styles.topBtnTxt}>{flash === 'off' ? '⚡' : '🔦'}</Text>
        </TouchableOpacity>
      </View>

      {/* Grid lines */}
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        <View style={[styles.gridLine, styles.gridV, { left: '33%' }]} />
        <View style={[styles.gridLine, styles.gridV, { left: '66%' }]} />
        <View style={[styles.gridLine, styles.gridH, { top: '33%' }]} />
        <View style={[styles.gridLine, styles.gridH, { top: '66%' }]} />
      </View>

      {/* Zoom */}
      <View style={styles.zoomRow}>
        {[0, 0.25, 0.5].map((z, i) => (
          <TouchableOpacity key={i} onPress={() => setZoom(z)} style={[styles.zoomBtn, zoom === z && styles.zoomBtnActive]}>
            <Text style={[styles.zoomTxt, zoom === z && { color: '#000' }]}>{['1×', '2×', '3×'][i]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mode selector */}
      <View style={styles.modeRow}>
        {(['photo', 'video'] as const).map(md => (
          <TouchableOpacity key={md} onPress={() => setMode(md)}>
            <Text style={[styles.modeTxt, mode === md && { color: '#ff9f0a' }]}>
              {md === 'photo' ? 'FOTO' : 'VIDEO'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        {/* Thumbnail */}
        <View style={[styles.thumb, lastPhoto ? { borderColor: '#fff' } : {}]}>
          {lastPhoto && <Text style={{ fontSize: 20 }}>🖼</Text>}
        </View>

        {/* Shutter */}
        <TouchableOpacity onPress={takePhoto} activeOpacity={0.85} style={styles.shutterOuter}>
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        {/* Flip */}
        <TouchableOpacity onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')} style={styles.flipBtn}>
          <Text style={{ fontSize: 26, color: '#fff' }}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.homeBar} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
  permBox: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  permIcon: { fontSize: 56 },
  permTxt: { color: 'rgba(255,255,255,0.7)', fontSize: 16, textAlign: 'center' },
  permBtn: { backgroundColor: '#0a84ff', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
  permBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '600' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 48, paddingHorizontal: 20, paddingBottom: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  topBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  topBtnTxt: { color: '#fff', fontSize: 18 },
  modeLabel: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.12)' },
  gridV: { width: 1, top: 0, bottom: 0 },
  gridH: { height: 1, left: 0, right: 0 },
  zoomRow: { position: 'absolute', bottom: 190, alignSelf: 'center', flexDirection: 'row', gap: 10 },
  zoomBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)' },
  zoomBtnActive: { backgroundColor: '#fff' },
  zoomTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  modeRow: { position: 'absolute', bottom: 148, alignSelf: 'center', flexDirection: 'row', gap: 28 },
  modeTxt: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  bottomBar: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 32 },
  thumb: { width: 54, height: 54, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  shutterOuter: { width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#fff' },
  flipBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  homeBar: { position: 'absolute', bottom: 8, alignSelf: 'center', width: 120, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
});
