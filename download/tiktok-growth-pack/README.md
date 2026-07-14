# 📦 Yuki AI — TikTok Büyüme Paketi

> **Hedef:** 0 → 1000 takipçi → Live yayını → Para kazanma
> **Süre:** 30 gün
> **Maliyet:** Sıfır bütçe (sadece senin zamanın)
> **Yöntem:** Günde 1 video, hazır senaryolar, trend yakalama

---

## 📋 Paket İçeriği

```
tiktok-growth-pack/
├── README.md                          ← Bu dosya (önce bunu oku)
├── 30-gunluk-plan.md                  ← Strateji dökümanı
├── tts_generator.py                   ← TTS ses üretici (Python)
├── senaryolar/
│   └── 10-senaryo.md                  ← 10 hazır video senaryosu
├── sesler/                            ← Yuki'nin sesli tanıtım klipleri
│   ├── 01-tanitim.mp3
│   ├── 02-gercek-miyim.mp3
│   ├── 03-sabah-kahvesi.mp3
│   ├── 04-3-dil.mp3
│   ├── 06-yas.mp3
│   ├── 07-anime-liste.mp3
│   ├── 08-pov-gun.mp3
│   ├── 09-ask.mp3
│   └── 10-turk-vtuber-destek.mp3
├── gorseller/                         ← TikTok için görseller
│   ├── profile-pic.png                ← TikTok profil fotoğrafı
│   ├── thumbnail-template.png         ← Video kapak şablonu
│   └── intro-frame.png                ← İntro frame
└── rehberler/
    ├── 01-tiktok-hesap-kurulumu.md    ← Hesap açma + ayarlar
    └── 02-api-key-rehberi.md          ← Gemini + ElevenLabs + TikTok
```

---

## 🚀 Hızlı Başlangıç (10 Dakika)

### 1. TikTok Hesabı Aç (5 dk)

`rehberler/01-tiktok-hesap-kurulumu.md` dosyasını oku:
- Hesap aç
- Profil fotoğrafı olarak `gorseller/profile-pic.png` yükle
- Bio'yu kopyala

### 2. İlk Videoyu Hazırla (5 dk)

1. `sesler/01-tanitim.mp3` dosyasını al
2. `senaryolar/10-senaryo.md` dosyasından 1. senaryoyu oku
3. CapCut'ta birleştir:
   - Yuki avatarı (OBS ile çek ya da statik görsel)
   - TTS sesi
   - Altyazı
4. 9:16 formatta export et
5. TikTok'a yükle, caption ve hashtag'leri senaryodan kopyala

### 3. Her Gün Tekrarla

- 30 gün boyunca her gün 1 video yükle
- `30-gunluk-plan.md`'deki takvimi takip et
- Senaryolar `senaryolar/` klasöründe hazır

---

## 📊 Beklenen Sonuçlar

| Hafta | Takipçi Hedefi | Video Sayısı | Etkileşim |
|---|---|---|---|
| 1 | 100 | 7 | Düşük (algoritma öğreniyor) |
| 2 | 300 | 14 | Orta (sadık kitle oluşur) |
| 3 | 600 | 21 | Yüksek (yorumlar artar) |
| 4 | 1000+ | 28-30 | Live'a hazır |

**Garanti veremem** — TikTok algoritması değişken. Ama bu planı uygulayıp 1000 takipçi alamazsan, stratejiyi birlikte gözden geçiririz.

---

## 🎯 Senin Yapman Gerekenler

### Yap (Sıfır Bütçe)

1. **TikTok hesabı aç** — `rehberler/01-tiktok-hesap-kurulumu.md`
2. **Her gün 1 video yükle** — `senaryolar/10-senaryo.md` + `sesler/*.mp3`
3. **Yorumlara cevap ver** — algoritma ödüllendirir
4. **Trendleri takip et** — TikTok Keşfet sekmesi
5. **Diğer VTuber'larla etkileşim** — collab için kapı açık tut

### Bana Sorman Gerekenler (Bana verebileceğin)

1. **Gemini API key** — `rehberler/02-api-key-rehberi.md`'den al
2. **ElevenLabs API key** — aynı rehberden
3. **TikTok session ID** — Live yayını için

### Benim Yaptığım (Hazır)

1. ✅ Yuki karakteri (persona + system prompt)
2. ✅ Web yönetim paneli (Next.js, çalışır halde)
3. ✅ Python backend (Gemini + ElevenLabs + OBS + TikTokLive)
4. ✅ 30 günlük içerik planı
5. ✅ 10 hazır video senaryosu
6. ✅ 9 adet TTS ses dosyası (Türkçe)
7. ✅ TikTok profil/thumbnail/intro görselleri
8. ✅ TikTok hesap kurulum rehberi
9. ✅ API key alma rehberi
10. ✅ `start.sh` — tek komutla başlatma

