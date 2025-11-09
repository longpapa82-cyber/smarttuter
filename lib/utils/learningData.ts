// 학습 데이터 관리 유틸리티

export interface LearningSession {
  id: string;
  subject: "math" | "english" | "science" | "social-studies" | "korean";
  gradeLevel: string;
  startTime: Date;
  endTime: Date;
  date: string; // YYYY-MM-DD format for easy filtering
  duration: number; // minutes
  messageCount: number;
  topicsDiscussed: string[];
  performance: number; // 0-100
}

export interface DailyReport {
  date: string;
  totalTime: number; // minutes
  sessions: LearningSession[];
  subjectBreakdown: {
    math: number;
    english: number;
    science: number;
    "social-studies": number;
  };
  topicsCount: number;
  averagePerformance: number;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  totalTime: number;
  dailyReports: DailyReport[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  progressTrend: number; // -100 to 100
}

// LocalStorage 키
const STORAGE_KEYS = {
  SESSIONS: "smarttuter_sessions",
  CURRENT_SESSION: "smarttuter_current_session",
};

// 현재 세션 시작
export function startSession(
  subject: "english" | "math" | "science" | "social-studies" | "korean",
  gradeLevel: string
): string {
  const sessionId = `session_${Date.now()}`;
  const now = new Date();
  const session: LearningSession = {
    id: sessionId,
    subject,
    gradeLevel,
    startTime: now,
    endTime: now,
    date: now.toISOString().split('T')[0], // YYYY-MM-DD
    duration: 0,
    messageCount: 0,
    topicsDiscussed: [],
    performance: 0,
  };

  localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
  return sessionId;
}

// 현재 세션 업데이트
export function updateCurrentSession(data: {
  messageCount?: number;
  topicsDiscussed?: string[];
}) {
  const sessionData = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  if (!sessionData) return;

  const session: LearningSession = JSON.parse(sessionData);
  const now = new Date();
  const duration = Math.floor(
    (now.getTime() - new Date(session.startTime).getTime()) / 1000 / 60
  );

  const updated: LearningSession = {
    ...session,
    endTime: now,
    duration,
    messageCount: data.messageCount ?? session.messageCount,
    topicsDiscussed: data.topicsDiscussed ?? session.topicsDiscussed,
    performance: calculatePerformance(session.messageCount + 1, duration),
  };

  localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(updated));
}

// 세션 종료 및 저장
export async function endSession() {
  const sessionData = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  if (!sessionData) return;

  const session: LearningSession = JSON.parse(sessionData);
  const sessions = getAllSessions();
  sessions.push(session);

  // LocalStorage에 저장
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);

  // Redis에도 동기화 (서버에 학습 데이터 저장)
  // 의미 있는 학습 세션만 저장 (최소 1분 이상)
  if (session.duration > 0) {
    try {
      const response = await fetch('/api/user/save-learning-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: session.subject,
          gradeLevel: session.gradeLevel,
          duration: session.duration,
          messageCount: session.messageCount,
          topicsDiscussed: session.topicsDiscussed,
          performance: session.performance,
          startTime: new Date(session.startTime).toISOString(),
          endTime: new Date(session.endTime).toISOString(),
        }),
      });

      if (response.ok) {
        console.log('✅ 학습 데이터가 서버에 저장되었습니다');
      } else {
        const errorData = await response.json();
        console.warn('⚠️  학습 데이터 저장 실패:', errorData);
      }
    } catch (error) {
      console.error('⚠️ 학습 데이터 서버 저장 실패:', error);
      // LocalStorage에는 이미 저장되었으므로 에러를 throw하지 않음
    }
  } else {
    console.log('ℹ️  학습 시간이 너무 짧아 서버에 저장하지 않습니다 (duration:', session.duration, 'minutes)');
  }
}

// 모든 세션 가져오기
export function getAllSessions(): LearningSession[] {
  const sessionsData = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (!sessionsData) return [];

  return JSON.parse(sessionsData);
}

