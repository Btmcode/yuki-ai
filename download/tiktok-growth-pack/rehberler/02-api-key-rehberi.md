# Gemini & ElevenLabs API Alma Rehberi

> Adım adım, ekran görüntüleri ile, ücretsiz hesap açma.
> Toplam süre: 5-10 dakika.

---

## 1️⃣ Google Gemini API Key (LLM için)

**Neden:** Yuki'nin akıllı cevaplar üretmesi için (kural bazlı değil, gerçek AI)
**Maliyet:** Ücretsiz (15 istek/dakika, günde 1500)
**Süre:** 2 dakika

### Adım 1: Google Hesabı Aç/Giriş Yap

1. https://accounts.google.com adresine git
2. Gmail hesabın varsa giriş yap
3. Yoksa "Create account" → personal account aç

### Adım 2: Google AI Studio'ya Git

1. https://aistudio.google.com/apikey adresine git
2. Google hesabın ile giriş yap
3. Ülke şartlarını kabul et (varsa)

### Adım 3: API Key Oluştur

1. "Create API key" butonuna bas
2. "Create API key in new project" seç (varsayılan)
3. Şu formatta bir key alacaksın:
   ```
   AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
4. Bu key'i **kopyala** (bir daha gösterilmeyebilir)

### Adım 4: .env Dosyasına Ekle

`/home/z/my-project/download/yuki-backend/.env` dosyasını aç:

```bash
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### ⚠️ Önemli Güvenlik Notları

