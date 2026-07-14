'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, X, Edit, Send, Sparkles, User, Bot, Megaphone } from 'lucide-react'
import { useBridge, getSocket, ChatMessage } from '@/lib/bridge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export function ChatSection() {
  const { messages, state } = useBridge()
  const [autoScroll, setAutoScroll] = useState(true)
  const [testUser, setTestUser] = useState('test_user')
  const [testMsg, setTestMsg] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, autoScroll])

  const handleSendTest = () => {
    if (!testMsg.trim() || !testUser.trim()) return
    getSocket().emit('test:chat', { username: testUser.trim(), content: testMsg.trim() })
    setTestMsg('')
  }

  const pending = messages.filter(m => m.source === 'ai' && m.status === 'pending')
  const others = messages

  return (
    <div className="grid h-full gap-3 p-3 sm:gap-4 sm:p-4 lg:grid-cols-3 lg:p-6">
      {/* Pending approval — only visible when autonomy != full */}
      {state.autonomyMode !== 'full' && (
        <Card className="border-amber-500/30 bg-amber-500/5 lg:col-span-1 lg:max-h-[calc(100vh-8rem)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Onay Bekleyenler
              </span>
              <Badge className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30">
                {pending.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[calc(100vh-18rem)] pr-2 scrollbar-pink">
              {pending.length === 0 ? (
                <p className="py-8 text-center text-xs text-zinc-500">
                  Onay bekleyen AI cevabı yok
                </p>
              ) : (
                <div className="space-y-3">
                  {pending.map((m) => (
                    <PendingCard key={m.id} msg={m} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Main chat */}
      <Card
        className={cn(
          'flex flex-col border-zinc-800 bg-zinc-950/60',
          state.autonomyMode !== 'full' ? 'lg:col-span-2' : 'lg:col-span-3'
        )}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <span>Canlı Sohbet Akışı</span>
            <div className="flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-zinc-400">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="accent-rose-500"
                />
                Otomatik kaydır
              </label>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pt-0">
          <div
            ref={scrollRef}
            className="h-[calc(100vh-22rem)] overflow-y-auto pr-2 scrollbar-pink lg:h-[calc(100vh-18rem)]"
          >
            <div className="space-y-2">
              {others.length === 0 ? (
                <p className="py-12 text-center text-xs text-zinc-500">
                  Henüz mesaj yok. Yayını başlat veya aşağıdan test mesajı gönder.
                </p>
              ) : (
                others.map((m) => <MessageRow key={m.id} msg={m} />)
              )}
            </div>
          </div>

          {/* Test chat sender */}
          <div className="mt-3 flex flex-col gap-2 border-t border-zinc-800 pt-3 sm:flex-row">
            <Input
              value={testUser}
              onChange={(e) => setTestUser(e.target.value)}
              placeholder="Kullanıcı adı"
              className="sm:w-40 bg-zinc-900 border-zinc-800"
            />
            <Input
              value={testMsg}
              onChange={(e) => setTestMsg(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendTest() }}
              placeholder="Test mesajı yaz..."
              className="flex-1 bg-zinc-900 border-zinc-800"
            />
            <Button
              onClick={handleSendTest}
              size="sm"
              className="bg-rose-500 hover:bg-rose-600"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Gönder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MessageRow({ msg }: { msg: ChatMessage }) {
  if (msg.source === 'system') {
    return (
      <div className="msg-enter flex items-center gap-2 px-2 py-1 text-[11px] italic text-zinc-500">
        <Megaphone className="h-3 w-3 shrink-0" />
        <span>{msg.content}</span>
        <span className="ml-auto shrink-0 text-[10px]">{new Date(msg.timestamp).toLocaleTimeString('tr-TR')}</span>
      </div>
    )
  }

  const isAI = msg.source === 'ai'

  return (
    <div
      className={cn(
        'msg-enter flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm',
        isAI
          ? 'border border-rose-500/20 bg-rose-500/5'
          : msg.status === 'rejected'
            ? 'border border-red-500/30 bg-red-500/5 opacity-60'
            : 'hover:bg-zinc-900/50'
      )}
    >
      <div
        className={cn(
          'grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold',
          isAI
            ? 'bg-gradient-to-br from-rose-400 to-fuchsia-500 text-white'
            : 'bg-zinc-800 text-zinc-300'
        )}
      >
        {isAI ? <Bot className="h-3.5 w-3.5" /> : msg.username.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-semibold', isAI ? 'text-rose-300' : 'text-zinc-300')}>
            {isAI ? 'Yuki' : msg.username}
          </span>
          {isAI && msg.mood && <MoodTag mood={msg.mood} />}
          {isAI && msg.status === 'pending' && (
            <Badge className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[10px] py-0">
              Beklemede
            </Badge>
          )}
          {isAI && msg.status === 'approved' && (
            <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] py-0">
              Onaylandı
            </Badge>
          )}
          {isAI && msg.status === 'rejected' && (
            <Badge className="bg-red-500/20 text-red-300 hover:bg-red-500/30 text-[10px] py-0">
              Reddedildi
            </Badge>
          )}
          {isAI && msg.status === 'sent' && (
            <Badge className="bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] py-0">
              Yayında
            </Badge>
          )}
          {!isAI && msg.status === 'rejected' && (
            <Badge className="bg-red-500/20 text-red-300 hover:bg-red-500/30 text-[10px] py-0">
              Filtre
            </Badge>
          )}
          <span className="ml-auto shrink-0 text-[10px] text-zinc-500">
            {new Date(msg.timestamp).toLocaleTimeString('tr-TR')}
          </span>
        </div>
        <p className={cn('mt-0.5 break-words', isAI ? 'text-zinc-100' : 'text-zinc-300')}>
          {msg.content}
        </p>
      </div>
    </div>
  )
}

function PendingCard({ msg }: { msg: ChatMessage }) {
  const [editOpen, setEditOpen] = useState(false)
  const [editText, setEditText] = useState(msg.content)

  const approve = () => getSocket().emit('ai:approve', { messageId: msg.id })
  const reject = () => getSocket().emit('ai:reject', { messageId: msg.id })
  const saveEdit = () => {
    getSocket().emit('ai:edit', { messageId: msg.id, newText: editText })
    setEditOpen(false)
  }

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 msg-enter">
      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
        <User className="h-3 w-3" />
        <span>{msg.username === 'Yuki' ? 'AI cevabı' : msg.username}</span>
        {msg.mood && <MoodTag mood={msg.mood} />}
      </div>
      <p className="mt-1.5 text-sm text-zinc-100">{msg.content}</p>

      <div className="mt-2 flex items-center gap-1.5">
        <Button
          size="sm"
          variant="default"
          onClick={approve}
          className="h-7 bg-emerald-600 hover:bg-emerald-700 text-[11px]"
        >
          <Check className="mr-1 h-3 w-3" />
          Onayla
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={reject}
          className="h-7 border-red-500/40 text-red-400 hover:bg-red-500/10 text-[11px]"
        >
          <X className="mr-1 h-3 w-3" />
          Reddet
        </Button>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-7 border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-[11px]"
            >
              <Edit className="mr-1 h-3 w-3" />
              Düzenle
            </Button>
          </DialogTrigger>
          <DialogContent className="border-zinc-800 bg-zinc-950">
            <DialogHeader>
              <DialogTitle>AI Cevabını Düzenle</DialogTitle>
            </DialogHeader>
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={4}
              className="bg-zinc-900 border-zinc-800"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)} className="border-zinc-700">
                Vazgeç
              </Button>
              <Button onClick={saveEdit} className="bg-rose-500 hover:bg-rose-600">
                Kaydet & Onayla
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function MoodTag({ mood }: { mood: string }) {
  const map: Record<string, string> = {
    happy: '😊',
    flirty: '😘',
    shy: '🙈',
    excited: '🤩',
    calm: '😌',
    angry: '😠',
  }
  return <span className="text-[10px]">{map[mood] || '💬'}</span>
}
