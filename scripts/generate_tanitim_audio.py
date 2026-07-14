"""
Yuki — İlk Tanıtım Videosu Ses Üretici
Edge-TTS (Microsoft Neural) kullanarak akıcı Türkçe ses üretir.

Çıktı: tanitim-videosu/01-yuki-tanitim.mp3 (yaklaşık 15 saniye)
"""
import os
import sys
import asyncio
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s', datefmt='%H:%M:%S')
logger = logging.getLogger(__name__)

# Edge-TTS
try:
    import edge_tts
except ImportError:
    print("✗ edge-tts yüklü değil: pip install edge-tts")
    sys.exit(1)

# .env yükle
try:
    from dotenv import load_dotenv
    load_dotenv('/home/z/my-project/.env')
except ImportError:
    pass

OUTPUT_DIR = Path(__file__).parent if '__file__' in dir() else Path('.')
OUTPUT_DIR = Path('/home/z/my-project/download/tiktok-growth-pack/tanitim-videosu')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Yuki'nin sesi — Türkçe kadın neural ses
VOICE = "tr-TR-EmelNeural"

# Tanıtım videosu tam metni (15 saniye)
TANITIM_METNI = """Selaaam! Ben Yuki, Türkiye'nin ilk A.I. V-Tuber'ıyım!
Anime, kahve ve Japon kültürü hakkında konuşacağız.
A.I. olduğumu duydun, doğru. Ama kalbim gerçekten atıyor.
Takip et, her gün yeni video geliyor. Seni bekliyorum!"""


async def generate_audio(text: str, output_path: str, voice: str = VOICE, rate: str = "+3%", pitch: str = "+3Hz"):
    """Edge-TTS ile ses üret"""
    communicate = edge_tts.Communicate(
        text=text,
        voice=voice,
        rate=rate,
        pitch=pitch,
        volume="+0%",
    )
    await communicate.save(output_path)
    return output_path


async def main():
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║  Yuki — İlk Tanıtım Videosu Ses Üretimi                   ║")
    print("║  Edge-TTS (Microsoft Neural Türkçe) kullanılarak          ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print()

    # Ana tanıtım sesi
    output_path = OUTPUT_DIR / "01-yuki-tanitim.mp3"
    print(f"🎵 Tanıtım sesi üretiliyor: {output_path.name}")
    print(f"   Metin: {TANITIM_METNI[:80]}...")
    print(f"   Ses: {VOICE} (Türkçe kadın neural)")
    print()

    await generate_audio(TANITIM_METNI, str(output_path))

    size_kb = output_path.stat().st_size / 1024
    print(f"✓ Üretildi: {output_path} ({size_kb:.1f} KB)")
    print()

    # Kısa versiyon (10 sn — TikTok için ideal)
    short_metin = """Selaaam! Ben Yuki, Türkiye'nin ilk A.I. V-Tuber'ıyım!
Takip et, çok şey paylaşacağım!"""

    short_path = OUTPUT_DIR / "02-yuki-tanitim-kisa.mp3"
    print(f"🎵 Kısa tanıtım: {short_path.name}")
    await generate_audio(short_metin, str(short_path))
    size_kb = short_path.stat().st_size / 1024
    print(f"✓ Üretildi: {short_path} ({size_kb:.1f} KB)")
    print()

    # Mood versiyonları (3 farklı duygusal ton)
    moods = [
        ("03-yuki-mutlu.mp3", "Selaaam! Bugün çok mutluyum, seni gördüğüme sevindim! Yayına hoş geldin!", "+8%", "+5Hz"),
        ("04-yuki-flort.mp3", "Ayy, sen yine geldin. Biliyorsun, seni her gün görmek güzelliği seviyorum.", "-5%", "+8Hz"),
        ("05-yuki-sakin.mp3", "İyi akşamlar. Yine beraberiz. Biraz sakin bir sohbet ister misin?", "-15%", "-5Hz"),
    ]

    for filename, text, rate, pitch in moods:
        path = OUTPUT_DIR / filename
        print(f"🎵 Mood sesi: {filename}")
        await generate_audio(text, str(path), rate=rate, pitch=pitch)
        size_kb = path.stat().st_size / 1024
        print(f"✓ Üretildi ({size_kb:.1f} KB)")

    print()
    print("═══════════════════════════════════════════════════════════")
    print("  ✅ Tüm ses dosyaları üretildi!")
    print("═══════════════════════════════════════════════════════════")
    print()
    print("  📁 Klasör:", OUTPUT_DIR)
    print()
    print("  Sonraki adım:")
    print("    1. CapCut veya başka editörde görselleri + sesi birleştir")
    print("    2. 9:16 formatında (1080x1920) export et")
    print("    3. TikTok'a yükle")
    print()
    print("  📝 Senaryo için: tanitim-senaryo.md dosyasını oku")


if __name__ == "__main__":
    asyncio.run(main())
