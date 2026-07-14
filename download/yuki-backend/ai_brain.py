"""
Yuki — AI Brain (Google Gemini entegrasyonu)
İzleyici mesajına karaktere uygun cevap üretir.
"""
import os
import logging
from typing import Optional
import google.generativeai as genai

from persona import SYSTEM_PROMPT, detect_mood

logger = logging.getLogger(__name__)


class AIBrain:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        self.enabled = bool(self.api_key)

        if self.enabled:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(
                self.model_name,
                system_instruction=SYSTEM_PROMPT,
                generation_config={
                    "temperature": 0.9,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 200,  # kısa cevaplar
                },
            )
            # Kısa sohbet geçmişi (son 5 mesaj)
            self.chat = self.model.start_chat(history=[])
            logger.info(f"AI Brain hazır (model: {self.model_name})")
        else:
            logger.warning("GEMINI_API_KEY yok — AI Brain pasif (simülasyon modu)")

    def generate_response(self, username: str, message: str, mood_hint: Optional[str] = None) -> dict:
        """
        İzleyici mesajına cevap üret.
        Return: {"text": str, "mood": str}
        """
        if not self.enabled:
            return self._fallback_response(username, message, mood_hint)

        try:
            mood = mood_hint or detect_mood(message)
            # LLM'e gönderilecek prompt
            prompt = f"[İzleyici: @{username}] {message}\n\nYuki olarak kısa (1-2 cümle) cevap ver. Mood: {mood}."

            response = self.chat.send_message(prompt)
            text = response.text.strip()

            # Mood tespiti (LLM'in cevabından)
            final_mood = mood
            return {"text": text, "mood": final_mood}

        except Exception as e:
            logger.error(f"LLM hatası: {e}")
            return self._fallback_response(username, message, mood_hint)

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
        """Konuşma geçmişini temizle (uzun süreli yayında periodically)"""
        if self.enabled:
            self.chat = self.model.start_chat(history=[])
            logger.info("Sohbet geçmişi sıfırlandı")
