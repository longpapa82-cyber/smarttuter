/**
 * Week 2 Day 3-4: Grade Level Validator
 *
 * Validates whether questions are appropriate for student's grade level
 * Prevents advanced learning (선행학습) by detecting content beyond grade level
 *
 * Features:
 * - AI-based topic detection using Gemini 2.0 Flash
 * - Curriculum database lookup for grade-level appropriateness
 * - Friendly guidance messages for off-level questions
 * - Support for both English and Math subjects
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  getCurriculum,
  searchTopics,
  getTopicGrade,
  type Subject,
  type SchoolLevel,
  type CurriculumTopic
} from './curriculum-database';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface GradeLevelValidation {
  isAppropriate: boolean; // Is this question appropriate for student's grade?
  studentGrade: string; // Student's current grade (e.g., "5", "university-1")
  studentLevel: SchoolLevel; // Student's school level
  detectedTopics: DetectedTopic[]; // Topics detected in the question
  reason: string; // Explanation for the decision
  guidanceMessage?: string; // Friendly message if inappropriate
}

export interface DetectedTopic {
  topic: CurriculumTopic;
  gradeLevel: string; // Grade where this topic appears
  confidence: number; // 0-100
  isAdvanced: boolean; // Is this beyond student's grade?
  isBelowLevel: boolean; // Is this below student's grade?
}

/**
 * Main function: Validate grade level appropriateness of a question
 */
export async function validateGradeLevel(
  question: string,
  studentGrade: string,
  subject: Subject
): Promise<GradeLevelValidation> {
  try {
    // Get student's school level
    const studentLevel = getSchoolLevel(studentGrade);

    // Step 1: Detect topics in the question using AI
    const detectedTopics = await detectTopicsInQuestion(question, subject, studentGrade);

    // Step 2: Analyze if any topic is beyond student's grade
    const hasAdvancedTopics = detectedTopics.some(dt => dt.isAdvanced);
    const hasBelowLevelTopics = detectedTopics.every(dt => dt.isBelowLevel);

    // Step 3: Generate appropriate response
    if (hasAdvancedTopics) {
      // Question contains advanced learning content
      const advancedTopics = detectedTopics.filter(dt => dt.isAdvanced);
      return {
        isAppropriate: false,
        studentGrade,
        studentLevel,
        detectedTopics,
        reason: `Question contains topics beyond grade ${studentGrade}: ${advancedTopics.map(dt => dt.topic.nameKo).join(', ')}`,
        guidanceMessage: generateAdvancedLearningMessage(studentGrade, studentLevel, subject, advancedTopics)
      };
    }

    if (hasBelowLevelTopics && detectedTopics.length > 0) {
      // Question is below student's level - allow but note it
      return {
        isAppropriate: true,
        studentGrade,
        studentLevel,
        detectedTopics,
        reason: `Question is below grade level but allowed for review`
      };
    }

    // Question is appropriate for grade level
    return {
      isAppropriate: true,
      studentGrade,
      studentLevel,
      detectedTopics,
      reason: detectedTopics.length > 0
        ? `Question is appropriate for grade ${studentGrade}`
        : `General question, no specific grade-level content detected`
    };

  } catch (error) {
    console.error('[Grade Level Validator] Error:', error);
    // On error, allow the question (fail-safe)
    return {
      isAppropriate: true,
      studentGrade,
      studentLevel: getSchoolLevel(studentGrade),
      detectedTopics: [],
      reason: 'Validation error - defaulting to allow'
    };
  }
}

/**
 * Detect topics in a question using AI classification
 */
