'use client'

import { useState } from 'react'
import {
  Cpu, Brain, Heart, Sparkles, Send, AlertTriangle,
  CheckCircle2, Zap, Hand, Bot
} from 'lucide-react'
import { useBridge, getSocket, AutonomyMode, CharacterMood } from '@/lib/bridge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const MOODS: { id: CharacterMood; label: string; emoji: string; desc: string }[] = [
  { id: 'happy', label: 'Mutlu', emoji: '😊', desc: 'Neşeli, samimi' },
  { id: 'flirty', label: 'Flörtöz', emoji: '😘', desc: 'Tatlı, ima dolu' },
  { id: 'shy', label: 'Utangaç', emoji: '🙈', desc: 'Mahcup, çekingen' },
  { id: 'excited', label: 'Heyecanlı', emoji: '🤩', desc: 'Coşkulu, enerjik' },
  { id: 'calm', label: 'Sakin', emoji: '😌', desc: 'Yavaş, rahatlatıcı' },
  { id: 'angry', label: 'Kızgın', emoji: '😠', desc: 'Ters, mesafeli' },
]

const MODES: { id: AutonomyMode; label: string; icon: typeof Hand; desc: string; color: string; risk: 'Düşük' | 'Orta' | 'Yüksek' }[] = [
  {
    id: 'manual',
    label: 'Manuel',
    icon: Hand,
    desc: 'Her AI cevabı senin onayını ister. En güvenli mod.',
    color: 'emerald',
    risk: 'Düşük',
  },
  {
    id: 'semi',
    label: 'Yarı Otonom',
    icon: Sparkles,
    desc: 'AI otomatik cevaplar ama yasaklı kelime/kullanıcı filtrelenir, panic stop aktif.',
    color: 'amber',
    risk: 'Orta',
  },
  {
    id: 'full',
    label: 'Tam Otonom',
    icon: Zap,
    desc: '7/24 insan müdahalesi yok. TikTok ToS ihlali riski EN YÜKSEK.',
    color: 'rose',
    risk: 'Yüksek',
  },
]

export function ControlSection() {
  const { state } = useBridge()
  const [manualText, setManualText] = useState('')
  const [manualMood, setManualMood] = useState<CharacterMood>(state.mood)

  const handleSetMode = (mode: AutonomyMode) => {
    getSocket().emit('autonomy:set', { mode })
  }

  const handleSetMood = (mood: CharacterMood) => {
    getSocket().emit('mood:set', { mood })
    setManualMood(mood)
  }

  const handleSpeak = () => {
    if (!manualText.trim()) return
    getSocket().emit('ai:speak', { text: manualText.trim(), mood: manualMood })
    setManualText('')
  }

  return (
    <div className="space-y-4 p-4 lg:p-6">
      {/* Autonomy Mode */}
      <Card className="border-zinc-800 bg-zinc-950/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Cpu className="h-4 w-4 text-rose-400" />
            Otonomi Modu
          </CardTitle>
          <CardDescription className="text-zinc-500">
            AI'ın ne kadar bağımsız karar vermesi gerektiğini seç. Ban riskini doğrudan etkiler.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 sm:grid-cols-3">
            {MODES.map((m) => {
              const Icon = m.icon
              const isActive = state.autonomyMode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => handleSetMode(m.id)}
                  className={cn(
                    'group relative overflow-hidden rounded-xl border p-4 text-left transition-all',
                    isActive
                      ? 'border-rose-500/50 bg-gradient-to-br from-rose-500/15 to-transparent'
                      : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <Icon className={cn('h-5 w-5', isActive ? 'text-rose-400' : 'text-zinc-500')} />
                    {isActive && (
                      <CheckCircle2 className="h-4 w-4 text-rose-400" />
                    )}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white">{m.label}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">{m.desc}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px]',
                        m.risk === 'Düşük' ? 'border-emerald-500/30 text-emerald-400' :
                        m.risk === 'Orta' ? 'border-amber-500/30 text-amber-400' :
                        'border-rose-500/30 text-rose-400'
                      )}
                    >
                      Risk: {m.risk}
                    </Badge>
                  </div>
                </button>
              )
            })}
          </div>

          {state.autonomyMode === 'full' && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
              <p className="text-xs text-rose-300">
                <strong>Uyarı:</strong> Tam Otonom mod TikTok Topluluk Kuralları'na aykırı olabilir.
                Hesap banı riski yüksektir. Yarı Otonom önerilir.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Mood */}
        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-rose-400" />
              Karakter Ruh Hali
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Yuki'nin ses tonu ve cevap tarzını anlık değiştir
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-2">
              {MOODS.map((m) => {
                const isActive = state.mood === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSetMood(m.id)}
                    className={cn(
                      'rounded-lg border p-3 text-center transition-all',
                      isActive
                        ? 'border-rose-500/50 bg-rose-500/10'
                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                    )}
                  >
                    <div className="text-2xl">{m.emoji}</div>
                    <p className={cn('mt-1 text-xs font-medium', isActive ? 'text-rose-300' : 'text-zinc-300')}>
                      {m.label}
                    </p>
                    <p className="mt-0.5 text-[10px] text-zinc-500">{m.desc}</p>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Manual speak */}
        <Card className="border-zinc-800 bg-zinc-950/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bot className="h-4 w-4 text-rose-400" />
              Manuel Konuşma
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Yuki adına anında bir mesaj yayınla (onaya gerek yok)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setManualMood(m.id)}
                  className={cn(
                    'rounded-md border px-2 py-1 text-xs transition-colors',
                    manualMood === m.id
                      ? 'border-rose-500/50 bg-rose-500/10 text-rose-300'
                      : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  )}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
            <Textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Yuki'nin söylemesini istediğin metni yaz..."
              rows={4}
              className="bg-zinc-900 border-zinc-800 resize-none"
            />
            <Button
              onClick={handleSpeak}
              disabled={!manualText.trim()}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
            >
              <Send className="mr-1.5 h-4 w-4" />
              Yayınla
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Persona info */}
      <Card className="border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-fuchsia-500/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Brain className="h-4 w-4 text-rose-400" />
            Karakter Kişiliği (System Prompt Özeti)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 font-mono text-xs leading-relaxed text-zinc-300">
            <p className="mb-2 text-rose-400">{'// Yuki — Sistem Promptu'}</p>
            <p>Sen Yuki'sin, 17 yaşında anime karakteri, Tokyo'dan.</p>
            <p>Ses tonun: samimi, flörtöz ama sınırları koruyan.</p>
            <p>Türk izleyicisine sıcak yaklaşır, isimleriyle hitap edersin.</p>
            <p>ASMR tarzı sakin anlar ve enerjik anime referansları dengelersin.</p>
            <p>AI olduğunu gizlemezsin, dürüstsün. Asla küfür etmezsin.</p>
            <p>Cevapların 1-2 cümle, doğal konuşma dilinde olur.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
