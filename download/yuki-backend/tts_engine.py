"""
Yuki — Multi-Provider TTS Engine
Birden fazla TTS sağlayıcısını destekler, sırayla dener:

  1. Gemini TTS (gemini-2.5-flash-preview-tts) — ücretsiz, en kaliteli
     ⚠️ Bölgesel kısıtlı olabilir (bazı bölgelerde "User location is not supported" hatası)
  2. ElevenLabs (opsiyonel, ücretsiz tier 10k karakter/ay) — en kaliteli ama sınırlı
  3. gTTS (Google Translate TTS) — her zaman çalışır, ücretsiz, biraz robotik

Kullanım:
  engine = TTSEngine()  # otomatik en iyi sağlayıcıyı seçer
  wav_path = engine.synthesize("Merhaba!", mood="happy")
"""
import os
import logging
import tempfile
import wave
import hashlib
import re
from typing import Optional
from pathlib import Path

logger = logging.getLogger(__name__)

# Persona'dan mood ayarları (TTS için speed/style gerekli)
try:
    from persona import MOOD_SETTINGS
except ImportError:
    MOOD_SETTINGS = {}

# ============================================================================
# Mood → Gemini ses eşlemesi
# ============================================================================
MOOD_VOICE_MAP = {
    "happy":    "Aoede",
    "flirty":   "Leda",
    "shy":      "Aoede",
    "excited":  "Leda",
    "calm":     "Kore",
    "angry":    "Kore",
}

AVAILABLE_VOICES = ["Charon", "Fenrir", "Kore", "Puck", "Aoede", "Leda", "Orus", "Zephyr"]
TTS_MODEL = "gemini-2.5-flash-preview-tts"


# ============================================================================
# Emoji temizleme (gTTS için)
# ============================================================================
def strip_emoji(text: str) -> str:
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"
        "\U0001F300-\U0001F5FF"
        "\U0001F680-\U0001F6FF"
        "\U0001F1E0-\U0001F1FF"
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001f926-\U0001f937"
        "\U00010000-\U0010ffff"
        "\u2600-\u26FF"
        "\u2700-\u27BF"
        "\u23E9-\u23F3"
        "\u23F8-\u23FA"
        "]+",
        flags=re.UNICODE,
    )
    return emoji_pattern.sub('', text).strip()


# ============================================================================
# Sağlayıcı 1: Gemini TTS
# ============================================================================
class GeminiTTSProvider:
    """Gemini 2.5 Flash Preview TTS"""

    name = "Gemini"

    def __init__(self, api_key: str, cache_dir: Path):
        self.api_key = api_key
        self.cache_dir = cache_dir
        self.enabled = False
        self.client = None
        self._types = None

        try:
            from google import genai
            from google.genai import types
            self._types = types
            self.client = genai.Client(api_key=api_key)
            self.enabled = True
            logger.info("✓ Gemini TTS sağlayıcı aktif")
        except ImportError:
            logger.warning("google-genai yüklü değil: pip install google-genai")
        except Exception as e:
            logger.warning(f"Gemini TTS init hatası: {e}")

    def synthesize(self, text: str, mood: str = "happy") -> Optional[str]:
        if not self.enabled or not self.client:
            return None

        try:
            voice_name = MOOD_VOICE_MAP.get(mood, "Aoede")
            response = self.client.models.generate_content(
                model=TTS_MODEL,
                contents=text,
                config=self._types.GenerateContentConfig(
                    response_modalities=["AUDIO"],
                    speech_config=self._types.SpeechConfig(
                        voice_config=self._types.VoiceConfig(
                            prebuilt_voice_config=self._types.PrebuiltVoiceConfig(
                                voice_name=voice_name
                            )
                        )
                    ),
                ),
            )

            audio_data = self._extract_audio(response)
            if not audio_data:
                return None

            cache_path = self._cache_path(text, voice_name, "wav")
            self._pcm_to_wav(audio_data, str(cache_path))
            return str(cache_path)

        except Exception as e:
            err = str(e)
            if "location is not supported" in err:
                logger.warning("⚠️ Gemini TTS bu bölgede desteklenmiyor — gTTS kullanılacak")
                self.enabled = False
            elif "429" in err or "quota" in err.lower():
                logger.warning("⚠️ Gemini TTS quota aşıldı — gTTS kullanılacak")
            else:
                logger.error(f"Gemini TTS hatası: {err[:200]}")
            return None

    def _extract_audio(self, response) -> Optional[bytes]:
        try:
            if hasattr(response, 'candidates') and response.candidates:
                for candidate in response.candidates:
                    if hasattr(candidate, 'content') and candidate.content:
                        for part in candidate.content.parts:
                            if hasattr(part, 'inline_data') and part.inline_data:
                                data = part.inline_data.data
                                if isinstance(data, bytes) and len(data) > 0:
                                    return data
            return None
        except Exception:
            return None

    def _pcm_to_wav(self, pcm_data: bytes, output_path: str):
        with wave.open(output_path, 'wb') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(24000)
            wav_file.writeframes(pcm_data)

    def _cache_path(self, text: str, voice: str, ext: str) -> Path:
        key = hashlib.md5(f"{text}_{voice}".encode()).hexdigest()
        return self.cache_dir / f"{key}.{ext}"