async function detectTopicsInQuestion(
  question: string,
  subject: Subject,
  studentGrade: string
): Promise<DetectedTopic[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.2, // Low temperature for consistent classification
        topP: 0.8,
        topK: 40,
      }
    });

    const prompt = `You are an expert ${subject} education specialist. Analyze this student question and identify the specific topics/concepts it asks about.

Student Question: "${question}"
Student Grade: ${studentGrade}

Identify the specific topics in this question. For each topic, provide:
1. The exact educational topic/concept name (e.g., "Present Perfect Tense", "Quadratic Equations", "Fractions")
2. Keywords related to this topic
3. Your confidence level (0-100) that this topic is present in the question

Response format (JSON):
{
  "topics": [
    {
      "name": "topic name in English",
      "nameKo": "topic name in Korean",
      "keywords": ["keyword1", "keyword2"],
      "confidence": 85
    }
  ]
}

If the question is too vague or doesn't contain specific educational topics, return an empty topics array.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return []; // No topics detected
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const aiTopics = parsed.topics || [];

    // Match AI-detected topics with curriculum database
    const detectedTopics: DetectedTopic[] = [];

    for (const aiTopic of aiTopics) {
      // Search curriculum database for matching topics
      const matchedTopics = searchTopics(aiTopic.name, subject);

      if (matchedTopics.length > 0) {
        for (const curriculumTopic of matchedTopics) {
          const topicGrade = getTopicGrade(curriculumTopic.id, subject);
          if (!topicGrade) continue;

          const gradeComparison = compareGrades(studentGrade, topicGrade);

          detectedTopics.push({
            topic: curriculumTopic,
            gradeLevel: topicGrade,
            confidence: aiTopic.confidence || 70,
            isAdvanced: gradeComparison < 0, // topicGrade > studentGrade
            isBelowLevel: gradeComparison > 0  // topicGrade < studentGrade
          });
        }
      }
    }

    // Sort by confidence (highest first)
    return detectedTopics.sort((a, b) => b.confidence - a.confidence);

  } catch (error) {
    console.error('[Topic Detection] Error:', error);
    return []; // Return empty on error
  }
}

/**
 * Compare two grade levels
 * Returns:
 *   -1 if grade1 < grade2 (grade2 is more advanced)
 *    0 if grade1 == grade2
 *    1 if grade1 > grade2 (grade1 is more advanced)
 */
function compareGrades(grade1: string, grade2: string): number {
  const gradeValue1 = getGradeValue(grade1);
  const gradeValue2 = getGradeValue(grade2);

  if (gradeValue1 < gradeValue2) return -1;
  if (gradeValue1 > gradeValue2) return 1;
  return 0;
}

/**
 * Convert grade string to numeric value for comparison
 * Elementary: 1-6 → 1-6
 * Middle: 7-9 → 7-9
 * High: 10-12 → 10-12
 * University: university-1, university-2, etc. → 13, 14, etc.
 */
function getGradeValue(grade: string): number {
  if (grade.startsWith('university-')) {
    const universityYear = parseInt(grade.replace('university-', ''));
    return 12 + universityYear;
  }

  const numericGrade = parseInt(grade);
  return isNaN(numericGrade) ? 0 : numericGrade;
}

/**
 * Get school level from grade
 */
function getSchoolLevel(grade: string): SchoolLevel {
  if (grade.startsWith('university')) return 'university';

  const gradeNum = parseInt(grade);
  if (gradeNum >= 1 && gradeNum <= 6) return 'elementary';
  if (gradeNum >= 7 && gradeNum <= 9) return 'middle';
  if (gradeNum >= 10 && gradeNum <= 12) return 'high';

  return 'elementary'; // Default
}

/**
 * Generate friendly message for advanced learning prevention
 */
function generateAdvancedLearningMessage(
  studentGrade: string,
  studentLevel: SchoolLevel,
  subject: Subject,
  advancedTopics: DetectedTopic[]
): string {
  const subjectKo = subject === 'english' ? '영어' : '수학';
  const topicNames = advancedTopics.map(dt => dt.topic.nameKo).join(', ');

  const levelMessages: Record<SchoolLevel, string> = {
    elementary: `초등학교 ${studentGrade}학년`,
    middle: `중학교 ${parseInt(studentGrade) - 6}학년`,
    high: `고등학교 ${parseInt(studentGrade) - 9}학년`,
    university: `대학교 ${studentGrade.replace('university-', '')}학년`
  };

  const currentLevelText = levelMessages[studentLevel] || `${studentGrade}학년`;

  // Get current grade curriculum to suggest appropriate topics
  const currentCurriculum = getCurriculum(studentGrade, subject);
  const currentTopics = currentCurriculum?.topics.slice(0, 3) || [];

  return `🎓 **선행학습 안내**

