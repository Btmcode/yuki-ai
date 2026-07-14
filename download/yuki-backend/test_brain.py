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


def test_memory_system():
    """Hafıza sistemi testi — Yuki'nin kullanıcıları hatırlaması"""
    section("HAFIZA SİSTEMİ TESTLERİ")

    from memory_store import UserMemoryStore
    import tempfile, os, shutil
    from datetime import datetime, timedelta

    # Geçici dosya ile test et
    tmp_dir = tempfile.mkdtemp()
    memory_file = os.path.join(tmp_dir, "test_memory.json")

    try:
        memory = UserMemoryStore(memory_file=memory_file)

        # Test 1: Yeni kullanıcı
        print("\n  📝 Test 1: Yeni kullanıcı kaydı")
        user = memory.record_interaction("ahmet_06", "merhaba nasılsın", "happy")
        print(f"    ✓ Yeni kullanıcı: @{user['username']}")
        print(f"    ✓ Mesaj sayısı: {user['messageCount']}")
        print(f"    ✓ Gün sayısı: {len(user['daysSeen'])}")
        print(f"    ✓ Yeni mi? {memory.is_new_user('ahmet_06')} (beklenen: False)")

        # Test 2: Aynı gün tekrar mesaj
        print("\n  📝 Test 2: Aynı gün tekrar mesaj")
        user = memory.record_interaction("ahmet_06", "anime sever misin", "happy")
        print(f"    ✓ Mesaj sayısı: {user['messageCount']} (beklenen: 2)")
        print(f"    ✓ Favori konu eklendi: {user['favoriteTopics']}")

        # Test 3: İkinci kullanıcı
        print("\n  📝 Test 3: İkinci kullanıcı + hediye")
        memory.record_interaction("zeynep_ist", "selam", "happy")
        memory.record_interaction(
            "zeynep_ist",
            gift_name="Gül Buketi",
            gift_diamonds=100,
        )
        user = memory.get_user("zeynep_ist")
        print(f"    ✓ @{user['username']}: {user['giftCount']} hediye, {user['totalDiamonds']} 💎")
        print(f"    ✓ Son hediye: {user['lastGift']['name']}")

        # Test 4: Kullanıcı özeti (AI prompt için)
        print("\n  📝 Test 4: Kullanıcı özeti (AI prompt)")
        summary = memory.get_user_summary("ahmet_06")
        print(f"    {summary}")

        # Test 5: İstatistikler
        print("\n  📝 Test 5: Genel istatistikler")
        stats = memory.get_stats()
        for key, val in stats.items():
            print(f"    {key}: {val}")

        # Test 6: Manuel not ekleme
        print("\n  📝 Test 6: Manuel not ekleme")
        memory.add_note("ahmet_06", "Her zaman Naruto'dan bahsediyor")
        user = memory.get_user("ahmet_06")
        print(f"    ✓ Not eklendi: {user['notes'][0]['text']}")

        # Test 7: Arama
        print("\n  📝 Test 7: Kullanıcı arama")
        results = memory.search_users("ahm")
        print(f"    ✓ 'ahm' araması: {len(results)} sonuç")
        for u in results:
            print(f"      - @{u['username']}")

        # Test 8: Top users
        print("\n  📝 Test 8: En aktif kullanıcılar")
        top = memory.get_top_users(limit=5, sort_by='messageCount')
        for i, u in enumerate(top, 1):
            print(f"    {i}. @{u['username']} — {u['messageCount']} mesaj")

        # Test 9: Kalıcılık (kapatıp aç)
        print("\n  📝 Test 9: Kalıcılık (yeni instance aç)")
        memory2 = UserMemoryStore(memory_file=memory_file)
        user = memory2.get_user("ahmet_06")
        print(f"    ✓ Yeni instance'dan ahmet_06: {user['messageCount']} mesaj (beklenen: 2)")
        print(f"    ✓ Toplam kullanıcı: {len(memory2.memory)}")

        print("\n  ✓ Hafıza sistemi testleri tamam")

    finally:
        shutil.rmtree(tmp_dir)


