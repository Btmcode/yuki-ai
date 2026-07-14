"""
Yuki — Bridge Client
Next.js mini-service (port 3003) ile WebSocket üzerinden iletişim kurar.
- TikTok olaylarını bridge'e iletir
- Bridge'den gelen AI onay/red olaylarını dinler
- Bridge'den gelen kontrol komutlarını uygular (start/stop, mode change, vb.)
"""
import os
import logging
import asyncio
from typing import Optional, Callable

# Socket.IO (varsa yükle)
try:
    import socketio
    SOCKETIO_AVAILABLE = True
except ImportError:
    SOCKETIO_AVAILABLE = False
    socketio = None
    logging.getLogger(__name__).warning(
        "python-socketio yüklü değil — bridge iletişimi çalışamaz. "
        "Yüklemek için: pip install python-socketio[client]"
    )

logger = logging.getLogger(__name__)


class BridgeClient:
    def __init__(
        self,
        url: str = "http://localhost:3003",
        on_ai_approved: Optional[Callable] = None,
        on_ai_rejected: Optional[Callable] = None,
        on_stream_start: Optional[Callable] = None,
        on_stream_stop: Optional[Callable] = None,
        on_emergency_stop: Optional[Callable] = None,
        on_mood_change: Optional[Callable] = None,
        on_mode_change: Optional[Callable] = None,
    ):
        self.url = url
        self.connected = False
        self.sio = None

        if not SOCKETIO_AVAILABLE:
            logger.error("socketio modülü yok — BridgeClient oluşturuldu ama kullanılamaz")
            return

        self.sio = socketio.Client(logger=False, engineio_logger=False)

        # Event handler'lar
        self.on_ai_approved = on_ai_approved
        self.on_ai_rejected = on_ai_rejected
        self.on_stream_start = on_stream_start
        self.on_stream_stop = on_stream_stop
        self.on_emergency_stop = on_emergency_stop
        self.on_mood_change = on_mood_change
        self.on_mode_change = on_mode_change

        if self.sio:
            self._register_handlers()

    def _register_handlers(self):
        @self.sio.event
        def connect():
            self.connected = True
            logger.info(f"Bridge'e bağlandı: {self.url}")
            # Backend olarak kaydol
            self.sio.emit("backend:register", {"role": "python-backend"})

        @self.sio.event
        def disconnect():
            self.connected = False
            logger.warning("Bridge bağlantısı koptu")

        @self.sio.on("ai:approved")
        def handle_ai_approved(data):
            """AI cevabı onaylandı — TTS üret + OBS çal"""
            logger.info(f"AI onaylandı: {data}")
            if self.on_ai_approved:
                self.on_ai_approved(data)

        @self.sio.on("ai:rejected")
        def handle_ai_rejected(data):
            logger.info(f"AI reddedildi: {data}")
            if self.on_ai_rejected:
                self.on_ai_rejected(data)

        @self.sio.on("stream:start")
        def handle_stream_start(data):
            logger.info(f"Yayın başlatma isteği: {data}")
            if self.on_stream_start:
                self.on_stream_start(data)

        @self.sio.on("stream:stop")
        def handle_stream_stop():
            logger.info("Yayın durdurma isteği")
            if self.on_stream_stop:
                self.on_stream_stop()

        @self.sio.on("stream:emergency-stop")
        def handle_emergency_stop():
            logger.warning("🚨 ACİL STOP!")
            if self.on_emergency_stop:
                self.on_emergency_stop()

        @self.sio.on("autonomy:set")
        def handle_mode_change(data):
            logger.info(f"Mod değişti: {data}")
            if self.on_mode_change:
                self.on_mode_change(data)

        @self.sio.on("mood:set")
        def handle_mood_change(data):
            logger.info(f"Mood değişti: {data}")
            if self.on_mood_change:
                self.on_mood_change(data)

        # Backend'den AI cevap üretmesi istendiğinde (real mode)
        @self.sio.on("ai:generate")
        def handle_ai_generate(data):
            """TikTok'tan yeni yorum geldi, AI cevap üret"""
            logger.info(f"AI generate isteği: {data}")
            # main.py'deki handler bunu yakalayacak
            if hasattr(self, "_generate_handler"):
                self._generate_handler(data)

    def set_generate_handler(self, handler: Callable):
        """AI cevap üretme handler'ını kaydet"""
        self._generate_handler = handler

    def connect_async(self):
        """Background thread'de bağlan"""
        if not self.sio:
            logger.error("socketio yok — bağlanılamaz")
            return False
        try:
            self.sio.connect(self.url, transports=["websocket", "polling"])
            return True
        except Exception as e:
            logger.error(f"Bridge bağlantı hatası: {e}")
            return False

    def disconnect(self):
        if self.connected and self.sio:
            self.sio.disconnect()

    # === TikTok olaylarını bridge'e ilet ===

    def emit_comment(self, username: str, content: str):
        """TikTok yorumunu bridge'e gönder"""
        if self.sio and self.connected:
            self.sio.emit("tiktok:comment", {
                "username": username,
                "content": content,
            })

    def emit_gift(self, username: str, gift_name: str, gift_count: int, diamond_count: int):
        """TikTok hediyesini bridge'e gönder"""
        if self.sio and self.connected:
            self.sio.emit("tiktok:gift", {
                "username": username,
                "giftName": gift_name,
                "giftCount": gift_count,
                "diamondCount": diamond_count,
            })

    def emit_viewer_count(self, count: int):
        """İzleyici sayısını bridge'e gönder"""
        if self.sio and self.connected:
            self.sio.emit("tiktok:viewer_count", {"count": count})

    def emit_ai_response(self, message_id: str, text: str, mood: str):
        """Üretilen AI cevabını bridge'e gönder"""
        if self.sio and self.connected:
            self.sio.emit("ai:response", {
                "messageId": message_id,
                "text": text,
                "mood": mood,
            })

    def emit_tts_played(self, message_id: str):
        """TTS çalındı bilgisi"""
        if self.sio and self.connected:
            self.sio.emit("ai:tts_played", {"messageId": message_id})