// 오늘의 리포트 생성
export function getTodayReport(): DailyReport {
  const sessions = getAllSessions();
  const today = new Date().toISOString().split("T")[0];

  const todaySessions = sessions.filter((s) => {
    const sessionDate = new Date(s.startTime).toISOString().split("T")[0];
    return sessionDate === today;
  });

  const totalTime = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const mathTime = todaySessions
    .filter((s) => s.subject === "math")
    .reduce((sum, s) => sum + s.duration, 0);
  const englishTime = todaySessions
    .filter((s) => s.subject === "english")
    .reduce((sum, s) => sum + s.duration, 0);
  const scienceTime = todaySessions
    .filter((s) => s.subject === "science")
    .reduce((sum, s) => sum + s.duration, 0);
  const socialStudiesTime = todaySessions
    .filter((s) => s.subject === "social-studies")
    .reduce((sum, s) => sum + s.duration, 0);

  const allTopics = todaySessions.flatMap((s) => s.topicsDiscussed);
  const uniqueTopics = [...new Set(allTopics)];

  const avgPerformance =
    todaySessions.length > 0
      ? todaySessions.reduce((sum, s) => sum + s.performance, 0) /
        todaySessions.length
      : 0;

  return {
    date: today,
    totalTime,
    sessions: todaySessions,
    subjectBreakdown: {
      math: mathTime,
      english: englishTime,
      science: scienceTime,
      "social-studies": socialStudiesTime,
    },
    topicsCount: uniqueTopics.length,
    averagePerformance: Math.round(avgPerformance),
  };
}

// 주간 리포트 생성
export function getWeeklyReport(): WeeklyReport {
  const sessions = getAllSessions();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);

  const weekSessions = sessions.filter((s) => {
    const sessionDate = new Date(s.startTime);
    return sessionDate >= weekStart && sessionDate <= now;
  });

  const dailyReportsMap = new Map<string, LearningSession[]>();

  weekSessions.forEach((session) => {
    const date = new Date(session.startTime).toISOString().split("T")[0];
    if (!dailyReportsMap.has(date)) {
      dailyReportsMap.set(date, []);
    }
    dailyReportsMap.get(date)!.push(session);
  });

  const dailyReports: DailyReport[] = Array.from(dailyReportsMap.entries()).map(
    ([date, daySessions]) => {
      const totalTime = daySessions.reduce((sum, s) => sum + s.duration, 0);
      const mathTime = daySessions
        .filter((s) => s.subject === "math")
        .reduce((sum, s) => sum + s.duration, 0);
      const englishTime = daySessions
        .filter((s) => s.subject === "english")
        .reduce((sum, s) => sum + s.duration, 0);
      const scienceTime = daySessions
        .filter((s) => s.subject === "science")
        .reduce((sum, s) => sum + s.duration, 0);
      const socialStudiesTime = daySessions
        .filter((s) => s.subject === "social-studies")
        .reduce((sum, s) => sum + s.duration, 0);

      const allTopics = daySessions.flatMap((s) => s.topicsDiscussed);
      const uniqueTopics = [...new Set(allTopics)];

      const avgPerformance =
        daySessions.reduce((sum, s) => sum + s.performance, 0) /
        daySessions.length;

      return {
        date,
        totalTime,
        sessions: daySessions,
        subjectBreakdown: {
          math: mathTime,
          english: englishTime,
          science: scienceTime,
          "social-studies": socialStudiesTime,
        },
        topicsCount: uniqueTopics.length,
        averagePerformance: Math.round(avgPerformance),
      };
    }
  );

  const totalTime = weekSessions.reduce((sum, s) => sum + s.duration, 0);
  const { strengths, weaknesses } = analyzePerformance(weekSessions);
  const recommendations = generateRecommendations(weaknesses);
  const progressTrend = calculateProgressTrend(dailyReports);

  return {
    weekStart: weekStart.toISOString().split("T")[0],
    weekEnd: now.toISOString().split("T")[0],
    totalTime,
    dailyReports,
    strengths,
    weaknesses,
    recommendations,
    progressTrend,
  };
}

// 성과 계산 (메시지 수와 시간 기반)
function calculatePerformance(messageCount: number, duration: number): number {
  if (duration === 0) return 0;

  const messagesPerMinute = messageCount / duration;
  const engagementScore = Math.min(messagesPerMinute * 10, 50); // 최대 50점
  const consistencyScore = Math.min(duration * 2, 50); // 최대 50점

  return Math.round(engagementScore + consistencyScore);
}

