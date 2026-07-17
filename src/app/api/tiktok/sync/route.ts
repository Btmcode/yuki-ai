/**
 * TikTok verilerini senkronize et
 * POST /api/tiktok/sync
 *
 * Display API'den güncel stats + video listesini çeker
 */

import { NextResponse } from 'next/server'
import { refreshAccountStats, syncAccountVideos } from '@/lib/tiktok'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const account = await refreshAccountStats()
    if (!account) {
      return NextResponse.json(
        { error: 'No active TikTok account' },
        { status: 404 }
      )
    }

    const videoCount = await syncAccountVideos()

    return NextResponse.json({
      success: true,
      stats: {
        followerCount: account.followerCount,
        followingCount: account.followingCount,
        likesCount: account.likesCount,
        videoCount: account.videoCount,
        statsUpdatedAt: account.statsUpdatedAt,
      },
      syncedVideos: videoCount,
    })
  } catch (error) {
    console.error('[TikTok] Sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync' },
      { status: 500 }
    )
  }
}
