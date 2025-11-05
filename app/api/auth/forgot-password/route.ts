import { NextRequest, NextResponse } from 'next/server';
import { dbUser, dbVerificationToken } from '@/lib/auth/db-redis';
import { validateEmail } from '@/lib/auth/password';

/**
 * Forgot Password API
 * Generates a password reset token and sends it to the user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await dbUser.findByEmail(email);

    // Don't reveal whether user exists or not (security best practice)
    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.',
      });
    }

    // Check if user has a password (not OAuth-only account)
    if (!user.password) {
      return NextResponse.json({
        success: true,
        message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    // Store verification token
    await dbVerificationToken.create({
      identifier: email,
      token: resetToken,
      expires,
    });

    // In a real application, you would send an email here
    // For development, we'll log the reset link
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    console.log('\n' + '='.repeat(80));
    console.log('🔑 PASSWORD RESET REQUEST');
    console.log('='.repeat(80));
    console.log(`📧 Email: ${email}`);
    console.log(`🔗 Reset Link: ${resetLink}`);
    console.log(`⏰ Expires: ${expires.toLocaleString()}`);
    console.log('='.repeat(80) + '\n');

    return NextResponse.json({
      success: true,
      message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.',
      // Only include in development
      ...(process.env.NODE_ENV === 'development' && {
        resetLink,
        expiresAt: expires.toISOString(),
      }),
    });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: '비밀번호 재설정 요청 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
