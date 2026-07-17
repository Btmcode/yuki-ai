/**
 * TikTok bağlantısını kes
 * POST /api/tiktok/disconnect
 *
 * Aktif TikTok hesabını pasif yapar (database'den silmez)
 */

import { NextResponse } from 'next/server'
import { disconnectTikTokAccount } from '@/lib/tiktok'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    await disconnectTikTokAccount()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[TikTok] Disconnect error:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    )
  }
}