# ============================================================================
# Sağlayıcı 2: gTTS (Google Translate TTS) — her zaman çalışır
# ============================================================================
class GttsProvider:
    """gTTS — her zaman çalışır, ücretsiz, biraz robotik"""

    name = "gTTS"

    def __init__(self, cache_dir: Path):
        self.cache_dir = cache_dir
        self.enabled = False
        try:
            from gtts import gTTS
            self._gTTS = gTTS
            self.enabled = True
            logger.info("✓ gTTS sağlayıcı aktif (fallback)")
        except ImportError:
            logger.warning("gTTS yüklü değil: pip install gTTS")

    def synthesize(self, text: str, mood: str = "happy") -> Optional[str]:
        if not self.enabled:
            return None
        try:
            clean_text = strip_emoji(text)
            if not clean_text:
                return None
            cache_path = self._cache_path(clean_text, mood)
            if cache_path.exists():
                logger.debug(f"gTTS önbellek hit: {cache_path}")
                return str(cache_path)

            slow = (mood == 'calm')
            tts = self._gTTS(text=clean_text, lang='tr', slow=slow)
            tts.save(str(cache_path))
            return str(cache_path)
        except Exception as e:
            logger.error(f"gTTS hatası: {e}")
            return None

    def _cache_path(self, text: str, mood: str) -> Path:
        key = hashlib.md5(f"{text}_{mood}_gtts".encode()).hexdigest()
        return self.cache_dir / f"{key}.mp3"


# ============================================================================
# Sağlayıcı 3: ElevenLabs (opsiyonel)
# ============================================================================
class ElevenLabsProvider:
    """ElevenLabs — en kaliteli ama ücretsiz tier 10k karakter/ay limitli"""

    name = "ElevenLabs"

    def __init__(self, api_key: str, voice_id: str, cache_dir: Path):
        self.api_key = api_key
        self.voice_id = voice_id
        self.cache_dir = cache_dir
        self.enabled = False
        self.client = None
        self._VoiceSettings = None

        if api_key and voice_id:
            try:
                from elevenlabs import ElevenLabs, VoiceSettings
                self._VoiceSettings = VoiceSettings
                self.client = ElevenLabs(api_key=api_key)
                self.enabled = True
                logger.info("✓ ElevenLabs sağlayıcı aktif (premium)")
            except Exception as e:
                logger.warning(f"ElevenLabs init hatası: {e}")

    def synthesize(self, text: str, mood: str = "happy") -> Optional[str]:
        if not self.enabled or not self.client:
            return None

        try:
            mood_cfg = MOOD_SETTINGS.get(mood, {})
            cache_path = self._cache_path(text, mood)
            if cache_path.exists():
                return str(cache_path)

            audio = self.client.text_to_speech.convert(
                voice_id=self.voice_id,
                text=text,
                model_id="eleven_turbo_v2_5",
                voice_settings=self._VoiceSettings(
                    stability=mood_cfg.get("stability", 0.5),
                    similarity_boost=mood_cfg.get("similarity_boost", 0.75),
                    style=mood_cfg.get("style", 0.3),
                    use_speaker_boost=True,
                ),
                output_format="mp3_44100_128",
            )

            with open(cache_path, 'wb') as f:
                for chunk in audio:
                    f.write(chunk)
            return str(cache_path)

        except Exception as e:
            logger.error(f"ElevenLabs hatası: {e}")
            return None

    def _cache_path(self, text: str, mood: str) -> Path:
        key = hashlib.md5(f"{text}_{mood}_11labs".encode()).hexdigest()
        return self.cache_dir / f"{key}.mp3"


