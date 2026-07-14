"""
Yuki — TTS Engine (ElevenLabs)
AI cevabını sese çevirip OBS için ses dosyası üretir.
"""
import os
import logging
import tempfile
from typing import Optional
from elevenlabs import ElevenLabs, VoiceSettings

from persona import MOOD_SETTINGS

logger = logging.getLogger(__name__)


class TTSEngine:
    def __init__(self):
        self.api_key = os.getenv("ELEVENLABS_API_KEY", "")
        self.voice_id = os.getenv("ELEVENLABS_VOICE_ID", "")
        self.enabled = bool(self.api_key and self.voice_id)

        if self.enabled:
            self.client = ElevenLabs(api_key=self.api_key)
            logger.info(f"TTS Engine hazır (voice: {self.voice_id})")
        else:
            logger.warning("ELEVENLABS_API_KEY/VOICE_ID yok — TTS pasif")

        # Önbellek klasörü
        self.cache_dir = os.path.join(tempfile.gettempdir(), "yuki_tts")
        os.makedirs(self.cache_dir, exist_ok=True)

    def synthesize(self, text: str, mood: str = "happy") -> Optional[str]:
        """
        Metni sese çevir.
        Return: wav dosyası yolu veya None (hata/pasif durumda)
        """
        if not self.enabled:
            logger.debug("TTS pasif — ses üretilmedi")
            return None

        try:
            mood_cfg = MOOD_SETTINGS.get(mood, MOOD_SETTINGS["happy"])

            # Geçici dosyaya yaz
            file_path = os.path.join(
                self.cache_dir,
                f"tts_{hash(text) & 0xFFFFFFFF:x}.mp3"
            )

            # Eğer zaten varsa, önbellekten dön
            if os.path.exists(file_path):
                logger.debug(f"TTS önbellek hit: {file_path}")
                return file_path

            audio = self.client.text_to_speech.convert(
                voice_id=self.voice_id,
                text=text,
                model_id="eleven_turbo_v2_5",
                voice_settings=VoiceSettings(
                    stability=mood_cfg["stability"],
                    similarity_boost=mood_cfg["similarity_boost"],
                    style=mood_cfg["style"],
                    use_speaker_boost=True,
                ),
                output_format="mp3_44100_128",
            )

            with open(file_path, "wb") as f:
                for chunk in audio:
                    f.write(chunk)

            logger.info(f"TTS üretildi: {file_path} ({len(text)} karakter)")
            return file_path

        except Exception as e:
            logger.error(f"TTS hatası: {e}")
            return None

    def cleanup_old(self, max_age_hours: int = 24):
        """Eski önbellek dosyalarını temizle"""
        import time
        now = time.time()
        for fname in os.listdir(self.cache_dir):
            fpath = os.path.join(self.cache_dir, fname)
            if os.path.isfile(fpath):
                age_hours = (now - os.path.getmtime(fpath)) / 3600
                if age_hours > max_age_hours:
                    os.remove(fpath)
                    logger.debug(f"Eski TTS silindi: {fname}")
