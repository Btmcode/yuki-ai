/**
 * TikTok OAuth ve API helper fonksiyonları
 *
 * Resmi TikTok Developer API entegrasyonu:
 * - Login Kit (OAuth 2.0 giriş)
 * - Display API v2 (kullanıcı bilgisi + video listesi)
 *
 * Scopes:
 * - user.info.profile
 * - user.info.stats
 * - video.list
 *
 * Not: Content Posting API (video.upload, video.publish) için
 * TikTok'tan ayrı onay gerekir.
 */

import { db } from '@/lib/db'

// ============================================================================
// Konfigürasyon
// ============================================================================
const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || ''
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || ''
const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI ||
  'https://yukiai.space-z.ai/api/tiktok/callback'

// Scopes — TikTok app ayarlarında aktive edilmiş scope'lar
const TIKTOK_SCOPES = [
  'user.info.profile',
  'user.info.stats',
  'video.list',
].join(',')

// TikTok API endpoint'leri
const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/'
const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/'
const TIKTOK_USER_INFO_URL = 'https://open.tiktokapis.com/v2/user/info/'
const TIKTOK_VIDEO_LIST_URL = 'https://open.tiktokapis.com/v2/video/list/'
const TIKTOK_REFRESH_URL = 'https://open.tiktokapis.com/v2/oauth/token/'

// ============================================================================
// Tipler
// ============================================================================
export interface TikTokTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number // saniye
  token_type: string
  scope: string
  open_id: string
}

export interface TikTokUserInfo {
  open_id: string
  username: string
  display_name: string
  avatar_url: string
  bio_description?: string
  profile_deep_link?: string
  profile_web_link?: string
  is_verified?: boolean
  follower_count?: number
  following_count?: number
  likes_count?: number
  video_count?: number
}

export interface TikTokVideo {
  id: string
  title?: string
  cover_image_url?: string
  share_url?: string
  video_description?: string
  duration?: number
  create_time: number
  view_count: number
  like_count: number
  comment_count: number
  share_count: number
}

// ============================================================================
// OAuth Akışı
// ============================================================================

/**
 * TikTok OAuth başlatma URL'i oluştur
 * Kullanıcı bu URL'e yönlendirilir, TikTok login olup izin verir
 */
export function getAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    scope: TIKTOK_SCOPES,
    response_type: 'code',
    redirect_uri: TIKTOK_REDIRECT_URI,
    state,
  })

  return `${TIKTOK_AUTH_URL}?${params.toString()}`
}

/**
 * Authorization code'u access token'a çevir
 * TikTok callback'ten gelen code ile çağrılır
 */
export async function exchangeCodeForToken(code: string): Promise<TikTokTokenResponse | null> {
  try {
    const body = new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      client_secret: TIKTOK_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: TIKTOK_REDIRECT_URI,
    })

    const response = await fetch(TIKTOK_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    if (!response.ok) {
      console.error('[TikTok] Token exchange failed:', response.status, await response.text())
      return null
    }

    const data = await response.json()
    return data as TikTokTokenResponse
  } catch (error) {
    console.error('[TikTok] Token exchange error:', error)
    return null
  }
}

/**
 * Access token yenile (süresi dolduğunda)
 */
export async function refreshAccessToken(refreshToken: string): Promise<TikTokTokenResponse | null> {
  try {
    const body = new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      client_secret: TIKTOK_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    })

    const response = await fetch(TIKTOK_REFRESH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    if (!response.ok) {
      console.error('[TikTok] Token refresh failed:', response.status)
      return null
    }

    return await response.json() as TikTokTokenResponse
  } catch (error) {
    console.error('[TikTok] Token refresh error:', error)
    return null
  }
}

// ============================================================================
// Display API v2 — Kullanıcı Bilgisi
// ============================================================================

/**
 * TikTok kullanıcısının profil bilgisi + stats'larını getir
 */
