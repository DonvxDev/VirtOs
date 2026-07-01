/**
 * Virt KI — Android Client (100% KOSTENLOS)
 * Nutzt Pollinations AI — kein API-Key, kein Account, keine Kosten.
 * https://text.pollinations.ai
 *
 * Verfügbare Agents/Modelle:
 *   openai           → GPT-4o Mini (Standard)
 *   openai-large     → GPT-4o (leistungsstark)
 *   deepseek-reasoner→ DeepSeek R1 (Denk-KI)
 *   mistral          → Mistral 7B (schnell)
 *   llama            → Llama 3 (Open Source)
 *   searchgpt        → SearchGPT (mit Websuche)
 */

const ENDPOINT = 'https://text.pollinations.ai/';

const SYSTEM_PROMPT =
  'Du bist Virt, der intelligente KI-Assistent von Virt OS. ' +
  'Antworte immer auf Deutsch, kurz und präzise. ' +
  'Du bist freundlich, hilfreich und kennst Virt OS in- und auswendig.';

class VirtKI {
  /**
   * @param {string} model - Agent/Modell (z.B. 'openai', 'mistral', 'llama')
   */
  constructor(model = 'openai') {
    this.model = model;
    this.history = [];
  }

  /**
   * Sendet eine Nachricht und streamt die Antwort.
   * @param {string} userMessage
   * @param {(chunk: string) => void} onChunk
   * @returns {Promise<string>}
   */
  async chat(userMessage, onChunk = null) {
    this.history.push({ role: 'user', content: userMessage });

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...this.history,
    ];

    let full = '';
    try {
      const resp = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          model: this.model,
          stream: true,
          seed: Math.floor(Math.random() * 100000),
        }),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const reader = resp.body.getReader();
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
          if (data === '[DONE]') { this.history.push({ role: 'assistant', content: full }); return full; }
          try {
            const json = JSON.parse(data);
            const chunk = json.choices?.[0]?.delta?.content ?? '';
            if (chunk) { full += chunk; if (onChunk) onChunk(chunk); }
          } catch {}
        }
      }
    } catch (e) {
      const err = `\n[Fehler: ${e.message}]`;
      full += err;
      if (onChunk) onChunk(err);
    }

    this.history.push({ role: 'assistant', content: full });
    return full;
  }

  /** Setzt den aktiven Agent/Modell */
  setModel(model) { this.model = model; }

  /** Verlauf löschen */
  clearHistory() { this.history = []; }

  /** Verfügbare Agents */
  static getAgents() {
    return [
      { id: 'openai',            name: 'Virt',        desc: 'GPT-4o Mini · Standard' },
      { id: 'openai-large',      name: 'Virt Pro',     desc: 'GPT-4o · Leistungsstark' },
      { id: 'deepseek-reasoner', name: 'Virt Think',   desc: 'DeepSeek R1 · Denkt tief nach' },
      { id: 'mistral',           name: 'Virt Fast',    desc: 'Mistral 7B · Superschnell' },
      { id: 'llama',             name: 'Virt Llama',   desc: 'Llama 3 · Open Source' },
      { id: 'searchgpt',         name: 'Virt Search',  desc: 'SearchGPT · Mit Websuche' },
    ];
  }
}

module.exports = VirtKI;
