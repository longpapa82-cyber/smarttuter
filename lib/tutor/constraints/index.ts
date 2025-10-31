/**
 * 학교급별 제약 조건 통합 export
 */

import { elementaryConstraints } from './elementary';
import { middleConstraints } from './middle';
import { highConstraints } from './high';
import { universityConstraints } from './university';
import { GradeLevelConstraints, GradeLevel, GradeLevelDetail } from '@/types/tutor';

export const allConstraints = {
  elementary: elementaryConstraints,
  middle: middleConstraints,
  high: highConstraints,
  university: universityConstraints,
};

/**
 * 사용자 프로필에 맞는 제약 조건 가져오기
 */
export function getConstraintsForProfile(
  gradeLevel: GradeLevel,
  gradeLevelDetail?: GradeLevelDetail
): GradeLevelConstraints {
  switch (gradeLevel) {
    case 'elementary':
      const elemGrade = gradeLevelDetail?.elementary || '3-4';
      return elementaryConstraints[elemGrade] || elementaryConstraints['3-4'];

    case 'middle':
      const middleGrade = gradeLevelDetail?.middle || '1';
      return middleConstraints[middleGrade] || middleConstraints['1'];

    case 'high':
      const highGrade = gradeLevelDetail?.high || '1';
      return highConstraints[highGrade] || highConstraints['1'];

    case 'university':
      return universityConstraints.general;

    default:
      // 기본값: 중학교 1학년
      return middleConstraints['1'];
  }
}

export { elementaryConstraints, middleConstraints, highConstraints, universityConstraints };
