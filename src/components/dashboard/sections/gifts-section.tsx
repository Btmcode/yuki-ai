'use client'

import { useMemo } from 'react'
import { Gift, Gem, TrendingUp, Users, Crown, Sparkles } from 'lucide-react'
import { useBridge } from '@/lib/bridge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

export function GiftsSection() {
  const { gifts, state } = useBridge()

  // Top gifters
  const topGifters = useMemo(() => {
    const map = new Map<string, { count: number; diamonds: number }>()
    for (const g of gifts) {
      const cur = map.get(g.username) || { count: 0, diamonds: 0 }
      cur.count += 1
      cur.diamonds += g.diamondCount * g.giftCount
      map.set(g.username, cur)
    }
    return Array.from(map.entries())
      .map(([username, v]) => ({ username, ...v }))
      .sort((a, b) => b.diamonds - a.diamonds)
      .slice(0, 10)
  }, [gifts])

  // Top gifts by type
  const topGiftTypes = useMemo(() => {
    const map = new Map<string, { count: number; diamonds: number; emoji?: string }>()
    for (const g of gifts) {
      const cur = map.get(g.giftName) || { count: 0, diamonds: 0, emoji: g.imageUrl || undefined }
      cur.count += 1
      cur.diamonds += g.diamondCount * g.giftCount
      map.set(g.giftName, cur)
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.diamonds - a.diamonds)
  }, [gifts])

  const recent = [...gifts].reverse()
  const maxGifterDiamonds = topGifters[0]?.diamonds || 1

  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <Gift className="h-4 w-4 text-rose-400" />
              <span className="text-[11px] uppercase tracking-wider">Toplam Hediye</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{state.totalGifts}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <Gem className="h-4 w-4 text-fuchsia-400" />
              <span className="text-[11px] uppercase tracking-wider">Elmas</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {state.totalDiamonds.toLocaleString('tr-TR')}
            </p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <Users className="h-4 w-4 text-cyan-400" />
              <span className="text-[11px] uppercase tracking-wider">Hediye Gönderen</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{topGifters.length}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-[11px] uppercase tracking-wider">Ortalama Elmas</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {state.totalGifts > 0
                ? Math.round(state.totalDiamonds / state.totalGifts).toLocaleString('tr-TR')
                : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top gifters */}
        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-amber-400" />
              En Çok Hediye Gönderenler
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {topGifters.length === 0 ? (
              <p className="py-8 text-center text-xs text-zinc-500">Henüz hediye yok</p>
            ) : (
              <div className="space-y-2">
                {topGifters.map((g, i) => (
                  <div
                    key={g.username}
                    className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2"
                  >
                    <div
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                        i === 0
                          ? 'bg-amber-500/20 text-amber-300'
                          : i === 1
                            ? 'bg-zinc-500/20 text-zinc-300'
                            : i === 2
                              ? 'bg-orange-700/30 text-orange-300'
                              : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-200">@{g.username}</p>
                      <div className="mt-0.5 h-1 w-full overflow-hidden rounded bg-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-fuchsia-500"
                          style={{ width: `${(g.diamonds / maxGifterDiamonds) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-fuchsia-300">
                        {g.diamonds.toLocaleString('tr-TR')}
                      </p>
                      <p className="text-[10px] text-zinc-500">{g.count} hediye</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gift types */}
        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-rose-400" />
              Hediye Türleri
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {topGiftTypes.length === 0 ? (
              <p className="py-8 text-center text-xs text-zinc-500">Henüz hediye türü yok</p>
            ) : (
              <div className="space-y-2">
                {topGiftTypes.map((g) => (
                  <div
                    key={g.name}
                    className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2"
                  >
                    <span className="text-xl">{g.emoji || '🎁'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-200">{g.name}</p>
                      <p className="text-[10px] text-zinc-500">{g.count} kez gönderildi</p>
                    </div>
                    <Badge className="bg-fuchsia-500/15 text-fuchsia-300 hover:bg-fuchsia-500/20">
                      {g.diamonds.toLocaleString('tr-TR')} 💎
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent gifts feed */}
      <Card className="border-zinc-800 bg-zinc-950/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Gift className="h-4 w-4 text-rose-400" />
            Hediye Akışı (Canlı)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-72 pr-2 scrollbar-pink">
            {recent.length === 0 ? (
              <p className="py-8 text-center text-xs text-zinc-500">Henüz hediye yok</p>
            ) : (
              <div className="space-y-1.5">
                {recent.map((g) => (
                  <div
                    key={g.id}
                    className="msg-enter flex items-center gap-3 rounded-lg border border-rose-500/10 bg-rose-500/5 px-3 py-2"
                  >
                    <span className="text-xl">{g.imageUrl || '🎁'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        <span className="font-semibold text-rose-300">@{g.username}</span>
                        <span className="text-zinc-400"> · {g.giftName}</span>
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {new Date(g.timestamp).toLocaleTimeString('tr-TR')}
                      </p>
                    </div>
                    <Badge className="bg-fuchsia-500/15 text-fuchsia-300 hover:bg-fuchsia-500/20">
                      {g.diamondCount * g.giftCount} 💎
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
