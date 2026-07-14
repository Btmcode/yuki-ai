'use client'

import { LayoutDashboard, MessageSquare, Cpu, Gift, Settings, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBridge } from '@/lib/bridge'

export type SectionId = 'dashboard' | 'chat' | 'control' | 'gifts' | 'settings'

interface SidebarProps {
  active: SectionId
  onChange: (id: SectionId) => void
}

const NAV: { id: SectionId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
  { id: 'chat', label: 'Canlı Sohbet', icon: MessageSquare },
  { id: 'control', label: 'AI Kontrol', icon: Cpu },
  { id: 'gifts', label: 'Hediyeler', icon: Gift },
  { id: 'settings', label: 'Ayarlar', icon: Settings },
]

export function Sidebar({ active, onChange }: SidebarProps) {
  const { pendingCount, state } = useBridge()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-rose-500/10 bg-zinc-950/50">
        <div className="flex h-full flex-col gap-2 p-3">
          {/* Karakter kartı */}
          <div className="mb-2 rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-transparent p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-rose-400 to-fuchsia-500 text-xl font-bold text-white shadow-lg shadow-rose-500/30">
                  雪
                </div>
                <span
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-zinc-950',
                    state.isLive ? 'bg-rose-500 live-dot' : 'bg-zinc-600'
                  )}
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">Yuki</p>
                <p className="truncate text-[11px] text-zinc-400">
                  {state.isLive ? `@${state.tiktokUser}` : 'Yayın offline'}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px]">
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
