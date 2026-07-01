import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Animated, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import AppHeader from '../../components/AppHeader';

// ──────────────────────────────────────────────────────────────
// 100% KOSTENLOSE AI — Pollinations AI (kein API-Key nötig)
// https://text.pollinations.ai
// ──────────────────────────────────────────────────────────────

interface Agent {
  id: string;
  name: string;
  model: string;
  description: string;
  icon: string;
  color: [string, string];
}

const AGENTS: Agent[] = [
  {
    id: 'virt',
    name: 'Virt',
    model: 'openai',
    description: 'Standard · GPT-4o Mini',
    icon: '✦',
    color: ['#0a84ff', '#0044aa'],
  },
  {
    id: 'virt-pro',
    name: 'Virt Pro',
    model: 'openai-large',
    description: 'Leistungsstark · GPT-4o',
    icon: '✦✦',
    color: ['#bf5af2', '#6a0dad'],
  },
  {
    id: 'virt-think',
    name: 'Virt Think',
    model: 'deepseek-reasoner',
    description: 'Denkt tief nach · DeepSeek R1',
    icon: '🧠',
    color: ['#30d158', '#0a5e1c'],
  },
  {
    id: 'virt-fast',
    name: 'Virt Fast',
    model: 'mistral',
    description: 'Superschnell · Mistral 7B',
    icon: '⚡',
    color: ['#ff9f0a', '#a05000'],
  },
  {
    id: 'virt-llama',
    name: 'Virt Llama',
    model: 'llama',
    description: 'Open Source · Llama 3',
    icon: '🦙',
    color: ['#ff453a', '#8b0000'],
  },
  {
    id: 'virt-search',
    name: 'Virt Search',
    model: 'searchgpt',
    description: 'Mit Websuche · SearchGPT',
    icon: '🔍',
    color: ['#5ac8fa', '#005588'],
  },
];

const SYSTEM_PROMPT =
  'Du bist Virt, der intelligente KI-Assistent von Virt OS. ' +
  'Antworte immer auf Deutsch, kurz und präzise. ' +
  'Du bist freundlich, hilfreich und kennst Virt OS in- und auswendig. ' +
  'Virt OS ist ein modernes Android-Betriebssystem mit Liquid Glass Design.';

interface Msg { role: 'user' | 'assistant'; content: string }

async function askVirt(
  messages: Msg[],
  model: string,
  onChunk: (t: string) => void,
): Promise<void> {
  const allMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
  ];

  try {
    // Pollinations AI — 100% free, no API key
    const resp = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: allMessages,
        model,
        stream: true,
        seed: Math.floor(Math.random() * 100000),
      }),
    });

    if (!resp.ok) {
      throw new Error(`Status ${resp.status}`);
    }

    const reader = resp.body?.getReader();
    if (!reader) throw new Error('Kein Stream');

    const dec = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += dec.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') return;
        try {
          const json = JSON.parse(data);
          const chunk = json.choices?.[0]?.delta?.content ?? '';
          if (chunk) onChunk(chunk);
        } catch {}
      }
    }
  } catch (err: any) {
    onChunk(
      `\n\n⚠ Fehler: ${err.message ?? 'Unbekannter Fehler'}\n` +
      'Stelle sicher, dass du mit dem Internet verbunden bist.',
    );
  }
}

const SUGGESTIONS = [
  'Was ist Virt OS?',
  'Erkläre mir KI in 3 Sätzen',
  'Schreib einen Witz',
  'Was kannst du alles?',
];

