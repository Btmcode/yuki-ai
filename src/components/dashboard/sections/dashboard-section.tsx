'use client'

import { Users, Gift, Gem, Clock, TrendingUp, Activity, Heart } from 'lucide-react'
import { useBridge } from '@/lib/bridge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useEffect, useState } from 'react'

export function DashboardSection() {
  const { state, messages, gifts } = useBridge()

  // İzleyici geçmişi (basit grafik için)
  const [history, setHistory] = useState<number[]>(Array(40).fill(0))
  useEffect(() => {
    setHistory((h) => [...h.slice(1), state.viewers])
  }, [state.viewers])

  const uptime = state.startTime ? Date.now() - new Date(state.startTime).getTime() : 0
  const uptimeStr = formatUptime(uptime)

  const recentGifts = gifts.slice(-5).reverse()
  const recentMessages = messages.slice(-8).reverse()

  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Stats grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="İzleyiciler"
          value={state.viewers.toLocaleString('tr-TR')}
          icon={Users}
          accent="from-cyan-500/20 to-transparent"
          iconColor="text-cyan-400"
          trend={history[history.length - 1] > history[history.length - 10] ? '+' : '-'}
        />
        <StatCard
          label="Toplam Hediye"
          value={state.totalGifts.toLocaleString('tr-TR')}
          icon={Gift}
          accent="from-rose-500/20 to-transparent"
          iconColor="text-rose-400"
        />
        <StatCard
          label="Elmas"
          value={state.totalDiamonds.toLocaleString('tr-TR')}
          icon={Gem}
          accent="from-fuchsia-500/20 to-transparent"
          iconColor="text-fuchsia-400"
        />
        <StatCard
          label="Yayın Süresi"
          value={uptimeStr}
          icon={Clock}
          accent="from-amber-500/20 to-transparent"
          iconColor="text-amber-400"
        />
      </div>

      {/* Viewer chart */}
      <Card className="border-zinc-800 bg-zinc-950/60">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-rose-400" />
              İzleyci Trendi
            </span>
            <Badge variant="outline" className="border-zinc-700 text-[11px] text-zinc-400">
              Son {history.length} ölçüm
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ViewerSparkline data={history} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent gifts */}
        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Gift className="h-4 w-4 text-rose-400" />
              Son Hediyeler
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {recentGifts.length === 0 ? (
              <p className="py-6 text-center text-xs text-zinc-500">Henüz hediye yok</p>
            ) : (
              <ScrollArea className="h-48 pr-2 scrollbar-pink">
                <div className="space-y-2">
                  {recentGifts.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center gap-3 rounded-lg border border-rose-500/10 bg-rose-500/5 px-3 py-2 msg-enter"
                    >
                      <span className="text-xl">{g.imageUrl || '🎁'}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-200">
                          <span className="text-rose-300">@{g.username}</span>
                          <span className="text-zinc-500"> gönderdi:</span>{' '}
                          {g.giftName}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {new Date(g.timestamp).toLocaleTimeString('tr-TR')}
                        </p>
                      </div>
                      <Badge className="bg-fuchsia-500/15 text-fuchsia-300 hover:bg-fuchsia-500/20">
                        {g.diamondCount} 💎
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-rose-400" />
              Son Aktivite
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-48 pr-2 scrollbar-pink">
              <div className="space-y-1.5">
                {recentMessages.length === 0 ? (
                  <p className="py-6 text-center text-xs text-zinc-500">Henüz mesaj yok</p>
                ) : (
                  recentMessages.map((m) => (
                    <div key={m.id} className="msg-enter rounded-md px-2 py-1.5 text-xs">
                      {m.source === 'system' ? (
                        <p className="italic text-zinc-500">{m.content}</p>
                      ) : m.source === 'ai' ? (
                        <p className="text-zinc-300">
                          <span className="font-semibold text-rose-300">Yuki:</span>{' '}
                          <span className="text-zinc-200">{m.content}</span>
                        </p>
                      ) : (
                        <p className="text-zinc-400">
                          <span className="font-medium text-zinc-300">{m.username}:</span> {m.content}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Persona card */}
      <Card className="border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-fuchsia-500/5 to-transparent">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-rose-400 to-fuchsia-500 text-3xl font-bold text-white shadow-xl shadow-rose-500/30">
              雪
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Yuki — Dijital Fenomen</h3>
              <p className="mt-1 text-sm text-zinc-400">
                17 yaşında anime karakteri, Tokyo'dan. Samimi, flörtöz ama sınırları koruyan.
                Türk izleyicisine özel ilgi gösterir, Japon kültürü referansları sever.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="outline" className="border-rose-500/30 text-rose-300">
                  <Heart className="mr-1 h-2.5 w-2.5" /> Alara-tarzı
                </Badge>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">Kontrollü Otonom</Badge>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">Türkçe</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  iconColor,
  trend,
}: {
  label: string
  value: string
  icon: typeof Users
  accent: string
  iconColor: string
  trend?: string
}) {
  return (
    <Card className={`relative overflow-hidden border-zinc-800 bg-zinc-950/60`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-60`} />
      <CardContent className="relative p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{value}</p>
            {trend && (
              <p className={`mt-0.5 text-[11px] ${trend === '+' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trend} son ölçüm
              </p>
            )}
          </div>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </CardContent>
    </Card>
  )
}

function ViewerSparkline({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const w = 100
  const h = 40
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / range) * h
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-24 w-full">
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(244 63 94)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="rgb(244 63 94)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${h} ${points} ${w},${h}`} fill="url(#sparkGrad)" />
        <polyline
          points={points}
          fill="none"
          stroke="rgb(244 63 94)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
        <span>Max: {max}</span>
        <span>Min: {min}</span>
        <span>Şimdi: {data[data.length - 1]}</span>
      </div>
    </div>
  )
}

function formatUptime(ms: number): string {
  if (ms <= 0) return '00:00:00'
  const s = Math.floor(ms / 1000)
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}