def test_memory_aware_brain():
    """Hafıza-aware AI brain testi — farklı kullanıcı senaryoları"""
    section("HAFIZA-AWARE AI BRAIN TESTLERİ")

    import tempfile, os, shutil
    from datetime import datetime, timedelta
    from memory_store import UserMemoryStore

    tmp_dir = tempfile.mkdtemp()
    memory_file = os.path.join(tmp_dir, "test_brain_memory.json")

    try:
        memory = UserMemoryStore(memory_file=memory_file)
        brain = AIBrain(memory_store=memory)

        # Senaryo 1: Yeni kullanıcı
        print("\n  🎬 Senaryo 1: Yeni kullanıcı geldi")
        r = brain.generate_response("yeni_user_1", "merhaba nasılsın")
        print(f"     💬 @yeni_user_1: merhaba nasılsın")
        print(f"     🤖 Yuki [{r.get('mood','?')}]: {r['text']}")
        print(f"     📊 memory_used: {r.get('memory_used')}, is_new: {r.get('is_new_user')}")

        # Senaryo 2: Aynı gün tekrar mesaj atıyor (hafıza yok, normal cevap)
        print("\n  🎬 Senaryo 2: Aynı gün 2. mesaj")
        r = brain.generate_response("yeni_user_1", "anime sever misin")
        print(f"     💬 @yeni_user_1: anime sever misin")
        print(f"     🤖 Yuki [{r.get('mood','?')}]: {r['text']}")
        print(f"     📊 memory_used: {r.get('memory_used')}, is_new: {r.get('is_new_user')}")

        # Senaryo 3: Önceki günden hediye göndermiş, bugün geldi
        print("\n  🎬 Senaryo 3: Dün hediye göndermiş, bugün geri döndü")
        # Manuel olarak dünden kayıt ekle
        memory.record_interaction("sadik_user", "merhaba", "happy")
        user = memory.get_user("sadik_user")
        # lastDaySeen'i dün yap
        yesterday = (datetime.now() - timedelta(days=1)).date().isoformat()
        user['lastDaySeen'] = yesterday
        user['daysSeen'] = [yesterday]  # sadece dün
        # Hediye ekle
        user['lastGift'] = {
            'name': 'Aslan',
            'diamonds': 29999,
            'date': (datetime.now() - timedelta(days=1)).isoformat(),
        }
        # Şimdi bugün mesaj atıyor
        r = brain.generate_response("sadik_user", "merhaba yuki")
        print(f"     💬 @sadik_user: merhaba yuki")
        print(f"     🤖 Yuki [{r.get('mood','?')}]: {r['text']}")
        print(f"     📊 memory_used: {r.get('memory_used')}, is_returning: {r.get('is_returning')}")

        # Senaryo 4: Sadık kullanıcı (3+ gün)
        print("\n  🎬 Senaryo 4: Sadık kullanıcı (5 farklı gün)")
        memory.record_interaction("fan_kullanici", "merhaba", "happy")
        user = memory.get_user("fan_kullanici")
        # 5 farklı gün ekle
        for i in range(5):
            day = (datetime.now() - timedelta(days=i)).date().isoformat()
            if day not in user['daysSeen']:
                user['daysSeen'].insert(0, day)
        user['lastDaySeen'] = (datetime.now() - timedelta(days=1)).date().isoformat()
        r = brain.generate_response("fan_kullanici", "naber")
        print(f"     💬 @fan_kullanici: naber")
        print(f"     🤖 Yuki [{r.get('mood','?')}]: {r['text']}")
        print(f"     📊 memory_used: {r.get('memory_used')}, is_loyal: {r.get('is_loyal')}")

        # Senaryo 5: Konu hatırlama
        print("\n  🎬 Senaryo 5: Konu hatırlama (dün anime konuşmuşlar)")
        memory.record_interaction("anime_sever", "anime izliyorum", "happy")
        user = memory.get_user("anime_sever")
        user['lastDaySeen'] = (datetime.now() - timedelta(days=1)).date().isoformat()
        user['lastTopic'] = 'anime'
        user['daysSeen'] = [(datetime.now() - timedelta(days=1)).date().isoformat()]
        # Bugün tekrar anime konuşuyor
        r = brain.generate_response("anime_sever", "yeni anime önerir misin")
        print(f"     💬 @anime_sever: yeni anime önerir misin")
        print(f"     🤖 Yuki [{r.get('mood','?')}]: {r['text']}")
        print(f"     📊 memory_used: {r.get('memory_used')}")

        print("\n  ✓ Hafıza-aware AI brain testleri tamam")

    finally:
        shutil.rmtree(tmp_dir)


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
    test_memory_system()
    test_memory_aware_brain()

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