// ──────────────────────────────────────────────────────────────
export default function VirtAIScreen({ onClose }: { onClose: () => void }) {
  const [agent, setAgent] = useState<Agent>(AGENTS[0]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [showAgents, setShowAgents] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages]);

  const send = async (text = input.trim()) => {
    if (!text || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMsgs: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    const idx = newMsgs.length;
    setMessages(m => [...m, { role: 'assistant', content: '' }]);

    let full = '';
    await askVirt(newMsgs, agent.model, (chunk) => {
      full += chunk;
      setMessages(m => {
        const c = [...m];
        c[idx] = { role: 'assistant', content: full };
        return c;
      });
    });

    setLoading(false);
  };

  const toggleSpeak = (text: string) => {
    if (speaking) { Speech.stop(); setSpeaking(false); return; }
    setSpeaking(true);
    Speech.speak(text, {
      language: 'de-DE',
      onDone: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const switchAgent = (a: Agent) => {
    setAgent(a);
    setShowAgents(false);
    setMessages([]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <Animated.View style={[styles.root, { opacity: fadeIn }]}>
      <LinearGradient colors={['#040720', '#060d2e', '#04111a']} style={StyleSheet.absoluteFillObject} />
      <AppHeader title="Virt KI" onClose={onClose} />

      {/* Agent selector bar */}
      <TouchableOpacity onPress={() => setShowAgents(true)} style={styles.agentBar} activeOpacity={0.8}>
        <LinearGradient colors={agent.color} style={styles.agentBarAvatar}>
          <Text style={styles.agentBarIcon}>{agent.icon.charAt(0)}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={styles.agentBarName}>{agent.name}</Text>
          <Text style={styles.agentBarDesc}>{agent.description}</Text>
        </View>
        <View style={styles.agentBarChip}>
          <Text style={styles.agentBarChipTxt}>Wechseln ›</Text>
        </View>
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.msgContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <View style={styles.welcome}>
              <LinearGradient colors={agent.color} style={styles.welcomeAvatar}>
                <Text style={styles.welcomeIcon}>{agent.icon.charAt(0)}</Text>
              </LinearGradient>
              <Text style={styles.welcomeTitle}>Hallo, ich bin {agent.name}</Text>
              <Text style={styles.welcomeSub}>{agent.description} · 100% kostenlos</Text>
              <View style={styles.suggestions}>
                {SUGGESTIONS.map(s => (
                  <TouchableOpacity key={s} onPress={() => send(s)} style={styles.chip}>
                    <Text style={styles.chipTxt}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {messages.map((msg, i) => (
            <View key={i} style={[styles.msgRow, msg.role === 'user' && styles.msgRowUser]}>
              {msg.role === 'assistant' && (
                <LinearGradient colors={agent.color} style={styles.msgAvatar}>
                  <Text style={{ fontSize: 11, color: '#fff' }}>{agent.icon.charAt(0)}</Text>
                </LinearGradient>
              )}
              <TouchableOpacity
                onLongPress={() => msg.role === 'assistant' && msg.content && toggleSpeak(msg.content)}
                activeOpacity={0.85}
                style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}
              >
                {msg.content === '' && loading ? (
                  <View style={styles.typingRow}>
                    {[0, 1, 2].map(d => (
                      <Animated.View key={d} style={[styles.typingDot, { opacity: 0.35 + d * 0.2 }]} />
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.bubbleTxt, msg.role === 'user' && { color: '#fff' }]}>
                    {msg.content}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <View style={styles.inputBox}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={`Schreib ${agent.name}…`}
              placeholderTextColor="rgba(255,255,255,0.28)"
              style={styles.input}
              multiline
              returnKeyType="send"
              onSubmitEditing={() => send()}
            />
          </View>
          <TouchableOpacity
            onPress={() => send()}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
            style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.3 }]}
          >
            <LinearGradient colors={agent.color} style={styles.sendBtnInner}>
              <Text style={styles.sendBtnIcon}>↑</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <View style={styles.homeBar} />

      {/* Agent selection modal */}
      <Modal visible={showAgents} transparent animationType="slide" onRequestClose={() => setShowAgents(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>KI-Agent auswählen</Text>
            <Text style={styles.modalSub}>Alle Agents sind 100% kostenlos — kein Account nötig.</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
              {AGENTS.map(a => (
                <TouchableOpacity
                  key={a.id}
                  onPress={() => switchAgent(a)}
                  activeOpacity={0.8}
                  style={[styles.agentRow, agent.id === a.id && styles.agentRowActive]}
                >
                  <LinearGradient colors={a.color} style={styles.agentIcon}>
                    <Text style={styles.agentIconTxt}>{a.icon.charAt(0)}</Text>
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.agentName}>{a.name}</Text>
                      {a.id === 'virt' && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeTxt}>Standard</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.agentDesc}>{a.description}</Text>
                  </View>
                  {agent.id === a.id && <Text style={{ color: '#30d158', fontSize: 20 }}>✓</Text>}
                </TouchableOpacity>
              ))}
              <View style={{ height: 24 }} />
            </ScrollView>

            <TouchableOpacity onPress={() => setShowAgents(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseTxt}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject },
  agentBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 8, padding: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  agentBarAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  agentBarIcon: { fontSize: 16, color: '#fff', fontWeight: '700' },
  agentBarName: { fontSize: 14, fontWeight: '600', color: '#fff' },
  agentBarDesc: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 },
  agentBarChip: { backgroundColor: 'rgba(10,132,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(10,132,255,0.3)' },
  agentBarChipTxt: { color: '#0a84ff', fontSize: 12, fontWeight: '600' },
  messages: { flex: 1 },
  msgContent: { padding: 16, gap: 12, flexGrow: 1 },
  welcome: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingVertical: 32 },
  welcomeAvatar: { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center', elevation: 12 },
  welcomeIcon: { fontSize: 36, color: '#fff', fontWeight: '700' },
  welcomeTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  welcomeSub: { fontSize: 13, color: 'rgba(255,255,255,0.45)', textAlign: 'center' },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 4, paddingHorizontal: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  chipTxt: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRowUser: { flexDirection: 'row-reverse' },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bubble: { maxWidth: '76%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  bubbleUser: { backgroundColor: '#0a84ff', borderBottomRightRadius: 5 },
  bubbleAI: { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderBottomLeftRadius: 5 },
  bubbleTxt: { fontSize: 14, color: 'rgba(255,255,255,0.92)', lineHeight: 21 },
  typingRow: { flexDirection: 'row', gap: 5, paddingVertical: 2 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0a84ff' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingBottom: 12, paddingTop: 6 },
  inputBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 16, paddingVertical: 10 },
  input: { color: '#fff', fontSize: 15, maxHeight: 100 },
  sendBtn: {},
  sendBtnInner: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendBtnIcon: { color: '#fff', fontSize: 20, fontWeight: '700' },
  homeBar: { width: 120, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 8 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#0d0d1a', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, paddingBottom: 40, maxHeight: '85%',
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#fff', textAlign: 'center' },
  modalSub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 6, lineHeight: 18 },
  agentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14,
    borderRadius: 16, marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  agentRowActive: { borderColor: 'rgba(48,209,88,0.35)', backgroundColor: 'rgba(48,209,88,0.07)' },
  agentIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  agentIconTxt: { fontSize: 22, color: '#fff', fontWeight: '700' },
  agentName: { fontSize: 16, fontWeight: '600', color: '#fff' },
  agentDesc: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  defaultBadge: { backgroundColor: 'rgba(10,132,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  defaultBtnTxt: { color: '#0a84ff', fontSize: 10, fontWeight: '600' },
  defaultBadgeTxt: { color: '#0a84ff', fontSize: 10, fontWeight: '600' },
  modalClose: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  modalCloseTxt: { color: 'rgba(255,255,255,0.5)', fontSize: 15 },
});
