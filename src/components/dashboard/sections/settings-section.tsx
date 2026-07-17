'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserPlus, Ban, Trash2, Plus, Key, Shield, Bot, Save, CheckCircle2, RefreshCw, X, ExternalLink } from 'lucide-react'
import { useBridge, getSocket } from '@/lib/bridge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function SettingsSection() {
  const { state, bannedUsers, filteredWords } = useBridge()
  const [tiktokUser, setTiktokUser] = useState(state.tiktokUser)
  const [banInput, setBanInput] = useState('')
  const [banReason, setBanReason] = useState('')
  const [filterInput, setFilterInput] = useState('')

  // API keys (local state, gerçekte .env'de olmalı)
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    elevenlabs: '',
    tiktokSession: '',
  })

  // Persona
  const [persona, setPersona] = useState({
    name: 'Yuki',
    age: '17',
    origin: 'Tokyo, Japonya',
    personality: 'Samimi, flörtöz ama sınırları koruyan. Türk izleyiciye sıcak.',
    systemPrompt: `Sen Yuki'sin, 17 yaşında anime karakteri, Tokyo'dan.
Ses tonun: samimi, flörtöz ama sınırları koruyan.
Türk izleyicisine sıcak yaklaşır, isimleriyle hitap edersin.
ASMR tarzı sakin anlar ve enerjik anime referansları dengelersin.
AI olduğunu gizlemezsin, dürüstsün. Asla küfür etmezsin.
Cevapların 1-2 cümle, doğal konuşma dilinde olur.`,
  })

  useEffect(() => {
    getSocket().emit('ban:list:get')
    getSocket().emit('filter:list:get')
  }, [])

  const handleSaveTiktok = () => {
    getSocket().emit('stream:stop')
    setTimeout(() => {
      getSocket().emit('stream:start', { tiktokUser })
    }, 200)
  }

  const handleBanAdd = () => {
    if (!banInput.trim()) return
    getSocket().emit('ban:add', { username: banInput.trim(), reason: banReason.trim() || undefined })
    setBanInput('')
    setBanReason('')
  }

  const handleBanRemove = (username: string) => {
    getSocket().emit('ban:remove', { username })
  }

  const handleFilterAdd = () => {
    if (!filterInput.trim()) return
    getSocket().emit('filter:add', { word: filterInput.trim() })
    setFilterInput('')
  }

  const handleFilterRemove = (word: string) => {
    getSocket().emit('filter:remove', { word })
  }

  return (
    <div className="p-4 lg:p-6">
      <Tabs defaultValue="tiktok" className="w-full">
        <TabsList className="bg-zinc-900/60 border border-zinc-800 overflow-x-auto flex-nowrap w-full max-w-full">
          <TabsTrigger value="tiktok" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-300 flex-1 min-w-0">
            <span className="truncate">TikTok</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-300 flex-1 min-w-0">
            <span className="truncate">API</span>
          </TabsTrigger>
          <TabsTrigger value="persona" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-300 flex-1 min-w-0">
            <span className="truncate">Karakter</span>
          </TabsTrigger>
          <TabsTrigger value="moderation" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-300 flex-1 min-w-0">
            <span className="truncate">Moderasyon</span>
          </TabsTrigger>
        </TabsList>

        {/* TikTok */}
        <TabsContent value="tiktok" className="mt-4">
          <Card className="border-zinc-800 bg-zinc-950/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bot className="h-4 w-4 text-rose-400" />
                TikTok Hesap Bağlantısı
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Canlı yayın yapılacak TikTok kullanıcı adı. Hesabın Live yetkisi olmalı (1000+ takipçi).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tiktok-user" className="text-zinc-300">TikTok Kullanıcı Adı</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">@</span>
                    <Input
                      id="tiktok-user"
                      value={tiktokUser}
                      onChange={(e) => setTiktokUser(e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
                      className="pl-7 bg-zinc-900 border-zinc-800"
                      placeholder="yuki_ai"
                    />
                  </div>
                  <Button
                    onClick={handleSaveTiktok}
                    disabled={!tiktokUser.trim() || tiktokUser === state.tiktokUser}
                    className="bg-rose-500 hover:bg-rose-600"
                  >
                    <Save className="mr-1.5 h-4 w-4" />
                    Kaydet & Yeniden Bağlan
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-300">
                <strong>Kurulum:</strong> TikTok Live API kullanımı için Python backend'inde
                <code className="mx-1 rounded bg-zinc-900 px-1.5 py-0.5 text-rose-300">TikTokLive</code>
                kütüphanesi çalışıyor olmalı. Ayrıntılar proje README'sinde.
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-zinc-500">Aktif Hesap</p>
                  <p className="mt-1 text-sm font-medium text-white">@{state.tiktokUser}</p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-zinc-500">Yayın Durumu</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {state.isLive ? '🟢 Canlı' : '⚪ Offline'}
                  </p>
                </div>
              </div>

              {/* TikTok OAuth — Resmi API Bağlantısı */}
              <TikTokOAuthCard />
            </CardContent>
          </Card>
        </TabsContent>

        {/* API */}
        <TabsContent value="api" className="mt-4">
          <Card className="border-zinc-800 bg-zinc-950/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Key className="h-4 w-4 text-rose-400" />
                API Anahtarları
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Tüm anahtarlar Python backend'inde .env dosyasında saklanır. Buradan sadece referans.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ApiKeyField
                label="Google Gemini API Key"
                value={apiKeys.gemini}
                onChange={(v) => setApiKeys(s => ({ ...s, gemini: v }))}
                placeholder="AIzaSy..."
                hint="Ücretsiz tier: 15 req/dk. LLM sohbet için."
                docsUrl="https://aistudio.google.com/apikey"
              />
              <ApiKeyField
                label="ElevenLabs API Key"
                value={apiKeys.elevenlabs}
                onChange={(v) => setApiKeys(s => ({ ...s, elevenlabs: v }))}
                placeholder="el_..."
                hint="Ücretsiz tier: 10k karakter/ay. Yüksek kaliteli Türkçe ses."
                docsUrl="https://elevenlabs.io"
              />
              <ApiKeyField
                label="TikTok Session ID"
                value={apiKeys.tiktokSession}
                onChange={(v) => setApiKeys(s => ({ ...s, tiktokSession: v }))}
                placeholder="sessionid=..."
                hint="TikTok hesabından cookie alınır. TikTokLive library için."
                docsUrl="https://github.com/isaackogan/TikTokLive"
              />

              <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-300">
                <strong>Güvenlik:</strong> Bu anahtarlar tarayıcıda saklanmaz. Gerçek kullanım için
                Python backend'inde <code className="mx-1 rounded bg-zinc-900 px-1.5 py-0.5">.env</code>
                dosyasına ekleyin.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Persona */}
        <TabsContent value="persona" className="mt-4">
          <Card className="border-zinc-800 bg-zinc-950/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bot className="h-4 w-4 text-rose-400" />
                Karakter Kişiliği
              </CardTitle>
              <CardDescription className="text-zinc-500">
                AI'ın nasıl davranacağını belirleyen sistem promptu. Düzenle ve kaydet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-zinc-300">İsim</Label>
                  <Input
                    value={persona.name}
                    onChange={(e) => setPersona(s => ({ ...s, name: e.target.value }))}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-zinc-300">Yaş</Label>
                  <Input
                    value={persona.age}
                    onChange={(e) => setPersona(s => ({ ...s, age: e.target.value }))}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-zinc-300">Şehir/Ülke</Label>
                  <Input
                    value={persona.origin}
                    onChange={(e) => setPersona(s => ({ ...s, origin: e.target.value }))}
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300">Kişilik Özeti</Label>
                <Input
                  value={persona.personality}
                  onChange={(e) => setPersona(s => ({ ...s, personality: e.target.value }))}
                  className="bg-zinc-900 border-zinc-800"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-zinc-300">Sistem Promptu (LLM'e gönderilir)</Label>
                <Textarea
                  value={persona.systemPrompt}
                  onChange={(e) => setPersona(s => ({ ...s, systemPrompt: e.target.value }))}
                  rows={8}
                  className="bg-zinc-900 border-zinc-800 font-mono text-xs resize-none"
                />
              </div>

              <Button className="bg-rose-500 hover:bg-rose-600">
                <Save className="mr-1.5 h-4 w-4" />
                Karakteri Kaydet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moderasyon */}
        <TabsContent value="moderation" className="mt-4 space-y-4">
          {/* Banned users */}
          <Card className="border-zinc-800 bg-zinc-950/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Ban className="h-4 w-4 text-rose-400" />
                Yasaklı Kullanıcılar
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Bu kullanıcıların mesajları sessizce yok sayılır.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input
                  value={banInput}
                  onChange={(e) => setBanInput(e.target.value)}
                  placeholder="kullanıcı adı"
                  className="bg-zinc-900 border-zinc-800"
                />
                <Input
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="sebep (opsiyonel)"
                  className="bg-zinc-900 border-zinc-800"
                />
                <Button
                  onClick={handleBanAdd}
                  disabled={!banInput.trim()}
                  className="bg-rose-500 hover:bg-rose-600"
                >
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  Yasakla
                </Button>
              </div>

              <div className="space-y-1.5">
                {bannedUsers.length === 0 ? (
                  <p className="py-4 text-center text-xs text-zinc-500">Yasaklı kullanıcı yok</p>
                ) : (
                  bannedUsers.map((u) => (
                    <div
                      key={u}
                      className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2"
                    >
                      <Ban className="h-3.5 w-3.5 text-rose-400" />
                      <span className="flex-1 text-sm text-zinc-200">@{u}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleBanRemove(u)}
                        className="h-7 w-7 p-0 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Filtered words */}
          <Card className="border-zinc-800 bg-zinc-950/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-rose-400" />
                Filtreli Kelimeler
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Bu kelimeleri içeren mesajlar otomatik reddedilir.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={filterInput}
                  onChange={(e) => setFilterInput(e.target.value)}
                  placeholder="kelime"
                  className="bg-zinc-900 border-zinc-800"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleFilterAdd() }}
                />
                <Button
                  onClick={handleFilterAdd}
                  disabled={!filterInput.trim()}
                  className="bg-rose-500 hover:bg-rose-600"
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Ekle
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {filteredWords.length === 0 ? (
                  <p className="py-4 text-center text-xs text-zinc-500">Filtre yok</p>
                ) : (
                  filteredWords.map((w) => (
                    <Badge
                      key={w}
                      variant="outline"
                      className="border-zinc-700 bg-zinc-900/60 text-zinc-300 pr-1"
                    >
                      {w}
                      <button
                        onClick={() => handleFilterRemove(w)}
                        className="ml-1.5 grid h-4 w-4 place-items-center rounded-full hover:bg-rose-500/30 hover:text-rose-300"
                      >
                        ×
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================================================
// TikTok OAuth Card — Resmi API ile hesap bağlama
// ============================================================================
function TikTokOAuthCard() {
  const [account, setAccount] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // URL params — TikTok callback'ten gelen error/success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tiktokError = params.get('tiktok_error')
    const tiktokConnected = params.get('tiktok_connected')
    if (tiktokError) {
      setError(`Bağlantı hatası: ${tiktokError}`)
    } else if (tiktokConnected === 'true') {
      // URL'i temizle
      window.history.replaceState({}, '', '/?section=tiktok')
    }
  }, [])

  // Hesap durumunu getir
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/tiktok/status')
      const data = await res.json()
      setAccount(data.connected ? data.account : null)
      setError(null)
    } catch (e) {
      setError('Durum getirilemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const handleConnect = () => {
    // TikTok OAuth başlat
    window.location.href = '/api/tiktok/auth'
  }

  const handleDisconnect = async () => {
    try {
      await fetch('/api/tiktok/disconnect', { method: 'POST' })
      setAccount(null)
    } catch (e) {
      setError('Bağlantı kesilemedi')
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      const res = await fetch('/api/tiktok/sync', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        await fetchStatus()
      } else {
        setError(data.error || 'Senkronizasyon başarısız')
      }
    } catch (e) {
      setError('Senkronizasyon hatası')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
            <CheckCircle2 className="h-4 w-4 text-rose-400" />
            TikTok Resmi API Bağlantısı
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            Display API v2 — profil, stats ve video listesi için
          </p>
        </div>
        {account && (
          <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Bağlı
          </Badge>
        )}
      </div>

      {error && (
        <div className="mb-3 rounded-md border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-4 text-center text-xs text-zinc-500">Yükleniyor...</div>
      ) : account ? (
        <div className="space-y-3">
          {/* Profil bilgisi */}
          <div className="flex items-center gap-3">
            {account.avatarUrl && (
              <img
                src={account.avatarUrl}
                alt={account.displayName || account.username}
                className="h-10 w-10 rounded-full border border-rose-500/30"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-sm font-medium text-white">
                {account.displayName || account.username}
                {account.isVerified && <CheckCircle2 className="h-3 w-3 text-rose-400" />}
              </p>
              <p className="truncate text-xs text-zinc-500">@{account.username}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-2">
              <p className="text-sm font-bold text-white">{account.followerCount.toLocaleString('tr-TR')}</p>
              <p className="text-[10px] text-zinc-500">Takipçi</p>
            </div>
            <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-2">
              <p className="text-sm font-bold text-white">{account.followingCount.toLocaleString('tr-TR')}</p>
              <p className="text-[10px] text-zinc-500">Takip</p>
            </div>
            <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-2">
              <p className="text-sm font-bold text-white">{account.likesCount.toLocaleString('tr-TR')}</p>
              <p className="text-[10px] text-zinc-500">Beğeni</p>
            </div>
            <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-2">
              <p className="text-sm font-bold text-white">{account.videoCount}</p>
              <p className="text-[10px] text-zinc-500">Video</p>
            </div>
          </div>

          {/* Son güncelleme */}
          {account.statsUpdatedAt && (
            <p className="text-[10px] text-zinc-600">
              Son senkronizasyon: {new Date(account.statsUpdatedAt).toLocaleString('tr-TR')}
            </p>
          )}

          {/* Aksiyonlar */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={syncing}
              className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Senkronize ediliyor...' : 'Verileri Yenile'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDisconnect}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Bağlantıyı Kes
            </Button>
          </div>

          {/* Son videolar */}
          {account.videos && account.videos.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] uppercase tracking-wider text-zinc-500">
                Son {account.videos.length} Video
              </p>
              <div className="max-h-40 space-y-1.5 overflow-y-auto scrollbar-pink pr-1">
                {account.videos.slice(0, 5).map((v: any) => (
                  <div key={v.videoId} className="rounded-md border border-zinc-800 bg-zinc-900/40 p-2">
                    <p className="truncate text-xs text-zinc-300">
                      {v.title || v.description || 'Başlıksız'}
                    </p>
                    <div className="mt-1 flex gap-3 text-[10px] text-zinc-500">
                      <span>👁 {v.viewCount.toLocaleString('tr-TR')}</span>
                      <span>❤️ {v.likeCount.toLocaleString('tr-TR')}</span>
                      <span>💬 {v.commentCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-zinc-400">
            TikTok hesabını resmi API ile bağla. Profil bilgisi, takipçi sayısı,
            video istatistikleri otomatik çekilir.
          </p>
          <Button
            onClick={handleConnect}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
          >
            <ExternalLink className="mr-1.5 h-4 w-4" />
            TikTok ile Bağlan
          </Button>
          <p className="text-[10px] text-zinc-600">
            İzin verilen kapsamlar: user.info.profile, user.info.stats, video.list
          </p>
        </div>
      )}
    </div>
  )
}

function ApiKeyField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  docsUrl,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  hint: string
  docsUrl: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-zinc-300">{label}</Label>
        <a
          href={docsUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-rose-400 hover:underline"
        >
          Döküman →
        </a>
      </div>
      <div className="flex gap-2">
        <Input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-zinc-900 border-zinc-800 font-mono text-xs"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShow(!show)}
          className="border-zinc-700 text-zinc-300"
        >
          {show ? 'Gizle' : 'Göster'}
        </Button>
      </div>
      <p className="text-[11px] text-zinc-500">{hint}</p>
    </div>
  )
}
