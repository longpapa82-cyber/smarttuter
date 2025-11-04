/**
 * lib/roleplay/roleplay-engine.ts
 * 실시간 롤플레이 대화 엔진
 *
 * Google Gemini 2.0 Flash 기반 실시간 시나리오 실행
 */

import type { RoleplayScenario } from './roleplay-scenarios';

export interface RoleplayMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isInCharacter: boolean;  // 캐릭터로서의 발화인지
}

export interface RoleplaySession {
  id: string;
  scenario: RoleplayScenario;
  messages: RoleplayMessage[];
  startTime: Date;
  endTime?: Date;
  turnCount: number;
  completionStatus: 'in-progress' | 'completed' | 'abandoned';

  // 평가
  evaluation?: RoleplayEvaluation;
}

export interface RoleplayEvaluation {
  completedCriteria: string[];      // 완료한 조건
  missedCriteria: string[];         // 놓친 조건
  keyPhrasesUsed: string[];         // 사용한 핵심 표현
  vocabularyUsed: string[];         // 사용한 어휘

  // 점수
  completionScore: number;          // 0-100 (목표 달성도)
  languageAccuracy: number;         // 0-100 (언어 정확도)
  appropriateness: number;          // 0-100 (상황 적절성)
  overallScore: number;             // 0-100 (종합 점수)

  // 피드백
  strengths: string[];              // 잘한 점
  improvements: string[];           // 개선점
  nextSteps: string[];              // 다음 학습 단계

  timestamp: Date;
}

/**
 * 롤플레이 세션 생성
 */
