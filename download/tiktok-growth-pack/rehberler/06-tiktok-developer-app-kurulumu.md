# TikTok Developer App Kurulumu — Adım Adım Rehber

> Yuki AI projesi için TikTok Developer App oluşturma ve OAuth entegrasyonu.
> **Mevcut scope'larla çalışır:** `user.info.profile`, `user.info.stats`, `video.list`

---

## 📋 Adım 1: Form Doldurma (2 dk)

TikTok Developer portalında app oluştururken şu bilgileri gir:

| Alan | Yazılacak |
|---|---|
| **App name** | `Yuki AI VTuber` |
| **App icon** | `/public/avatars/yuki-chibi.png` (1024x1024 PNG) |
| **Description** | `Yuki AI VTuber — autonomous TikTok content management system with AI-powered character interactions` |
| **Category** | `Entertainment` |
| **Terms of Service URL** | `https://yukiai.space-z.ai/legal/terms` |
| **Privacy Policy URL** | `https://yukiai.space-z.ai/legal/privacy` |
| **Platforms** | Sadece **Web** işaretle (Desktop/Android/iOS boş) |
| **Dev URL** | `https://yukiai.space-z.ai` |
| **Redirect URI** | `https://yukiai.space-z.ai/api/tiktok/callback` |

---

## 🔐 Adım 2: URL Prefix Doğrulama (Signature File)

TikTok domain sahibi olduğunu doğrulamanı istiyor. "Signature file" yöntemi:

### 2.1. TikTok sana bir verification string verecek

Örnek: `tiktok-verify-a1b2c3d4e5f6`

### 2.2. Bana bu string'i gönder

```
Verification string: tiktok-verify-a1b2c3d4e5f6
```

Ben de şu dosyayı oluşturacağım:
```
public/.well-known/tiktok-verify-a1b2c3d4e5f6.txt
```

### 2.3. Deploy edip TikTok'ta "Verify" butonuna bas

Deployment yayınlandıktan sonra TikTok şuraya erişip doğrulayacak:
```
https://yukiai.space-z.ai/.well-known/tiktok-verify-a1b2c3d4e5f6.txt
```

---

## 🎯 Adım 3: Scopes Ekle (3 adet)

App ayarlarında **"Add scopes"** bölümüne git ve şu 3 scope'u ekle:

### ✅ Eklenecek Scope'lar

| Scope | Açıklama | Yuki'de Kullanımı |
|---|---|---|
| `user.info.profile` | Profil bilgisi (bio, avatar, doğrulanmış mı) | Panelde profil gösterimi |
| `user.info.stats` | Takipçi, beğeni, video sayısı | Stats kartı |
| `video.list` | Kullanıcının video listesi + stats | Video performans takibi |

### ❌ GÖRÜNMEYEN Scope'lar (önemli!)

Şu scope'lar yeni hesaplarda **görünmez**:
- `video.upload` — Content Posting API
- `video.publish` — Video upload için

**Sebep:** TikTok bu scope'ları sadece **onaylanmış Content Posting API kullanıcılarına** verir. Başvuru gerekir.

**Çözüm:** İlk başta yukarıdaki 3 scope ile başla. İleride video upload için başvuru yaparız.

---

## 📤 Adım 4: Submit ve Credentials Al

1. **Submit** ile app'i kaydet
2. App dashboard'una git
3. Şu iki değeri kopyala:
   - **Client Key** (format: `awxxxxxxxxxxxx`)
   - **Client Secret** (format: `xxxxxxxxxxxxxxxxxxxxxxxxxx`)

### 4.1. Bana Gönder (Format)

```
Client Key: awxxxxxxxxxxxx
Client Secret: xxxxxxxxxxxxxxxxxxxxxxxxxx
```

Ben de `.env` dosyasına ekleyeyim:
```bash
TIKTOK_CLIENT_KEY=awxxxxxxxxxxxx
TIKTOK_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx
TIKTOK_REDIRECT_URI=https://yukiai.space-z.ai/api/tiktok/callback
```

---

## 🚀 Adım 5: OAuth Akışı Test

Credentials eklendikten sonra:

