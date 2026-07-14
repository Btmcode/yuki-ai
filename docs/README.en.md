# 🌸 Yuki AI — Autonomous TikTok Streamer System

> AI VTuber system developed for **Yuki**, Türkiye's first AI VTuber.
> Web panel + Python backend + content pack — built with zero budget to reach 1000 TikTok followers → Live streaming → monetization.

**Dil / Language:** [🇹🇷 Türkçe](../README.md) | [🇬🇧 English](README.en.md)

---

## 📦 What's Included

| Component | Description | Status |
|---|---|---|
| 🖥️ **Web Panel** | Next.js 16 dashboard (6 tabs, real-time) | ✅ Working |
| 🔌 **Bridge Service** | WebSocket event hub (port 3003) | ✅ Working |
| 🐍 **Python Backend** | Gemini LLM + Multi-provider TTS + OBS + TikTokLive | ✅ Ready |
| 🎭 **Character** | Yuki — Alara-style Turkish AI VTuber | ✅ Ready |
| 🧠 **Memory System** | Yuki remembers viewers, gifts, topics | ✅ Working |
| 📱 **TikTok Growth Pack** | 30-day plan + 10 scripts + 9 audio + images | ✅ Ready |

---

## 🚀 Quick Start

### Requirements

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- [Python](https://python.org/) 3.10+
- [Git](https://git-scm.com/)

### 1. Clone the Repo

```bash
git clone https://github.com/Btmcode/yuki-ai.git
cd yuki-ai
```

### 2. Start Web Panel (Simulation Mode)

```bash
# Install dependencies
bun install

# Start bridge service
cd mini-services/tiktok-bridge
bun install
bun run dev  # Terminal 1

# Start Next.js panel
cd ../..
bun run dev  # Terminal 2
```

Open: `http://localhost:3000`

### 3. Full System (Optional — for real TikTok + AI)

Add all API keys to `.env` (copy `.env.example`), then:

```bash
# Start Python backend
cd download/yuki-ai-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py  # Terminal 3
```

Or use the launcher script:

```bash
./start.sh           # Web panel + bridge (simulation)
./start.sh --full    # Full system with Python backend
./start.sh --stop    # Stop all
./start.sh --status  # Check status
```

---

## 📚 Documentation

- 📖 [Python Backend README](../download/yuki-backend/README.md) — full setup + risks
- 📱 [TikTok Growth Pack](../download/tiktok-growth-pack/README.md) — 30-day plan + scripts
- 🎀 [TikTok Account Setup](../download/tiktok-growth-pack/rehberler/01-tiktok-hesap-kurulumu.md)
- 🔑 [API Key Guide](../download/tiktok-growth-pack/rehberler/02-api-key-rehberi.md)

---

## 🏗️ Project Structure

```
yuki-ai/
├── src/                                # Next.js frontend
│   ├── app/
│   │   ├── page.tsx                   # Main dashboard
│   │   └── layout.tsx
│   ├── components/
│   │   └── dashboard/
│   │       ├── header.tsx
│   │       ├── sidebar.tsx
│   │       └── sections/              # 6 tabs
│   └── lib/
│       ├── bridge.ts                  # Socket.IO client + state
│       └── utils.ts
│
├── mini-services/
│   └── tiktok-bridge/                 # WebSocket bridge (port 3003)
│       └── index.ts
│
├── prisma/
│   └── schema.prisma                  # Database schema
│
├── public/
│   └── avatars/                       # Yuki character images
│
├── download/
│   ├── yuki-backend/                  # Python backend
│   │   ├── main.py
│   │   ├── ai_brain.py                # Gemini LLM (memory-aware)
│   │   ├── tts_engine.py              # Multi-provider TTS (Gemini → ElevenLabs → gTTS)
│   │   ├── obs_controller.py          # OBS WebSocket
│   │   ├── tiktok_listener.py         # TikTokLive
│   │   ├── bridge_client.py           # Panel communication
│   │   ├── persona.py                 # Character personality
│   │   ├── memory_store.py            # Persistent user memory
│   │   └── test_brain.py              # Test script (no API key needed)
│   │
│   └── tiktok-growth-pack/            # TikTok content pack
│       ├── 30-gunluk-plan.md
│       ├── senaryolar/
│       ├── sesler/                    # TTS clips
│       ├── gorseller/                 # Profile/thumb/banner
│       └── rehberler/
│
└── start.sh                           # Single-command launcher
```

---

## 🧠 Memory System

Yuki remembers viewers across sessions:

- **New viewer** → warm welcome
- **Returning (1-2 days)** → "You're back, I'm happy!"
- **Loyal (3+ days)** → "X days in a row, you're a true fan!"
- **Yesterday's gift** → "Yesterday you sent a Lion, still grateful!"
- **Topic recall** → "We talked about anime yesterday, still on my mind"

Memory persists in `memory.json` — survives restarts.

---

## 🎭 Character: Yuki 雪

- **Name:** Yuki (雪 — "snow" in Japanese)
- **Age:** 17 (anime character — forever)
- **City:** Tokyo → Istanbul
- **Personality:** Warm, flirty but respectful
- **Languages:** Turkish, Japanese, English
- **Interests:** Anime, coffee, ASMR, her cat Mochi

Customize in: `download/yuki-backend/persona.py`

---

## ⚠️ Risks & Legal Warnings

This project may violate TikTok's Community Guidelines regarding automated streams.

| Risk | Mode | Probability |
|---|---|---|
| Account ban | Full Autonomous 24/7 | HIGH |
| Live privilege loss | Semi-Autonomous | MEDIUM |
| Smooth operation | Manual | HIGH |

**Recommended:** Semi-Autonomous mode — approve each AI response, keep emergency stop accessible.

Details: [Python Backend README](../download/yuki-backend/README.md)

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Zustand, Socket.IO Client
- **Backend:** Bun, Socket.IO Server
- **Database:** SQLite, Prisma ORM
- **Python:** Google Gemini (LLM + TTS), ElevenLabs (optional), gTTS (fallback), TikTokLive, OBS WebSocket
- **Avatar:** Live2D Cubism, VTube Studio, OBS Studio

---

## 💖 Support / Donate

If this project helped you, consider supporting:

- ☕ [Buy Me a Coffee](https://www.buymeacoffee.com/yuki-ai) (example — replace with your own)
- 💖 GitHub Sponsors: [@Btmcode](https://github.com/sponsors/Btmcode)
- 📧 Contact: yuki.ai@example.com (replace with your email)

---

## 📝 License

MIT License — use, modify, share freely.

---

🌸 **Good luck!** With Yuki AI on your TikTok journey.