이 질문은 **${currentLevelText}** 수준보다 높은 내용이에요!

**질문하신 내용**: ${topicNames}
→ 이 주제는 더 높은 학년에서 배우는 내용이에요.

**왜 지금은 어려울까요?**
지금 배우고 있는 개념들을 먼저 완전히 이해하는 것이 더 중요해요. 기초가 탄탄해야 나중에 더 어려운 내용도 쉽게 배울 수 있거든요! 📚

**${currentLevelText}에서 배울 수 있는 ${subjectKo} 주제들**:
${currentTopics.map((t, i) => `${i + 1}. ${t.nameKo} - ${t.description}`).join('\n')}

이런 주제들로 질문해 주시면 제가 도움을 드릴 수 있어요! 😊

**궁금증이 계속된다면?**
나중에 해당 학년이 되면 꼭 다시 질문해 주세요! 그때는 제대로 설명해드릴게요. 🚀`;
}

/**
 * Quick check if a question might be advanced (pre-filter)
 */
export function mightBeAdvancedTopic(
  question: string,
  studentGrade: string,
  subject: Subject
): boolean {
  const gradeValue = getGradeValue(studentGrade);

  // Advanced math keywords by grade level
  const advancedMathKeywords: Record<string, string[]> = {
    elementary: ['미분', 'derivative', '적분', 'integral', '삼각함수', 'trigonometry', '행렬', 'matrix', '벡터', 'vector', '이차방정식', 'quadratic'],
    middle: ['미분', 'derivative', '적분', 'integral', '행렬', 'matrix', '벡터', 'vector', '삼각함수', 'trigonometry', 'calculus'],
    high: ['편미분', 'partial derivative', '중적분', 'multiple integral', '미분방정식', 'differential equation', '선형대수', 'linear algebra']
  };

  // Advanced English keywords by grade level
  const advancedEnglishKeywords: Record<string, string[]> = {
    elementary: ['가정법', 'subjunctive', '분사구문', 'participle', '관계대명사', 'relative pronoun', '수동태', 'passive'],
    middle: ['도치', 'inversion', '강조구문', 'cleft', '생략', 'ellipsis'],
    high: ['문학이론', 'literary theory', '비평', 'criticism', '수사학', 'rhetoric']
  };

  const keywords = subject === 'math' ? advancedMathKeywords : advancedEnglishKeywords;
  const studentLevel = getSchoolLevel(studentGrade);

  // Check if question contains keywords from higher levels
  for (const [level, levelKeywords] of Object.entries(keywords)) {
    if (shouldCheckLevel(studentLevel, level as SchoolLevel)) {
      for (const keyword of levelKeywords) {
        if (question.toLowerCase().includes(keyword.toLowerCase())) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Helper: Should we check this level for advanced keywords?
 */
function shouldCheckLevel(studentLevel: SchoolLevel, keywordLevel: SchoolLevel): boolean {
  const levelOrder: SchoolLevel[] = ['elementary', 'middle', 'high', 'university'];
  const studentIndex = levelOrder.indexOf(studentLevel);
  const keywordIndex = levelOrder.indexOf(keywordLevel);

  // Check levels equal to or higher than student level
  return keywordIndex >= studentIndex;
}

/**
 * Get recommended topics for student's grade level
 */
export function getRecommendedTopics(
  studentGrade: string,
  subject: Subject,
  limit: number = 5
): CurriculumTopic[] {
  const curriculum = getCurriculum(studentGrade, subject);
  if (!curriculum) return [];

  return curriculum.topics.slice(0, limit);
}
