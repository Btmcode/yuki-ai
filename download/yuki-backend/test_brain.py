"""
Yuki — Test Script (API KEY GEREKMEZ)

Bu script, Gemini API key olmadan AI brain'i test etmeni sağlar.
Sadece fallback (simülasyon) modunu kullanır.

Çalıştırma:
    cd /home/z/my-project/download/yuki-backend
    python test_brain.py
"""
import os
import sys
import logging

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)

# .env yüklemeye çalış (yoksa sorun değil)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# GEMINI_API_KEY'i geçici olarak sil (test fallback modu için)
os.environ.pop("GEMINI_API_KEY", None)

from ai_brain import AIBrain
from persona import detect_mood, get_gift_reaction, get_welcome_message, is_spam


def section(title: str):
    print()
    print("═" * 60)
    print(f"  {title}")
    print("═" * 60)


def test_basic_responses():
    """Temel cevap testleri"""
    section("TEMEL CEVAP TESTLERİ")
    brain = AIBrain()

    test_cases = [
        ("ahmet_06", "merhaba kanka nasılsın"),
        ("zeynep_ist", "bugün çok güzelsin"),
        ("mehmet35", "hangi animeyi seviyorsun"),
        ("elifmerve", "bana aşık oldun mu"),
        ("caner_34", "kaç yaşındasın"),
        ("denizkaya", "gerçek misin yoksa AI mı"),
        ("emre_yldz", "bana hediye gönderdim görmedin mi"),
        ("feyza_27", "şiir okur musun"),
        ("gokhann", "türkiye hangi şehir"),
        ("hilal_tunc", "japonca biliyor musun"),
        ("ibrahim42", "canım sıkıldı konuşur musun"),
        ("keremdmn", "tiktokta ne kadar süre oldun"),
    ]

    for username, message in test_cases:
        result = brain.generate_response(username, message)
        mood_emoji = {"happy": "😊", "flirty": "😘", "shy": "🙈",
                      "excited": "🤩", "calm": "😌", "angry": "😠"}.get(result["mood"], "💬")
        print(f"\n  💬 @{username}: {message}")
        print(f"  🤖 Yuki {mood_emoji}: {result['text']}")


def test_mood_detection():
    """Mood tespiti testleri"""
    section("MOOD TESPİTİ TESTLERİ")

    test_cases = [
        ("bugün çok güzelsin", "shy"),
        ("bana aşık oldun mu", "flirty"),
        ("hediye gönderdim", "excited"),
        ("gece oldu, uyku tutmuyor", "calm"),
        ("çok kötü ve aptal bir şey", "angry"),
        ("merhaba nasılsın", "happy"),
        ("seni seviyorum bebeğim", "flirty"),
        ("süper harika muhteşem", "excited"),
    ]

    for message, expected in test_cases:
        actual = detect_mood(message)
        ok = "✓" if actual == expected else "✗"
        print(f"  {ok} '{message}' → {actual} (beklenen: {expected})")


def test_gift_reactions():
    """Hediye reaksiyon testleri"""
    section("HEDİYE REAKSİYON TESTLERİ")

    gifts = [
        ("Gül", "ahmet_06"),
        ("Buz Kreması", "zeynep_ist"),
        ("Perfume", "mehmet35"),
        ("Üçüncü Parmak Kalp", "elifmerve"),
        ("Gül Buketi", "caner_34"),
        ("Aslan", "denizkaya"),
        ("Krema", "emre_yldz"),
        ("Bilinmeyen Hediye", "feyza_27"),
    ]

    for gift_name, username in gifts:
        reaction = get_gift_reaction(gift_name, username)
        print(f"\n  🎁 {username} → {gift_name}")
        print(f"  🤖 Yuki: {reaction}")


def test_welcome_messages():
    """Hoş geldin mesajı testleri"""
    section("HOŞ GELDİN MESAJLARI")

    users = ["ahmet_06", "zeynep_ist", "mehmet35"]
    for username in users:
        welcome = get_welcome_message(username)
        print(f"  👋 {username}: {welcome}")


def test_spam_detection():
    """Spam tespiti testleri"""
    section("SPAM TESPİTİ TESTLERİ")

    test_cases = [
        ("merhaba nasılsın", False),
        ("https://example.com/spam", True),
        ("instagram.com/baska_kanal", True),
        ("selam kanka", False),
        ("@everyone bakın", True),
        ("bugün hava güzel", False),
    ]

    for message, expected in test_cases:
        actual = is_spam(message)
        ok = "✓" if actual == expected else "✗"
        print(f"  {ok} '{message}' → spam={actual} (beklenen: {expected})")


def test_persona():
    """Persona bilgisi testi"""
    section("KARAKTER PERSONA BİLGİSİ")

    from persona import PERSONA
    print(f"  İsim: {PERSONA['name']} ({PERSONA['name_jp']})")
    print(f"  Anlam: {PERSONA['name_meaning']}")
    print(f"  Yaş: {PERSONA['age']}")
    print(f"  Şehir: {PERSONA['origin']} → {PERSONA['current_city']}")
    print(f"  Meslek: {PERSONA['occupation']}")
    print(f"  Diller: {', '.join(PERSONA['languages'])}")
    print(f"  İlgi alanları: {', '.join(PERSONA['interests'])}")
    print(f"  Sevdiği anime: {', '.join(PERSONA['favorite_anime'])}")
    print(f"  Evcil hayvan: {PERSONA['pet']}")
    print(f"\n  Tuhaf özellikler:")
    for q in PERSONA['quirks']:
        print(f"    • {q}")


def test_mood_settings():
    """Mood ayarları testi"""
    section("MOOD TTS AYARLARI")

    from persona import MOOD_SETTINGS
    for mood, settings in MOOD_SETTINGS.items():
        print(f"  {mood:8} → speed: {settings['speed']}, style: {settings['style']}")
        print(f"           {settings['description']}")


def main():
    print("╔" + "═" * 58 + "╗")
    print("║" + "  Yuki AI — Brain Test Script (Simülasyon Modu)".center(58) + "║")
    print("║" + "  API KEY gerekmez — fallback modunu test eder".center(58) + "║")
    print("╚" + "═" * 58 + "╝")

    test_persona()
    test_mood_detection()
    test_spam_detection()
    test_basic_responses()
    test_gift_reactions()
    test_welcome_messages()
    test_mood_settings()

    section("TEST TAMAMLANDI")
    print("  ✓ Tüm testler çalıştırıldı")
    print()
    print("  Gerçek LLM (Gemini) testi için:")
    print("    1. .env dosyasına GEMINI_API_KEY ekleyin")
    print("    2. python test_brain.py tekrar çalıştırın")
    print()
    print("  Tam sistem testi için:")
    print("    1. Web panelini açın (http://localhost:81)")
    print("    2. Yayını Başlat'a basın")
    print("    3. Chat'ten test mesajı gönderin")


if __name__ == "__main__":
    main()