# ============================================================================
# Ana TTSEngine — multi-provider, otomatik fallback
# ============================================================================
class TTSEngine:
    """Multi-provider TTS engine.

    Öncelik sırası:
      1. Gemini TTS (en kaliteli, ücretsiz, bölgesel kısıtlı)
      2. ElevenLabs (premium, ücretsiz tier limitli)
      3. gTTS (her zaman çalışır, ücretsiz, biraz robotik)
    """

    def __init__(self):
        self.cache_dir = Path(tempfile.gettempdir()) / "yuki_tts"
        self.cache_dir.mkdir(parents=True, exist_ok=True)

        self.providers = []

        # 1. Gemini TTS
        gemini_key = os.getenv("GEMINI_API_KEY", "")
        if gemini_key:
            gemini = GeminiTTSProvider(gemini_key, self.cache_dir)
            if gemini.enabled:
                self.providers.append(gemini)

        # 2. ElevenLabs (opsiyonel)
        eleven_key = os.getenv("ELEVENLABS_API_KEY", "")
        eleven_voice = os.getenv("ELEVENLABS_VOICE_ID", "")
        if eleven_key and eleven_voice:
            eleven = ElevenLabsProvider(eleven_key, eleven_voice, self.cache_dir)
            if eleven.enabled:
                self.providers.append(eleven)

        # 3. gTTS (her zaman)
        gtts = GttsProvider(self.cache_dir)
        if gtts.enabled:
            self.providers.append(gtts)

        if not self.providers:
            logger.warning("⚠️ Hiç TTS sağlayıcı yok — ses üretilemez")
            self.enabled = False
        else:
            self.enabled = True
            names = [p.name for p in self.providers]
            logger.info(f"🔊 TTS Engine hazır — sağlayıcılar: {' → '.join(names)}")

    def synthesize(self, text: str, mood: str = "happy") -> Optional[str]:
        """Metni sese çevir. Sağlayıcıları sırayla dener, ilk başarılı olanı döndürür."""
        if not self.enabled or not text or not text.strip():
            return None

        for provider in self.providers:
            # Eğer provider disabled olduysa atla (Gemini location hatası gibi)
            if hasattr(provider, 'enabled') and not provider.enabled:
                continue
            try:
                result = provider.synthesize(text, mood)
                if result:
                    logger.info(f"🔊 TTS üretildi ({provider.name}): {result}")
                    return result
            except Exception as e:
                logger.warning(f"{provider.name} hatası: {e}, sonraki sağlayıcıya geçiliyor")
                continue

        logger.error(f"Tüm TTS sağlayıcıları başarısız: '{text[:50]}...'")
        return None

    def list_available_voices(self) -> list:
        return AVAILABLE_VOICES.copy()

    def cleanup_old(self, max_age_hours: int = 24):
        """Eski önbellek dosyalarını temizle"""
        import time
        now = time.time()
        for f in self.cache_dir.iterdir():
            if f.is_file():
                age_hours = (now - f.stat().st_mtime) / 3600
                if age_hours > max_age_hours:
                    f.unlink()
                    logger.debug(f"Eski TTS silindi: {f.name}")


# ============================================================================
# Test
# ============================================================================
if __name__ == "__main__":
    import sys

    logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s', datefmt='%H:%M:%S')

    try:
        from dotenv import load_dotenv
        load_dotenv('/home/z/my-project/.env')
    except ImportError:
        pass

    print("╔═══════════════════════════════════════════════════════════╗")
    print("║  Multi-Provider TTS Engine Test                          ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print()

    tts = TTSEngine()

    if not tts.enabled:
        print("✗ Hiç TTS sağlayıcı enable edilemedi!")
        sys.exit(1)

    test_cases = [
        ("Selaaam ahmet! Hoş geldin canım, nasılsın?", "happy"),
        ("Ayy dur ya, kalbim hızlandı! Ama önce tanışalim", "flirty"),
        ("Aaa çok teşekkür ederim, utandim simdi", "shy"),
        ("ASLAN! Sen deli misin? Çok pahali!", "excited"),
        ("Geçmiş olsun, sana hikaye anlatayim mi?", "calm"),
    ]

    for i, (text, mood) in enumerate(test_cases, 1):
        print(f"Test {i}: [{mood}] {text[:50]}...")
        wav_path = tts.synthesize(text, mood)
        if wav_path:
            size_kb = os.path.getsize(wav_path) / 1024
            print(f"  ✓ Üretildi ({size_kb:.1f} KB): {wav_path}")
        else:
            print(f"  ✗ Üretilemedi")
        print()

    print("═══════════════════════════════════════════════════════════")
    print("  Test tamamlandı!")
    print("═══════════════════════════════════════════════════════════")
