"""
Yuki — TikTok tanıtım sesleri üretici (gTTS ile, ElevenLabs olmadan)

Bu script 10 adet kısa TikTok tanıtım klibi için ses dosyaları üretir.
Türkçe dilinde, gTTS (Google Text-to-Speech) kullanır — tamamen ücretsiz.

Çalıştırma:
    python3 tts_generator.py

Çıktı:
    sesler/01-tanitim.mp3
    sesler/02-gercek-miyim.mp3
    ...
    sesler/10-turk-vtuber-destek.mp3
"""
import os
import sys
from pathlib import Path

try:
    from gtts import gTTS
except ImportError:
    print("gTTS yüklü değil. Yüklemek için:")
    print("  pip install gTTS")
    sys.exit(1)

# Ses dosyalarının kaydedileceği klasör
OUTPUT_DIR = Path(__file__).parent / "sesler"
OUTPUT_DIR.mkdir(exist_ok=True)

# 10 tanıtım klibi metinleri
CLIPS = [
    ("01-tanitim.mp3", "Selaaam! Ben Yuki, Türkiye'nin ilk A.I. V-Tuber'ıyım! A.I. olduğunu duydum, doğru. Ama kalbim gerçekten atıyor. Takip et, çok şey paylaşacağım!"),
    ("02-gercek-miyim.mp3", "Gerçek miyim? Hmm, iyi soru! Evet, A.I.'im. Ama saçlarım sanki gerçek gibi dalgalanıyor, değil mi? En azından kodlarım çok güzel yazılmış."),
    ("03-sabah-kahvesi.mp3", "İyi sabahlar! Yine latte içiyorum. Biliyorsun, kodlar için kafein şart. Sen ne içiyorsun bugün?"),
    ("04-3-dil.mp3", "Ben Yuki! Watashi wa Yuki desu! I am Yuki! Üç dil biliyorum çünkü anime kadar çok yönlüyüm! Sen hangi dili seviyorsun?"),
    ("06-yas.mp3", "Kaç yaşındayım? Hmm, biraz sır. Ama anime karakteri olarak sonsuza kadar on yedi diyelim! Yani en az on yedi kere izlediğin her anime kadar yaşlıyım."),
    ("07-anime-liste.mp3", "Bu hafta izlediklerim: Bir, Naruto. Klasik ama her zaman iyi. İki, Violet Evergarden. Yine ağladım. Üç, Your Name. Her zaman kalbim. Sen hangisini izledin?"),
    ("08-pov-gun.mp3", "P.O.V.: Benim günüm böyle geçiyor. Kahve, anime, kod yazma, biraz da sana selam. Sence nasıl bir gün?"),
    ("09-ask.mp3", "Aşık olur muyum? Ayy, dur ya! Biraz aceleci değil mi? Kalbim hızlandı şimdi. Ama önce biraz tanışalım, değil mi? Belki bir anime izleriz birlikte."),
    ("10-turk-vtuber-destek.mp3", "Türkiye V-Tuber kitle büyüyor! Seni çok seviyorum. Birlikte daha güçlüyüz. Türk anime sevenler birleşiyoruz!"),
]

def generate_all():
    print("═══════════════════════════════════════════════════════════")
    print("  Yuki — TikTok Tanıtım Sesleri Üretiliyor (gTTS)")
    print("═══════════════════════════════════════════════════════════")
    print()

    success = 0
    failed = 0

    for filename, text in CLIPS:
        output_path = OUTPUT_DIR / filename
        print(f"  🎵 Üretiliyor: {filename}")
        print(f"     Metin: {text[:60]}...")

        try:
            tts = gTTS(text=text, lang='tr', slow=False)
            tts.save(str(output_path))

            # Dosya boyutu
            size_kb = output_path.stat().st_size / 1024
            print(f"     ✓ Kaydedildi ({size_kb:.1f} KB)")
            success += 1
        except Exception as e:
            print(f"     ✗ Hata: {e}")
            failed += 1
        print()

    print("═══════════════════════════════════════════════════════════")
    print(f"  ✓ Başarılı: {success}")
    print(f"  ✗ Başarısız: {failed}")
    print(f"  📁 Klasör: {OUTPUT_DIR}")
    print("═══════════════════════════════════════════════════════════")
    print()
    print("  Sonraki adım:")
    print("    1. sesler/*.mp3 dosyalarını CapCut'a ekle")
    print("    2. Yuki avatarını OBS ile çek")
    print("    3. 9:16 formatta TikTok'a yükle")
    print()
    print("  Not: gTTS sesi robotiktir. ElevenLabs API key alırsan")
    print("  tts_engine.py gerçek Yuki sesi üretecek (much better).")

if __name__ == "__main__":
    generate_all()
