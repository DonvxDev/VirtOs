# Virt KI — 100% Kostenlos, kein API-Key

Der KI-Assistent von Virt OS. Basiert auf **Pollinations AI** —
vollständig kostenlos, kein Account, kein API-Key, keine Kreditkarte.

## Verfügbare Agents

| Agent | Modell | Beschreibung |
|-------|--------|-------------|
| Virt | `openai` | GPT-4o Mini · Standard |
| Virt Pro | `openai-large` | GPT-4o · Leistungsstark |
| Virt Think | `deepseek-reasoner` | DeepSeek R1 · Denkt tief nach |
| Virt Fast | `mistral` | Mistral 7B · Superschnell |
| Virt Llama | `llama` | Llama 3 · Open Source |
| Virt Search | `searchgpt` | SearchGPT · Mit Websuche |

## Verwendung (JavaScript/Android)

```javascript
const VirtKI = require('./virt_ki_android');

// Standard Agent (GPT-4o Mini)
const ki = new VirtKI('openai');

// Chat mit Streaming
await ki.chat('Was ist Virt OS?', (chunk) => {
  process.stdout.write(chunk);
});

// Agent wechseln
ki.setModel('mistral');

// Alle verfügbaren Agents
console.log(VirtKI.getAgents());
```

## API-Endpoint (Pollinations AI)

```
POST https://text.pollinations.ai/
Content-Type: application/json

{
  "messages": [{ "role": "user", "content": "Deine Frage" }],
  "model": "openai",
  "stream": true
}
```

**Kein API-Key nötig. Komplett kostenlos. Kein Account erforderlich.**

## Desktop-Nutzung (virt.py)

```bash
python virt.py                       # Interaktiver Chat
python virt.py "Erkläre KI"          # One-Shot
python virt.py --model mistral "..."  # Mit bestimmtem Modell
```
