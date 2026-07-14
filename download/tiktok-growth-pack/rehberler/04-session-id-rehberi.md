# TikTok Session ID Alma — Otomatik + Mobil Rehber

> TikTok session ID, Python backend'in TikTok yorum/hediye olaylarını dinlemesi için gerekli.
> Bu rehberde: otomatik alma yöntemleri + mobil telefondan alma adımları.

---

## 🤔 Session ID Gerçekten Gerekli mi?

### Session ID OLMADAN da çalışır (sadece dinleme):

TikTokLive library **sadece username** ile de çalışır (anonim mod):
```python
client = TikTokLiveClient(unique_id="yuki_xaivar")
```

✅ **Avantajları:**
- Session ID almaya gerek yok
- Hesap bilgilerini girmene gerek yok
- Ban riski sıfır

❌ **Dezavantajları:**
- Yorum yapamazsın (sadece dinler)
- Hediye gönderemezsin
- TikTok bazen anonim bağlantıları kısıtlar (rate limit)
- 30 dakikada bir bağlantı kopabilir

### Session ID İLE çalışır (tam yetki):

```python
client = TikTokLiveClient(unique_id="yuki_xaivar", sessionid="xxxxx")
```

✅ **Avantajları:**
- Daha güvenilir bağlantı
- Yorum yapabilirsin (AI cevapları otomatik TikTok'a yazılır)
- Hediye gönderabilirsin
- Daha az rate limit

❌ **Dezavantajları:**
- 30 gün sonra expire olur (yenilemen gerekir)
- Hesap bilgileri credential olduğu için riskli
- Başka cihazda oturum açarsan değişir

### Önerimiz

**Başlangıç için:** Session ID olmadan başla (anonim mod). Yeterli.
**İleri seviye:** AI'ın otomatik TikTok'a yorum yazmasını istiyorsan session ID al.

---

## 🚀 Otomatik Session ID Alma (Tarayıcı Eklentisi)

### Yöntem 1: Cookie Editor Extension (En Kolay)

1. **Tarayıcıya eklenti yükle:**
   - Chrome: [Cookie-Editor](https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm)
   - Firefox: [Cookie Editor](https://addons.mozilla.org/en-US/firefox/addon/cookie-editor/)
   - Edge: [Cookie Editor](https://microsoftedge.microsoft.com/addons/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm)

2. **TikTok'a giriş yap:** https://www.tiktok.com

3. **Cookie Editor'ı aç:**
   - Tarayıcıda herhangi bir sayfadayken eklenti simgesine tıkla
   - TikTok.com'da olduğunu doğrula

4. **"sessionid" cookie'sini bul:**
   - Listede `sessionid` ara (Ctrl+F ile)
   - Üzerine tıkla

5. **Value değerini kopyala:**
   - `Value` alanındaki uzun string'i kopyala
   - Bu senin session ID'n!

6. **.env dosyasına yapıştır:**
   ```bash
   TIKTOK_SESSION_ID=kopyaladigin_deger_buraya
   ```

### Yöntem 2: Geliştirici Araçları (Eklenti Yok)

1. **TikTok'a giriş yap:** https://www.tiktok.com

2. **F12 bas** (Geliştirici araçlarını aç)

3. **Application sekmesine geç** (Chrome'da)
   - Firefox'ta: **Storage** sekmesi
   - Edge'de: **Application** sekmesi

4. **Sol menüden:**
   - **Cookies** > `https://www.tiktok.com` seç

5. **"sessionid" satırını bul:**
   - Cookie listesinde `sessionid` ara
   - Sağındaki `Value` değerini kopyala

6. **.env dosyasına yapıştır**

---

## 📱 Mobil Telefondan Session ID Alma

Mobilde Chrome/Safari'de geliştirici araçları olmadığı için farklı yöntemler gerekir.

### Yöntem A: Kiwi Browser (Android — Önerilen)

Kiwi Browser, Chrome tabanlı mobil tarayıcı **desktop eklentileri** destekler:

1. **Kiwi Browser yükle:** https://play.google.com/store/apps/details=com.kiwibrowser.browser

2. **Cookie Editor eklentisini yükle:**
   - Kiwi'de Chrome Web Store'u aç: https://chrome.google.com/webstore
   - "Cookie-Editor" ara ve yükle

3. **TikTok'a giriş yap:** https://www.tiktok.com

4. **Cookie Editor'ı aç:**
   - Üç nokta menü > Eklentiler > Cookie-Editor
   - `sessionid` ara, value'yu kopyala

### Yöntem B: Android Uzaktan Hata Ayıklama (İleri Seviye)

1. **Android'de USB hata ayıklama aç:**
   - Settings > Geliştirici seçenekleri > USB hata ayıklama

2. **Bilgisayara USB ile bağla**

3. **Bilgisayarda Chrome aç:**
   - Adres çubuğuna: `chrome://inspect/#devices`

4. **Telefonda TikTok'u aç**

5. **Bilgisayarda inspect et:**
   - Cihaz listesinde TikTok'un altındaki "Inspect" butonuna bas
   - Açılan pencerede Application > Cookies > sessionid

### Yöntem C: iOS (iPhone/iPad)

iOS'ta Safari'nin geliştirici araçlarını Mac ile kullanabilirsin:

1. **iPhone'da:** Settings > Safari > Gelişmiş > Web Denetçisi (aç)

2. **Mac'te:** Safari > Ayarlar > Gelişmiş > Menü çubuğunda Geliştir menüsünü göster

3. **iPhone'u Mac'e bağla (USB)**

4. **iPhone'da Safari ile TikTok'a git**

5. **Mac'te Safari > Geliştir menüsü > iPhone > TikTok**

6. **Storage > Cookies > sessionid** değerini kopyala

### Yöntem D: Daha Basit — Manuel Test

Session ID olmadan başla, sistemin çalıştığını gör. Daha sonra gerekirse al.

```python
# main.py'de TIKTOK_SESSION_ID boş bırakırsan anonim modda çalışır
TIKTOK_SESSION_ID=
```

---

## 🤖 Otomatik Session ID Alma Script'i

Daha gelişmiş bir yöntem: Selenium/Playwright ile TikTok'a otomatik giriş yap, session ID'yi çek. **Ancak:**

⚠️ **Riskler:**
- TikTok bot detection sistemi → hesap banı riski
- SMS doğrulaması gerekebilir (captcha)
- Bakımı zor (TikTok UI değiştirdiğinde bozulur)

Bu yüzden **otomatik script önerilmez**. Manuel yöntem (Cookie Editor) daha güvenli ve hızlı.

---

## 🔄 Session ID Yenileme

Session ID **30 gün sonra expire olur**. Yenilemek için:

1. Tarayıcıda TikTok'a yeniden giriş yap
2. Session ID'yi tekrar al (yukarıdaki yöntemlerle)
3. `.env` dosyasını güncelle:
   ```bash
   TIKTOK_SESSION_ID=yeni_session_id_buraya
   ```
4. Python backend'i yeniden başlat:
   ```bash
   ./start.sh --stop
   ./start.sh --full
   ```

---

## 🛡️ Güvenlik Notları

### Asla Yapma

- ❌ Session ID'yi başkasına verme
- ❌ Session ID'yi GitHub'a push etme (.env zaten gitignored)
- ❌ Session ID'yi Discord/Telegram grubuna yapıştırma
- ❌ Birden fazla cihazda aynı session ID kullanma

### Yap

- ✓ Session ID'yi sadece lokal .env'de tut
- ✓ 30 günde bir yenile
- ✓ Şüpheli aktivite görürsen TikTok şifresini değiştir (tüm session'lar düşer)
- ✓ Çocuk hesaplarından session ID alma (etik değil)

---

## ❓ Sık Sorulan Sorular

### "Session ID çalışmıyor"

1. **30 günden eski mi?** → Yenile
2. **Başka cihazda oturum açtın mı?** → Session değişir, yeniden al
3. **TikTokLive library güncel mi?**
   ```bash
   pip install --upgrade TikTokLive
   ```
4. **VPN kullanıyorsan kapat** — TikTok VPN algılarsa hesabı kilitler

### "Session ID'yi aldım ama backend hata veriyor"

Backend log'unda şu satırı görmelisin:
```
[TikTokLive] bağlandı: @yuki_xaivar
```

Eğer görmüyorsan:
1. Username doğru mu? (`yuki_xaivar` yazıldığı gibi)
2. Live yayını açık mı? (Live kapalıyken dinlenemez)
3. Hesap banlı mı? TikTok'ta manuel giriş yap, hesap çalışıyor mu kontrol et

### "Birden fazla hesap için session ID alabilir miyim?"

Evet, ama **aynı cihazdan değil**. TikTok cihaz ID takip eder, birden fazla hesap = spam şüphesi.

Birden fazla hesap için:
- Her hesap için farklı cihaz (telefon/bilgisayar)
- Farklı IP (mobil veri + WiFi)
- Farklı e-posta + telefon numarası

---

## ✅ Hızlı Özet

| Senaryon | Ne Yapmalısın |
|---|---|
| İlk başlangıç | Session ID alma, anonim modda başla |
| AI'ın TikTok'a yorum yazmasını istiyorsan | Cookie Editor ile al (5 dk) |
| Sadece mobilin var | Kiwi Browser yükle (Android) |
| iPhone kullanıyorsan | Mac ile Safari Web Inspector |
| Session ID çalışmıyor | 30 gün geçmiş, yenile |
| Banlanma korkun | Anonim modda kal, session ID kullanma |

---

**Sonraki adım:** Session ID aldığında `.env` dosyasına ekle ve Python backend'i çalıştır.
