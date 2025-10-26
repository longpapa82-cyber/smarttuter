// Phase 10: English Voice Tutor
// Pronunciation feedback, grammar correction, conversation practice

import { VoiceTutorEngine } from './engine';
import {
  TutorSubject,
  GradeLevel,
  MessageFeedback,
  EnglishAnalysis,
  GrammarCorrection,
  VocabularyAnalysis,
  CONVERSATION_STARTERS,
} from './types';

export class EnglishVoiceTutor extends VoiceTutorEngine {
  constructor(gradeLevel: GradeLevel, userId: string) {
    super('english', gradeLevel, userId);
  }

  // Start conversation with appropriate greeting
  async startConversation(): Promise<string> {
    const starters = CONVERSATION_STARTERS.english[this.gradeLevel];
    const starter = starters[Math.floor(Math.random() * starters.length)];

    const greeting = this.getGreeting();
    return `${greeting} I'm your English speaking tutor. ${starter}`;
  }

  private getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning!";
    if (hour < 18) return "Good afternoon!";
    return "Good evening!";
  }

  // Analyze English input
  protected async analyzeInput(message: string): Promise<EnglishAnalysis> {
    const prompt = `
You are an expert English tutor analyzing a student's spoken message.

Student level: ${this.gradeLevel}
Student message: "${message}"

Analyze the following aspects:
1. Grammar correctness (0-100)
2. Vocabulary level (elementary/intermediate/advanced)
3. Sentence structure complexity (0-100)
4. Fluency and naturalness (0-100)
5. Identify any errors with corrections
6. Note strengths in the response

Be encouraging and supportive. For lower levels, focus on communication over perfection.
For higher levels, provide more detailed feedback.

Return ONLY valid JSON in this exact format:
{
  "grammarScore": 85,
  "vocabularyLevel": "intermediate",
  "sentenceComplexity": 70,
  "fluency": 80,
  "errors": [
    {
      "type": "grammar",
      "text": "I goes to school",
      "correction": "I go to school",
      "explanation": "Use 'go' with 'I', not 'goes'"
    }
  ],
  "strengths": ["good vocabulary choice", "clear pronunciation"]
}
`;

    const response = await this.callClaude(prompt);

    try {
      // Extract JSON from response (handle code blocks)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const analysis: EnglishAnalysis = JSON.parse(jsonMatch[0]);
      return analysis;
    } catch (error) {
      console.error('Failed to parse English analysis:', error);
      // Return default analysis
      return {
        grammarScore: 70,
        vocabularyLevel: 'intermediate',
        sentenceComplexity: 60,
        fluency: 70,
        errors: [],
        strengths: ['You are communicating well!'],
      };
    }
  }

  // Generate response based on analysis
  protected async generateResponse(
    analysis: EnglishAnalysis,
    userMessage: string
  ): Promise<string> {
    const context = this.buildContext();
    const recentMessages = context.sessionHistory.slice(-6); // Last 3 exchanges

    const conversationContext = recentMessages
      .map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
      .join('\n');

    const prompt = `
You are a friendly, encouraging English conversation tutor.

Student level: ${this.gradeLevel}
Current conversation:
${conversationContext}

Student just said: "${userMessage}"

Analysis shows:
- Grammar score: ${analysis.grammarScore}/100
- Vocabulary level: ${analysis.vocabularyLevel}
- Fluency: ${analysis.fluency}/100
${analysis.errors.length > 0 ? `- Errors found: ${analysis.errors.length}` : '- No errors!'}

Your response should:
1. Continue the conversation naturally
2. Show interest in what they said
3. Ask a follow-up question to keep conversation flowing
4. Use vocabulary appropriate for ${this.gradeLevel} level
5. Be encouraging and supportive

${analysis.errors.length > 0 && analysis.grammarScore < 70
  ? 'If there were significant errors, gently correct ONE of them in a natural way.'
  : ''
}

Keep it conversational and friendly (2-3 sentences max). Don't make it feel like a test.

Response:`;

    const response = await this.callClaude(prompt);
    return response.trim();
  }

  // Generate feedback
  protected async generateFeedback(
    analysis: EnglishAnalysis
  ): Promise<MessageFeedback | undefined> {
    // Determine if response is positive
    const avgScore = (analysis.grammarScore + analysis.fluency) / 2;
    const isPositive = avgScore >= 60;

    // Decide feedback type based on analysis
    let feedbackType: 'pronunciation' | 'grammar' | 'concept' | 'encouragement' = 'encouragement';

    if (analysis.errors.length > 0) {
      const hasGrammarErrors = analysis.errors.some(e => e.type === 'grammar');
      if (hasGrammarErrors) {
        feedbackType = 'grammar';
      }
    } else if (analysis.grammarScore >= 90) {
      feedbackType = 'grammar'; // Perfect grammar
    }

    // Generate suggestions
    const suggestions: string[] = [];
    if (analysis.errors.length > 0 && analysis.errors.length <= 2) {
      // Only show corrections for 1-2 errors (not overwhelming)
      suggestions.push(...analysis.errors.map(e => e.correction));
    }

    if (analysis.strengths.length > 0) {
      suggestions.push(`Great job: ${analysis.strengths[0]}`);
    }

    // Generate correction text for major errors
    let corrections: string | undefined;
    if (analysis.errors.length > 0 && feedbackType === 'grammar') {
      const mainError = analysis.errors[0];
      corrections = `"${mainError.text}" → "${mainError.correction}". ${mainError.explanation}`;
    }

    return {
      type: feedbackType,
      score: Math.round(avgScore),
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      corrections,
      isPositive,
    };
  }

  // Grammar correction helper
  async correctGrammar(message: string): Promise<GrammarCorrection[]> {
    const prompt = `
Analyze grammar in this sentence and provide corrections:

"${message}"

Return ONLY valid JSON array of corrections:
[
  {
    "original": "text with error",
    "corrected": "corrected text",
    "rule": "grammar rule name",
    "explanation": "why this is the correction",
    "severity": "minor"
  }
]

If there are no errors, return: []
`;

    const response = await this.callClaude(prompt);

    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return [];

      const corrections = JSON.parse(jsonMatch[0]);
      return corrections.map((c: any, index: number) => ({
        id: `correction-${Date.now()}-${index}`,
        original: c.original,
        corrected: c.corrected,
        rule: c.rule,
        explanation: c.explanation,
        severity: c.severity || 'moderate',
        timestamp: new Date(),
      }));
    } catch (error) {
      console.error('Failed to parse grammar corrections:', error);
      return [];
    }
  }

  // Vocabulary analysis helper
  async analyzeVocabulary(message: string): Promise<VocabularyAnalysis> {
    const prompt = `
Analyze vocabulary usage in this message:

"${message}"

Student level: ${this.gradeLevel}

Identify:
1. Vocabulary level used (elementary/intermediate/advanced)
2. Words that are appropriate for this level
3. Words that might be challenging
4. Suggestions for vocabulary improvement

Return ONLY valid JSON:
{
  "level": "intermediate",
  "appropriateWords": ["word1", "word2"],
  "challengingWords": ["difficult1", "difficult2"],
  "suggestions": ["try using 'X' instead of 'Y'"]
}
`;

    const response = await this.callClaude(prompt);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to parse vocabulary analysis:', error);
      return {
        level: 'intermediate',
        appropriateWords: [],
        challengingWords: [],
        suggestions: [],
      };
    }
  }

  // Get topic suggestion for next conversation
  async suggestTopic(): Promise<string> {
    const prompt = `
Suggest an interesting conversation topic for a ${this.gradeLevel} student learning English.

Make it engaging, age-appropriate, and conducive to natural conversation.

Return just the topic suggestion (one sentence):
`;

    const response = await this.callClaude(prompt);
    return response.trim();
  }

  // Provide pronunciation tip
  getPronunciationTip(): string {
    const tips = {
      elementary: [
        "Practice the 'th' sound by placing your tongue between your teeth.",
        "Remember: 'ship' and 'sheep' sound different! Focus on the vowel.",
        "Try saying tongue twisters slowly at first, then speed up.",
      ],
      middle: [
        "Record yourself speaking and compare with native speakers.",
        "Pay attention to word stress - it can change meaning!",
        "Practice linking words together for more natural flow.",
      ],
      high: [
        "Focus on intonation patterns for questions vs. statements.",
        "Practice reducing unstressed syllables for natural rhythm.",
        "Work on difficult consonant clusters like 'str', 'spr', 'thr'.",
      ],
      university: [
        "Master the schwa sound (ə) - it's the most common vowel in English!",
        "Practice varying your pitch for emphasis and emotion.",
        "Study connected speech patterns and weak forms.",
      ],
    };

    const levelTips = tips[this.gradeLevel];
    return levelTips[Math.floor(Math.random() * levelTips.length)];
  }
}
