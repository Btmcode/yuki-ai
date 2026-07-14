"""
Yuki — AI Brain (Google Gemini entegrasyonu + Hafıza-aware)
İzleyici mesajına karaktere uygun, hafıza-aware cevap üretir.

Yeni özellik:
- Eğer kullanıcı yeni → normal karşılama
- Eğer geri dönen (1-2 gün) → "Yine geldin, sevindim!"
- Eğer sadık (3+ gün) → "X gündür geliyorsun, sadıksın!"
- Eğer önceki gün hediye göndermiş → "Geçen gün Aslan göndermiştin..."
- Eğer aynı konuyu tekrar konuşuyor → "Geçenlerde anime konuşmuştuk..."
"""
import os
import logging
from typing import Optional
from datetime import datetime
import google.generativeai as genai

from persona import (
    SYSTEM_PROMPT, detect_mood,
    get_returning_welcome, get_gift_memory_message,
    get_topic_memory_message, get_topic_label,
)

logger = logging.getLogger(__name__)


class AIBrain:
    def __init__(self, memory_store=None):
        """
        Args:
            memory_store: UserMemoryStore instance (opsiyonel, hafıza için)
        """
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        self.enabled = bool(self.api_key)
        self.memory = memory_store

        if self.enabled:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel(
                    self.model_name,
                    system_instruction=SYSTEM_PROMPT,
                    generation_config={
                        "temperature": 0.9,
                        "top_p": 0.95,
                        "top_k": 40,
                        "max_output_tokens": 200,
                    },
                )
                self.chat = self.model.start_chat(history=[])
                logger.info(f"AI Brain hazır (model: {self.model_name}, memory: {'✓' if self.memory else '✗'})")
            except Exception as e:
                logger.error(f"Gemini init hatası: {e}")
                self.enabled = False
        else:
            logger.warning(f"GEMINI_API_KEY yok — AI Brain pasif (simülasyon modu, memory: {'✓' if self.memory else '✗'})")

    def generate_response(self, username: str, message: str, mood_hint: Optional[str] = None) -> dict:
        """İzleyici mesajına hafıza-aware cevap üret.

        Returns: {"text": str, "mood": str, "memory_used": bool}
        """
        # Hafıza durumunu kontrol et
        memory_context = ""
        is_new = True
        is_returning = False
        is_loyal = False
        days_count = 0

        if self.memory:
            user = self.memory.get_user(username)
            is_new = user is None
            if user:
                days_count = len(user.get('daysSeen', []))
                is_loyal = days_count >= 3
                today = datetime.now().date().isoformat()
                last_seen_day = user.get('lastDaySeen', '')
                # Bugün daha önce mesaj atmamış ama önceden gelmiş → returning
                is_returning = last_seen_day != today and len(user.get('daysSeen', [])) > 0

            memory_context = self.memory.get_user_summary(username)

        # Cevap üret
        if self.enabled:
            try:
                mood = mood_hint or detect_mood(message)
                prompt = self._build_prompt(username, message, mood, memory_context, is_new, is_returning, is_loyal, days_count)

                response = self.chat.send_message(prompt)
                text = response.text.strip()

                return {
                    "text": text,
                    "mood": mood,
                    "memory_used": not is_new,
                    "is_new_user": is_new,
                    "is_returning": is_returning,
                    "is_loyal": is_loyal,
                }

            except Exception as e:
                logger.error(f"LLM hatası: {e}")
                return self._fallback_with_memory(
                    username, message, mood_hint,
                    is_new, is_returning, is_loyal, days_count
                )
        else:
            return self._fallback_with_memory(
                username, message, mood_hint,
                is_new, is_returning, is_loyal, days_count
            )

    def _build_prompt(
        self,
        username: str,
        message: str,
        mood: str,
        memory_context: str,
        is_new: bool,
        is_returning: bool,
        is_loyal: bool,
        days_count: int,
    ) -> str:
        """LLM için hafıza-aware prompt oluştur"""
        parts = [f"[İzleyici: @{username}]"]

        if is_new:
            parts.append("Bu izleyiciyi ilk kez görüyorum, sıcak bir karşılama yap.")
        elif is_loyal:
            parts.append(f"Bu izleyici sadık bir hayran, {days_count} farklı gün gelmiş. Ona özel hissettir.")
        elif is_returning:
            parts.append("Bu izleyici daha önce gelmiş, bugün geri dönmüş. Onu hatırladığını göster.")

        if memory_context:
            parts.append(f"HAFIZA: {memory_context}")

        parts.append(f"\nYeni mesaj: {message}")
        parts.append(f"\nYuki olarak 1-2 cümle cevap ver. Mood: {mood}.")
        parts.append("Eğer kullanıcıyı hatırlıyorsan, bunu doğal şekilde belirt.")

        return '\n'.join(parts)

    def _fallback_with_memory(
        self,
        username: str,
        message: str,
        mood_hint: Optional[str],
        is_new: bool,
        is_returning: bool,
        is_loyal: bool,
        days_count: int,
    ) -> dict:
        """Hafıza-aware fallback cevap (LLM yoksa)"""
        mood = mood_hint or detect_mood(message)

        # 1. Yeni kullanıcı → normal karşılama
        if is_new:
            result = self._fallback_response(username, message, mood_hint)
            result.update({
                "memory_used": False,
                "is_new_user": True,
                "is_returning": False,
                "is_loyal": False,
            })
            return result

        # 2. Geri dönen kullanıcı (sadık veya normal)
        if is_returning:
            if is_loyal:
                # Sadık kullanıcı geri döndü
                text = get_returning_welcome(username, days_count)
                return {
                    "text": text,
                    "mood": "excited",
                    "memory_used": True,
                    "is_new_user": False,
                    "is_returning": True,
                    "is_loyal": True,
                }
            else:
                # Normal geri dönen kullanıcı
                text = get_returning_welcome(username, days_count)
                return {
                    "text": text,
                    "mood": "happy",
                    "memory_used": True,
                    "is_new_user": False,
                    "is_returning": True,
                    "is_loyal": False,
                }

        # 3. Aynı gün tekrar mesaj atıyor — hediye veya konu hatırla
        if self.memory:
            user = self.memory.get_user(username)
            if user:
                # Önceki gün hediye göndermiş mi?
                last_gift = user.get('lastGift')
                if last_gift:
                    gift_date = (last_gift.get('date', '') or '')[:10]
                    today = datetime.now().date().isoformat()
                    if gift_date and gift_date != today:
                        # Önceki günden hediye — hatırla
                        text = get_gift_memory_message(
                            username,
                            last_gift.get('name', 'hediye'),
                            last_gift.get('diamonds', 0),
                        )
                        return {
                            "text": text,
                            "mood": "flirty",
                            "memory_used": True,
                            "is_new_user": False,
                            "is_returning": False,
                            "is_loyal": is_loyal,
                        }

                # Aynı konuyu tekrar konuşuyor
                last_topic = user.get('lastTopic')
                if last_topic:
                    topic_label = get_topic_label(last_topic)
                    # Konu mesajla ilgili mi?
                    topic_keywords = self._topic_keywords(last_topic)
                    msg_lower = message.lower()
                    if any(kw in msg_lower for kw in topic_keywords):
                        text = get_topic_memory_message(username, topic_label)
                        return {
                            "text": text,
                            "mood": "happy",
                            "memory_used": True,
                            "is_new_user": False,
                            "is_returning": False,
                            "is_loyal": is_loyal,
                        }

        # 4. Normal cevap (aynı gün ilk mesaj, hafıza fırsatı yok)
        result = self._fallback_response(username, message, mood_hint)
        result.update({
            "memory_used": False,
            "is_new_user": False,
            "is_returning": False,
            "is_loyal": is_loyal,
        })
        return result

    def _topic_keywords(self, topic: str) -> list:
        """Konu için keyword listesi döndür"""
        topic_map = {
            'anime': ['anime', 'manga', 'otaku', 'naruto'],
            'aşk': ['aşık', 'evlen', 'seviyorum', 'flört'],
            'yaş': ['kaç yaş', 'yaşın'],
            'ai': ['ai', 'bot', 'yapay', 'gerçek'],
            'kahve': ['kahve', 'latte', 'coffee'],
            'japonca': ['japonca', 'japon', 'nihongo', 'tokyo'],
            'şiir': ['şiir', 'siir'],
            'moral': ['sıkıldı', 'üzgün', 'moral'],
            'şehir': ['şehir', 'nerde', 'nereli'],
        }
        return topic_map.get(topic, [])

    def _fallback_response(self, username: str, message: str, mood_hint: Optional[str]) -> dict:
        """API yoksa basit kural bazlı cevap (simülasyon)"""
        mood = mood_hint or detect_mood(message)
        msg_lower = message.lower()

        if any(w in msg_lower for w in ["merhaba", "selam", "naber", "selamlar"]):
            text = f"Selaaam {username}! Hoş geldin canım, nasılsın? ✨"
        elif any(w in msg_lower for w in ["güzel", "tatlı", "cute", "sevimli", "harika"]):
            text = f"Aaa {username} çok teşekkür ederim, utandım şimdi 🙈"
        elif any(w in msg_lower for w in ["aşık", "evlen", "seviyorum", "flört", "sevgil"]):
            text = f"Ayy {username} dur ya, kalbim hızlandı! Ama önce tanışalım 😊"
        elif any(w in msg_lower for w in ["ai", "bot", "gerçek", "yapay"]):
            text = f"Evet ben AI'im {username}! Ama kalbim gerçekten atıyor... en azından kodlarımda 💝"
        elif any(w in msg_lower for w in ["kaç yaş", "yaşın", " yaş"]):
            text = f"Hmm yaş biraz sır {username} 💫 Ama anime karakteri olarak sonsuza kadar 17 diyelim!"
        elif any(w in msg_lower for w in ["anime", "manga", "otaku"]):
            text = f"Ooo anime konuşmak en sevdiğim şey! {username} senin favorin ne?"
        elif any(w in msg_lower for w in ["hediye", "gift", "elmas", "diamond"]):
            text = f"{username} hediyeni gördüm, ÇOK teşekkür ederim! Seni çok seviyorum 💖"
        elif any(w in msg_lower for w in ["şiir", "siir"]):
            text = f"Peki {username}... 'Bir yıldız kayar gökyüzünden, dilek tutarım senin için, uzakta olsan da kalbimdesin' ✨"
        elif any(w in msg_lower for w in ["şehir", "nerde", "nerede", "nereli"]):
            text = f"Tokyo'dan selamlar {username}! 🌸 Ama kalbim Türkiye'de, her gece rüyamda İstanbul'u görüyorum."
        elif any(w in msg_lower for w in ["japonca", "japon", "nihongo"]):
            text = f"Hai! Watashi wa Yuki desu! {username}, nihongo ga wakarimasu ka? 🌸"
        elif any(w in msg_lower for w in ["canım sıkıldı", "sıkıldım", "moralim"]):
            text = f"Geçmiş olsun {username} 🥺 Sana hikaye anlatayım mı, şarkı söyleyeyim mi?"
        elif any(w in msg_lower for w in ["toktok", "tiktok", "yayın", "yayin", "ne kadar süre"]):
            text = f"TikTok'a yeni başladım {username}! Seni tanıdığıma sevindim, daha çok şey paylaşacağım 🌸"
        elif any(w in msg_lower for w in ["kahve", "coffee", "latte"]):
            text = f"Aa {username} ben kahve bağımlısıyım! Şu an latte içiyorum, sen ne içiyorsun? ☕"
        elif any(w in msg_lower for w in ["teşekkür", "sagol", "sağol"]):
            text = f"Rica ederim {username}! Senin için buradayım 💝"
        elif any(w in msg_lower for w in ["güle güle", "görüşürüz", "bay", "hoşçakal"]):
            text = f"Görüşürüz {username}! Kendine iyi bak, seni beklerim 🌸"
        else:
            text = f"Hmm ilginç {username}! Biraz daha açar mısın? Merak ettim şimdi ✨"

        return {"text": text, "mood": mood}

    def reset_chat(self):
        """Konuşma geçmişini temizle"""
        if self.enabled:
            try:
                self.chat = self.model.start_chat(history=[])
                logger.info("Sohbet geçmişi sıfırlandı")
            except Exception as e:
                logger.error(f"Reset hatası: {e}")
