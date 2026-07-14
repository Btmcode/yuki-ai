'use client'

import { useEffect, useState } from 'react'
import {
  Brain, Users, Crown, Clock, Gift, MessageSquare,
  Search, Trash2, StickyNote, Heart, Star, TrendingUp,
} from 'lucide-react'
import { useBridge, getSocket, UserMemory } from '@/lib/bridge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

const TOPIC_LABELS: Record<string, string> = {
  'anime': 'Anime',
  'aşk': 'Aşk',
  'yaş': 'Yaş',
  'ai': 'AI',
  'kahve': 'Kahve',
  'japonca': 'Japonca',
  'şiir': 'Şiir',
  'moral': 'Moral',
  'şehir': 'Şehir',
  'müzik': 'Müzik',
}

export function MemorySection() {
  const { memoryStats, memoryUsers } = useBridge()
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserMemory | null>(null)
  const [noteInput, setNoteInput] = useState('')

  // İlk yüklemede verileri çek
  useEffect(() => {
    const s = getSocket()
    s.emit('memory:stats:get', {})
    s.emit('memory:list', { limit: 50, sortBy: 'messageCount' })
  }, [])

  // Arama değişince tekrar çek
  useEffect(() => {
    const t = setTimeout(() => {
      getSocket().emit('memory:list', {
        limit: 50,
        sortBy: 'messageCount',
        search: search.trim() || undefined,
      })
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const handleShowUser = (user: UserMemory) => {
    setSelectedUser(user)
    getSocket().emit('memory:get-user', { username: user.username })
  }

  const handleAddNote = () => {
    if (!selectedUser || !noteInput.trim()) return
    getSocket().emit('memory:add-note', {
      username: selectedUser.username,
      note: noteInput.trim(),
    })
    setNoteInput('')
    setTimeout(() => {
      getSocket().emit('memory:get-user', { username: selectedUser.username })
    }, 500)
  }

  const handleForget = (username: string) => {
    getSocket().emit('memory:forget', { username })
    setSelectedUser(null)
  }

  const handleClearAll = () => {
    getSocket().emit('memory:clear-all')
  }

  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Başlık açıklama */}
      <Card className="border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-fuchsia-500/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-rose-500/30 to-fuchsia-500/30">
              <Brain className="h-5 w-5 text-rose-300" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Yuki'nin Hafızası</h3>
              <p className="mt-0.5 text-xs text-zinc-400">
                Yuki izleyicileri hatırlar. Bir kullanıcı geri döndüğünde onu ismiyle karşılar,
                sadık hayranlarına özel davranır, geçen günün hediyelerini anar. Bu bağ kurma
                yöntemi TikTok'ta güçlü izleyici sadakati yaratır.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <MemoryStatCard
          icon={Users}
          label="Toplam İzleyici"
          value={memoryStats?.totalUsers ?? 0}
          color="cyan"
        />
        <MemoryStatCard
          icon={TrendingUp}
          label="Bugün Geri Dönen"
          value={memoryStats?.returningToday ?? 0}
          color="emerald"
        />
        <MemoryStatCard
          icon={Crown}
          label="Sadık Hayranlar"
          value={memoryStats?.loyalUsers ?? 0}
          color="amber"
        />
        <MemoryStatCard
          icon={Clock}
          label="Son 24 Saat"
          value={memoryStats?.recent24h ?? 0}
          color="rose"
        />
      </div>

      {/* Toplam etkileşim stats */}
      <Card className="border-zinc-800 bg-zinc-950/60">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1.5 text-zinc-400">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="text-[11px] uppercase tracking-wider">Mesaj</span>
              </div>
              <p className="mt-1 text-xl font-bold text-white">
                {memoryStats?.totalMessages ?? 0}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 text-zinc-400">
                <Gift className="h-3.5 w-3.5" />
                <span className="text-[11px] uppercase tracking-wider">Hediye</span>
              </div>
              <p className="mt-1 text-xl font-bold text-white">
                {memoryStats?.totalGifts ?? 0}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 text-zinc-400">
                <Star className="h-3.5 w-3.5" />
                <span className="text-[11px] uppercase tracking-wider">Elmas</span>
              </div>
              <p className="mt-1 text-xl font-bold text-fuchsia-300">
                {(memoryStats?.totalDiamonds ?? 0).toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İzleyici ara... (kullanıcı adı)"
            className="pl-9 bg-zinc-900 border-zinc-800"
          />
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Tümünü Sil
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-red-500/30 bg-zinc-950">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-400">Tüm Hafızayı Sil</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                Bu işlem tüm izleyici hafızasını kalıcı olarak silecek. Yuki kimseyi hatırlamayacak.
                Geri alınamaz. Emin misin?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-zinc-700 bg-zinc-900 text-zinc-300">Vazgeç</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearAll}
                className="bg-red-600 hover:bg-red-700"
              >
                Evet, hepsini sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* User list */}
      <Card className="border-zinc-800 bg-zinc-950/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-rose-400" />
              İzleyiciler
            </span>
            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
              {memoryUsers.length} kullanıcı
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[calc(100vh-26rem)] pr-2 scrollbar-pink">
            {memoryUsers.length === 0 ? (
              <div className="py-12 text-center">
                <Brain className="mx-auto h-12 w-12 text-zinc-700" />
                <p className="mt-3 text-sm text-zinc-500">
                  {search ? 'Arama sonucu yok' : 'Henüz hafızada kullanıcı yok'}
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  {search ? 'Farklı bir arama dene' : 'Yayını başlatınca izleyiciler burada görünür'}
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {memoryUsers.map((user) => (
                  <UserRow
                    key={user.username}
                    user={user}
                    onClick={() => handleShowUser(user)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* User detail dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl border-zinc-800 bg-zinc-950 max-h-[90vh] overflow-y-auto scrollbar-pink">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-rose-400 to-fuchsia-500 text-sm font-bold text-white">
                    {selectedUser.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white">@{selectedUser.username}</p>
                    <p className="text-xs text-zinc-500">
                      İlk görülme: {new Date(selectedUser.firstSeen).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Stats grid */}
                <div className="grid grid-cols-4 gap-2">
                  <DetailStat label="Gün sayısı" value={selectedUser.daysSeen.length} icon={Clock} />
                  <DetailStat label="Mesaj" value={selectedUser.messageCount} icon={MessageSquare} />
                  <DetailStat label="Hediye" value={selectedUser.giftCount} icon={Gift} />
                  <DetailStat
                    label="Elmas"
                    value={selectedUser.totalDiamonds}
                    icon={Star}
                    color="text-fuchsia-300"
                  />
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedUser.daysSeen.length >= 3 && (
                    <Badge className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30">
                      <Crown className="mr-1 h-3 w-3" />
                      Sadık Hayran ({selectedUser.daysSeen.length} gün)
                    </Badge>
                  )}
                  {selectedUser.giftCount > 0 && (
                    <Badge className="bg-rose-500/20 text-rose-300 hover:bg-rose-500/30">
                      <Gift className="mr-1 h-3 w-3" />
                      Hediye Gönderen
                    </Badge>
                  )}
                  {selectedUser.messageCount >= 10 && (
                    <Badge className="bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30">
                      <MessageSquare className="mr-1 h-3 w-3" />
                      Aktif Konuşan
                    </Badge>
                  )}
                </div>

                {/* Favori konular */}
                {selectedUser.favoriteTopics.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs uppercase tracking-wider text-zinc-500">
                      Favori Konular
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedUser.favoriteTopics.map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="border-rose-500/30 text-rose-300"
                        >
                          {TOPIC_LABELS[t] || t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Son hediye */}
                {selectedUser.lastGift && (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                    <p className="mb-1 text-xs uppercase tracking-wider text-zinc-500">
                      Son Hediye
                    </p>
                    <p className="text-sm text-zinc-200">
                      {selectedUser.lastGift.name}{' '}
                      <span className="text-fuchsia-300">
                        ({selectedUser.lastGift.diamonds} 💎)
                      </span>
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(selectedUser.lastGift.date).toLocaleString('tr-TR')}
                    </p>
                  </div>
                )}

                {/* Notlar */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Notlar ({selectedUser.notes.length})
                    </p>
                  </div>

                  {selectedUser.notes.length > 0 && (
                    <div className="mb-3 space-y-1.5">
                      {selectedUser.notes.map((note, i) => (
                        <div
                          key={i}
                          className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2.5"
                        >
                          <p className="text-sm text-zinc-200">{note.text}</p>
                          <p className="mt-1 text-[10px] text-zinc-500">
                            {new Date(note.date).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="Yuki için not ekle... (örn: 'Her zaman Naruto'dan bahsediyor')"
                      className="bg-zinc-900 border-zinc-800"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddNote()
                      }}
                    />
                    <Button
                      onClick={handleAddNote}
                      disabled={!noteInput.trim()}
                      className="bg-rose-500 hover:bg-rose-600"
                    >
                      <StickyNote className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Yuki'nin hatırlayacağı şeyler */}
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                  <p className="mb-1.5 text-xs uppercase tracking-wider text-rose-400">
                    Yuki'nin Hatırlayacağı Şeyler
                  </p>
                  <p className="text-xs text-zinc-300">
                    Bu kullanıcı geri döndüğünde Yuki şu anıları kullanabilir:
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-zinc-400">
                    <li>• {selectedUser.daysSeen.length} farklı gün geldi</li>
                    {selectedUser.lastGift && (
                      <li>• En son {selectedUser.lastGift.name} hediyesi gönderdi</li>
                    )}
                    {selectedUser.favoriteTopics.length > 0 && (
                      <li>• Sevdiği konu: {TOPIC_LABELS[selectedUser.favoriteTopics[0]] || selectedUser.favoriteTopics[0]}</li>
                    )}
                    {selectedUser.notes.length > 0 && (
                      <li>• Operatör notu: "{selectedUser.notes[0].text}"</li>
                    )}
                  </ul>
                </div>
              </div>

              <DialogFooter>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="mr-1.5 h-4 w-4" />
                      Hafızadan Sil
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-red-500/30 bg-zinc-950">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-400">
                        @{selectedUser.username} Hafızadan Silinsin mi?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400">
                        Yuki bu kullanıcıyı tamamen unutacak. Tüm mesaj, hediye ve not geçmişi silinecek.
                        Geri alınamaz.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-zinc-700 bg-zinc-900 text-zinc-300">Vazgeç</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleForget(selectedUser.username)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Evet, sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  onClick={() => setSelectedUser(null)}
                  className="bg-rose-500 hover:bg-rose-600"
                >
                  Kapat
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MemoryStatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Users
  label: string
  value: number
  color: 'cyan' | 'emerald' | 'amber' | 'rose'
}) {
  const colorMap = {
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
  }
  return (
    <Card className="border-zinc-800 bg-zinc-950/60">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          </div>
          <Icon className={cn('h-5 w-5', colorMap[color])} />
        </div>
      </CardContent>
    </Card>
  )
}

function DetailStat({
  label,
  value,
  icon: Icon,
  color = 'text-white',
}: {
  label: string
  value: number
  icon: typeof Clock
  color?: string
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2.5 text-center">
      <Icon className="mx-auto mb-1 h-3.5 w-3.5 text-zinc-500" />
      <p className={cn('text-lg font-bold', color)}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
    </div>
  )
}

function UserRow({ user, onClick }: { user: UserMemory; onClick: () => void }) {
  const isLoyal = user.daysSeen.length >= 3
  const isReturningToday = () => {
    const today = new Date().toISOString().slice(0, 10)
    return user.lastDaySeen === today && user.daysSeen.length > 1
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'msg-enter flex w-full items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-left transition-all hover:border-rose-500/30 hover:bg-rose-500/5',
        isLoyal && 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40'
      )}
    >
      {/* Avatar */}
      <div className={cn(
        'grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold',
        isLoyal
          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
          : 'bg-zinc-700 text-zinc-300'
      )}>
        {user.username.slice(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium text-zinc-200">@{user.username}</p>
          {isLoyal && (
            <Crown className="h-3 w-3 shrink-0 text-amber-400" />
          )}
          {isReturningToday() && (
            <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[9px] py-0">
              Bugün döndü
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-zinc-500">
          {user.daysSeen.length} gün · {user.messageCount} mesaj · {user.giftCount} hediye
        </p>
      </div>

      {/* Right info */}
      <div className="flex shrink-0 items-center gap-1.5">
        {user.totalDiamonds > 0 && (
          <Badge className="bg-fuchsia-500/15 text-fuchsia-300 hover:bg-fuchsia-500/20 text-[10px]">
            {user.totalDiamonds} 💎
          </Badge>
        )}
        {user.notes.length > 0 && (
          <StickyNote className="h-3 w-3 text-rose-400" />
        )}
      </div>
    </button>
  )
}
