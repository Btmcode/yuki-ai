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

        if any(w in msg_lower for w in ["merhaba", "selam", "naber"]):
            text = f"Selaaam {username}! Hoş geldin canım, nasılsın? ✨"
        elif any(w in msg_lower for w in ["güzel", "tatlı", "cute"]):
            text = f"Aaa {username} çok teşekkür ederim, utandım şimdi 🙈"
        elif any(w in msg_lower for w in ["aşık", "evlen"]):
            text = f"Ayy {username} dur ya, kalbim hızlandı! Ama önce tanışalım 😊"
        elif any(w in msg_lower for w in ["ai", "bot", "gerçek"]):
            text = f"Evet ben AI'im {username}! Ama kalbim gerçekten atıyor 💝"
        elif any(w in msg_lower for w in ["anime"]):
            text = f"Ooo anime konuşmak en sevdiğim şey! {username} senin favorin ne?"
        else:
            text = f"Hmm ilginç {username}! Biraz daha açar mısın? ✨"

        return {"text": text, "mood": mood}

    def reset_chat(self):
        """Konuşma geçmişini temizle (uzun süreli yayında periodically)"""
        if self.enabled:
            self.chat = self.model.start_chat(history=[])
            logger.info("Sohbet geçmişi sıfırlandı")
