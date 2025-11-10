import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasKakaoClientId: !!process.env.KAKAO_CLIENT_ID,
    hasKakaoClientSecret: !!process.env.KAKAO_CLIENT_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    kakaoClientIdLength: process.env.KAKAO_CLIENT_ID?.length || 0,
    kakaoClientSecretLength: process.env.KAKAO_CLIENT_SECRET?.length || 0,
    // Last 4 characters for verification (safe to expose)
    kakaoClientSecretLast4: process.env.KAKAO_CLIENT_SECRET?.slice(-4) || 'MISSING',
    nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT_SET',
    deploymentUrl: process.env.VERCEL_URL || 'local',
  });
}
