/**
 * TikTok bağlantı durumu
 * GET /api/tiktok/status
 *
 * Aktif TikTok hesabının durumunu ve stats'larını getirir
 */

import { NextResponse } from 'next/server'
import { getActiveAccount } from '@/lib/tiktok'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const account = await getActiveAccount()

    if (!account) {
      return NextResponse.json({
        connected: false,
        account: null,
      })
    }

    return NextResponse.json({
      connected: true,
      account: {
        openId: account.openId,
        username: account.username,
        displayName: account.displayName,
        avatarUrl: account.avatarUrl,
        bioDescription: account.bioDescription,
        isVerified: account.isVerified,
        followerCount: account.followerCount,
        followingCount: account.followingCount,
        likesCount: account.likesCount,
        videoCount: account.videoCount,
        statsUpdatedAt: account.statsUpdatedAt,
        connectedAt: account.connectedAt,
        scope: account.scope,
        videos: account.videos.map(v => ({
          videoId: v.videoId,
          title: v.title,
          description: v.description,
          coverImageUrl: v.coverImageUrl,
          shareUrl: v.shareUrl,
          duration: v.duration,
          createTime: v.createTime,
          viewCount: v.viewCount,
          likeCount: v.likeCount,
          commentCount: v.commentCount,
          shareCount: v.shareCount,
        })),
      },
    })
  } catch (error) {
    console.error('[TikTok] Status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
