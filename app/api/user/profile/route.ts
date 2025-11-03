/**
 * User Profile API
 * Handles user profile updates including onboarding data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { dbUser } from '@/lib/auth/db';
import { createErrorResponse } from '@/lib/api/error-handler';

// GET /api/user/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return createErrorResponse('인증이 필요합니다', 401, 'UNAUTHORIZED');
    }

    const user = await dbUser.findByEmail(session.user.email);

    if (!user) {
      return createErrorResponse('사용자를 찾을 수 없습니다', 404, 'USER_NOT_FOUND');
    }

    // Don't send password hash
    const { password, ...userProfile } = user;

    return NextResponse.json({
      success: true,
      user: userProfile,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return createErrorResponse(
      '프로필을 가져오는 중 오류가 발생했습니다',
      500,
      'INTERNAL_ERROR',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// POST /api/user/profile - Create/Update user profile (onboarding)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return createErrorResponse('인증이 필요합니다', 401, 'UNAUTHORIZED');
    }

    const user = await dbUser.findByEmail(session.user.email);

    if (!user) {
      return createErrorResponse('사용자를 찾을 수 없습니다', 404, 'USER_NOT_FOUND');
    }

    const body = await request.json();
    const { gradeLevel, gradeDetail, preferredSubjects } = body;

    // Validate gradeLevel
    if (gradeLevel) {
      const validGradeLevels = ['elementary', 'middle', 'high', 'university'];
      if (!validGradeLevels.includes(gradeLevel)) {
        return createErrorResponse(
          '유효하지 않은 학교급입니다',
          400,
          'INVALID_GRADE_LEVEL',
          { validGradeLevels }
        );
      }
    }

    // Validate preferredSubjects
    if (preferredSubjects) {
      if (!Array.isArray(preferredSubjects)) {
        return createErrorResponse(
          'preferredSubjects는 배열이어야 합니다',
          400,
          'INVALID_TYPE',
          { field: 'preferredSubjects', expected: 'array' }
        );
      }
      const validSubjects = ['english', 'math'];
      const invalidSubjects = preferredSubjects.filter((s: string) => !validSubjects.includes(s));
      if (invalidSubjects.length > 0) {
        return createErrorResponse(
          '유효하지 않은 과목입니다',
          400,
          'INVALID_SUBJECTS',
          { invalidSubjects, validSubjects }
        );
      }
    }

    // Update user profile
    const updatedUser = await dbUser.update(user.id, {
      gradeLevel: gradeLevel || user.gradeLevel,
      gradeDetail: gradeDetail || user.gradeDetail,
      preferredSubjects: preferredSubjects || user.preferredSubjects,
    });

    if (!updatedUser) {
      return createErrorResponse(
        '프로필 저장에 실패했습니다',
        500,
        'UPDATE_FAILED'
      );
    }

    // Don't send password hash
    const { password, ...userProfile } = updatedUser;

    console.log(`✅ Profile saved for ${updatedUser.email}: gradeLevel=${gradeLevel}, subjects=${preferredSubjects?.join(',')}`);

    return NextResponse.json({
      success: true,
      user: userProfile,
      message: 'Profile saved successfully',
    });
  } catch (error) {
    console.error('Profile save error:', error);
    return createErrorResponse(
      '프로필 저장 중 오류가 발생했습니다',
      500,
      'INTERNAL_ERROR',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}

// PATCH /api/user/profile - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return createErrorResponse('인증이 필요합니다', 401, 'UNAUTHORIZED');
    }

    const user = await dbUser.findByEmail(session.user.email);

    if (!user) {
      return createErrorResponse('사용자를 찾을 수 없습니다', 404, 'USER_NOT_FOUND');
    }

    const body = await request.json();
    const { gradeLevel, gradeDetail, name, preferredSubjects } = body;

    // Validate data
    const allowedFields: Partial<typeof user> = {};

    if (gradeLevel !== undefined) {
      const validGradeLevels = ['elementary', 'middle', 'high', 'university'];
      if (gradeLevel && !validGradeLevels.includes(gradeLevel)) {
        return createErrorResponse(
          '유효하지 않은 학교급입니다',
          400,
          'INVALID_GRADE_LEVEL',
          { validGradeLevels }
        );
      }
      allowedFields.gradeLevel = gradeLevel;
    }

    if (gradeDetail !== undefined) {
      allowedFields.gradeDetail = gradeDetail;
    }

    if (name !== undefined && name.trim().length > 0) {
      allowedFields.name = name.trim();
    }

    if (preferredSubjects !== undefined) {
      if (Array.isArray(preferredSubjects)) {
        const validSubjects = ['english', 'math'];
        const invalidSubjects = preferredSubjects.filter((s: string) => !validSubjects.includes(s));
        if (invalidSubjects.length === 0) {
          allowedFields.preferredSubjects = preferredSubjects;
        }
      }
    }

    // Update user profile
    const updatedUser = await dbUser.update(user.id, allowedFields);

    if (!updatedUser) {
      return createErrorResponse(
        '프로필 업데이트에 실패했습니다',
        500,
        'UPDATE_FAILED'
      );
    }

    // Don't send password hash
    const { password, ...userProfile } = updatedUser;

    console.log(`✅ Profile updated for ${updatedUser.email}: gradeLevel=${gradeLevel}, gradeDetail=${gradeDetail}`);

    return NextResponse.json({
      success: true,
      user: userProfile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return createErrorResponse(
      '프로필 업데이트 중 오류가 발생했습니다',
      500,
      'INTERNAL_ERROR',
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}
