/**
 * TikTok OAuth callback endpoint'i
 * GET /api/tiktok/callback?code=xxx&state=xxx
 *
 * TikTok login başarılı olduktan sonra buraya dönülür
 * Authorization code → access token değişimi yapar
 */

import { NextResponse } from 'next/server'
import { exchangeCodeForToken, getUserInfo, saveTikTokAccount } from '@/lib/tiktok'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Hata kontrolü
  if (error) {
    return NextResponse.redirect(
      new URL(`/?tiktok_error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/?tiktok_error=missing_params', request.url)
    )
  }

  // State doğrulaması (CSRF koruması)
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [k, v] = c.split('=')
      return [k, decodeURIComponent(v)]
    })
  )
  const savedState = cookies.tiktok_oauth_state

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      new URL('/?tiktok_error=invalid_state', request.url)
    )
  }

  // Code → token değişimi
  const tokenData = await exchangeCodeForToken(code)
  if (!tokenData) {
    return NextResponse.redirect(
      new URL('/?tiktok_error=token_exchange_failed', request.url)
    )
  }

  // Kullanıcı bilgisi çek
  const userInfo = await getUserInfo(tokenData.access_token, tokenData.open_id)
  if (!userInfo) {
    return NextResponse.redirect(
      new URL('/?tiktok_error=user_info_failed', request.url)
    )
  }

  // Database'e kaydet
  try {
    await saveTikTokAccount(tokenData, userInfo)
  } catch (error) {
    console.error('[TikTok] DB save error:', error)
    return NextResponse.redirect(
      new URL('/?tiktok_error=db_save_failed', request.url)
    )
  }

  // Başarılı — ana sayfaya yönlendir
  const response = NextResponse.redirect(
    new URL('/?tiktok_connected=true', request.url)
  )
  // State cookie'sini temizle
  response.cookies.delete('tiktok_oauth_state')
  return response
}
