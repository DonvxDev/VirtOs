import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Text, Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const { width, height } = Dimensions.get('window');

export default function BootScreen({ onDone }: { onDone: () => void }) {
  const fade = useRef(new Animated.Value(1)).current;
  const prog = useRef(new Animated.Value(0)).current;
  const [ready, setReady] = useState(false);

  const player = useVideoPlayer(require('../assets/bootanimation.mp4'), p => {
    p.loop = false; p.muted = true;
  });

  useEffect(() => {
    player.play();
    setTimeout(() => setReady(true), 400);
    Animated.timing(prog, { toValue: 1, duration: 4200, useNativeDriver: false }).start();

    const sub = player.addListener('playingChange', (playing: boolean) => {
      if (!playing && player.currentTime > 0.5) fadeOut();
    });
    const fallback = setTimeout(fadeOut, 6500);
    return () => { sub.remove(); clearTimeout(fallback); };
  }, []);

  const fadeOut = () => {
    Animated.timing(fade, { toValue: 0, duration: 700, useNativeDriver: true }).start(() => onDone());
  };

  const barWidth = prog.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Animated.View style={[styles.root, { opacity: fade }]}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />
      {ready && (
        <View style={styles.footer}>
          <View style={styles.track}>
            <Animated.View style={[styles.bar, { width: barWidth }]} />
          </View>
          <Text style={styles.label}>VIRT OS</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  video: { position: 'absolute', width, height },
  footer: { position: 'absolute', bottom: 64, alignItems: 'center', gap: 10 },
  track: { width: 48, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 2, backgroundColor: '#fff' },
  label: { color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 3, fontWeight: '500' },
});