export async function getUserInfo(accessToken: string, openId: string): Promise<TikTokUserInfo | null> {
  try {
    const fields = [
      'open_id',
      'username',
      'display_name',
      'avatar_url',
      'bio_description',
      'profile_deep_link',
      'profile_web_link',
      'is_verified',
      'follower_count',
      'following_count',
      'likes_count',
      'video_count',
    ].join(',')

    const response = await fetch(`${TIKTOK_USER_INFO_URL}?fields=${fields}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      console.error('[TikTok] getUserInfo failed:', response.status)
      return null
    }

    const data = await response.json()
    if (data?.data?.user) {
      return {
        ...data.data.user,
        open_id: openId,
      } as TikTokUserInfo
    }
    return null
  } catch (error) {
    console.error('[TikTok] getUserInfo error:', error)
    return null
  }
}

/**
 * Kullanıcının son videolarını getir (stats ile birlikte)
 */
export async function getUserVideos(
  accessToken: string,
  maxCount: number = 20,
  cursor: number = 0,
): Promise<TikTokVideo[] | null> {
  try {
    const fields = [
      'id',
      'title',
      'cover_image_url',
      'share_url',
      'video_description',
      'duration',
      'create_time',
      'view_count',
      'like_count',
      'comment_count',
      'share_count',
    ].join(',')

    const response = await fetch(TIKTOK_VIDEO_LIST_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        fields,
        max_count: maxCount,
        cursor,
      }),
    })

    if (!response.ok) {
      console.error('[TikTok] getUserVideos failed:', response.status)
      return null
    }

    const data = await response.json()
    return data?.data?.videos || []
  } catch (error) {
    console.error('[TikTok] getUserVideos error:', error)
    return null
  }
}

// ============================================================================
// Database İşlemleri
// ============================================================================

/**
 * TikTok hesabını database'e kaydet veya güncelle
 */
export async function saveTikTokAccount(
  tokenData: TikTokTokenResponse,
  userInfo: TikTokUserInfo,
) {
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000)

  // Önceki aktif hesabı pasif yap
  await db.tikTokAccount.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  })

  // Yeni hesabı upsert
  return await db.tikTokAccount.upsert({
    where: { openId: userInfo.open_id },
    update: {
      username: userInfo.username,
      displayName: userInfo.display_name,
      avatarUrl: userInfo.avatar_url,
      bioDescription: userInfo.bio_description,
      isVerified: userInfo.is_verified || false,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt: expiresAt,
      scope: tokenData.scope,
      followerCount: userInfo.follower_count || 0,
      followingCount: userInfo.following_count || 0,
      likesCount: userInfo.likes_count || 0,
      videoCount: userInfo.video_count || 0,
      statsUpdatedAt: new Date(),
      isActive: true,
    },
    create: {
      openId: userInfo.open_id,
      username: userInfo.username,
      displayName: userInfo.display_name,
      avatarUrl: userInfo.avatar_url,
      bioDescription: userInfo.bio_description,
      isVerified: userInfo.is_verified || false,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiresAt: expiresAt,
      scope: tokenData.scope,
      followerCount: userInfo.follower_count || 0,
      followingCount: userInfo.following_count || 0,
      likesCount: userInfo.likes_count || 0,
      videoCount: userInfo.video_count || 0,
      statsUpdatedAt: new Date(),
      isActive: true,
    },
  })
}

/**
 * Aktif TikTok hesabını getir
 */
export async function getActiveAccount() {
  return await db.tikTokAccount.findFirst({
    where: { isActive: true },
    include: {
      videos: {
        orderBy: { createTime: 'desc' },
        take: 20,
      },
    },
  })
}

/**
 * TikTok hesabını bağlantısını kes (database'den sil)
 */
export async function disconnectTikTokAccount() {
  return await db.tikTokAccount.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  })
}

/**
 * Token expire olmuş mu kontrol et, gerekirse yenile
 */
export async function ensureValidToken(accountId: string) {
  const account = await db.tikTokAccount.findUnique({
    where: { id: accountId },
  })
  if (!account) return null

  // Token hâlâ geçerli (5 dk tolerans)
  const fiveMinFromNow = new Date(Date.now() + 5 * 60 * 1000)
  if (account.tokenExpiresAt > fiveMinFromNow) {
    return account
  }

  // Token yenile
  const newToken = await refreshAccessToken(account.refreshToken)
  if (!newToken) {
    console.error('[TikTok] Token yenilenemedi')
    return null
  }

  const expiresAt = new Date(Date.now() + newToken.expires_in * 1000)
  return await db.tikTokAccount.update({
    where: { id: accountId },
    data: {
      accessToken: newToken.access_token,
      refreshToken: newToken.refresh_token,
      tokenExpiresAt: expiresAt,
    },
  })
}

/**
 * Aktif hesabın stats'larını güncelle (Display API'den çek)
 */
export async function refreshAccountStats() {
  const account = await getActiveAccount()
  if (!account) return null

  // Token geçerli mi kontrol et
  const validAccount = await ensureValidToken(account.id)
  if (!validAccount) return null

  // User info çek
  const userInfo = await getUserInfo(validAccount.accessToken, validAccount.openId)
  if (!userInfo) return null

  // Stats güncelle
  return await db.tikTokAccount.update({
    where: { id: validAccount.id },
    data: {
      followerCount: userInfo.follower_count || 0,
      followingCount: userInfo.following_count || 0,
      likesCount: userInfo.likes_count || 0,
      videoCount: userInfo.video_count || 0,
      statsUpdatedAt: new Date(),
    },
  })
}

/**
 * Aktif hesabın son videolarını çek ve database'e kaydet
 */
export async function syncAccountVideos() {
  const account = await getActiveAccount()
  if (!account) return null

  const validAccount = await ensureValidToken(account.id)
  if (!validAccount) return null

  const videos = await getUserVideos(validAccount.accessToken, 20)
  if (!videos) return null

  // Database'e upsert
  for (const video of videos) {
    await db.tikTokVideo.upsert({
      where: { videoId: video.id },
      update: {
        accountId: validAccount.id,
        title: video.title,
        description: video.video_description,
        coverImageUrl: video.cover_image_url,
        shareUrl: video.share_url,
        duration: video.duration,
        createTime: new Date(video.create_time * 1000),
        viewCount: video.view_count,
        likeCount: video.like_count,
        commentCount: video.comment_count,
        shareCount: video.share_count,
        updatedAt: new Date(),
      },
      create: {
        accountId: validAccount.id,
        videoId: video.id,
        title: video.title,
        description: video.video_description,
        coverImageUrl: video.cover_image_url,
        shareUrl: video.share_url,
        duration: video.duration,
        createTime: new Date(video.create_time * 1000),
        viewCount: video.view_count,
        likeCount: video.like_count,
        commentCount: video.comment_count,
        shareCount: video.share_count,
      },
    })
  }

  return videos.length
}
