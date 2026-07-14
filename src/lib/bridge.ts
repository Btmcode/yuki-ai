'use client'

import { io, Socket } from 'socket.io-client'
import { create } from 'zustand'

// ============================================================================
// Tipler — backend (port 3003) ile uyumlu
// ============================================================================
export type AutonomyMode = 'manual' | 'semi' | 'full'
export type CharacterMood = 'happy' | 'flirty' | 'shy' | 'excited' | 'calm' | 'angry'

export interface StreamState {
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

export interface ChatMessage {
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

export interface GiftEvent {
  id: string
  sessionId: string | null
  username: string
  giftName: string
  giftCount: number
  diamondCount: number
  imageUrl?: string | null
  timestamp: string
}

// ============================================================================
// Zustand store — tüm dashboard state'i burada
// ============================================================================
interface BridgeStore {
  connected: boolean
  state: StreamState
  messages: ChatMessage[]
  gifts: GiftEvent[]
  bannedUsers: string[]
  filteredWords: string[]
  pendingCount: number

  // actions
  setConnected: (v: boolean) => void
  setState: (s: StreamState) => void
  addMessage: (m: ChatMessage) => void
  addGift: (g: GiftEvent) => void
  updateMessage: (m: ChatMessage) => void
  setMessages: (m: ChatMessage[]) => void
  setGifts: (g: GiftEvent[]) => void
  setBannedUsers: (u: string[]) => void
  setFilteredWords: (w: string[]) => void
  clearMessages: () => void
}

const initialState: StreamState = {
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

export const useBridge = create<BridgeStore>((set) => ({
  connected: false,
  state: initialState,
  messages: [],
  gifts: [],
  bannedUsers: [],
  filteredWords: [],
  pendingCount: 0,

  setConnected: (v) => set({ connected: v }),
  setState: (s) => set({ state: s }),
  addMessage: (m) => set((st) => {
    const messages = [...st.messages, m].slice(-200)
    const pendingCount = messages.filter(x => x.source === 'ai' && x.status === 'pending').length
    return { messages, pendingCount }
  }),
  addGift: (g) => set((st) => ({ gifts: [...st.gifts, g].slice(-100) })),
  updateMessage: (m) => set((st) => {
    const messages = st.messages.map(x => x.id === m.id ? m : x)
    const pendingCount = messages.filter(x => x.source === 'ai' && x.status === 'pending').length
    return { messages, pendingCount }
  }),
  setMessages: (m) => set({
    messages: m,
    pendingCount: m.filter(x => x.source === 'ai' && x.status === 'pending').length,
  }),
  setGifts: (g) => set({ gifts: g }),
  setBannedUsers: (u) => set({ bannedUsers: u }),
  setFilteredWords: (w) => set({ filteredWords: w }),
  clearMessages: () => set({ messages: [], pendingCount: 0 }),
}))

// ============================================================================
// Singleton socket — tüm uygulama tek bağlantı paylaşır
// ============================================================================
let socket: Socket | null = null

export function getSocket(): Socket {
  if (socket) return socket
  socket = io('/?XTransformPort=3003', {
    transports: ['websocket', 'polling'],
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  })
  return socket
}

export function initBridge() {
  const s = getSocket()
  const store = useBridge

  s.on('connect', () => store.getState().setConnected(true))
  s.on('disconnect', () => store.getState().setConnected(false))
  s.on('reconnect', () => store.getState().setConnected(true))

  s.on('state', (st: StreamState) => store.getState().setState(st))
  s.on('chat:history', (msgs: ChatMessage[]) => store.getState().setMessages(msgs))
  s.on('gift:history', (gifts: GiftEvent[]) => store.getState().setGifts(gifts))
  s.on('chat:message', (m: ChatMessage) => store.getState().addMessage(m))
  s.on('chat:update', (m: ChatMessage) => store.getState().updateMessage(m))
  s.on('gift:event', (g: GiftEvent) => store.getState().addGift(g))
  s.on('ban:list', (u: string[]) => store.getState().setBannedUsers(u))
  s.on('filter:list', (w: string[]) => store.getState().setFilteredWords(w))

  return s
}
