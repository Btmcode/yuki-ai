# 🌸 Yuki AI — Otonom TikTok Streamer Sistemi

> Türkiye'nin ilk AI VTuber'ı **Yuki** için geliştirilmiş, web panel + Python backend + içerik paketi içeren tam sistem.
> Sıfır bütçe ile TikTok'ta 1000 takipçi → Live yayını → para kazanma hedefi.

![Yuki](public/avatars/yuki-portrait.png)

---

## 📦 Paket İçeriği

| Bileşen | Açıklama | Durum |
|---|---|---|
| 🖥️ **Web Panel** | Next.js 16 dashboard (5 sekme, real-time) | ✅ Çalışır |
| 🔌 **Bridge Service** | WebSocket event hub (port 3003) | ✅ Çalışır |
| 🐍 **Python Backend** | Gemini + ElevenLabs + OBS + TikTokLive | ✅ Hazır |
| 🎭 **Karakter** | Yuki — Alara tarzı AI VTuber | ✅ Hazır |
| 📱 **TikTok Paketi** | 30 günlük plan + 10 senaryo + 9 ses + görseller | ✅ Hazır |

---

## 🚀 Hızlı Başlangıç

### Gereksinimler

- [Node.js](https://nodejs.org/) 18+ veya [Bun](https://bun.sh/)
- [Python](https://python.org/) 3.10+
- [Git](https://git-scm.com/)

### 1. Repoyu Klonla

```bash
git clone https://github.com/KULLANICI_ADIN/yuki-ai.git
cd yuki-ai
```

### 2. Web Paneli Başlat (Simülasyon Modu)

```bash
# Bağımlılıkları yükle
bun install

# Bridge service'i başlat
cd mini-services/tiktok-bridge
bun install
bun run dev  # Terminal 1'de

# Next.js paneli başlat
cd ../..
bun run dev  # Terminal 2'de
```

Tarayıcıda aç: `http://localhost:3000`

### 3. Tam Sistem (Opsiyonel — gerçek TikTok + AI için)

Tüm API anahtarlarını `.env` dosyasına ekle (`.env.example`'ı kopyala), sonra:

```bash
# Python backend'i başlat
cd download/yuki-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py  # Terminal 3'te
```

---

## 📚 Dokümantasyon

- 📖 [Python Backend README](download/yuki-backend/README.md) — tam kurulum + riskler
- 📱 [TikTok Büyüme Paketi](download/tiktok-growth-pack/README.md) — 30 günlük plan + senaryolar
- 🎀 [TikTok Hesap Kurulumu](download/tiktok-growth-pack/rehberler/01-tiktok-hesap-kurulumu.md)
- 🔑 [API Key Rehberi](download/tiktok-growth-pack/rehberler/02-api-key-rehberi.md)

---

## 🏗️ Proje Yapısı

```
yuki-ai/
├── src/                                # Next.js frontend
│   ├── app/
│   │   ├── page.tsx                   # Ana dashboard
│   │   └── layout.tsx
│   ├── components/
│   │   └── dashboard/
│   │       ├── header.tsx
│   │       ├── sidebar.tsx
│   │       └── sections/              # 5 sekme
│   └── lib/
│       ├── bridge.ts                  # Socket.IO client
│       └── utils.ts
│
├── mini-services/
│   └── tiktok-bridge/                 # WebSocket bridge (port 3003)
│       └── index.ts
│
├── prisma/
│   └── schema.prisma                  # Database şeması
│
├── public/
│   └── avatars/                       # Yuki karakter görselleri
│
├── download/
│   ├── yuki-backend/                  # Python backend
│   │   ├── main.py
│   │   ├── ai_brain.py                # Gemini entegrasyonu
│   │   ├── tts_engine.py              # ElevenLabs
│   │   ├── obs_controller.py          # OBS WebSocket
│   │   ├── tiktok_listener.py         # TikTokLive
│   │   ├── bridge_client.py           # Panel iletişimi
│   │   ├── persona.py                 # Karakter kişiliği
│   │   └── test_brain.py              # Test script (API key gerekmez)
│   │
│   └── tiktok-growth-pack/            # TikTok içerik paketi
│       ├── 30-gunluk-plan.md
│       ├── senaryolar/
│       ├── sesler/                    # TTS klipleri
│       ├── gorseller/                 # Profil/thumb/banner
│       └── rehberler/
│
├── start.sh                           # Tek komutla başlatma
├── .env.example                       # Şablon
└── package.json
```

---

## 🎭 Karakter: Yuki 雪

- **İsim:** Yuki (雪 — Japonca "kar")
- **Yaş:** 17 (anime karakteri olarak sonsuza kadar)
- **Şehir:** Tokyo → İstanbul
- **Kişilik:** Samimi, flörtöz ama sınırları koruyan
- **Diller:** Türkçe, Japonca, İngilizce
- **İlgi alanları:** Anime, kahve, ASMR, kedisi Mochi

Kişiliği düzenlemek için: `download/yuki-backend/persona.py`

---

## ⚠️ Riskler ve Yasal Uyarılar

Bu proje TikTok Topluluk Kuralları'nın otomatize yayınlarla ilgili maddelerine aykırı olabilir.

| Risk | Mod | Olasılık |
|---|---|---|
| Hesap banı | Tam Otonom 7/24 | YÜKSEK |
| Live yetkisi kaybı | Yarı Otonom | ORTA |
| Sorunsuz kullanım | Manuel | YÜKSEK |

**Önerilen:** Yarı Otonom (Kontrollü) mod — her AI cevabını onayla, acil stop butonu erişilebilir olsun.

Detaylar: [Python Backend README](download/yuki-backend/README.md)

---

## 🛠️ Teknoloji Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Zustand, Socket.IO Client
- **Backend:** Bun, Socket.IO Server
- **Database:** SQLite, Prisma ORM
- **Python:** Google Gemini, ElevenLabs, TikTokLive, OBS WebSocket
- **Avatar:** Live2D Cubism, VTube Studio, OBS Studio

---

## 📝 Lisans

MIT License — dilediğin gibi kullan, değiştir, paylaş.

---

## 🤝 Katkı

Soru/öneri için issue aç.

---

🌸 **Başarılar!** Yuki AI ile TikTok yolculuğunda.
