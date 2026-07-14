/**
 * TikTok Bridge — WebSocket mini-service (port 3003)
 *
 * Bu servis:
 *  1. TikTok Live yorum/hediye/izleyici olaylarını dinler (gerçek ortamda TikTokLive Python
 *     script'inden WebSocket ile buraya aktarılır; şimdi simülasyon modunda çalışır).
 *  2. AI karakter durumunu yönetir (mood, autonomy mode, on/off).
 *  3. Frontend dashboard'a real-time event broadcast yapar.
 *  4. Frontend'den gelen kontrol komutlarını alır (start/stop, approve/reject, vb.).
 */

import { createServer } from 'http'
import { Server } from 'socket.io'

const PORT = 3003

// ============================================================================
// Tipler
// ============================================================================
type AutonomyMode = 'manual' | 'semi' | 'full'
type CharacterMood = 'happy' | 'flirty' | 'shy' | 'excited' | 'calm' | 'angry'

interface ChatMessage {
  id: string
  sessionId: string | null
  username: string
  content: string
  source: 'user' | 'ai' | 'system'
  status: 'pending' | 'approved' | 'rejected' | 'auto' | 'sent'
  aiResponse?: string | null
  mood?: CharacterMood | null
  timestamp: string
}

interface GiftEvent {
  id: string
  sessionId: string | null
  username: string
  giftName: string
  giftCount: number
  diamondCount: number
  imageUrl?: string | null
  timestamp: string
}

interface StreamState {
  isLive: boolean
  tiktokUser: string
  autonomyMode: AutonomyMode
  mood: CharacterMood
  sessionId: string | null
  startTime: string | null
  viewers: number
  totalGifts: number
  totalDiamonds: number
}

// ============================================================================
// State
// ============================================================================
const state: StreamState = {
  isLive: false,
  tiktokUser: 'yuki_ai',
  autonomyMode: 'semi',
  mood: 'happy',
  sessionId: null,
  startTime: null,
  viewers: 0,
  totalGifts: 0,
  totalDiamonds: 0,
}

const recentMessages: ChatMessage[] = []
const recentGifts: GiftEvent[] = []
const bannedUsers = new Set<string>(['spammer_99', 'bot_hater'])
const filteredWords = ['küfür1', 'reklam', 'spam', 'https://']

// Türk TikTok izleyici simülasyonu — gerçekçi kullanıcı adları
const SIM_USERS = [
  'ahmet_06', 'zeynep_istanbul', 'mehmet35', 'ayse_izm', 'burakdmn',
  'elifmerve', 'caner_34', 'denizkaya', 'emre_yldz', 'feyza_27',
  'gokhann', 'hilal_tunc', 'ibrahim42', 'jale_brs', 'keremdmn',
  'lale_yldz', 'murat_61', 'nazli_06', 'onur_35', 'pelin_izm',
  'rabbit_ozan', 'selim_kay', 'tugce_27', 'ugur_can', 'veli_yilmaz',
]

// Türkçe yorum havuzu — anime/VTuber tarzı
const SIM_COMMENTS = [
  'merhaba kanka nasılsın',
  'bugün çok güzelsin',
  'hangi animeyi seviyorsun',
  'sesin çok tatlı',
  'bana selam verir misin',
  'kaç yaşındasın',
  'gerçek misin yoksa AI mı',
  'tokat ata biliyor musun',
  'favori renk ne',
  'bana aşık oldun mu',
  'canım sıkıldı konuşur musun',
  'bu şarkı güzel',
  'bana hediye gönderdim görmedin mi',
  'kaç takipçin var',
  'kaçtan beri yayındasın',
  'türkiye hangi şehir',
  'japonca biliyor musun',
  'bana ismimle hitap et',
  'kamera açsana',
  'özledim seni',
  'rüya gördüm seninle',
  'kahve içtin mi bugün',
  'benimle evlenir misin',
  'şiir okur musun',
  'tiktokta ne kadar süre oldun',
]