---

## ❓ Sık Sorulan Sorular

### "Bu plan gerçekten işe yarar mı?"

Evet — ama **garanti değil**. Türk VTuber nişi küçük ama sadık. 30 gün boyunca günde 1 video yükleyip trendleri yakaladığında 800-1500 takipçi arası ulaşabilirsin.

### "Yuki'nin sesi neden robotik?"

Şu an `gTTS` kullanıyoruz (Google Translate'in sesi — robotik). ElevenLabs API key alırsan, `tts_engine.py` gerçek anime sesi üretecek. Rehber: `rehberler/02-api-key-rehberi.md`

### "TikTok'ta banlanır mıyım?"

- **AI olduğunu gizlemediğin sürece** ban riski düşük
- **Live yayınında 7/24 tam otonom** yaparsan yüksek risk
- **Yarı Otonom mod** (bizim önerimiz) güvenli
- TikTok ToS'a saygı duy: https://www.tiktok.com/community-guidelines

### "Hesabım banlanırsa ne yaparım?"

1. Settings > Report a problem
2. "Account suspended" seç
3. Yuki AI VTuber olduğunu anlat
4. 24-72 saat bekle

### "Video çekmek için VTuber avatarımı nasıl yaparım?"

`yuki-backend/README.md` dosyasındaki "Live2D Avatar" bölümünü oku:
- Booth.pm'den ücretsiz avatar indir
- VTube Studio ile kur
- OBS ile yakala

### "Daha hızlı 1000 takipçi alabilir miyim?"

Sıfır bütçe ile hayır. Ücretli yollar:
- TikTok Ads ($50-200/ay)
- Influencer shoutout ($20-100/gönderi)
- Bot takipçi (TikTok ToS ihlali — ban riski)

---

## 📅 Haftalık Rutin

### Pazartesi-Cuma (Hafta İçi)

| Saat | Yap |
|---|---|
| 09:00 | Trendleri kontrol et (Keşfet) |
| 12:00 | Yorumları cevapla |
| 18:00 | Video yükle (en iyi saat) |
| 20:00 | Yeni yorumlara cevap ver |
| 22:00 | Analytics kontrol |

### Cumartesi-Pazar (Hafta Sonu)

- 2 video yükle (sabah + akşam)
- Diğer VTuber videoları izle (algoritma için)
- 1 Duet/Reaction videosu çek

---

## 🎁 Bonus: Hızlı Viralite Taktikleri

### 1. "İlk 3 Saniye" Kuralı

TikTok videonun ilk 3 saniyesine bakar:
- Eğlenceli/kışrtıcı bir başlangıç yap
- "Bir saniye, sonuna kadar izle" türü çağrı
- Hemen soru sor ("Sence...")

### 2. Yorum Toplama Taktikleri

- Video sonunda soru sor
- Caption'da "Yorumlarda yaz" çağrısı
- Top comment'a video cevap ver (yeni trend)

### 3. Duet İzni Açık Olsun

Başkaları senin videonu duet yapabilir = viralite.

### 4. Trend Ses + Özel Twist

Trend sesi kullan ama Yuki'nin karakteriyle twist ekle. "Sıradan trend" değil, "Yuki'ye özel trend" olsun.

### 5. Seri İçerik

"Yuki'ye soru sorun #1", "#2", "#3" gibi seri içerik. İnsanlar seriyi takip eder.

---

## 🆘 Yardım

### Sorun mu yaşadın?

1. `rehberler/` klasöründeki rehberleri tekrar oku
2. `yuki-backend/README.md`'deki sorun giderme bölümüne bak
3. Bana sor — birlikte çözelim

### Geliştirme önerisi mi var?

- Yeni senaryo türleri
- Yeni karakter mood'ları
- Yeni TikTok taktikleri
- Yeni araç önerileri

→ Bana yaz, paketi genişletelim.

---

## 🏁 Son Söz

Bu paket bir **başlangıç noktası**. Mükemmel değil, eksikler var. Ama 30 gün boyunca uygularsan, Yuki karakterini gerçek bir TikTok fenomenine dönüştürebilirsin.

**Önemli:** TikTok banı riskini unutma. AI olduğunu dürüstçe söyle, gizleme. Yarı Otonom modda başla. Tam otonom 7/24 yayına geçme.

Başarılar! 🌸

---

## 📞 İletişim & Destek

Sorularını bana sor. Birlikte:
- Hangi videoların çalıştığını analiz edebiliriz
- Senaryoları güncelleyebiliriz
- Trend stratejisini değiştirebiliriz
- API key entegrasyonunu yapabiliriz
- Live yayınına geçiş planı yapabiliriz

Şimdi başla — TikTok hesabını aç, ilk videoyu yükle, geri bildirim ver!