// 강점/약점 분석
function analyzePerformance(sessions: LearningSession[]): {
  strengths: string[];
  weaknesses: string[];
} {
  const mathSessions = sessions.filter((s) => s.subject === "math");
  const englishSessions = sessions.filter((s) => s.subject === "english");

  const mathAvg =
    mathSessions.length > 0
      ? mathSessions.reduce((sum, s) => sum + s.performance, 0) /
        mathSessions.length
      : 0;
  const englishAvg =
    englishSessions.length > 0
      ? englishSessions.reduce((sum, s) => sum + s.performance, 0) /
        englishSessions.length
      : 0;

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (mathAvg > 70) {
    strengths.push("수학 개념 이해도가 우수합니다");
  } else if (mathAvg < 50) {
    weaknesses.push("수학 학습 시간을 늘려보세요");
  }

  if (englishAvg > 70) {
    strengths.push("영어 대화 참여도가 높습니다");
  } else if (englishAvg < 50) {
    weaknesses.push("영어 회화 연습이 더 필요합니다");
  }

  const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
  if (totalTime > 120) {
    strengths.push("꾸준한 학습 습관을 유지하고 있습니다");
  } else if (totalTime < 30) {
    weaknesses.push("학습 시간을 조금 더 늘려보세요");
  }

  return { strengths, weaknesses };
}

// 추천 사항 생성
function generateRecommendations(weaknesses: string[]): string[] {
  const recommendations: string[] = [];

  if (weaknesses.some((w) => w.includes("수학"))) {
    recommendations.push("기초 개념부터 차근차근 복습해보세요");
    recommendations.push("유사 문제를 반복해서 풀어보는 것을 추천합니다");
  }

  if (weaknesses.some((w) => w.includes("영어"))) {
    recommendations.push("매일 10분씩 영어로 대화하는 습관을 만들어보세요");
    recommendations.push("좋아하는 주제로 대화를 시작해보세요");
  }

  if (weaknesses.some((w) => w.includes("시간"))) {
    recommendations.push("하루 30분 학습 목표를 설정해보세요");
    recommendations.push("짧은 시간이라도 매일 꾸준히 하는 것이 중요합니다");
  }

  if (recommendations.length === 0) {
    recommendations.push("현재 학습 패턴을 잘 유지하고 있습니다!");
    recommendations.push("새로운 주제에 도전해보는 것은 어떨까요?");
  }

  return recommendations;
}

// 진도 추세 계산
function calculateProgressTrend(dailyReports: DailyReport[]): number {
  if (dailyReports.length < 2) return 0;

  const sorted = dailyReports.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const recentAvg =
    sorted
      .slice(-3)
      .reduce((sum, r) => sum + r.averagePerformance, 0) /
    Math.min(3, sorted.length);

  const olderAvg =
    sorted
      .slice(0, -3)
      .reduce((sum, r) => sum + r.averagePerformance, 0) /
    Math.max(1, sorted.length - 3);

  return Math.round(recentAvg - olderAvg);
}

// 데모 데이터 생성 (테스트용)
export function generateDemoData() {
  const demoSessions: LearningSession[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const dateString = date.toISOString().split('T')[0];

    // 수학 세션
    demoSessions.push({
      id: `demo_math_${i}`,
      subject: "math",
      gradeLevel: "고등학교",
      startTime: new Date(date.setHours(14, 0, 0)),
      endTime: new Date(date.setHours(14, 30, 0)),
      date: dateString,
      duration: 30,
      messageCount: 15 + Math.floor(Math.random() * 10),
      topicsDiscussed: ["이차방정식", "인수분해"],
      performance: 60 + Math.floor(Math.random() * 30),
    });

    // 영어 세션
    if (i % 2 === 0) {
      demoSessions.push({
        id: `demo_english_${i}`,
        subject: "english",
        gradeLevel: "고등학교",
        startTime: new Date(date.setHours(16, 0, 0)),
        endTime: new Date(date.setHours(16, 20, 0)),
        date: dateString,
        duration: 20,
        messageCount: 20 + Math.floor(Math.random() * 15),
        topicsDiscussed: ["일상 대화", "문법"],
        performance: 70 + Math.floor(Math.random() * 20),
      });
    }
  }

  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(demoSessions));
}
