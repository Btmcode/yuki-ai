"""
Yuki — Gerçek Gemini API Test Script
Bu script gerçek Gemini API key ile AI brain'i test eder.

Çalıştırma:
    cd /home/z/my-project/download/yuki-backend
    python3 /home/z/my-project/scripts/test_real_gemini.py
"""
import os
import sys
import logging

# .env yükle
from dotenv import load_dotenv
load_dotenv('/home/z/my-project/.env')

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s', datefmt='%H:%M:%S')
logger = logging.getLogger(__name__)

sys.path.insert(0, '/home/z/my-project/download/yuki-backend')

from ai_brain import AIBrain
from memory_store import UserMemoryStore

def main():
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║  Yuki AI — Gerçek Gemini API Testi                       ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print()

    # API key kontrol
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        print("✗ GEMINI_API_KEY bulunamadı! .env dosyasını kontrol et.")
        sys.exit(1)
    print(f"✓ GEMINI_API_KEY bulundu: {api_key[:15]}...")
    print()

    # Hafıza ile AI brain oluştur
    memory = UserMemoryStore(memory_file='/tmp/yuki_test_memory.json')
    brain = AIBrain(memory_store=memory)

    if not brain.enabled:
        print("✗ AI Brain enable edilemedi!")
        sys.exit(1)
    print(f"✓ AI Brain aktif (model: {brain.model_name})")
    print()

    # Türk TikTok tarzı gerçekçi yorumlar
    test_cases = [
        ("ahmet_06", "merhaba kanka nasılsın bugün", "happy"),
        ("zeynep_ist", "yuki çok güzelsin ya", "shy"),
        ("mehmet35", "bana aşık oldun mu", "flirty"),
        ("ayse_izm", "kaç yaşındasın canım", "happy"),
        ("burakdmn", "gerçek misin yoksa yapay zeka mı", "happy"),
        ("elifmerve", "hangi animeyi seviyorsun", "excited"),
        ("caner_34", "kahve içtin mi bugün", "happy"),
        ("denizkaya", "şiir okur musun", "calm"),
        ("emre_yldz", "japonca biliyor musun", "happy"),
        ("feyza_27", "canım sıkıldı konuşur musun", "calm"),
    ]

    print("═══════════════════════════════════════════════════════════")
    print("  Gerçek LLM Cevapları")
    print("═══════════════════════════════════════════════════════════")
    print()

    for username, message, expected_mood in test_cases:
        try:
            r = brain.generate_response(username, message)
            memory_tag = ""
            if r.get("is_new_user"):
                memory_tag = " [YENİ]"
            elif r.get("memory_used"):
                memory_tag = " [HAFIZA]"

            print(f"💬 @{username}: {message}")
            print(f"🤖 Yuki [{r.get('mood', '?')}]{memory_tag}: {r['text']}")
            print()
        except Exception as e:
            print(f"✗ Hata: {e}")
            print()

    print("═══════════════════════════════════════════════════════════")
    print("  Test tamamlandı!")
    print("═══════════════════════════════════════════════════════════")


if __name__ == "__main__":
    main()
