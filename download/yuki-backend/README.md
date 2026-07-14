# Yuki AI — Otonom TikTok Streamer Sistemi

> **Dikkat:** Bu proje TikTok Topluluk Kuralları'nın otomatize yayınlarla ilgili maddelerine aykırı olabilir. Hesap banı riski taşıdığını bilerek kullanın. Tüm gerçekçilik iddialarına rağmen, tamamen otonom 7/24 AI yayını TikTok için sorunludur — **Yarı Otonom (Kontrollü)** mod önerilir.

---

## 📋 İçindekiler

1. [Sistem Mimarisi](#-sistem-mimarisi)
2. [Hızlı Başlangıç (5 Dakika)](#-hızlı-başlangıç-5-dakika)
3. [Sıfır Bütçe Yol Haritası](#-sıfır-bütçe-yol-haritası)
4. [Kurulum — Web Panel](#-kurulum--web-panel-nextjs)
5. [Kurulum — Python Backend](#-kurulum--python-backend)
6. [Kurulum — OBS Studio](#-kurulum--obs-studio)
7. [Kurulum — Live2D Avatar (VTube Studio)](#-kurulum--live2d-avatar-vtube-studio)
8. [Kurulum — TikTok Live](#-kurulum--tiktok-live)
9. [Çalıştırma](#-çalıştırma)
10. [Riskler ve Yasal Uyarılar](#-riskler-ve-yasal-uyarılar)
11. [Sorun Giderme](#-sorun-giderme)

---

## ⚡ Hızlı Başlangıç (5 Dakika)

Sadece web paneli ve simülasyon modunu denemek için:

```bash
# 1. Projeye git
cd /home/z/my-project

# 2. Tek komutla başlat
./start.sh
```

Bu komut:
- ✅ Bridge service'i başlatır (port 3003)
- ✅ Next.js panel'i başlatır (port 3000)
- ✅ Tarayıcıda açman için URL verir

**Aç:** `http://localhost:81` (Caddy gateway üzerinden)

Panelde:
1. Sağ üstteki **"Yayını Başlat"** butonuna bas
2. **"Canlı Sohbet"** sekmesine geç — sahte TikTok yorumları gelmeye başlar
3. AI her yoruma cevap üretir, **"Onayla"/"Reddet"** ile yönet
4. **"AI Kontrol"** sekmesinden otonomi modunu değiştir (Manuel/Yarı/Tam)

Gerçek TikTok + Gemini + ElevenLabs + OBS entegrasyonu için aşağıdaki tam kurulum adımlarını izle.

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

## 🎀 Kurulum — Live2D Avatar (VTube Studio)

Anime karakterini (Yuki) canlı yayında göstermek için Live2D avatar kullanıyoruz.

### Seçenek 1: Hazır Ücretsiz Avatar İndir (Hızlı)

1. ** Booth.pm** — Japon VTuber pazarı, birçok ücretsiz model var
   - https://booth.pm/en-us/browse/Live2D
   - "Free" filtresi uygula, ara: "free VTuber model"
   - TikTok-friendly: kawaii, pastel, anime tarzı

2. **VRoid Hub** — VRoid Studio ile oluşturulmuş ücretsiz modeller
   - https://hub.vroid.com/en
   - "Free to use" filtrele
   - Live2D'ye çevirmek için ekstra adım gerekir

3. **Nizima** — Live2D model pazarı
   - https://nizimaplus.com/
   - Free kategorisi var

### Seçenek 2: Kendi Avatarını Yap (Ücretsiz)

1. **Live2D Cubism Free** yükle
   - https://www.live2d.com/en/cubism/download/
   - Free tier yeterli (ticari kullanım için Pro gerekir)

2. **Karakter çizimi**
   - Clip Studio Paint (ücretli) veya Krita (ücretsiz) ile çiz
   - Katman katman ayır: gözler, ağız, kaşlar, saç öbekleri, vb.
   - PSD formatında dışa aktar

3. **Cubism'te modelle**
   - PSD'yi import et
   - Her parçaya "deformer" ekle (göz kırpma, ağız açma)
   - Movement parametreleri tanımla (nefes, baş sallama)
   - .model3.json olarak export et

### VTube Studio Kurulumu

1. **Steam'den yükle** (ücretsiz)
   - https://store.steampowered.com/app/1486800/VTube_Studio/

2. **Avatar yükle**
   - VTube Studio > "Add Model" > .model3.json dosyasını seç
   - Avatarı ekranda konumlandır

3. **Lip-sync ayarı** (TTS sesine dudak oynatma)
   - VTube Studio > Settings > "Lip Sync"
   - "Microphone" yerine **"System Audio"** seç (TTS çıktısını yakala)
   - Veya "Audio File Input" ile TTS ses dosyasını seç

4. **Kamera hareketi** (head tracking)
   - Webcam aç
   - VTube Studio > Face Tracking > Start
   - Kameraya baktıkça avatar takip eder

5. **OBS entegrasyonu**
   - OBS'te "Game Capture" veya "Window Capture" ekle
   - Hedef: "VTube Studio"
   - VTube Studio'da "Transparent Background" aç (chroma key gerekmez)

### AI Sesine Lip-Sync (Otomatik)

Sistem zaten otomatik lip-sync yapıyor:
1. `obs_controller.py` TTS sesini "YukiVoice" source'a yükler
2. Aynı anda "YukiAvatar" source'da lip-sync filter 3 saniye açılır
3. Ses bittiğinde filter otomatik kapanır

**OBS'te gerekli source'lar:**
- `YukiVoice` (Media Source) — TTS ses dosyası çalar
- `YukiAvatar` (Window Capture) — VTube Studio penceresi

### Avatarı Özelleştirme

`persona.py` dosyasını düzenleyerek karakteri özelleştir:
- **İsim** (Yuki → başka isim)
- **Kişilik** (flörtöz → utangaç, sakin, vb.)
- **Lore** (Tokyo → başka şehir, başka backstory)
- **System prompt** — LLM'e verilen tüm talimat

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

### Yöntem 1: Tek Komutla (Önerilen)

`start.sh` script'i 3 servisi birden başlatır:

```bash
cd /home/z/my-project

# Sadece web panel + bridge (simülasyon modu — API key gerekmez)
./start.sh

# Tam sistem (Python backend dahil — API key gerekir)
./start.sh --full

# Durum kontrolü
./start.sh --status

# Tüm servisleri durdur
./start.sh --stop
```

### Yöntem 2: Manuel (3 Terminal)

Tüm sistem çalışırken **3 terminal** açık olmalı:

```bash
# Terminal 1 — Bridge service
cd /home/z/my-project/mini-services/tiktok-bridge
bun run dev

# Terminal 2 — Next.js panel
cd /home/z/my-project
bun run dev

# Terminal 3 — Python backend (gerçek mod için)
cd /home/z/my-project/download/yuki-backend
source venv/bin/activate
python main.py
```

### Yöntem 3: Sadece Web Panel Testi

Hiçbir API key olmadan, sadece simülasyon modunu denemek için:

```bash
# Terminal 1
cd /home/z/my-project/mini-services/tiktok-bridge
bun install && bun run dev

# Terminal 2
cd /home/z/my-project
bun install && bun run dev
```

Tarayıcıda `http://localhost:81` aç. Bu modda:
- ✅ Web panel çalışır
- ✅ Sahte TikTok yorumları gelir
- ✅ AI kural-bazlı cevaplar üretir (LLM yok)
- ✅ Onay/red mekanizması çalışır
- ❌ Gerçek TikTok bağlantısı yok
- ❌ TTS ses çıkmaz
- ❌ OBS entegrasyonu yok

### Çalışma Akışı (Gerçek Mod)

1. **Hazırlık**
   - OBS Studio aç, "Yuki Live" sahnesini seç
   - VTube Studio aç, avatarı aktif et
   - TikTok hesabında Live yetkisi olduğundan emin ol

2. **Sistemi başlat**
   ```bash
   ./start.sh --full
   ```

3. **Web paneli aç** (`http://localhost:81`)

4. **Ayarları doğrula**
   - **Ayarlar > TikTok Bağlantısı** → TikTok kullanıcı adını gir
   - **Ayarlar > API Anahtarları** → tüm anahtarlar dolu mu kontrol et

5. **Otonomi modunu seç**
   - **AI Kontrol** sekmesi
   - İlk başta **Manuel** modda başla (her cevabı sen onayla)

6. **Yayını Başlat**
   - Sağ üstteki buton
   - OBS otomatik TikTok'a RTMP yayın başlatır
   - TikTok yorumları panelde görünmeye başlar

7. **AI cevapları yönet**
   - **Manuel modda**: AI her yoruma cevap üretir, sen "Onayla"/"Reddet" basana kadar bekler
   - **Yarı Otonom modda**: Otomatik cevaplar ama yasaklı içerik filtrelenir, acil stop aktif
   - **Tam Otonom modda**: 7/24 kendisi cevaplar (RİSKLİ — önerilmez)

8. **Yayını kapat**
   - "Yayını Kapat" butonu
   - Acil durumda "Acil Stop" → her şey anında durur

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
