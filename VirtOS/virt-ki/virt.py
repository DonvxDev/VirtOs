#!/usr/bin/env python3
"""
Virt KI — Desktop CLI (100% kostenlos, kein API-Key)
Nutzt Pollinations AI: https://text.pollinations.ai

Verfügbare Modelle:
  openai            → GPT-4o Mini (Standard)
  openai-large      → GPT-4o
  deepseek-reasoner → DeepSeek R1
  mistral           → Mistral 7B
  llama             → Llama 3
  searchgpt         → SearchGPT (mit Websuche)
"""
from __future__ import annotations
import argparse, json, sys, urllib.request, urllib.error

ENDPOINT = "https://text.pollinations.ai/"
SYSTEM = (
    "Du bist Virt, der intelligente KI-Assistent von Virt OS. "
    "Antworte immer auf Deutsch, kurz und präzise. "
    "Du bist freundlich und hilfreich."
)


def stream_chat(messages: list[dict], model: str = "openai") -> None:
    payload = {
        "messages": [{"role": "system", "content": SYSTEM}, *messages],
        "model": model,
        "stream": True,
    }
    body = json.dumps(payload).encode()
    req = urllib.request.Request(
        ENDPOINT, data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            for raw in resp:
                line = raw.decode("utf-8", errors="replace").strip()
                if not line.startswith("data: "):
                    continue
                data = line[6:]
                if data == "[DONE]":
                    break
                try:
                    chunk = json.loads(data)["choices"][0]["delta"].get("content", "")
                    if chunk:
                        sys.stdout.write(chunk)
                        sys.stdout.flush()
                except Exception:
                    pass
        print()
    except urllib.error.HTTPError as e:
        print(f"\n[Fehler {e.code}]: {e.read().decode()}")
    except Exception as e:
        print(f"\n[Netzwerkfehler]: {e}")


AGENTS = {
    "1": ("openai",            "Virt        — GPT-4o Mini"),
    "2": ("openai-large",      "Virt Pro    — GPT-4o"),
    "3": ("deepseek-reasoner", "Virt Think  — DeepSeek R1"),
    "4": ("mistral",           "Virt Fast   — Mistral 7B"),
    "5": ("llama",             "Virt Llama  — Llama 3"),
    "6": ("searchgpt",         "Virt Search — SearchGPT"),
}


def choose_agent() -> str:
    print("\n╔══════════════════════════════════╗")
    print("║      Virt KI — Agent auswählen    ║")
    print("╚══════════════════════════════════╝")
    for k, (_, label) in AGENTS.items():
        print(f"  [{k}] {label}")
    print()
    choice = input("Agent (1-6, Enter = Standard): ").strip()
    return AGENTS.get(choice, AGENTS["1"])[0]


def interactive(model: str) -> None:
    print(f"\nVirt KI · Modell: {model} · /exit beendet · /agent wechselt\n")
    history: list[dict] = []
    while True:
        try:
            user = input("Du  › ").strip()
        except (EOFError, KeyboardInterrupt):
            print(); break
        if not user:
            continue
        if user in {"/exit", "/quit"}:
            break
        if user == "/clear":
            history.clear(); print("(Verlauf geleert)"); continue
        if user == "/agent":
            model = choose_agent(); print(f"Agent gewechselt zu: {model}"); continue
        history.append({"role": "user", "content": user})
        print("Virt › ", end="", flush=True)
        stream_chat(history, model)


def main() -> None:
    p = argparse.ArgumentParser(prog="virt", description="Virt KI · 100% kostenlos")
    p.add_argument("prompt", nargs="*", help="Direkte Frage")
    p.add_argument("--model", "-m", default="openai", help="Modell (openai/mistral/llama/...)")
    p.add_argument("--file", "-f", help="Datei an Anfrage anhängen")
    p.add_argument("--list", "-l", action="store_true", help="Alle Modelle anzeigen")
    args = p.parse_args()

    if args.list:
        print("Verfügbare Modelle:")
        for _, (m, label) in AGENTS.items():
            print(f"  {m:25} ({label})")
        return

    if not args.prompt and not args.file:
        model = args.model if args.model != "openai" else choose_agent()
        interactive(model)
        return

    text = " ".join(args.prompt)
    if args.file:
        try:
            text += "\n\n---\nDatei: " + args.file + "\n" + open(args.file, encoding="utf-8").read()
        except OSError as e:
            print(e); sys.exit(1)
    stream_chat([{"role": "user", "content": text}], args.model)


if __name__ == "__main__":
    main()
