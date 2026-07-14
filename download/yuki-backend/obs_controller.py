"""
Yuki — OBS Controller
OBS Studio'ya WebSocket ile bağlanıp:
- TTS sesini çalar (Media source)
- Avatar lip-sync animasyonunu tetikler (VTube Studio source visible/hidden toggle)
"""
import os
import logging
import threading
import time
from typing import Optional

try:
    import obsws_python as obs
    OBS_AVAILABLE = True
except ImportError:
    OBS_AVAILABLE = False

logger = logging.getLogger(__name__)


class OBSController:
    def __init__(self):
        self.host = os.getenv("OBS_HOST", "localhost")
        self.port = int(os.getenv("OBS_PORT", "4455"))
        self.password = os.getenv("OBS_PASSWORD", "")
        self.enabled = OBS_AVAILABLE and bool(self.password)

        self.client = None
        self._connect_lock = threading.Lock()

        if not OBS_AVAILABLE:
            logger.warning("obsws-python yüklü değil — OBS kontrol pasif")
            return

        if self.enabled:
            self.connect()

    def connect(self):
        """OBS WebSocket'e bağlan"""
        if not OBS_AVAILABLE:
            return False
        try:
            with self._connect_lock:
                self.client = obs.ReqClient(
                    host=self.host,
                    port=self.port,
                    password=self.password,
                    timeout=5,
                )
            logger.info(f"OBS bağlantısı kuruldu ({self.host}:{self.port})")
            return True
        except Exception as e:
            logger.error(f"OBS bağlantı hatası: {e}")
            self.client = None
            return False

    def play_audio(self, audio_path: str):
        """Media source'a ses dosyası yükle ve çal"""
        if not self.client:
            logger.warning("OBS bağlı değil — ses çalınamadı")
            return False

        try:
            # "YukiVoice" adlı Media source olmalı
            self.client.set_source_settings(
                source_name="YukiVoice",
                settings={"local_file": audio_path, "is_local_file": True},
            )
            # Yeniden başlat
            self.client.press_media_button("YukiVoice", "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PLAY")
            logger.info(f"OBS: ses çalınıyor → {audio_path}")
            return True
        except Exception as e:
            logger.error(f"OBS ses hatası: {e}")
            return False

    def trigger_lip_sync(self, duration_sec: float = 3.0):
        """Avatar source'unu görünür yap (lip-sync animasyonunu tetiklemek için)"""
        if not self.client:
            return False
        try:
            # VTube Studio source'unu pulse efektiyle tetikle
            # "YukiAvatar" source olmalı
            self.client.set_source_filter_visibility("YukiAvatar", "LipSync", True)
            time.sleep(duration_sec)
            self.client.set_source_filter_visibility("YukiAvatar", "LipSync", False)
            return True
        except Exception as e:
            logger.error(f"OBS lip-sync hatası: {e}")
            return False

    def set_scene(self, scene_name: str):
        """Sahne değiştir"""
        if not self.client:
            return False
        try:
            self.client.set_current_program_scene(scene_name)
            logger.info(f"OBS: sahne → {scene_name}")
            return True
        except Exception as e:
            logger.error(f"OBS sahne hatası: {e}")
            return False

    def start_streaming(self):
        """TikTok'a yayın başlat (RTMP ile)"""
        if not self.client:
            return False
        try:
            self.client.start_stream()
            logger.info("OBS: yayın başlatıldı")
            return True
        except Exception as e:
            logger.error(f"OBS yayın başlatma hatası: {e}")
            return False

    def stop_streaming(self):
        """Yayını durdur"""
        if not self.client:
            return False
        try:
            self.client.stop_stream()
            logger.info("OBS: yayın durduruldu")
            return True
        except Exception as e:
            logger.error(f"OBS yayın durdurma hatası: {e}")
            return False

    def speak(self, audio_path: str, lip_sync_duration: float = 3.0):
        """TTS çal + lip-sync tetikle (paralel)"""
        # Ses çal
        self.play_audio(audio_path)
        # Lip-sync paralel tetikle
        if lip_sync_duration > 0:
            t = threading.Thread(
                target=self.trigger_lip_sync,
                args=(lip_sync_duration,),
                daemon=True,
            )
            t.start()
