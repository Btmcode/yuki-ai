"""
Yuki — TikTok Live Listener
TikTokLive kütüphanesi ile TikTok canlı yayın yorum/hediye olaylarını dinler.
"""
import os
import logging
import asyncio
from typing import Callable, Optional

try:
    from TikTokLive.types.api import TikTokLiveUserNotFound
    from TikTokLive import TikTokLiveClient
    TIKTOK_AVAILABLE = True
except ImportError:
    TIKTOK_AVAILABLE = False
    TikTokLiveClient = None

logger = logging.getLogger(__name__)


class TikTokListener:
    def __init__(
        self,
        username: str,
        on_comment: Callable,
        on_gift: Callable,
        on_viewer: Optional[Callable] = None,
    ):
        self.username = username
        self.on_comment = on_comment
        self.on_gift = on_gift
        self.on_viewer = on_viewer
        self.client = None
        self.running = False

        if not TIKTOK_AVAILABLE:
            logger.warning(
                "TikTokLive yüklü değil — TikTok dinleyici pasif. "
                "Sadece simülasyon modu çalışır."
            )

    async def start(self):
        """TikTok Live dinlemeye başla"""
        if not TIKTOK_AVAILABLE:
            logger.warning("TikTokLive yok — gerçek bağlantı kurulamadı")
            return

        # Session ID varsa yükle
        session_id = os.getenv("TIKTOK_SESSION_ID", "")

        self.client = TikTokLiveClient(
            unique_id=self.username,
            sessionid=session_id if session_id else None,
        )

        @self.client.on("connect")
        async def on_connect(_):
            logger.info(f"TikTok Live bağlandı: @{self.username}")
            self.running = True

        @self.client.on("disconnect")
        async def on_disconnect(_):
            logger.warning("TikTok Live bağlantısı koptu")
            self.running = False

        @self.client.on("comment")
        async def on_comment_event(data):
            try:
                username = data.user.nickname
                content = data.comment
                await self.on_comment(username, content)
            except Exception as e:
                logger.error(f"Comment işleme hatası: {e}")

        @self.client.on("gift")
        async def on_gift_event(data):
            try:
                username = data.user.nickname
                gift_name = data.gift.info.name
                gift_count = data.gift.count
                # diamond_count TikTokLive kütüphanesinden geliyor
                diamond_count = getattr(data.gift.info, "diamond_count", 1) or 1
                await self.on_gift(username, gift_name, gift_count, diamond_count)
            except Exception as e:
                logger.error(f"Gift işleme hatası: {e}")

        @self.client.on("viewer_count")
        async def on_viewer_event(data):
            if self.on_viewer:
                try:
                    await self.on_viewer(data.viewer_count)
                except Exception as e:
                    logger.error(f"Viewer count hatası: {e}")

        try:
            await self.client.start()
        except Exception as e:
            logger.error(f"TikTok Live başlatma hatası: {e}")

    def stop(self):
        """Dinleyiciyi durdur"""
        if self.client:
            try:
                self.client.stop()
            except Exception:
                pass
        self.running = False
        logger.info("TikTok dinleyici durduruldu")
