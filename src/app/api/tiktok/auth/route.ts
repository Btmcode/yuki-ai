/**
 * TikTok OAuth başlatma endpoint'i
 * GET /api/tiktok/auth
 *
 * Kullanıcıyı TikTok login sayfasına yönlendirir
 */

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getAuthUrl } from '@/lib/tiktok'

export const dynamic = 'force-dynamic'

export async function GET() {
  // State — CSRF koruması için
  const state = crypto.randomBytes(16).toString('hex')

  // State'i cookie'ye kaydet (callback'te doğrula)
  const response = NextResponse.redirect(getAuthUrl(state))
  response.cookies.set('tiktok_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60, // 10 dakika
    path: '/',
  })

  return response
}
