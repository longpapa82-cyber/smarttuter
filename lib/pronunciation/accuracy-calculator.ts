// lib/pronunciation/accuracy-calculator.ts
// Levenshtein Distance 기반 발음 정확도 계산 알고리즘

/**
 * Levenshtein Distance 계산
 * 두 문자열 간의 최소 편집 거리 (삽입, 삭제, 치환 횟수)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // DP 테이블 생성
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  // 초기화: 첫 번째 행과 열
  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // DP 계산
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // 삭제
        matrix[i][j - 1] + 1,      // 삽입
        matrix[i - 1][j - 1] + cost // 치환
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * 발음 정확도 계산 (0-100 점수)
 * Levenshtein Distance를 사용하여 유사도 계산
 */
export function calculatePronunciationAccuracy(
  expected: string,
  actual: string
): number {
  // 대소문자 무시 및 공백 제거
  const normalizedExpected = expected.toLowerCase().trim();
  const normalizedActual = actual.toLowerCase().trim();

  // 완전 일치 시 100점
  if (normalizedExpected === normalizedActual) {
    return 100;
  }

  // 빈 문자열 처리
  if (!normalizedExpected || !normalizedActual) {
    return 0;
  }

  // Levenshtein Distance 계산
  const distance = levenshteinDistance(normalizedExpected, normalizedActual);

  // 최대 길이 기준으로 유사도 계산
  const maxLength = Math.max(normalizedExpected.length, normalizedActual.length);
  const similarity = ((maxLength - distance) / maxLength) * 100;

  // 0-100 범위로 클램핑
  return Math.max(0, Math.min(100, Math.round(similarity)));
}

/**
 * 단어별 발음 정확도 계산
 * 각 단어의 정확도를 개별적으로 계산
 */
export interface WordAccuracy {
  word: string;
  expectedWord: string;
  accuracy: number;
  distance: number;
  color: 'green' | 'yellow' | 'red';
}

export function calculateWordAccuracies(
  expected: string,
  actual: string
): WordAccuracy[] {
  const expectedWords = expected.toLowerCase().split(/\s+/);
  const actualWords = actual.toLowerCase().split(/\s+/);

  const results: WordAccuracy[] = [];

  // 짧은 배열 길이 기준으로 순회
  const minLength = Math.min(expectedWords.length, actualWords.length);

  for (let i = 0; i < minLength; i++) {
    const expectedWord = expectedWords[i];
    const actualWord = actualWords[i] || '';

    const distance = levenshteinDistance(expectedWord, actualWord);
    const accuracy = calculatePronunciationAccuracy(expectedWord, actualWord);

    // 색상 등급 결정
    let color: 'green' | 'yellow' | 'red';
    if (accuracy >= 90) {
      color = 'green';
    } else if (accuracy >= 70) {
      color = 'yellow';
    } else {
      color = 'red';
    }

    results.push({
      word: actualWord,
      expectedWord,
      accuracy,
      distance,
      color,
    });
  }

  // 누락된 단어 처리 (expected에만 있는 경우)
  for (let i = minLength; i < expectedWords.length; i++) {
    results.push({
      word: '',
      expectedWord: expectedWords[i],
      accuracy: 0,
      distance: expectedWords[i].length,
      color: 'red',
    });
  }

  return results;
}

/**
 * 음소 레벨 유사도 계산 (Jaro-Winkler Distance)
 * Levenshtein보다 짧은 문자열 비교에 유리
 */
