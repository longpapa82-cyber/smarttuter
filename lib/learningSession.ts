// Learning Session Management Utility
// Handles storage and analysis of learning sessions

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface LearningSession {
  id: string;
  subject: "math" | "english";
  gradeLevel: string;
  messages: Message[];
  startTime: Date;
  endTime: Date | null;
  duration: number; // in seconds
  questionCount: number;
  topics: string[];
}

export interface SessionStats {
  totalSessions: number;
  totalDuration: number;
  totalQuestions: number;
  mathSessions: number;
  englishSessions: number;
  averageSessionDuration: number;
  averageQuestionsPerSession: number;
  recentTopics: string[];
  learningStreak: number;
  mostActiveTimeOfDay: string;
}

const SESSION_STORAGE_KEY = "smarttuter_sessions";
const MAX_SESSIONS = 100; // Keep last 100 sessions

// Get all sessions from localStorage
export function getAllSessions(): LearningSession[] {
  try {
    const sessionsJson = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionsJson) return [];

    const sessions = JSON.parse(sessionsJson);

    // Convert date strings back to Date objects
    return sessions.map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : null,
      messages: session.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }));
  } catch (error) {
    console.error("Error loading sessions:", error);
    return [];
  }
}

// Save a new session
export function saveSession(session: LearningSession): void {
  try {
    const sessions = getAllSessions();

    // Add new session
    sessions.push(session);

    // Keep only the most recent sessions
    const recentSessions = sessions
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, MAX_SESSIONS);

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(recentSessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

// Update an existing session
export function updateSession(sessionId: string, updates: Partial<LearningSession>): void {
  try {
    const sessions = getAllSessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);

    if (sessionIndex !== -1) {
      sessions[sessionIndex] = {
        ...sessions[sessionIndex],
        ...updates,
      };

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessions));
    }
  } catch (error) {
    console.error("Error updating session:", error);
  }
}

// Get session statistics
export function getSessionStats(): SessionStats {
  const sessions = getAllSessions();

  if (sessions.length === 0) {
    return {
      totalSessions: 0,
      totalDuration: 0,
      totalQuestions: 0,
      mathSessions: 0,
      englishSessions: 0,
      averageSessionDuration: 0,
      averageQuestionsPerSession: 0,
      recentTopics: [],
      learningStreak: 0,
      mostActiveTimeOfDay: "오전",
    };
  }

  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalQuestions = sessions.reduce((sum, s) => sum + s.questionCount, 0);
  const mathSessions = sessions.filter(s => s.subject === "math").length;
  const englishSessions = sessions.filter(s => s.subject === "english").length;

  // Get recent topics (last 10 sessions)
  const recentTopics = sessions
    .slice(0, 10)
    .flatMap(s => s.topics)
    .filter((topic, index, self) => self.indexOf(topic) === index)
    .slice(0, 5);

  // Calculate learning streak (consecutive days with sessions)
  const learningStreak = calculateLearningStreak(sessions);

  // Find most active time of day
  const mostActiveTimeOfDay = getMostActiveTimeOfDay(sessions);

  return {
    totalSessions: sessions.length,
    totalDuration,
    totalQuestions,
    mathSessions,
    englishSessions,
    averageSessionDuration: totalDuration / sessions.length,
    averageQuestionsPerSession: totalQuestions / sessions.length,
    recentTopics,
    learningStreak,
    mostActiveTimeOfDay,
  };
}

// Calculate learning streak
function calculateLearningStreak(sessions: LearningSession[]): number {
  if (sessions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sessionDates = sessions
    .map(s => {
      const date = new Date(s.startTime);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => b - a);

  let streak = 0;
  let currentDate = today.getTime();

  for (const sessionDate of sessionDates) {
    if (sessionDate === currentDate) {
      streak++;
      currentDate -= 24 * 60 * 60 * 1000; // Move to previous day
    } else if (sessionDate < currentDate) {
      break; // Gap in streak
    }
  }

  return streak;
}

// Get most active time of day
function getMostActiveTimeOfDay(sessions: LearningSession[]): string {
  const timeSlots = {
    "새벽 (0-6시)": 0,
    "오전 (6-12시)": 0,
    "오후 (12-18시)": 0,
    "저녁 (18-24시)": 0,
  };

  sessions.forEach(session => {
    const hour = new Date(session.startTime).getHours();

    if (hour >= 0 && hour < 6) {
      timeSlots["새벽 (0-6시)"]++;
    } else if (hour >= 6 && hour < 12) {
      timeSlots["오전 (6-12시)"]++;
    } else if (hour >= 12 && hour < 18) {
      timeSlots["오후 (12-18시)"]++;
    } else {
      timeSlots["저녁 (18-24시)"]++;
    }
  });

  const mostActive = Object.entries(timeSlots).reduce((max, [time, count]) =>
    count > max[1] ? [time, count] : max
  , ["오전 (6-12시)", 0]);

  return mostActive[0];
}

// Extract topics from messages using simple keyword analysis
export function extractTopics(messages: Message[]): string[] {
  const topics: string[] = [];

  // Math topics
  const mathKeywords = {
    "분수": "분수",
    "방정식": "방정식",
    "함수": "함수",
    "미적분": "미적분",
    "삼각함수": "삼각함수",
    "기하": "기하학",
    "확률": "확률과 통계",
    "통계": "확률과 통계",
    "이차방정식": "이차방정식",
    "나눗셈": "나눗셈",
    "곱셈": "곱셈",
    "덧셈": "덧셈",
    "뺄셈": "뺄셈",
  };

  // English topics
  const englishKeywords = {
    "grammar": "Grammar",
    "vocabulary": "Vocabulary",
    "pronunciation": "Pronunciation",
    "reading": "Reading",
    "writing": "Writing",
    "speaking": "Speaking",
    "listening": "Listening",
    "tense": "Verb Tenses",
    "article": "Articles",
    "preposition": "Prepositions",
  };

  const allKeywords = { ...mathKeywords, ...englishKeywords };

  messages.forEach(msg => {
    const content = msg.content.toLowerCase();

    Object.entries(allKeywords).forEach(([keyword, topic]) => {
      if (content.includes(keyword) && !topics.includes(topic)) {
        topics.push(topic);
      }
    });
  });

  return topics;
}

// Create a new session
export function createSession(
  subject: "math" | "english",
  gradeLevel: string
): LearningSession {
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    subject,
    gradeLevel,
    messages: [],
    startTime: new Date(),
    endTime: null,
    duration: 0,
    questionCount: 0,
    topics: [],
  };
}

// End a session
export function endSession(session: LearningSession): LearningSession {
  const endTime = new Date();
  const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);
  const questionCount = session.messages.filter(m => m.role === "user").length;
  const topics = extractTopics(session.messages);

  return {
    ...session,
    endTime,
    duration,
    questionCount,
    topics,
  };
}