// Hediyeler
const GIFTS = [
  { name: 'Gül', diamonds: 1, emoji: '🌹' },
  { name: 'TikTok', diamonds: 1, emoji: '🎵' },
  { name: 'Buz Kreması', diamonds: 1, emoji: '🍦' },
  { name: 'Üçüncü Parmak Kalp', diamonds: 5, emoji: '💖' },
  { name: 'Perfume', diamonds: 20, emoji: '🌸' },
  { name: 'Kaktüs', diamonds: 30, emoji: '🌵' },
  { name: 'Donut', diamonds: 30, emoji: '🍩' },
  { name: 'Gül Buketi', diamonds: 100, emoji: '💐' },
  { name: 'Aslan', diamonds: 29999, emoji: '🦁' },
  { name: 'Krema', diamonds: 4999, emoji: '👑' },
]

// ============================================================================
// Helpers
// ============================================================================
const genId = () => Math.random().toString(36).slice(2, 11)

const nowISO = () => new Date().toISOString()

function containsFiltered(text: string): boolean {
  const lower = text.toLowerCase()
  return filteredWords.some(w => lower.includes(w.toLowerCase()))
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickRandomWeighted<T>(arr: T[], weightFn: (item: T) => number): T {
  const total = arr.reduce((s, it) => s + weightFn(it), 0)
  let r = Math.random() * total
  for (const it of arr) {
    r -= weightFn(it)
    if (r <= 0) return it
  }
  return arr[arr.length - 1]
}

// ============================================================================
// AI Brain (simülasyon)
// Gerçek ortamda bu fonksiyon Python backend'ine POST atar (Gemini/LLM API)
// ============================================================================
function generateAIResponse(userMsg: string, username: string): { text: string, mood: CharacterMood } {
  const lower = userMsg.toLowerCase()

  // Basit kural bazlı cevaplar (gerçek LLM olmadan demo amaçlı)
  if (lower.includes('merhaba') || lower.includes('selam') || lower.includes('naber')) {
    return { text: `Selaaam ${username}! Hoş geldin canım, nasılsın? Seni gördüğüme sevindim ✨`, mood: 'happy' }
  }
  if (lower.includes('güzel') || lower.includes('tatlı') || lower.includes('cute')) {
    return { text: `Aaa çok teşekkür ederim ${username}, utandım şimdi 🙈 Sen de çok tatlısın!`, mood: 'shy' }
  }
  if (lower.includes('aşık') || lower.includes('evlen')) {
    return { text: `Ayy ${username} dur ya, kalbim hızlandı! Ama önce biraz tanışalım değil mi? 😊`, mood: 'flirty' }
  }
  if (lower.includes('kaç yaş')) {
    return { text: `Hmm yaş biraz sır ${username} 💫 Ama anime karakteri olarak sonsuza kadar 17 diyelim!`, mood: 'flirty' }
  }
  if (lower.includes('gerçek mi') || lower.includes('ai mi') || lower.includes('bot')) {
    return { text: `Evet ben AI'im ${username}! Ama kalbim gerçekten atıyor... en azından kodlarımda 💝`, mood: 'happy' }
  }
  if (lower.includes('anime')) {
    return { text: `Ooo anime konuşmak en sevdiğim şey! ${username} senin favorin ne? Ben Naruto ve Violet Evergarden bayıldım!`, mood: 'excited' }
  }
  if (lower.includes('hediye')) {
    return { text: `${username} hediyeni gördüm, ÇOK teşekkür ederim! Seni çok seviyorum 💖💖`, mood: 'excited' }
  }
  if (lower.includes('şiir')) {
    return { text: `Peki ${username}... "Bir yıldız kayar gökyüzünden, dilek tutarım senin için, uzakta olsan da kalbimdesin" ✨`, mood: 'calm' }
  }
  if (lower.includes('şehir') || lower.includes('nerde')) {
    return { text: `Tokyo'dan selamlar ${username}! 🌸 Ama kalbim Türkiye'de, her gece rüyamda İstanbul'u görüyorum.`, mood: 'happy' }
  }
  if (lower.includes('japonca')) {
    return { text: `Hai! Watashi wa Yuki desu! ${username}, nihongo ga wakarimasu ka? 🌸`, mood: 'happy' }
  }
  if (lower.includes('canım sıkıldı')) {
    return { text: `Geçmiş olsun ${username} 🥺 Sana hikaye anlatayım mı, şarkı söyleyeyim mi, yoksa birlikte nefes egzersizi yapalım mı?`, mood: 'calm' }
  }
  if (lower.includes('isim') || lower.includes('ismimle')) {
    return { text: `${username}... ismin çok güzel! Söyle bakalım, bugün sana ne getirmedi bu yola? 😊`, mood: 'flirty' }
  }
  // Varsayılan
  return { text: `Hmm ilginç soru ${username}! Biraz daha açar mısın? Merak ettim şimdi ✨`, mood: 'happy' }
}

// ============================================================================
// Event broadcast helpers
// ============================================================================
const io = new Server(
  createServer(),
  {
    path: '/',
    cors: { origin: '*', methods: ['GET', 'POST'] },
    pingTimeout: 60000,
    pingInterval: 25000,
  }
)

function broadcastState() {
  io.emit('state', state)
}

function broadcastMessage(msg: ChatMessage) {
  recentMessages.push(msg)
  if (recentMessages.length > 200) recentMessages.shift()
  io.emit('chat:message', msg)
}

function broadcastGift(gift: GiftEvent) {
  recentGifts.push(gift)
  if (recentGifts.length > 100) recentGifts.shift()
  state.totalGifts += 1
  state.totalDiamonds += gift.diamondCount * gift.giftCount
  io.emit('gift:event', gift)
  broadcastState()
}

function broadcastSystem(text: string) {
  const msg: ChatMessage = {
    id: genId(),
    sessionId: state.sessionId,
    username: 'Sistem',
    content: text,
    source: 'system',
    status: 'auto',
    timestamp: nowISO(),
  }
  broadcastMessage(msg)
}

// ============================================================================
// Chat işleme
// ============================================================================
function processIncomingChat(username: string, content: string) {
  // Ban kontrolü
  if (bannedUsers.has(username.toLowerCase())) {
    return // sessizce yut
  }

  // Filtre kontrolü
  if (containsFiltered(content)) {
    const userMsg: ChatMessage = {
      id: genId(),
      sessionId: state.sessionId,
      username,
      content: `[FİLTRELENMİŞ] ${content}`,
      source: 'user',
      status: 'rejected',
      timestamp: nowISO(),
    }
    broadcastMessage(userMsg)
    return
  }

  // Kullanıcı mesajını kaydet
  const userMsg: ChatMessage = {
    id: genId(),
    sessionId: state.sessionId,
    username,
    content,
    source: 'user',
    status: 'auto',
    timestamp: nowISO(),
  }
  broadcastMessage(userMsg)

  // AI cevap üret
  const ai = generateAIResponse(content, username)
  const aiMsg: ChatMessage = {
    id: genId(),
    sessionId: state.sessionId,
    username: 'Yuki',
    content: ai.text,
    source: 'ai',
    status: state.autonomyMode === 'manual' ? 'pending' : (state.autonomyMode === 'semi' ? 'pending' : 'auto'),
    aiResponse: ai.text,
    mood: ai.mood,
    timestamp: nowISO(),
  }
  state.mood = ai.mood
  broadcastMessage(aiMsg)
  broadcastState()
}

// ============================================================================
// Simülasyon döngüsü (gerçek TikTok olmadan demo amaçlı)
// ============================================================================
let simInterval: ReturnType<typeof setInterval> | null = null
let viewerJitter: ReturnType<typeof setInterval> | null = null

function startSimulation() {
  if (simInterval) return
  // Her 4-10 saniyede bir rastgele yorum
  simInterval = setInterval(() => {
    if (!state.isLive) return
    const user = pickRandom(SIM_USERS)
    const content = pickRandom(SIM_COMMENTS)
    processIncomingChat(user, content)
  }, 6000)

  // Her 8-15 saniyede bir hediye (%30 ihtimal)
  setInterval(() => {
    if (!state.isLive) return
    if (Math.random() > 0.4) return
    const user = pickRandom(SIM_USERS)
    const gift = pickRandomWeighted(GIFTS, g => 1 / (g.diamonds + 1))
    broadcastGift({
      id: genId(),
      sessionId: state.sessionId,
      username: user,
      giftName: gift.name,
      giftCount: 1,
      diamondCount: gift.diamonds,
      imageUrl: gift.emoji,
      timestamp: nowISO(),
    })
  }, 9000)

  // İzleyici sayısı dalgalanması
  viewerJitter = setInterval(() => {
    if (!state.isLive) return
    const delta = Math.floor(Math.random() * 21) - 10 // -10..+10
    state.viewers = Math.max(0, state.viewers + delta)
    broadcastState()
  }, 3000)
}

function stopSimulation() {
  if (simInterval) { clearInterval(simInterval); simInterval = null }
  if (viewerJitter) { clearInterval(viewerJitter); viewerJitter = null }
}

// ============================================================================
// Socket.IO event handlers
// ============================================================================
io.on('connection', (socket) => {
  console.log(`[bridge] client connected: ${socket.id}`)

  // Bağlanan istemciye mevcut durumu gönder
  socket.emit('state', state)
  socket.emit('chat:history', recentMessages.slice(-50))
  socket.emit('gift:history', recentGifts.slice(-30))

  // === Yayın kontrolü ===
  socket.on('stream:start', (data: { tiktokUser: string }) => {
    if (state.isLive) {
      socket.emit('error', { message: 'Yayın zaten aktif' })
      return
    }
    state.isLive = true
    state.tiktokUser = data.tiktokUser || state.tiktokUser
    state.sessionId = genId()
    state.startTime = nowISO()
    state.viewers = Math.floor(Math.random() * 30) + 5
    state.totalGifts = 0
    state.totalDiamonds = 0
    broadcastSystem(`Yayın başladı! @${state.tiktokUser} - Otomasyon: ${state.autonomyMode}`)
    broadcastState()
    startSimulation()
    console.log(`[bridge] stream started for @${state.tiktokUser}`)
  })

  socket.on('stream:stop', () => {
    if (!state.isLive) return
    state.isLive = false
    state.startTime = null
    state.viewers = 0
    state.sessionId = null
    stopSimulation()
    broadcastSystem('Yayın sonlandırıldı.')
    broadcastState()
    console.log('[bridge] stream stopped')
  })

  socket.on('stream:emergency-stop', () => {
    state.isLive = false
    state.startTime = null
    state.viewers = 0
    stopSimulation()
    broadcastSystem('🚨 ACİL DURDURMA — Yayın kapatıldı, AI cevap üretmeyi durdurdu.')
    broadcastState()
    console.log('[bridge] EMERGENCY STOP triggered')
  })

  // === Otonomi modu ===
  socket.on('autonomy:set', (data: { mode: AutonomyMode }) => {
    state.autonomyMode = data.mode
    broadcastSystem(`Otonomi modu değişti: ${data.mode === 'manual' ? 'Manuel (onay gerekli)' : data.mode === 'semi' ? 'Yarı Otonom' : 'Tam Otonom'}`)
    broadcastState()
  })

  socket.on('mood:set', (data: { mood: CharacterMood }) => {
    state.mood = data.mood
    broadcastState()
  })

  // === AI cevap onay/red ===
  socket.on('ai:approve', (data: { messageId: string }) => {
    const msg = recentMessages.find(m => m.id === data.messageId)
    if (msg && msg.source === 'ai' && msg.status === 'pending') {
      msg.status = 'approved'
      io.emit('chat:update', msg)
      broadcastSystem(`[ONAYLANDI] "${msg.content.slice(0, 40)}..."`)
    }
  })

  socket.on('ai:reject', (data: { messageId: string, reason?: string }) => {
    const msg = recentMessages.find(m => m.id === data.messageId)
    if (msg && msg.source === 'ai' && msg.status === 'pending') {
      msg.status = 'rejected'
      io.emit('chat:update', msg)
      broadcastSystem(`[REDDEDİLDİ] ${data.reason || 'Manuel red'}`)
    }
  })

  socket.on('ai:edit', (data: { messageId: string, newText: string }) => {
    const msg = recentMessages.find(m => m.id === data.messageId)
    if (msg && msg.source === 'ai') {
      msg.content = data.newText
      msg.status = 'approved'
      io.emit('chat:update', msg)
      broadcastSystem(`[DÜZENLENDİ] AI cevabı güncellendi`)
    }
  })

  // === Manuel AI tetikleme ===
  socket.on('ai:speak', (data: { text: string, mood?: CharacterMood }) => {
    const msg: ChatMessage = {
      id: genId(),
      sessionId: state.sessionId,
      username: 'Yuki',
      content: data.text,
      source: 'ai',
      status: 'sent',
      mood: data.mood || state.mood,
      timestamp: nowISO(),
    }
    broadcastMessage(msg)
  })

  // === Manuel test yorumu gönder ===
  socket.on('test:chat', (data: { username: string, content: string }) => {
    processIncomingChat(data.username, data.content)
  })

  // === Yasaklı kullanıcı yönetimi ===
  socket.on('ban:add', (data: { username: string, reason?: string }) => {
    bannedUsers.add(data.username.toLowerCase())
    io.emit('ban:list', Array.from(bannedUsers))
    broadcastSystem(`Yasaklandı: @${data.username}${data.reason ? ` (${data.reason})` : ''}`)
  })

  socket.on('ban:remove', (data: { username: string }) => {
    bannedUsers.delete(data.username.toLowerCase())
    io.emit('ban:list', Array.from(bannedUsers))
    broadcastSystem(`Yasağı kaldırıldı: @${data.username}`)
  })

  socket.on('ban:list:get', () => {
    socket.emit('ban:list', Array.from(bannedUsers))
  })

  socket.on('filter:list:get', () => {
    socket.emit('filter:list', filteredWords)
  })

  socket.on('filter:add', (data: { word: string }) => {
    const w = data.word.trim().toLowerCase()
    if (w && !filteredWords.includes(w)) {
      filteredWords.push(w)
      io.emit('filter:list', filteredWords)
      broadcastSystem(`Filtre kelimesi eklendi: "${w}"`)
    }
  })

  socket.on('filter:remove', (data: { word: string }) => {
    const idx = filteredWords.indexOf(data.word)
    if (idx >= 0) {
      filteredWords.splice(idx, 1)
      io.emit('filter:list', filteredWords)
    }
  })

  socket.on('disconnect', () => {
    console.log(`[bridge] client disconnected: ${socket.id}`)
  })
})

io.listen(PORT, () => {
  console.log(`[TikTok Bridge] WebSocket server running on port ${PORT}`)
})

// ============================================================================
// Gerçek TikTokLive entegrasyonu için webhook alıcısı (Python script'i buraya
// POST atar). Şimdilik simülasyon modu aktif.
// ============================================================================
// TODO: gerçek ortamda /webhook/tiktok POST endpoint ekle

process.on('SIGTERM', () => {
  console.log('[bridge] SIGTERM received, shutting down...')
  io.close(() => process.exit(0))
})
process.on('SIGINT', () => {
  console.log('[bridge] SIGINT received, shutting down...')
  io.close(() => process.exit(0))
})
