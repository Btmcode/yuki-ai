# TikTok Developer API — Resmi Entegrasyon Rehberi

> TikTok'un resmi geliştirici platformu (https://developers.tiktok.com) incelendi.
> Bu rehber, Yuki AI projesinde TikTok'un **resmi API'lerini** nasıl kullanacağını açıklar.

---

## 📋 TikTok Developer Platform — Mevcut API'ler

TikTok'un resmi olarak sunduğu 5 ana API var:

| API | Kullanım Amacı | Yuki İçin Önemi |
|---|---|---|
| **Login Kit** | TikTok ile giriş yapma | Yüksek — Yuki panelinde TikTok girişi |
| **Display API (v2)** | Profil/video bilgisi gösterme | Yüksek — Hesap stats görüntüleme |
| **Content Posting API** | Video upload (TikTok'a post) | **Çok Yüksek** — Otomatik video paylaşımı |
| **Research API** | Akademik araştırma | Düşük — Sadece onaylı araştırmacılar |
| **Commercial Content API** | Reklam içeriği analiz | Düşük |

### ⚠️ Önemli Not: Live API'si YOK

TikTok'un **resmi Live yayını dinleme API'si yok**. Yorum/hediye dinleme için:
- **Üçüncü parti `TikTokLive` library** kullanıyoruz (reverse-engineering)
- Resmi Content Posting API **video upload** için var ama **Live dinleme** için değil

---

## 🚀 Content Posting API — Otomatik Video Upload

Bu API Yuki için en kritik olanı — **TikTok'a otomatik video paylaşımı** yapabilirsin.

### Kullanım Senaryoları

1. **Otomatik tanıtım videosu paylaşımı** — Her gün 1 video otomatik
2. **AI üretimi içerikler** — Senaryo + ses + görsel → otomatik upload
3. **Schedule upload** — Gelecek tarihli videolar
4. **Çoklu hesap yönetimi** — Birden fazla AI karakter

### ⚠️ Ban Riski

- TikTok'un spam politikası otomatik upload'u **şüpheli** görür
- İlk hafta **günde max 1 video** önerilir
- Her videoda farklı içerik olmalı (aynı video 2. kez upload = ban)
- AI olduğunu caption'da belirt

---

## 📝 Adım 1: TikTok Developer Hesabı Aç

### 1.1. Kayıt

1. https://developers.tiktok.com/ adresine git
2. Sağ üstte **"Sign up"** veya **"Get started"** butonuna bas
3. TikTok hesabınla giriş yap (@yuki_xaivar hesabını kullan)
4. Developer agreement'ı kabul et

### 1.2. Yeni App Oluştur

1. https://developers.tiktok.com/login'e git
2. **"My apps"** > **"Connect an app"** butonuna bas
3. App bilgilerini doldur:

| Alan | Değer |
|---|---|
| **App name** | `Yuki AI VTuber` |
| **Category** | `Entertainment` |
| **Description** | `AI VTuber content management system` |
| **Platform** | `Web` |
| **Dev URL** | `https://yukiai.space-z.ai` |
| **Redirect URI** | `https://yukiai.space-z.ai/api/tiktok/callback` |

4. **Submit** ile kaydet

### 1.3. Client Key ve Secret Al

App oluştuktan sonra:
- **Client Key** — public identifier (`awxxxxxxxxxxxx`)
- **Client Secret** — gizli anahtar (`xxxxxxxxxxxxxxxxxxxxxxxxxx`)

Bu değerleri `.env`'e ekle:
```bash
TIKTOK_CLIENT_KEY=awxxxxxxxxxxxx
TIKTOK_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxx
TIKTOK_REDIRECT_URI=https://yukiai.space-z.ai/api/tiktok/callback
```

### 1.4. Scopes Seç

App ayarlarında şu scope'ları aktive et:

| Scope | İzin | Yuki İçin |
|---|---|---|
| `user.info.basic` | Temel profil bilgisi | ✓ Gerekli |
| `video.list` | Kullanıcının videolarını listele | ✓ Stats için |
| `video.publish` | **Video upload ve publish** | ✓ **Kritik** |
| `video.upload` | Video upload (publish etmeden) | ✓ |
| `video.publish.actions` | Publish işlemleri | ✓ |

---

## 🔐 Adım 2: OAuth 2.0 Login Akışı

Kullanıcının TikTok hesabını Yuki paneline bağlamak için OAuth akışı:

### 2.1. Auth URL Oluştur

```
https://www.tiktok.com/v2/auth/authorize/
  ?client_key=CLIENT_KEY
  &scope=user.info.basic,video.list,video.publish
  &response_type=code
  &redirect_uri=REDIRECT_URI
  &state=RANDOM_STATE
```

### 2.2. Kullanıcı İzin Verir

TikTok açılır, kullanıcı "Allow" der, redirect URI'ye code gelir:
```
https://yukiai.space-z.ai/api/tiktok/callback?code=AUTH_CODE&state=RANDOM_STATE
```

### 2.3. Access Token Al

```python
import requests

response = requests.post(
    "https://open.tiktokapis.com/v2/oauth/token/",
    data={
        "client_key": CLIENT_KEY,
        "client_secret": CLIENT_SECRET,
        "code": AUTH_CODE,
        "grant_type": "authorization_code",
        "redirect_uri": REDIRECT_URI,
    }
)
access_token = response.json()["access_token"]
refresh_token = response.json()["refresh_token"]
```

Token'ı database'e kaydet. Access token **24 saat**, refresh token **1 yıl** geçerli.

---

## 📤 Adım 3: Content Posting API — Video Upload

### 3.1. Initialize Upload

```python
import requests

headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json; charset=UTF-8",
}

# Initialize
response = requests.post(
    "https://open.tiktokapis.com/v2/post/publish/video/init/",
    headers=headers,
    json={
        "post_info": {
            "title": "Selaaam! Ben Yuki, Türkiye'nin ilk AI VTuber'ıyım! 🌸 #AIvtuber #VTuber",
            "privacy_level": "PUBLIC_TO_EVERYONE",
            "disable_duet": False,
            "disable_comment": False,
            "disable_stitch": False,
            "video_cover_timestamp_ms": 1000,
        },
        "source_info": {
            "source": "FILE_UPLOAD",
            "video_size": video_size_bytes,
            "chunk_size": chunk_size,
            "total_chunk_count": 1,
        },
    },
)
upload_url = response.json()["data"]["upload_url"]
publish_id = response.json()["data"]["publish_id"]
```

### 3.2. Upload Video Chunks

```python
# Video dosyasını yükle
with open(video_path, "rb") as f:
    video_data = f.read()

requests.put(
    upload_url,
    headers={
        "Content-Range": f"bytes 0-{len(video_data)-1}/{len(video_data)}",
        "Content-Type": "video/mp4",
    },
    data=video_data,
)
```

### 3.3. Status Check

```python
response = requests.post(
    "https://open.tiktokapis.com/v2/post/publish/status/fetch/",
    headers=headers,
    json={"publish_id": publish_id},
)
status = response.json()["data"]["status"]
# PUBLISH_PROCESSING / PUBLISH_COMPLETE / FAILED
```

---

## 📊 Adım 4: Display API — Stats Çekme

### 4.1. Kullanıcı Bilgisi

```python
response = requests.get(
    "https://open.tiktokapis.com/v2/user/info/",
    headers={
        "Authorization": f"Bearer {access_token}",
    },
    params={
        "fields": "open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count",
    },
)
user_data = response.json()["data"]
```

### 4.2. Video Listesi (Stats ile)

```python
response = requests.post(
    "https://open.tiktokapis.com/v2/video/list/",
    headers={
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json; charset=UTF-8",
    },
    json={
        "fields": "id,title,create_time,view_count,like_count,comment_count,share_count",
        "max_count": 20,
        "cursor": 0,
    },
)
videos = response.json()["data"]["videos"]
```

---

## 🤖 Yuki AI Projesine Entegrasyon Planı

### Faz 2.A — Login Kit (1 hafta)

**Hedef:** Yuki panelinde TikTok hesabını bağla

1. `/api/tiktok/auth` endpoint'i → TikTok auth URL'ine redirect
2. `/api/tiktok/callback` endpoint'i → code → token değişimi
3. Token'ı Prisma database'e kaydet (şifreli)
4. Panelde "TikTok Bağlı" badge'i göster

### Faz 2.B — Display API (3 gün)

**Hedef:** Panelde gerçek TikTok stats göster

1. Sağ üstte "X izleyici · Y takipçi · Z video" göster
2. Son 10 video listesi (Dashboard'a sekme)
3. Her video için view/like/comment sayıları
4. Otomatik refresh (5 dakikada bir)

### Faz 2.C — Content Posting API (2 hafta)

**Hedef:** Otomatik video upload

1. `/api/tiktok/upload` endpoint'i
2. Backend script: video üret → upload → status bekle
3. Schedule: her gün 18:00'da otomatik upload
4. Hata yönetimi (quota, ban, network)
5. Log: her upload için database kaydı

### Faz 2.D — Cron Job (1 hafta)

**Hedef:** Tam otomasyon

1. Her gece 02:00'da: senaryo seç → TTS üret → görsel üret → render → upload
2. 18:00'da: video TikTok'ta görünür
3. Başarısız olursa: fallback içerik (önceden hazırlanmış)

---

## ⚠️ Riskler ve Sınırlar

### TikTok Content Posting API Kısıtları

| Limit | Değer |
|---|---|
| Günlük upload | 6 video ( Production app) |
| Haftalık upload | 30 video |
| Aylık upload | 100 video |
| Video boyutu | 500 MB max |
| Video süre | 540 sn (9 dk) max |
| Caption | 2200 karakter |

### Ban Riski Azaltma

1. **Aynı içeriği 2. kez upload etme** — TikTok bunu spam sayar
2. **Günde max 1 video** — algoritma öğrenme süresi ver
3. **AI olduğunu caption'da yaz** — `"AI VTuber"` veya `"AI generated"`
4. **Telif hakkı müzik kullanma** — sadece ücretsiz kütüphane
5. **İlk hafta** video sayısını düşük tut (algoritma öğrensin)

### Hesap Banı Durumunda

1. Token'ı iptal et
2. Yeni TikTok hesabı aç (sıfırdan)
3. Yeni developer app oluştur
4. Token değişimi yap
5. **3 gün bekle** — algoritma yeni hesap öğrensin

---

## 🛠️ TikTokLive Library ile Karşılaştırma

| Özellik | Resmi API | TikTokLive (3rd party) |
|---|---|---|
| Video upload | ✓ Resmi | ✗ Yok |
| Live dinleme | ✗ Yok | ✓ Var |
| Yorum okuma | ✗ Yok | ✓ Var |
| Hediye dinleme | ✗ Yok | ✓ Var |
| Profil stats | ✓ Resmi | ✓ Kısmen |
| Risk | Düşük | Yüksek (TikTok ToS ihlali) |
| Stabilite | Yüksek | Düşük (TikTok değişiklik kırar) |

**Sonuç:** Yuki için **ikisini de kullan**:
- Resmi API → video upload, stats
- TikTokLive → Live yayını dinleme (yorum/hediye)

---

## 📚 Faydalı Linkler

### Resmi Dokümanlar
- https://developers.tiktok.com/doc/login-kit-web/
- https://developers.tiktok.com/doc/content-posting-api-get-started
- https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info
- https://developers.tiktok.com/doc/research-api-get-started/

### API Endpoint'leri
- Auth: `https://www.tiktok.com/v2/auth/authorize/`
- Token: `https://open.tiktokapis.com/v2/oauth/token/`
- Upload init: `https://open.tiktokapis.com/v2/post/publish/video/init/`
- Status: `https://open.tiktokapis.com/v2/post/publish/status/fetch/`
- User info: `https://open.tiktokapis.com/v2/user/info/`
- Video list: `https://open.tiktokapis.com/v2/video/list/`

### Sınırlar
- https://developers.tiktok.com/doc/rate-limit
- https://developers.tiktok.com/doc/usage-guidelines

### SDK'lar
- Python: `tiktok-api` (3rd party)
- Node.js: `tiktok-openapi-sdk` (3rd party)
- Resmi SDK yok — direkt HTTP istekleri

---

## 🎯 Sırada Ne Yapmalı?

### Hemen (Bu Hafta)

1. **TikTok Developer hesabı aç** → https://developers.tiktok.com/
2. **Yuki AI app oluştur** — yukarıdaki adımları takip et
3. **Client Key + Secret al** → bana ver, `.env`'e ekleyeyim
4. **OAuth akımını test et** — Login Kit

### Sonra (Faz 2.A — 1 Hafta)

5. `/api/tiktok/auth` endpoint yaz (Next.js API route)
6. `/api/tiktok/callback` — token değişimi
7. Token'ı Prisma'ya kaydet
8. Panelde "TikTok Bağlı" badge göster

### Sonra (Faz 2.C — 2 Hafta)

9. Content Posting API entegrasyonu
10. İlk otomatik video upload testi
11. Schedule sistem kur

---

Bu rehberi takip edersen, Yuki AI'ı TikTok'a resmi olarak bağlamış olursun — TikTokLive library'nin **riskli** reverse-engineering yaklaşımı yerine **resmi** API kullanarak.

İstediğin zaman "TikTok OAuth akımını yaz" de, Next.js API route'larını hazırlayayım.
