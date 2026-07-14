# Yuki AI — Otonom TikTok Streamer Sistemi

> **Dikkat:** Bu proje TikTok Topluluk Kuralları'nın otomatize yayınlarla ilgili maddelerine aykırı olabilir. Hesap banı riski taşıdığını bilerek kullanın. Tüm gerçekçilik iddialarına rağmen, tamamen otonom 7/24 AI yayını TikTok için sorunludur — **Yarı Otonom (Kontrollü)** mod önerilir.

---

## 📋 İçindekiler

1. [Sistem Mimarisi](#-sistem-mimarisi)
2. [Sıfır Bütçe Yol Haritası](#-sıfır-bütçe-yol-haritası)
3. [Kurulum — Web Panel](#-kurulum--web-panel-nextjs)
4. [Kurulum — Python Backend](#-kurulum--python-backend)
5. [Kurulum — OBS Studio](#-kurulum--obs-studio)
6. [Kurulum — TikTok Live](#-kurulum--tiktok-live)
7. [Çalıştırma](#-çalıştırma)
8. [Riskler ve Yasal Uyarılar](#-riskler-ve-yasal-uyarılar)
9. [Sorun Giderme](#-sorun-giderme)

---

## 🏗 Sistem Mimarisi

```
┌────────────────────────────────────────────────────────────┐
│                      Tarayıcı (Sen)                         │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     Next.js Dashboard (port 3000 / Caddy 81)         │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐ ┌──────┐  │  │
│  │  │Genel   │ │Sohbet  │ │AI Ctrl │ │Hediye│ │Ayar  │  │  │
│  │  │Bakış   │ │Monitör │ │+ Stop  │ │Takip │ │lar   │  │  │
│  │  └────────┘ └────────┘ └────────┘ └──────┘ └──────┘  │  │
│  └─────────────────────┬────────────────────────────────┘  │
│                        │                                    │
│                        ▼                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Bridge Mini-Service (port 3003) — socket.io          │  │
│  │  • TikTok olaylarını simüle/relay eder                │  │
│  │  • AI cevap üretir (simülasyon modu)                  │  │
│  │  • Onay/red mekanizması                               │  │
│  │  • Yasaklı kullanıcı/ kelime filtresi                 │  │
│  └─────────────────────┬────────────────────────────────┘  │
│                        │                                    │
└────────────────────────┼───────────────────────────────────┘
                         │
                         ▼ (gerçek modda)
┌────────────────────────────────────────────────────────────┐
│                  Python Backend (main.py)                   │
│                                                            │
│  ┌──────────────┐  ┌──────────┐  ┌───────┐  ┌──────────┐   │
│  │TikTok Listener│→│ AI Brain │→│  TTS  │→│  OBS     │   │
│  │(TikTokLive)  │  │(Gemini)  │  │(11Lab)│  │(Websocket│   │
│  └──────────────┘  └──────────┘  └───────┘  └──────────┘   │
│                                                            │
│  → TikTok yorum/hediye olayları                            │
│  → LLM ile karaktere uygun cevap üretimi                   │
│  → ElevenLabs ile Türkçe ses                               │
│  → OBS Studio'da avatar + ses çalma                        │
│  → OBS RTMP ile TikTok'a yayın                             │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
                  TikTok Canlı Yayın
                  (hediye = para)
```

### Bileşenler

| Bileşen | Teknoloji | Bütçe | Açıklama |
|---|---|---|---|
| Web Panel | Next.js 16 + shadcn/ui | $0 | Yönetim/izleme arayüzü |
| Bridge Service | Bun + socket.io | $0 | Real-time event hub |
| Database | SQLite + Prisma | $0 | Chat, hediye, ayar logları |
| AI Brain | Google Gemini 1.5 Flash | $0 (free tier) | Sohbet cevapları |
| TTS | ElevenLabs | $0 (10k char/ay) | Türkçe seslendirme |
| TikTok Live | TikTokLive (Python) | $0 | Yorum/hediye dinleme |
| Streaming | OBS Studio + VTube Studio | $0 | Avatar + RTMP yayın |
| Avatar | Live2D Cubism Free | $0 | Anime karakteri |

---

## 💰 Sıfır Bütçe Yol Haritası

### Aşama 0 — Hazırlık (1-2 hafta)

1. **Karakter tasarımı**
   - Stable Diffusion (lokal, ücretsiz) ile karakter referans görselleri üret
   - Live2D Cubism Free ile avatar modelle (ya da ücretsiz VTuber model indir)
   - `persona.py` dosyasından kişiliği düzenle

2. **TikTok hesabı**
   - Yeni hesap aç
   - İlk 1000 takipçiyi **organik kısa videolarla** topla (AI avatar ile Harry Potter tarzı seslendirme, anime sahneleri, vb.)
   - **1000 takipçi olmadan Live yetkisi alınamaz** — bu şart

3. **API anahtarları**
   - Google Gemini: https://aistudio.google.com/apikey (ücretsiz, kredi kartı gerekmez)
   - ElevenLabs: https://elevenlabs.io (ücretsiz tier 10k karakter/ay, yeterli değilse kendi sesini klonla)
   - TikTok session ID: Tarayıcı developer tools'tan al

### Aşama 1 — İlk Yayın (2-3 hafta)

1. Web paneli + bridge + Python backend'i çalıştır
2. OBS'te Yuki karakterini TikTok RTMP ile yayına al
3. **Yarı Otonom modda** başla: her AI cevabını manuel onayla
4. Banlanma riskini ölç (ilk hafta dikkatli ol)

### Aşama 2 — Optimizasyon (1-2 ay)

1. Filtre listesini tunedüş (spam, küfür, rakip kanallar)
2. Karakter kişiliğini izleyici geri bildirimine göre iyileştir
3. Hediye toplama stratejisi: belirli hediye türlerine özel reaksiyonlar
4. **Tam Otonom moduna geçme — riskli**

### Aşama 3 — Ölçekleme (uzun vadeli)

1. Bir VPS kiralayıp backend'i oraya taşı (aylık $5-10 — artık sıfır bütçe değil)
2. Çoklu hesap / birden fazla karakter
3. Premium ElevenLabs tier'a geç

---

## 🚀 Kurulum — Web Panel (Next.js)

### Gereksinimler

- Node.js 18+ veya Bun
- İnternet bağlantısı

### Adımlar

```bash
# 1. Projeyi indir (zaten elinde varsa atla)
# Bu proje Next.js 16 + TypeScript + Tailwind + shadcn/ui içerir

# 2. Bağımlılıkları yükle
cd /home/z/my-project
bun install

# 3. Bridge service'i başlat (ayrı terminal)
cd mini-services/tiktok-bridge
bun install
bun run dev
# → [TikTok Bridge] WebSocket server running on port 3003

# 4. Next.js dev server'ı başlat (ayrı terminal)
cd /home/z/my-project
bun run dev
# → Ready on http://localhost:3000

# 5. Tarayıcıdan aç
# → http://localhost:81 (Caddy gateway üzerinden)
```

Web panel açıldığında:
- Sol üstte "Yuki" karakter kartı
- Sağ üstte "Yayını Başlat" ve "Acil Stop" butonları
- Sol navigasyonda 5 sekme: Genel Bakış, Canlı Sohbet, AI Kontrol, Hediyeler, Ayarlar

---

## 🐍 Kurulum — Python Backend

### Gereksinimler

- Python 3.10+
- pip veya uv

### Adımlar

```bash
# 1. Python backend klasörüne git
cd /home/z/my-project/download/yuki-backend

# 2. Sanal ortam oluştur
python -m venv venv
source venv/bin/activate  # Linux/Mac
# veya: venv\Scripts\activate  # Windows

# 3. Bağımlılıkları yükle
pip install -r requirements.txt

# 4. .env dosyasını hazırla
cp .env.example .env
# .env dosyasını edit ile aç ve gerçek API anahtarlarını gir

# 5. Backend'i çalıştır
python main.py
```

Backend başarıyla başladığında şöyle bir çıktı görürsün:
```
============================================================
  Yuki AI — Backend Başlatılıyor
============================================================
[Bridge] bağlandı: http://localhost:3003
✓ Tüm bileşenler hazır
  - AI Brain: ✓
  - TTS: ✓
  - OBS: ✓
  - TikTok: ✓
============================================================
```

Eğer bazı bileşenler "✗ (pasif)" görünüyorsa, ilgili API anahtarı eksik demektir. Backend yine de çalışır, sadece o özellik aktif olmaz.

---

## 🎥 Kurulum — OBS Studio

### Gereksinimler

- OBS Studio 30+
- VTube Studio (ücretsiz)
- Live2D avatar (Cubism Free ile modelle ya da indir)

### Adımlar

1. **OBS Studio'yu yükle**
   - https://obsproject.com/

2. **VTube Studio'yu yükle**
   - Steam'den ücretsiz: https://store.steampowered.com/app/1486800/VTube_Studio/

3. **Live2D avatar yükle**
   - VTube Studio'ya .model3.json dosyasını import et
   - Avatarı ekrana yerleştir

4. **OBS sahnesini kur**
   - Yeni sahne: "Yuki Live"
   - "Game Capture" veya "Window Capture" ekle → VTube Studio'yu seç
   - "Media Source" ekle, ismini "YukiVoice" yap (Python TTS çıktısı için)
   - "Color Source" ile arka plan

5. **OBS WebSocket'i etkinleştir**
   - OBS > Tools > WebSocket Server Settings
   - "Enable WebSocket server" işaretle
   - Port: 4455 (varsayılan)
   - Password belirle → `.env` dosyasına yaz

6. **TikTok RTMP ayarı**
   - TikTok Live Studio'yu aç ya da TikTok Creator'dan RTMP bilgilerini al
   - OBS > Settings > Stream
   - Server: TikTok'un verdiği RTMP URL
   - Stream Key: TikTok'un verdiği key

---

## 🎵 Kurulum — TikTok Live

### TikTokLive Library

Python backend TikTokLive kütüphanesi ile TikTok canlı yayınını dinler. Bu kütüphane resmi değil, reverse-engineering ile çalışır — TikTok değişiklik yaparsa bozulabilir.

### Session ID Alma

1. Tarayıcıda TikTok'a giriş yap (yayın yapacağın hesapla)
2. Developer Tools aç (F12)
3. **Application** > **Cookies** > `https://www.tiktok.com`
4. `sessionid` cookie'sini bul ve değerini kopyala
5. `.env` dosyasına yapıştır:
   ```
   TIKTOK_SESSION_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TIKTOK_USERNAME=yuki_ai
   ```

### Live Yetkisi

TikTok'ta Live açmak için:
- 18 yaşında olmalısın
- En az **1000 takipçi**
- Hesap en az 30 gün yaşında

Yeni açılan hesap Live yetkisi alamaz. Önce organik içerikle takipçi topla.

---

## ▶️ Çalıştırma

Tüm sistem çalışırken **3 terminal** açık olmalı:

```bash
# Terminal 1 — Bridge service
cd /home/z/my-project/mini-services/tiktok-bridge
bun run dev

# Terminal 2 — Next.js panel
cd /home/z/my-project
bun run dev

# Terminal 3 — Python backend
cd /home/z/my-project/download/yuki-backend
source venv/bin/activate
python main.py
```

Ayrıca:
- OBS Studio açık ve "Yuki Live" sahnesi seçili
- VTube Studio açık ve avatar aktif
- TikTok hesabı Live yetkisi olan bir hesap

### Çalışma Akışı

1. Web paneli aç (`http://localhost:81`)
2. **AI Kontrol** sekmesinden otonomi modunu seç (önce "Manuel" ile başla)
3. **Ayarlar > TikTok Bağlantısı**'ndan hesap adını doğrula
4. **Yayını Başlat**'a bas
5. OBS otomatik TikTok'a yayın başlatır
6. TikTok yorumları panelde görünmeye başlar
7. AI her yoruma cevap üretir:
   - **Manuel modda**: Sen "Onayla"/"Reddet" basana kadar bekler
   - **Yarı Otonom modda**: Otomatik cevaplar ama yasaklı içerik filtrelenir, acil stop aktif
   - **Tam Otonom modda**: 7/24 kendisi cevaplar (RİSKLİ)

---

## ⚠️ Riskler ve Yasal Uyarılar

### TikTok ToS İhlalleri

TikTok'un [Topluluk Kuralları](https://www.tiktok.com/community-guidelines?lang=tr) net olarak şunları yasaklar:

- **Sahte etkileşim**: Bot/otomatize edilmiş yorum, beğeni, izlenme
- **Yanıltıcı içerik**: AI olduğunu gizleyerek gerçek kişi gibi davranmak
- **Spam**: Tekrarlanan, alakasız içerik

**Bu projenin riskleri:**

| Risk | Olasılık | Sonuç |
|---|---|---|
| Hesap banı (tam otonom) | YÜKSEK | Kalıcı kapanma |
| Live yetkisi kaybı | ORTA | Yayın yapamama |
| Hediye geliri iadesi | DÜŞÜK | Para iadesi zorunluluğu |
| Yasal işlem (yanıltıcı içerik) | DÜŞÜK | Çok nadir |

### Azaltma Stratejileri

1. **AI olduğunu ifşa et** — Bio'da "AI VTuber" yaz, her yayında başlangıçta söyle
2. **Yarı Otonom modda kal** — Tam otonom 7/24 en yüksek risk
3. **İlk hafta 2-4 saatten fazla yayın yapma** — TikTok algoritması şüphelenir
4. **Acil Stop butonunu erişilebilir tut** — Olumsuz bir durumda anında kapat
5. **Birden fazla hesap kullanma** — Hesaplar arası bağ kurulursa hepsi banlanır

### Etik Uyarılar

- İnsanları AI olduğunu gizleyerek kandırmak etik değildir
- Çocuk koruması: AI karakteri "17 yaşında" bile olsa, gerçek bir izleyici çocuk olabilir — bu durumda flörtöz içerik sorunlu
- Hediye dilenmek TikTok kurallarına aykırı — AI karakterin "hediye gönder" demesi ban sebebi

---

## 🔧 Sorun Giderme

### Web panel açılıyor ama veri gelmiyor

**Sorun:** Bridge service çalışmıyor olabilir.

**Çözüm:**
```bash
# Bridge log'unu kontrol et
tail -f /home/z/my-project/mini-services/tiktok-bridge/bridge.log

# Bridge portunu kontrol et
curl http://localhost:3003
# HTTP 400 dönmesi normal (WebSocket bekler)
```

### Python backend bağlanamıyor

**Sorun:** "Bridge'e bağlanılamadı" hatası.

**Çözüm:**
1. Bridge service çalışıyor mu? (`bun run dev` çalışıyor olmalı)
2. `.env` dosyasındaki `BRIDGE_URL` doğru mu? (`http://localhost:3003`)
3. Firewall engellemiyor mu?

### TTS çalışmıyor

**Sorun:** AI cevap üretiyor ama ses çıkmıyor.

**Çözüm:**
1. ElevenLabs API key doğru mu?
2. Voice ID geçerli mi? (ElevenLabs panelinden al)
3. Ücretsiz tier limitini aştın mı? (10k karakter/ay)
4. OBS'te "YukiVoice" Media Source var mı?

### OBS bağlanmıyor

**Sorun:** "OBS bağlantı hatası"

**Çözüm:**
1. OBS açık mı?
2. WebSocket Server etkin mi? (Tools > WebSocket Server Settings)
3. Port 4455 ve password doğru mu?
4. obsws-python yüklü mü? (`pip install obsws-python`)

### TikTok bağlanmıyor

**Sorun:** TikTokLive hata veriyor.

**Çözüm:**
1. Session ID yenilenmiş olabilir — tekrar al
2. Hesap Live yayını yapıyor olmalı (yayın kapalıyken dinlenemez)
3. TikTokLive library sürümünü kontrol et: `pip show TikTokLive`
4. TikTok bazen IP bazlı rate limit uygular — VPN deneyebilirsin

### Avatar animasyonu senkron değil

**Sorun:** Dudak hareketleri sese uymuyor.

**Çözüm:**
1. VTube Studio'da "Lip Sync" ayarını mikrofon girişinden → system audio'ya değiştir
2. OBS'te "Audio Input Capture" ekleyip sistem sesini yakala
3. VTube Studio'ya bu kaynağı feed et

---

## 📁 Proje Yapısı

```
/home/z/my-project/
├── src/                          # Next.js frontend
│   ├── app/
│   │   ├── page.tsx             # Ana dashboard (5 sekme)
│   │   ├── layout.tsx           # Root layout (dark tema)
│   │   └── globals.css          # Tailwind + custom CSS
│   ├── components/
│   │   └── dashboard/
│   │       ├── header.tsx       # Üst bar (live status, stop)
│   │       ├── sidebar.tsx      # Sol navigasyon
│   │       └── sections/
│   │           ├── dashboard-section.tsx
│   │           ├── chat-section.tsx
│   │           ├── control-section.tsx
│   │           ├── gifts-section.tsx
│   │           └── settings-section.tsx
│   └── lib/
│       └── bridge.ts            # Socket.IO client + Zustand store
├── mini-services/
│   └── tiktok-bridge/           # WebSocket bridge service (port 3003)
│       └── index.ts
├── prisma/
│   └── schema.prisma            # Database schema
└── download/
    └── yuki-backend/            # Python backend (ayrı çalışır)
        ├── main.py              # Entry point
        ├── ai_brain.py          # Gemini LLM
        ├── tts_engine.py        # ElevenLabs TTS
        ├── obs_controller.py    # OBS WebSocket
        ├── tiktok_listener.py   # TikTok Live
        ├── bridge_client.py     # Next.js panel ile iletişim
        ├── persona.py           # Karakter kişiliği
        ├── .env.example
        ├── requirements.txt
        └── README.md            # Bu dosya
```

---

## 🎯 Sonraki Adımlar

Bu proje bir **başlangıç noktası**. Gerçek bir AI fenomeni yapmak için:

1. **Avatar kalitesini artır** — profesyonel Live2D model ($50-200)
2. **Ses klonlama** — ElevenLabs yerine kendi sesini klonla (XTTS, ücretsiz)
3. **Multimodal AI** — kamera gösterdiğinde nesne tanıma (VLM)
4. **Hediye reaksiyonları** — belirli hediyelere özel animasyonlar
5. **Topluluk yönetimi** — VIP kullanıcılara özel karşılama
6. **Analitik** — en iyi yayın saatleri, en çok hediye veren saatler

Başarılar! 🌸