- API key'i **asla** TikTok/Instagram/Twitter'da paylaşma
- API key'i GitHub'a push etme (.gitignore'a ekle)
- Ücretsiz tier limiti: 15 req/dk, günde 1500 istek
- Limit aşarsan kart bilgisi ister (ücretli tier)

### Faturalandırma Anlama

- **Free tier:** 15 req/dk, günde 1500 istek, ücretsiz
- **Pay-as-you-go:** Limitsiz ama her istek ücretli ($0.075/1M token)
- Yuki için free tier yeterli (1000 takipçi = 50-100 yorum/gün)

---

## 2️⃣ ElevenLabs API Key (TTS için)

**Neden:** Yuki'nin doğal, anime tarzı Türkçe sesi için
**Maliyet:** Ücretsiz tier (ayda 10.000 karakter)
**Süre:** 3 dakika

### Adım 1: ElevenLabs Hesabı Aç

1. https://elevenlabs.io adresine git
2. "Sign up" butonuna bas
3. Google veya e-posta ile kaydol
4. E-posta onayla

### Adım 2: API Key Al

1. Giriş yaptıktan sonra sağ üstteki profile tıkla
2. "Profile + API key" seç
3. "API Key" sekmesini gör
4. Şu formatta bir key alacaksın:
   ```
   el_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
5. Kopyala

### Adım 3: Voice ID Al (Ses Seç)

1. ElevenLabs panelinde "Voices" sekmesine git
2. "Voice Library" aç
3. Türkçe konuşan bir kadın sesi ara:
   - "Rachel" (iyi, doğal)
   - "Bella" (yumuşak, anime uyumlu)
   - "Freya" (genç kız sesi, VTuber için ideal)
4. Bir ses seç → "Add to VoiceLab"
5. Seçtiğin sesin sayfasında "Voice ID" gösterilir
6. Voice ID'yi kopyala (örn: `EXAVITQu4vr4xnSDxMaL`)

### Adım 4: .env Dosyasına Ekle

```bash
ELEVENLABS_API_KEY=el_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL
```

### ⚠️ Free Tier Sınırları

- **10.000 karakter/ay** ücretsiz
- Yuki karakteri ortalama cevap = 100 karakter
- 100 cevap/gün = 10.000 karakter = 1 ay limit
- Yani: **her gün 100 cevap verebilirsin**, ay sonunda limit dolar
- Limit aşarsan: ya bekle (ay başı sıfırlanır) ya da ücretli tier'a geç ($5/ay)

### Ses Kalitesi İçin İpuçları

1. **Voice stability:** 0.4-0.6 arası (çok düşük = kararsız, çok yüksek = robotik)
2. **Similarity boost:** 0.7-0.8 (karakter tutarlılığı)
3. **Style:** 0.3-0.6 (dramatik = yüksek, doğal = düşük)
4. **Speed:** 1.0 (normal), 0.95 (yavaş, sakin), 1.1 (hızlı, heyecanlı)

`persona.py` dosyasındaki `MOOD_SETTINGS` zaten bunları ayarlı.

---

## 3️⃣ TikTok Session ID (TikTok Live dinlemek için)

**Neden:** TikTok yorum/hediyelerini Python backend'de dinlemek için
**Maliyet:** Ücretsiz
**Süre:** 2 dakika

### Adım 1: TikTok'a Giriş Yap

1. https://www.tiktok.com adresine git
2. Yuki AI hesabınla giriş yap
3. (Live yetkisi olmasa da, oturum açık olmalı)

### Adım 2: Developer Tools Aç

1. **Chrome/Edge/Firefox'ta:** F12 bas
2. **Application** sekmesine geç (Chrome'da)
   - Veya **Storage** sekmesi (Firefox'ta)
3. Sol menüden **Cookies** > `https://www.tiktok.com` seç

### Adım 3: Session ID Bul

1. Cookie listesinde `sessionid` ara
2. Value sütunundaki değeri kopyala:
   ```
   XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
3. Bu değer yaklaşık 32-64 karakter uzunluğunda

### Adım 4: .env Dosyasına Ekle

```bash
TIKTOK_USERNAME=yuki_ai
TIKTOK_SESSION_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### ⚠️ Önemli Uyarılar

- **Session ID 30 gün sonra expire olur** — yenilemen gerekir
- **Başka cihazda oturum açarsan session ID değişir** — yeniden al
- **Asla kimseyle paylaşma** — hesabını ele geçirebilir
- **TikTokLive library resmi değil** — TikTok ToS grisi alan, dikkatli kullan

---

## 4️⃣ OBS WebSocket Şifresi

**Neden:** Python backend OBS Studio'yu kontrol etsin diye (ses çalma, sahne değiştirme)
**Maliyet:** Ücretsiz
**Süre:** 1 dakika

### Adım 1: OBS Studio'yu Aç

1. OBS Studio'yu başlat
2. **Tools > WebSocket Server Settings** menüsüne git
3. "Enable WebSocket server" kutusunu işaretle
4. Port: `4455` (varsayılan)
5. "Enable authentication" kutusunu işaretle
6. "Set password" düğmesine bas, bir şifre belirle

### Adım 2: .env Dosyasına Ekle

```bash
OBS_HOST=localhost
OBS_PORT=4455
OBS_PASSWORD=belirledigin_sifre
```

---

## 5️⃣ Tüm .env Dosyası Örneği

`/home/z/my-project/download/yuki-backend/.env` dosyasının son hali:

```bash
# --- TikTok ---
TIKTOK_USERNAME=yuki_ai
TIKTOK_SESSION_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# --- Google Gemini (LLM) ---
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GEMINI_MODEL=gemini-1.5-flash

# --- ElevenLabs (TTS) ---
ELEVENLABS_API_KEY=el_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL

# --- OBS WebSocket ---
OBS_HOST=localhost
OBS_PORT=4455
OBS_PASSWORD=belirledigin_sifre

# --- Bridge (Next.js mini-service) ---
BRIDGE_URL=http://localhost:3003

# --- Karakter ---
CHARACTER_NAME=Yuki
```

---

## ✅ Test: API Key'ler Çalışıyor mu?

Tüm key'leri girdikten sonra test et:

```bash
cd /home/z/my-project/download/yuki-backend
python3 test_brain.py
```

Çıktıda şunu görmelisin:

```
✓ Tüm bileşenler hazır
  - AI Brain: ✓
  - TTS: ✓
  - OBS: ✓ (OBS açıkken)
  - TikTok: ✓
```

Eğer bazı bileşenler "✗" ise, ilgili API key'i kontrol et.

---

## 🆘 Sorun Giderme

### "GEMINI_API_KEY yok"

- .env dosyası doğru yerde mi? (`yuki-backend/.env`)
- python-dotenv yüklü mü? (`pip install python-dotenv`)
- .env'deki key'de boşluk var mı? (olmamalı)

### "ElevenLabs 401 Unauthorized"

- API key yanlış kopyalanmış olabilir
- ElevenLabs panelinde key hala aktif mi kontrol et
- Free tier limitini aştın mı? (10k karakter/ay)

### "TikTok session ID çalışmıyor"

- 30 günden eski olabilir — yeniden al
- Başka cihazda oturum açtın mı? — session ID değişir
- TikTokLive library güncel mi? (`pip install --upgrade TikTokLive`)

### "OBS bağlantı hatası"

- OBS Studio açık mı?
- WebSocket Server etkin mi? (Tools > WebSocket Server Settings)
- Port 4455 doğru mu?
- Şifre doğru mu?

---

## 💡 Bonus: API Key'leri Güvenle Sakla

### Asla Yapma

- ❌ API key'i TikTok/Instagram'da paylaşma
- ❌ GitHub'a commit etme (`.gitignore`'a ekle)
- ❌ Ekran görüntüsünde gösterme (demo çekerken blur'la)
- ❌ Başka birine e-posta ile gönderme

### Yap

- ✓ `.env` dosyasını yerel tut
- ✓ Yedekle (1Password, Bitwarden gibi)
- ✓ Şüpheli aktivite görürsen hemen key'i rotate et
- ✓ Farklı projeler için farklı key'ler kullan

---

API key'leri aldıktan sonra bunları bana ver, `.env` dosyasını ben hazırlayayım ve Python backend'i gerçek AI ile test edelim.
