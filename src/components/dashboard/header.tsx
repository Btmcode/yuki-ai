'use client'

import { Radio, ShieldAlert, Power, Wifi, WifiOff } from 'lucide-react'
import { useBridge, getSocket } from '@/lib/bridge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function Header() {
  const { connected, state } = useBridge()

  const handleEmergencyStop = () => {
    getSocket().emit('stream:emergency-stop')
  }

  const handleToggleStream = () => {
    if (state.isLive) {
      getSocket().emit('stream:stop')
    } else {
      getSocket().emit('stream:start', { tiktokUser: state.tiktokUser })
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-rose-500/15 bg-zinc-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-rose-500/30 shadow-lg shadow-rose-500/30">
            { }
            <img src="/avatars/yuki-chibi.png" alt="Yuki" className="h-full w-full object-cover" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold leading-tight text-white">Yuki AI</p>
            <p className="text-[11px] text-zinc-400 leading-tight">TikTok Streamer Panel</p>
          </div>
        </div>

        {/* Live status */}
        <div className="ml-2 flex items-center gap-2">
          {state.isLive ? (
            <Badge className="border-rose-500/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/20">
              <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-rose-500 live-dot" />
              CANLI
            </Badge>
          ) : (
            <Badge variant="outline" className="border-zinc-700 text-zinc-400">
              <Radio className="mr-1 h-3 w-3" />
              OFFLINE
            </Badge>
          )}
          {connected ? (
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Wifi className="mr-1 h-3 w-3" />
              Bağlı
            </Badge>
          ) : (
            <Badge variant="outline" className="border-zinc-700 text-zinc-500">
              <WifiOff className="mr-1 h-3 w-3" />
              Bağlantı yok
            </Badge>
          )}
        </div>

        {/* Right side — actions */}
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden lg:flex flex-col items-end text-right">
            <span className="text-xs text-zinc-500">@{state.tiktokUser}</span>
            <span className="text-[11px] text-zinc-400">
              {state.viewers.toLocaleString('tr-TR')} izleyici · {state.totalGifts} hediye · {state.totalDiamonds.toLocaleString('tr-TR')} 💎
            </span>
          </div>

          <Button
            variant={state.isLive ? 'destructive' : 'default'}
            size="sm"
            onClick={handleToggleStream}
            className={state.isLive
              ? 'bg-rose-600 hover:bg-rose-700'
              : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600'}
          >
            <Power className="mr-1.5 h-4 w-4" />
            {state.isLive ? 'Yayını Kapat' : 'Yayını Başlat'}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
              >
                <ShieldAlert className="mr-1.5 h-4 w-4" />
                <span className="hidden sm:inline">Acil Stop</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-rose-500/30 bg-zinc-950">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-rose-400">Acil Durdurma</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  Yayın anında kapatılacak ve AI cevap üretmeyi durduracak. Onaylıyor musun?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-zinc-700 bg-zinc-900 text-zinc-300">Vazgeç</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleEmergencyStop}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  Evet, durdur
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </header>
  )
}
