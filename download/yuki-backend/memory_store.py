"""
Yuki — User Memory Store
AI'ın izleyicileri hatırlaması için kalıcı hafıza.

Her kullanıcı için saklar:
- İlk görülme, son görülme, kaç farklı gün geldi
- Mesaj sayısı, hediye sayısı, toplam elmas
- Favori konular (otomatik tespit)
- Son hediye (ne zaman, ne gönderdi)
- Manuel notlar (operatör ekleyebilir)
- Son ruh hali

Bu sayede Yuki:
- "Aa {isim}! Yine geldin, sevindim!" diyebilir
- "Vay {isim}, 5 gündür üst üste geliyorsun, sadıksın!" diyebilir
- "Geçen gün Aslan göndermiştin, hâlâ minnettarım 💝" diyebilir
- "Geçenlerde anime konuşmuştuk, hâlâ aklımda 🌸" diyebilir
"""
import os
import json
import logging
from pathlib import Path
from typing import Optional, Dict, List, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class UserMemoryStore:
    """Kalıcı kullanıcı hafızası (JSON dosyası)"""

    def __init__(self, memory_file: str = "memory.json"):
        self.memory_file = Path(memory_file)
        self.memory: Dict[str, Dict] = {}
        self._load()

    def _load(self):
        """JSON dosyasından hafızayı yükle"""
        if self.memory_file.exists():
            try:
                with open(self.memory_file, 'r', encoding='utf-8') as f:
                    self.memory = json.load(f)
                logger.info(f"[memory] {len(self.memory)} kullanıcı yüklendi")
            except Exception as e:
                logger.error(f"[memory] yükleme hatası: {e}")
                self.memory = {}
        else:
            self.memory = {}

    def _save(self):
        """JSON dosyasına kaydet"""
        try:
            with open(self.memory_file, 'w', encoding='utf-8') as f:
                json.dump(self.memory, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"[memory] kaydetme hatası: {e}")

    # ============================================================
    # SORGULAR
    # ============================================================

    def get_user(self, username: str) -> Optional[Dict]:
        return self.memory.get(username.lower())

    def is_new_user(self, username: str) -> bool:
        return username.lower() not in self.memory

    def is_returning_today(self, username: str) -> bool:
        """Bugün ilk kez mesaj atıyor ama önceden gelmiş"""
        user = self.get_user(username)
        if not user:
            return False
        today = datetime.now().date().isoformat()
        return user.get('lastDaySeen') != today and len(user.get('daysSeen', [])) > 0

    def is_loyal(self, username: str, min_days: int = 3) -> bool:
        user = self.get_user(username)
        if not user:
            return False
        return len(user.get('daysSeen', [])) >= min_days

    def days_count(self, username: str) -> int:
        user = self.get_user(username)
        return len(user.get('daysSeen', [])) if user else 0

    # ============================================================
    # ETKİLEŞİM KAYDI
    # ============================================================

    def record_interaction(
        self,
        username: str,
        message: str = "",
        mood: str = "happy",
        gift_name: str = None,
        gift_diamonds: int = 0,
    ) -> Dict:
        """Kullanıcı etkileşimini kaydet, güncel kullanıcı bilgisi döndür"""
        key = username.lower()
        now = datetime.now()
        today = now.date().isoformat()

        if key not in self.memory:
            self.memory[key] = {
                'username': username,
                'firstSeen': now.isoformat(),
                'lastSeen': now.isoformat(),
                'lastDaySeen': today,
                'daysSeen': [today],
                'messageCount': 0,
                'giftCount': 0,
                'totalDiamonds': 0,
                'favoriteTopics': [],
                'lastTopic': None,
                'lastGift': None,
                'notes': [],
                'mood': mood,
            }

        user = self.memory[key]
        user['lastSeen'] = now.isoformat()

        # Yeni gün kontrolü
        if user.get('lastDaySeen') != today:
            user['lastDaySeen'] = today
            if today not in user.get('daysSeen', []):
                user.setdefault('daysSeen', []).append(today)
                if len(user['daysSeen']) > 30:
                    user['daysSeen'] = user['daysSeen'][-30:]

        # Mesaj
        if message:
            user['messageCount'] = user.get('messageCount', 0) + 1
            topic = self._detect_topic(message)
            if topic:
                if topic not in user.get('favoriteTopics', []):
                    user.setdefault('favoriteTopics', []).append(topic)
                user['lastTopic'] = topic

        # Hediye
        if gift_name:
            user['giftCount'] = user.get('giftCount', 0) + 1
            user['totalDiamonds'] = user.get('totalDiamonds', 0) + gift_diamonds
            user['lastGift'] = {
                'name': gift_name,
                'diamonds': gift_diamonds,
                'date': now.isoformat(),
            }

        user['mood'] = mood
        self._save()
        return user

    def _detect_topic(self, message: str) -> Optional[str]:
        """Mesajdan konu tespit et (basit keyword matching)"""
        msg = message.lower()
        topic_keywords = {
            'anime': ['anime', 'manga', 'otaku', 'naruto', 'onepiece', 'demon', 'violet'],
            'aşk': ['aşık', 'evlen', 'seviyorum', 'flört', 'sevgil'],
            'yaş': ['kaç yaş', 'yaşın', ' yaşın'],
            'ai': ['ai', 'bot', 'yapay', 'gerçek'],
            'kahve': ['kahve', 'latte', 'coffee', 'espresso'],
            'japonca': ['japonca', 'japon', 'nihongo', 'tokyo'],
            'şiir': ['şiir', 'siir', 'şarkı'],
            'moral': ['canım sıkıldı', 'üzgün', 'moral', 'dert'],
            'şehir': ['şehir', 'nerde', 'nerede', 'nereli'],
            'müzik': ['müzik', 'sarki', 'şarkı', 'melodi'],
        }
        for topic, keywords in topic_keywords.items():
            if any(kw in msg for kw in keywords):
                return topic
        return None

    # ============================================================
    # MANUEL YÖNETİM
    # ============================================================

    def add_note(self, username: str, note: str):
        """Operatör manuel not ekle"""
        key = username.lower()
        if key not in self.memory:
            self.record_interaction(username)
        self.memory[key].setdefault('notes', []).append({
            'text': note,
            'date': datetime.now().isoformat(),
        })
        self._save()

    def forget_user(self, username: str):
        """Kullanıcıyı tamamen unut"""
        key = username.lower()
        if key in self.memory:
            del self.memory[key]
            self._save()

    def clear_all(self):
        """Tüm hafızayı sil ( dikkatli!)"""
        self.memory = {}
        self._save()

    # ============================================================
    # LİSTELEME
    # ============================================================

    def get_top_users(self, limit: int = 10, sort_by: str = 'messageCount') -> List[Dict]:
        users = list(self.memory.values())
        users.sort(key=lambda u: u.get(sort_by, 0), reverse=True)
        return users[:limit]

    def get_returning_today(self) -> List[Dict]:
        """Bugün geri dönen kullanıcılar (daha önce gelmiş, bugün tekrar)"""
        today = datetime.now().date().isoformat()
        returning = []
        for user in self.memory.values():
            if user.get('lastDaySeen') == today and len(user.get('daysSeen', [])) > 1:
                returning.append(user)
        return returning

    def get_loyal_users(self, min_days: int = 3) -> List[Dict]:
        return [u for u in self.memory.values() if len(u.get('daysSeen', [])) >= min_days]

    def get_recent_users(self, hours: int = 24) -> List[Dict]:
        cutoff = datetime.now() - timedelta(hours=hours)
        recent = []
        for user in self.memory.values():
            try:
                last_seen = datetime.fromisoformat(user['lastSeen'])
                if last_seen >= cutoff:
                    recent.append(user)
            except Exception:
                continue
        return recent

    def search_users(self, query: str) -> List[Dict]:
        """Kullanıcı adıyla ara"""
        q = query.lower()
        return [u for u in self.memory.values() if q in u['username'].lower()]

    # ============================================================
    # AI İÇİN ÖZET
    # ============================================================

    def get_user_summary(self, username: str) -> str:
        """AI'a prompt için kısa özet"""
        user = self.get_user(username)
        if not user:
            return f"@{username} yeni bir izleyici, daha önce görmedim."

        days = len(user.get('daysSeen', []))
        msgs = user.get('messageCount', 0)
        gifts = user.get('giftCount', 0)
        diamonds = user.get('totalDiamonds', 0)
        first = user.get('firstSeen', '')[:10]
        topics = user.get('favoriteTopics', [])
        last_gift = user.get('lastGift') or {}
        notes = user.get('notes', [])

        parts = [f"@{username} daha önce gördüğüm bir izleyici."]
        parts.append(f"İlk kez {first} görüldü, {days} farklı gün geldi, {msgs} mesaj yazdı.")
        if gifts > 0:
            parts.append(f"{gifts} hediye gönderdi ({diamonds} elmas).")
            if last_gift:
                parts.append(f"Son hediyesi: {last_gift.get('name')} ({last_gift.get('diamonds')} 💎).")
        if topics:
            parts.append(f"Sevdiği konular: {', '.join(topics[:3])}.")
        if notes:
            parts.append(f"Notlarım: {' | '.join(n['text'] for n in notes[:3])}")
        return ' '.join(parts)

    def get_stats(self) -> Dict:
        """Genel istatistikler"""
        return {
            'totalUsers': len(self.memory),
            'returningToday': len(self.get_returning_today()),
            'loyalUsers': len(self.get_loyal_users()),
            'recent24h': len(self.get_recent_users(24)),
            'totalMessages': sum(u.get('messageCount', 0) for u in self.memory.values()),
            'totalGifts': sum(u.get('giftCount', 0) for u in self.memory.values()),
            'totalDiamonds': sum(u.get('totalDiamonds', 0) for u in self.memory.values()),
        }
