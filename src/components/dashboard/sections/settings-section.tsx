'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Ban, Trash2, Plus, Key, Shield, Bot, Save } from 'lucide-react'
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
        <TabsList className="bg-zinc-900/60 border border-zinc-800">
          <TabsTrigger value="tiktok" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-300">
            TikTok Bağlantısı
          </TabsTrigger>
          <TabsTrigger value="api" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-300">
            API Anahtarları
          </TabsTrigger>
          <TabsTrigger value="persona" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-300">
            Karakter
          </TabsTrigger>
          <TabsTrigger value="moderation" className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-300">
            Moderasyon
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