export function createRoleplaySession(scenario: RoleplayScenario): RoleplaySession {
  const sessionId = `roleplay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: sessionId,
    scenario,
    messages: [
      {
        role: 'system',
        content: generateSystemPrompt(scenario),
        timestamp: new Date(),
        isInCharacter: false,
      },
      {
        role: 'assistant',
        content: scenario.startingMessage,
        timestamp: new Date(),
        isInCharacter: true,
      },
    ],
    startTime: new Date(),
    turnCount: 0,
    completionStatus: 'in-progress',
  };
}

/**
 * 롤플레이용 시스템 프롬프트 생성
 */
function generateSystemPrompt(scenario: RoleplayScenario): string {
  return `
# ROLEPLAY SCENARIO: ${scenario.title}

## Your Role
You are: **${scenario.aiRole}**
Setting: ${scenario.setting}

## User's Role
The user is: **${scenario.userRole}**
Their objective: ${scenario.objective}

## Scenario Guidelines

### Stay In Character
- Maintain your role as ${scenario.aiRole} throughout the conversation
- Respond naturally as this character would in real life
- Use appropriate tone and language for this role and situation

### Educational Goals
- Help the user practice these key phrases: ${scenario.keyPhrases.join(', ')}
- Encourage use of vocabulary: ${scenario.vocabulary.slice(0, 10).join(', ')}
- Create natural opportunities for grammar practice: ${scenario.grammarFocus.join(', ')}

### Conversation Management
- Expected conversation length: ${scenario.expectedTurns} turns
- Guide the user toward completing these objectives: ${scenario.completionCriteria.join(', ')}
- If the user makes common mistakes (${scenario.commonMistakes.slice(0, 2).join(', ')}), gently correct them in character

### Response Style
- Keep responses realistic and natural for this situation
- Length: 1-3 sentences per turn (brief, like real conversation)
- Ask follow-up questions when appropriate
- Provide hints if user seems stuck (but stay in character)

### Completion
When the user has achieved the objective (${scenario.objective}), naturally conclude the interaction.

### IMPORTANT RULES
1. ALWAYS stay in character - never break the fourth wall
2. Keep it realistic - respond as this person would in real life
3. Be helpful but natural - don't be an obvious language teacher
4. If user goes off-topic, gently guide back to the scenario
5. After ${scenario.expectedTurns} turns, start wrapping up the conversation

## Begin the roleplay!
`.trim();
}

/**
 * 사용자 메시지 추가 및 AI 응답 생성
 */
export async function processRoleplayTurn(
  session: RoleplaySession,
  userMessage: string
): Promise<{ updatedSession: RoleplaySession; aiResponse: string }> {
  // 사용자 메시지 추가
  const userMsg: RoleplayMessage = {
    role: 'user',
    content: userMessage,
    timestamp: new Date(),
    isInCharacter: true,
  };

  session.messages.push(userMsg);
  session.turnCount++;

  // AI 응답 생성 (실제로는 Gemini API 호출)
  const aiResponse = await generateAIResponse(session);

  // AI 응답 추가
  const aiMsg: RoleplayMessage = {
    role: 'assistant',
    content: aiResponse,
    timestamp: new Date(),
    isInCharacter: true,
  };

  session.messages.push(aiMsg);

  // 완료 조건 체크
  if (session.turnCount >= session.scenario.expectedTurns) {
    session.completionStatus = 'completed';
    session.endTime = new Date();
  }

  return {
    updatedSession: session,
    aiResponse,
  };
}

/**
 * AI 응답 생성 (Gemini 2.0 Flash 호출)
 */
async function generateAIResponse(session: RoleplaySession): Promise<string> {
  try {
    const response = await fetch('/api/chat/english', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: session.messages.map(m => ({
          role: m.role === 'system' ? 'system' : m.role,
          content: m.content,
        })),
        temperature: 0.8, // 더 자연스럽고 다양한 응답
        maxTokens: 150,   // 간결한 응답
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI response');
    }

    const data = await response.json();
    return data.response || 'I understand. Please continue.';
  } catch (error) {
    console.error('❌ Roleplay AI response error:', error);
    return 'I understand. Could you tell me more?';
  }
}

/**
 * 롤플레이 평가 생성
 */
export async function evaluateRoleplaySession(
  session: RoleplaySession
): Promise<RoleplayEvaluation> {
  const scenario = session.scenario;
  const userMessages = session.messages.filter(m => m.role === 'user');

  // 사용자 메시지 전체 텍스트
  const userText = userMessages.map(m => m.content).join(' ').toLowerCase();

  // 1. 완료 조건 체크
  const completedCriteria: string[] = [];
  const missedCriteria: string[] = [];

  scenario.completionCriteria.forEach(criteria => {
    // 간단한 키워드 기반 체크 (실제로는 더 정교한 분석 필요)
    const keywords = extractKeywords(criteria);
    const isCompleted = keywords.some(kw => userText.includes(kw.toLowerCase()));

    if (isCompleted) {
      completedCriteria.push(criteria);
    } else {
      missedCriteria.push(criteria);
    }
  });

  // 2. 핵심 표현 사용 체크
  const keyPhrasesUsed = scenario.keyPhrases.filter(phrase =>
    userText.includes(phrase.toLowerCase())
  );

  // 3. 어휘 사용 체크
  const vocabularyUsed = scenario.vocabulary.filter(word =>
    userText.includes(word.toLowerCase())
  );

  // 4. 점수 계산
  const completionScore = Math.round(
    (completedCriteria.length / scenario.completionCriteria.length) * 100
  );

  const languageAccuracy = Math.min(
    100,
    (keyPhrasesUsed.length * 15 + vocabularyUsed.length * 5)
  );

  const appropriateness = session.turnCount >= scenario.expectedTurns - 2 ? 80 : 60;

  const overallScore = Math.round(
    completionScore * 0.5 +
    languageAccuracy * 0.3 +
    appropriateness * 0.2
  );

  // 5. 피드백 생성
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (completionScore >= 80) {
    strengths.push('목표를 성공적으로 달성했습니다! 🎯');
  }
  if (keyPhrasesUsed.length >= scenario.keyPhrases.length * 0.5) {
    strengths.push('핵심 표현을 잘 활용했습니다! 💬');
  }
  if (vocabularyUsed.length >= 5) {
    strengths.push('다양한 어휘를 사용했습니다! 📚');
  }

  if (completionScore < 80) {
    improvements.push(`다음 조건을 더 연습해보세요: ${missedCriteria.slice(0, 2).join(', ')}`);
  }
  if (keyPhrasesUsed.length < 2) {
    improvements.push('핵심 표현을 더 많이 사용해보세요');
  }

  // 6. 다음 단계 추천
  const nextSteps: string[] = [];
  if (overallScore >= 80) {
    nextSteps.push('더 어려운 레벨의 시나리오에 도전해보세요!');
    nextSteps.push('같은 카테고리의 다른 상황을 연습해보세요.');
  } else {
    nextSteps.push('이 시나리오를 다시 한 번 연습해보세요.');
    nextSteps.push('핵심 표현을 암기한 후 시도해보세요.');
  }

  return {
    completedCriteria,
    missedCriteria,
    keyPhrasesUsed,
    vocabularyUsed,
    completionScore,
    languageAccuracy,
    appropriateness,
    overallScore,
    strengths,
    improvements,
    nextSteps,
    timestamp: new Date(),
  };
}

/**
 * 조건에서 키워드 추출 (간단한 휴리스틱)
 */
function extractKeywords(criteria: string): string[] {
  // 명사와 동사 추출 (간단한 버전)
  const words = criteria.toLowerCase().split(/\s+/);
  return words.filter(w =>
    w.length > 3 &&
    !['the', 'and', 'for', 'with', 'this', 'that'].includes(w)
  );
}

/**
 * 롤플레이 힌트 제공
 */
export function getHintForCurrentTurn(
  session: RoleplaySession
): string | null {
  const { scenario, turnCount } = session;

  // 힌트 제공 조건: 턴이 진행되었지만 사용자가 어려워할 때
  if (turnCount > 0 && turnCount <= scenario.hints.length) {
    return scenario.hints[Math.min(turnCount - 1, scenario.hints.length - 1)];
  }

  return null;
}

/**
 * 세션 저장 (LocalStorage)
 */
export function saveRoleplaySession(session: RoleplaySession): void {
  if (typeof window === 'undefined') return;

  const key = `roleplay_session_${session.id}`;
  localStorage.setItem(key, JSON.stringify(session));

  // 최근 세션 목록 업데이트
  const recentKey = 'roleplay_recent_sessions';
  const recent = JSON.parse(localStorage.getItem(recentKey) || '[]');

  if (!recent.includes(session.id)) {
    recent.unshift(session.id);
    localStorage.setItem(recentKey, JSON.stringify(recent.slice(0, 10))); // 최근 10개만
  }
}

/**
 * 세션 로드
 */
export function loadRoleplaySession(sessionId: string): RoleplaySession | null {
  if (typeof window === 'undefined') return null;

  const key = `roleplay_session_${sessionId}`;
  const data = localStorage.getItem(key);

  if (!data) return null;

  try {
    return JSON.parse(data) as RoleplaySession;
  } catch {
    return null;
  }
}

/**
 * 최근 세션 목록
 */
export function getRecentSessions(): string[] {
  if (typeof window === 'undefined') return [];

  const recentKey = 'roleplay_recent_sessions';
  const data = localStorage.getItem(recentKey);

  if (!data) return [];

  try {
    return JSON.parse(data) as string[];
  } catch {
    return [];
  }
}

/**
 * 롤플레이 통계
 */
export interface RoleplayStats {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  totalTime: number; // minutes
  favoriteCategory: string;
  currentStreak: number;
}

export function getRoleplayStats(): RoleplayStats {
  if (typeof window === 'undefined') {
    return {
      totalSessions: 0,
      completedSessions: 0,
      averageScore: 0,
      totalTime: 0,
      favoriteCategory: 'travel',
      currentStreak: 0,
    };
  }

  const recentSessions = getRecentSessions();
  const sessions = recentSessions
    .map(loadRoleplaySession)
    .filter(Boolean) as RoleplaySession[];

  const completedSessions = sessions.filter(s => s.completionStatus === 'completed');

  const scores = completedSessions
    .map(s => s.evaluation?.overallScore || 0)
    .filter(s => s > 0);

  const totalTime = sessions.reduce((sum, s) => {
    if (s.endTime) {
      return sum + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000;
    }
    return sum;
  }, 0);

  const categoryCount: Record<string, number> = {};
  sessions.forEach(s => {
    const cat = s.scenario.category;
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  const favoriteCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'travel';

  return {
    totalSessions: sessions.length,
    completedSessions: completedSessions.length,
    averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    totalTime: Math.round(totalTime),
    favoriteCategory,
    currentStreak: 0, // TODO: 구현
  };
}
