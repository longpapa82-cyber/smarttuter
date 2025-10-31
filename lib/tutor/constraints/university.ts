/**
 * 대학교 학습 수준 제약 조건
 * CEFR C1-C2, 전공별 맞춤형
 */

import { GradeLevelConstraints } from '@/types/tutor';

export const universityConstraints: Record<string, GradeLevelConstraints> = {
  general: {
    englishConstraints: {
      cefrLevel: 'C1',
      vocabularyLevel: {
        maxWordCount: 10000, // 제한 완화
        allowedTopics: [
          '학술 논문', '전공 영어', '실무 영어', '연구 방법론',
          '비판적 분석', '전문 커뮤니케이션',
          'academic papers', 'major-specific English',
          'professional English', 'research methodology',
          'critical analysis', 'professional communication'
        ],
        forbiddenTopics: []
      },
      grammarComplexity: {
        allowedStructures: [
          '모든 문법', '학술적 표현', '전문적 글쓰기',
          '논문 작성', '프레젠테이션',
          'all grammar', 'academic expressions',
          'professional writing', 'thesis writing',
          'presentations'
        ],
        forbiddenStructures: []
      },
      sentenceLength: {
        maxWordsPerSentence: 100, // 제한 거의 없음
        readingLevel: 'University / Professional'
      }
    },
    mathConstraints: {
      topicScope: {
        allowedTopics: [
          '미적분학', '선형대수', '미분방정식', '확률통계',
          '이산수학', '수치해석', '복소해석',
          '실해석학 (전공자)',
          'calculus', 'linear algebra', 'differential equations',
          'probability & statistics', 'discrete mathematics',
          'numerical analysis', 'complex analysis',
          'real analysis (for majors)'
        ],
        forbiddenTopics: [
          // 전문성 한계 인정
          '초전문 연구 수학', '박사 과정 이론',
          'highly specialized research math',
          'doctoral-level theories'
        ]
      },
      complexityLevel: 5,
      prerequisiteCheck: false // 대학생은 스스로 판단
    },
    responseStyle: {
      maxStepsPerExplanation: 15,
      useVisualAids: false,
      gamificationLevel: 'low'
    }
  }
};
