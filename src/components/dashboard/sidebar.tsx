'use client'

import { LayoutDashboard, MessageSquare, Cpu, Gift, Settings, Heart, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBridge } from '@/lib/bridge'

export type SectionId = 'dashboard' | 'chat' | 'control' | 'gifts' | 'memory' | 'settings'

interface SidebarProps {
  active: SectionId
  onChange: (id: SectionId) => void
}

const NAV: { id: SectionId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
  { id: 'chat', label: 'Canlı Sohbet', icon: MessageSquare },
  { id: 'control', label: 'AI Kontrol', icon: Cpu },
  { id: 'gifts', label: 'Hediyeler', icon: Gift },
  { id: 'memory', label: 'Hafıza', icon: Brain },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
]

export function Sidebar({ active, onChange }: SidebarProps) {
  const { pendingCount, state, memoryStats } = useBridge()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-rose-500/10 bg-zinc-950/50">
        <div className="flex h-full flex-col gap-2 p-3">
          {/* Karakter kartı */}
          <div className="mb-2 overflow-hidden rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-transparent">
            {/* Avatar görsel */}
            <div className="relative aspect-square overflow-hidden">
              { }
              <img
                src="/avatars/yuki-avatar.png"
                alt="Yuki karakter avatarı"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
              {/* Live badge overlay */}
              {state.isLive && (
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-rose-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-white live-dot" />
                  CANLI
                </div>
              )}
              {/* İsim overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-sm font-bold text-white drop-shadow">Yuki 雪</p>
                <p className="truncate text-[11px] text-zinc-300">
                  {state.isLive ? `@${state.tiktokUser}` : 'Yayın offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 text-[11px]">
              <span className="text-zinc-400">Ruh hali</span>
              <MoodPill mood={state.mood} />
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-1 flex-col gap-1">
            {NAV.map((item) => {
              const Icon = item.icon
              const isActive = active === item.id
              const showBadge = item.id === 'chat' && pendingCount > 0
              const showMemoryBadge = item.id === 'memory' && (memoryStats?.returningToday ?? 0) > 0
              return (
                <button
                  key={item.id}
                  onClick={() => onChange(item.id)}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-rose-500/20 to-transparent text-rose-300'
                      : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-rose-500" />
                  )}
                  <Icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {showBadge && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {pendingCount}
                    </span>
                  )}
                  {showMemoryBadge && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
                      {memoryStats?.returningToday}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="mt-auto rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-[11px] text-zinc-500">
            <div className="mb-1 flex items-center gap-1.5 text-rose-400">
              <Heart className="h-3 w-3 fill-current" />
              <span className="font-medium">Kontrollü Otonom</span>
            </div>
            <p>TikTok ToS riskine karşı her AI cevabı filtrelidir.</p>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-rose-500/15 bg-zinc-950/95 backdrop-blur-xl">
        <div className="grid grid-cols-5">
          {NAV.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors',
                  isActive ? 'text-rose-400' : 'text-zinc-500'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label.split(' ')[0]}</span>
                {item.id === 'chat' && pendingCount > 0 && (
                  <span className="absolute right-2 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                    {pendingCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}

function MoodPill({ mood }: { mood: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    happy: { label: '😊 Mutlu', cls: 'text-yellow-300' },
    flirty: { label: '😘 Flört', cls: 'text-pink-300' },
    shy: { label: '🙈 Utangaç', cls: 'text-rose-300' },
    excited: { label: '🤩 Heyecanlı', cls: 'text-orange-300' },
    calm: { label: '😌 Sakin', cls: 'text-cyan-300' },
    angry: { label: '😠 Kızgın', cls: 'text-red-400' },
  }
  const m = map[mood] || map.happy
  return <span className={cn('font-medium', m.cls)}>{m.label}</span>
}
