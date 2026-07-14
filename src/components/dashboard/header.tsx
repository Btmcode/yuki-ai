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
      <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-4 lg:gap-4 lg:px-6">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="relative h-9 w-9 sm:h-10 sm:w-10 overflow-hidden rounded-lg sm:rounded-xl border border-rose-500/30 shadow-lg shadow-rose-500/30">
            { }
            <img src="/avatars/yuki-chibi.png" alt="Yuki" className="h-full w-full object-cover" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold leading-tight text-white">Yuki AI</p>
            <p className="text-[11px] text-zinc-400 leading-tight">TikTok Streamer Panel</p>
          </div>
        </div>

        {/* Live status — mobilde küçük, desktopta tam */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {state.isLive ? (
            <Badge className="border-rose-500/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/20 px-2 py-0.5 sm:px-2.5">
              <span className="mr-1 inline-block h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-rose-500 live-dot" />
              <span className="text-[10px] sm:text-xs">CANLI</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="border-zinc-700 text-zinc-400 px-2 py-0.5 sm:px-2.5">
              <Radio className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span className="text-[10px] sm:text-xs">OFFLINE</span>
            </Badge>
          )}
          {connected ? (
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hidden xs:inline-flex sm:inline-flex">
              <Wifi className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline text-xs">Bağlı</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="border-zinc-700 text-zinc-500 hidden sm:inline-flex">
              <WifiOff className="mr-1 h-3 w-3" />
              <span className="text-xs">Bağlantı yok</span>
            </Badge>
          )}
        </div>

        {/* Stats — sadece large ekran */}
        <div className="hidden lg:flex flex-col items-end text-right mr-2">
          <span className="text-xs text-zinc-500">@{state.tiktokUser}</span>
          <span className="text-[11px] text-zinc-400">
            {state.viewers.toLocaleString('tr-TR')} izleyici · {state.totalGifts} hediye · {state.totalDiamonds.toLocaleString('tr-TR')} 💎
          </span>
        </div>

        {/* Right side — actions */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button
            variant={state.isLive ? 'destructive' : 'default'}
            size="sm"
            onClick={handleToggleStream}
            className={state.isLive
              ? 'bg-rose-600 hover:bg-rose-700 h-9 px-3 sm:h-9 sm:px-4'
              : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 h-9 px-3 sm:h-9 sm:px-4'}
          >
            <Power className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">{state.isLive ? 'Yayını Kapat' : 'Yayını Başlat'}</span>
            <span className="sm:hidden text-xs">{state.isLive ? 'Kapat' : 'Başlat'}</span>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 h-9 w-9 sm:w-auto p-0 sm:px-3"
              >
                <ShieldAlert className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Acil Stop</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-rose-500/30 bg-zinc-950 max-w-[calc(100vw-2rem)] sm:max-w-lg">
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
