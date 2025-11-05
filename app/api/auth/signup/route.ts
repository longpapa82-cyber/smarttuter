/**
 * Sign Up API Route
 * Handles new user registration
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbUser } from '@/lib/auth/db-redis';
import { hashPassword, validatePassword, validateEmail, isDisposableEmail } from '@/lib/auth/password';
import type { SignUpData } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const body: SignUpData = await request.json();
    const { email, password, name } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // Check for disposable email
    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: '일회용 이메일 주소는 사용할 수 없습니다.' },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: '비밀번호 요구사항을 충족하지 않습니다.', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await dbUser.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await dbUser.create({
      email,
      password: hashedPassword,
      name: name || null,
      emailVerified: null,
      image: null,
      gradeLevel: null,
      gradeDetail: null,
      preferredSubjects: null,
    });

    // Return success (without password)
    return NextResponse.json(
      {
        success: true,
        message: '회원가입이 완료되었습니다.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