1. **Yuki panelini aç** → `https://yukiai.space-z.ai`
2. **Settings** sekmesine git
3. **TikTok** tab'ı → **"TikTok Resmi API Bağlantısı"** bölümü
4. **"TikTok ile Bağlan"** butonuna bas
5. TikTok login sayfası açılır → @yuki_xaivar ile giriş yap
6. İzinleri onayla (3 scope)
7. Otomatik geri yönlendirilirsin
8. Panelde **profil bilgisi + stats + son videolar** görünür

---

## 📊 Adım 6: Ne Yapabiliriz?

### Mevcut Scope'larla (Phase 1)

- ✅ Profil bilgisi (avatar, bio, doğrulanmış mı)
- ✅ **Gerçek takipçi sayısı** (1000 hedefini takip)
- ✅ Toplam beğeni, takip, video sayısı
- ✅ Son 20 video listesi + istatistikleri
- ✅ Video performans analizi (izlenme, beğeni, yorum, paylaşım)
- ✅ Otomatik senkronizasyon (5 dakikada bir)

### İleride (Phase 2 — Content Posting API onayı)

- ⏳ Video upload (TikTok'a otomatik video paylaşımı)
- ⏳ Schedule upload
- ⏳ Çoklu hesap yönetimi

### Hâlâ TikTokLive ile (Phase 1 — zaten yapıldı)

- ✅ Live yayını dinleme (yorum/hediye)
- ⚠️ TikTokLive library 3rd party, riskli
- ✅ Python backend ile entegre

---

## 🛠️ Teknik Detaylar

### Database Şeması

`prisma/schema.prisma`'ya 2 yeni model eklendi:

```prisma
model TikTokAccount {
  id              String   @id @default(cuid())
  openId          String   @unique
  username        String?
  displayName     String?
  avatarUrl       String?
  // ... (tokens, stats, meta)
  videos          TikTokVideo[]
}

model TikTokVideo {
  id              String   @id @default(cuid())
  accountId       String
  videoId         String   @unique
  title           String?
  // ... (cover, stats, etc.)
  account         TikTokAccount @relation(...)
}
```

### API Endpoint'leri

| Endpoint | Method | Açıklama |
|---|---|---|
| `/api/tiktok/auth` | GET | OAuth başlatma — TikTok login'e yönlendir |
| `/api/tiktok/callback` | GET | TikTok'tan dönüş — code → token değişimi |
| `/api/tiktok/status` | GET | Aktif hesap durumunu getir |
| `/api/tiktok/disconnect` | POST | Bağlantıyı kes |
| `/api/tiktok/sync` | POST | Stats + video listesini yenile |

### Token Yönetimi

- **Access token:** 24 saat geçerli
- **Refresh token:** 1 yıl geçerli
- Otomatik yenileme — `ensureValidToken()` fonksiyonu
- Token expire olmadan 5 dk önce yenilenir
- Database'de şifreli saklanır (production'da encrypt önerilir)

---

## ❓ Sık Sorulan Sorular

### "URL prefix doğrulama başarısız"

1. `https://yukiai.space-z.ai/.well-known/tiktok-verify-xxx.txt` tarayıcıda aç
2. Dosya içeriği sadece verification string olmalı (boşluk/yeni satır olmamalı)
3. Deployment 500 veriyorsa önce deployment'ı düzelt

### "OAuth callback error: invalid_state"

- Cookie'lerin temiz olmalı
- Tarayıcıyı yeniden başlat
- 10 dakikadan kısa sürede OAuth tamamla (state 10 dk expire olur)

### "Token exchange failed"

- Client Key ve Secret doğru mu kontrol et
- Redirect URI app ayarlarıyla birebir aynı mı
- HTTPS zorunlu (http çalışmaz)

### "Scopes arasında video.publish yok"

- Normal — TikTok bu scope'u onaylanmış hesaplara verir
- Content Posting API için ayrı başvuru gerekir
- Şimdilik 3 scope ile devam et

---

## 🎯 Sıradaki Adımlar

1. **Bu rehberi takip et** — form doldur, scopes ekle, submit et
2. **Verification string'i bana gönder** — `.well-known/` dosyası ekleyeyim
3. **Client Key + Secret'ı bana gönder** — `.env`'e ekleyeyim
4. **Deploy edelim** — TikTok URL'i doğrulasın
5. **Panelde "TikTok ile Bağlan"** — OAuth akışını test et
6. **Stats gör** — Gerçek takipçi sayısı panelde

---

**Sırada:** TikTok Developer app'ini doldur, verification string + Client Key/Secret'ı bana gönder. 🌸