export function jaroWinklerSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;

  // Jaro Distance 계산
  const matchWindow = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  const s1Matches = new Array(s1.length).fill(false);
  const s2Matches = new Array(s2.length).fill(false);

  let matches = 0;
  let transpositions = 0;

  // 매칭 찾기
  for (let i = 0; i < s1.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, s2.length);

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  // 전치(Transposition) 계산
  let k = 0;
  for (let i = 0; i < s1.length; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const jaro =
    (matches / s1.length +
     matches / s2.length +
     (matches - transpositions / 2) / matches) / 3;

  // Winkler 보정 (접두사 일치 보너스)
  let prefix = 0;
  for (let i = 0; i < Math.min(s1.length, s2.length, 4); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  return jaro + prefix * 0.1 * (1 - jaro);
}

/**
 * 음소 유사도 기반 정확도 계산
 * 발음이 비슷한 음소를 더 관대하게 평가
 */
const similarPhonemes: Record<string, string[]> = {
  // 모음 유사도
  'a': ['e', 'ə'],
  'e': ['i', 'a'],
  'i': ['e', 'ɪ'],
  'o': ['u', 'ɔ'],
  'u': ['o', 'ʊ'],

  // 자음 유사도
  'p': ['b'],
  'b': ['p', 'v'],
  't': ['d'],
  'd': ['t'],
  'k': ['g'],
  'g': ['k'],
  'f': ['v'],
  'v': ['f', 'b'],
  's': ['z', 'θ'],
  'z': ['s'],
  'θ': ['s', 'f'],
  'ð': ['z', 'v'],
  'ʃ': ['ʒ', 's'],
  'ʒ': ['ʃ', 'z'],
  'r': ['l', 'ɹ'],
  'l': ['r'],
};

export function calculatePhonemeAccuracyWithSimilarity(
  expected: string,
  actual: string
): number {
  if (expected === actual) return 100;
  if (!expected || !actual) return 0;

  const exp = expected.toLowerCase();
  const act = actual.toLowerCase();

  // 기본 Levenshtein 점수
  let baseScore = calculatePronunciationAccuracy(exp, act);

  // 유사 음소 보너스
  let bonus = 0;
  const similar = similarPhonemes[exp];
  if (similar && similar.includes(act)) {
    bonus = 20; // 유사 음소인 경우 20점 보너스
  }

  // Jaro-Winkler 유사도 추가 반영
  const jaroScore = jaroWinklerSimilarity(exp, act) * 100;
  const finalScore = (baseScore * 0.6) + (jaroScore * 0.4) + bonus;

  return Math.min(100, Math.round(finalScore));
}

/**
 * 종합 발음 점수 계산
 * 여러 지표를 가중 평균하여 최종 점수 산출
 */
export interface ComprehensiveScore {
  overallScore: number;
  wordAccuracy: number;
  phonemeAccuracy: number;
  fluencyScore: number;
  intonationScore: number;
  breakdown: {
    category: string;
    score: number;
    weight: number;
  }[];
}

export function calculateComprehensiveScore(
  wordAccuracies: WordAccuracy[],
  phonemeAccuracy: number,
  fluencyScore: number,
  intonationScore: number
): ComprehensiveScore {
  // 단어 정확도 평균
  const wordAccuracy = wordAccuracies.length > 0
    ? wordAccuracies.reduce((sum, w) => sum + w.accuracy, 0) / wordAccuracies.length
    : 0;

  // 가중치 설정
  const weights = {
    word: 0.4,      // 단어 정확도 40%
    phoneme: 0.3,   // 음소 정확도 30%
    fluency: 0.2,   // 유창성 20%
    intonation: 0.1, // 억양 10%
  };

  const breakdown = [
    { category: '단어 정확도', score: Math.round(wordAccuracy), weight: weights.word },
    { category: '음소 정확도', score: Math.round(phonemeAccuracy), weight: weights.phoneme },
    { category: '유창성', score: Math.round(fluencyScore), weight: weights.fluency },
    { category: '억양', score: Math.round(intonationScore), weight: weights.intonation },
  ];

  // 가중 평균 계산
  const overallScore =
    wordAccuracy * weights.word +
    phonemeAccuracy * weights.phoneme +
    fluencyScore * weights.fluency +
    intonationScore * weights.intonation;

  return {
    overallScore: Math.round(overallScore),
    wordAccuracy: Math.round(wordAccuracy),
    phonemeAccuracy: Math.round(phonemeAccuracy),
    fluencyScore: Math.round(fluencyScore),
    intonationScore: Math.round(intonationScore),
    breakdown,
  };
}
