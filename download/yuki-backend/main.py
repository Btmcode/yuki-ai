"""
Yuki — Ana Orchestration
Tüm bileşenleri birbirine bağlar:
1. TikTok Live dinleyici (gerçek yorum/hediye)
2. AI Brain (Gemini ile cevap üretimi)
3. TTS Engine (ElevenLabs ile ses)
4. OBS Controller (avatar + ses çalma)
5. Bridge Client (Next.js panel ile iletişim)
"""
import os
import sys
import asyncio
import logging
import threading
import time
from dotenv import load_dotenv

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("yuki.main")

# Load env
load_dotenv()

from ai_brain import AIBrain
from tts_engine import TTSEngine
from obs_controller import OBSController
from tiktok_listener import TikTokListener, TIKTOK_AVAILABLE
from bridge_client import BridgeClient


class YukiOrchestrator:
    def __init__(self):
        self.brain = AIBrain()
        self.tts = TTSEngine()
        self.obs = OBSController()
        self.tiktok = None
        self.bridge = None
        self.running = False
        self.autonomy_mode = "semi"  # manual | semi | full
        self.emergency_stopped = False

    async def handle_comment(self, username: str, content: str):
        """TikTok yorumu geldi"""
        logger.info(f"💬 @{username}: {content}")

        # Bridge'e ilet (dashboard görsün)
        if self.bridge and self.bridge.connected:
            self.bridge.emit_comment(username, content)

        # AI cevap üret
        ai_result = self.brain.generate_response(username, content)
        logger.info(f"🤖 Yuki: {ai_result['text']} (mood: {ai_result['mood']})")

        # Mode'a göre davran
        if self.autonomy_mode == "full" and not self.emergency_stopped:
            # Tam otonom — hemen TTS üret ve çal
            self._speak(ai_result["text"], ai_result["mood"])
        elif self.autonomy_mode == "semi":
            # Yarı otonom — bridge'e pending olarak gönder, onay bekle
            # Bridge zaten onay mekanizmasını yönetiyor
            # Onay geldiğinde _handle_ai_approved çağrılacak
            pass
        # Manual modda sadece göster, çalma

    async def handle_gift(self, username: str, gift_name: str, gift_count: int, diamond_count: int):
        """TikTok hediyesi geldi"""
        logger.info(f"🎁 @{username} → {gift_name} x{gift_count} ({diamond_count} 💎)")

        # Bridge'e ilet
        if self.bridge and self.bridge.connected:
            self.bridge.emit_gift(username, gift_name, gift_count, diamond_count)

        # Hediye için teşekkür mesajı üret
        if self.autonomy_mode in ("semi", "full") and not self.emergency_stopped:
            thanks_msg = self.brain.generate_response(
                username,
                f"hediye gönderdin {gift_name}",
                mood_hint="excited",
            )
            logger.info(f"🤖 Teşekkür: {thanks_msg['text']}")

            if self.autonomy_mode == "full":
                self._speak(thanks_msg["text"], thanks_msg["mood"])

    async def handle_viewer_count(self, count: int):
        """İzleyici sayısı güncellendi"""
        if self.bridge and self.bridge.connected:
            self.bridge.emit_viewer_count(count)

    def _speak(self, text: str, mood: str):
        """TTS üret + OBS ile çal"""
        audio_path = self.tts.synthesize(text, mood)
        if audio_path and self.obs:
            # Süre tahmini (hızlı ve kabaca): 15 karakter/saniye
            duration = max(1.5, min(15, len(text) / 15))
            self.obs.speak(audio_path, lip_sync_duration=duration)

    # === Bridge event handler'ları ===

    def handle_ai_approved(self, data):
        """Web panelden AI cevabı onaylandı"""
        text = data.get("text", "")
        mood = data.get("mood", "happy")
        logger.info(f"✅ Onaylandı — konuşuyor: {text[:50]}")
        if not self.emergency_stopped:
            self._speak(text, mood)

    def handle_ai_rejected(self, data):
        """Web panelden AI cevabı reddedildi"""
        logger.info(f"❌ Reddedildi: {data}")

    def handle_stream_start(self, data):
        """Web panelden yayın başlatma isteği"""
        logger.info(f"▶️ Yayın başlatılıyor: {data}")
        if self.obs:
            self.obs.start_streaming()
        # TikTok dinleyiciyi başlat
        if self.tiktok:
            threading.Thread(
                target=lambda: asyncio.run(self.tiktok.start()),
                daemon=True,
            ).start()

    def handle_stream_stop(self):
        """Web panelden yayın durdurma isteği"""
        logger.info("⏹️ Yayın durduruluyor")
        if self.tiktok:
            self.tiktok.stop()
        if self.obs:
            self.obs.stop_streaming()

    def handle_emergency_stop(self):
        """Acil stop"""
        logger.warning("🚨 ACİL STOP — her şey durduruluyor")
        self.emergency_stopped = True
        if self.tiktok:
            self.tiktok.stop()
        if self.obs:
            self.obs.stop_streaming()

    def handle_mode_change(self, data):
        """Otonomi modu değişti"""
        self.autonomy_mode = data.get("mode", "semi")
        logger.info(f"⚙️ Mod: {self.autonomy_mode}")
        # Acil stop resetleniyor mod değişince
        if self.autonomy_mode != "manual":
            self.emergency_stopped = False

    def handle_mood_change(self, data):
        """Mood değişti"""
        mood = data.get("mood", "happy")
        logger.info(f"🎭 Mood: {mood}")

    # === Başlatma ===

    def start(self):
        """Tüm sistemi başlat"""
        logger.info("═" * 60)
        logger.info("  Yuki AI — Backend Başlatılıyor")
        logger.info("═" * 60)

        # Bridge client
        self.bridge = BridgeClient(
            url=os.getenv("BRIDGE_URL", "http://localhost:3003"),
            on_ai_approved=self.handle_ai_approved,
            on_ai_rejected=self.handle_ai_rejected,
            on_stream_start=self.handle_stream_start,
            on_stream_stop=self.handle_stream_stop,
            on_emergency_stop=self.handle_emergency_stop,
            on_mode_change=self.handle_mode_change,
            on_mood_change=self.handle_mood_change,
        )

        # Bridge'e bağlan (background thread)
        if not self.bridge.connect_async():
            logger.error("Bridge'e bağlanılamadı — panel çalışıyor mu?")
            logger.error("Önce: cd mini-services/tiktok-bridge && bun run dev")
            sys.exit(1)

        # TikTok dinleyici (eğer yüklüyse)
        tiktok_user = os.getenv("TIKTOK_USERNAME", "yuki_ai")
        self.tiktok = TikTokListener(
            username=tiktok_user,
            on_comment=self.handle_comment,
            on_gift=self.handle_gift,
            on_viewer=self.handle_viewer_count,
        )

        logger.info("✓ Tüm bileşenler hazır")
        logger.info("  - AI Brain: " + ("✓" if self.brain.enabled else "✗ (simülasyon)"))
        logger.info("  - TTS: " + ("✓" if self.tts.enabled else "✗ (pasif)"))
        logger.info("  - OBS: " + ("✓" if self.obs.enabled else "✗ (pasif)"))
        logger.info("  - TikTok: " + ("✓" if TIKTOK_AVAILABLE else "✗ (pasif)"))
        logger.info("")
        logger.info("Web paneli açın ve 'Yayını Başlat' tuşuna basın.")
        logger.info("═" * 60)

        # Ana döngü — bridge event'lerini dinle
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("Kapatılıyor...")
            self.handle_stream_stop()
            if self.bridge:
                self.bridge.disconnect()


if __name__ == "__main__":
    orchestrator = YukiOrchestrator()
    orchestrator.start()
