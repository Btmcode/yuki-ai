'use client'

import { useEffect, useState } from 'react'
import { initBridge } from '@/lib/bridge'
import { Header } from '@/components/dashboard/header'
import { Sidebar, SectionId } from '@/components/dashboard/sidebar'
import { DashboardSection } from '@/components/dashboard/sections/dashboard-section'
import { ChatSection } from '@/components/dashboard/sections/chat-section'
import { ControlSection } from '@/components/dashboard/sections/control-section'
import { GiftsSection } from '@/components/dashboard/sections/gifts-section'
import { SettingsSection } from '@/components/dashboard/sections/settings-section'

export default function Home() {
  const [section, setSection] = useState<SectionId>('dashboard')

  useEffect(() => {
    const socket = initBridge()
    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <Header />

      <div className="flex flex-1">
        <Sidebar active={section} onChange={setSection} />

        <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">
          {section === 'dashboard' && <DashboardSection />}
          {section === 'chat' && <ChatSection />}
          {section === 'control' && <ControlSection />}
          {section === 'gifts' && <GiftsSection />}
          {section === 'settings' && <SettingsSection />}
        </main>
      </div>
    </div>
  )
}
