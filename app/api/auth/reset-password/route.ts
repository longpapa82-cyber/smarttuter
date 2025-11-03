import { NextRequest, NextResponse } from 'next/server';
import { dbUser, dbVerificationToken } from '@/lib/auth/db';
import { hashPassword, validatePassword } from '@/lib/auth/password';

/**
 * Reset Password API
 * Validates token and updates user password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email, password } = body;

    if (!token || !email || !password) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: '비밀번호 요구사항을 충족하지 않습니다.',
          details: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Find and verify token
    const verificationToken = await dbVerificationToken.findByIdentifier(email);

    if (!verificationToken || verificationToken.token !== token) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await dbVerificationToken.delete(email, token);
      return NextResponse.json(
        { error: '토큰이 만료되었습니다. 비밀번호 재설정을 다시 요청해주세요.' },
        { status: 400 }
      );
    }

    // Find user
    const user = await dbUser.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    await dbUser.update(user.id, {
      password: hashedPassword,
      emailVerified: new Date(), // Mark email as verified
    });

    // Delete used token
    await dbVerificationToken.delete(email, token);

    console.log(`✅ Password reset successful for: ${email}`);

    return NextResponse.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.',
    });

  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: '비밀번호 재설정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
