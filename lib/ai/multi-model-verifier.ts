/**
 * Multi-Model Consensus Verifier
 *
 * 여러 AI 모델로 답변을 교차 검증하여 Hallucination 방지
 *
 * 전략:
 * 1. Gemini Pro로 답변 생성
 * 2. Gemini Flash로 빠른 검증
 * 3. Claude Sonnet로 최종 검증 (필요 시)
 * 4. RAG 시스템과 비교
 *
 * 목표: Hallucination <5%
 */

import { vertexAIClient } from './vertex-client';
import { retrieveVerifiedContent } from '../tutor/rag-system';
import Anthropic from '@anthropic-ai/sdk';

export interface VerificationResult {
  isAccurate: boolean;
  confidence: number; // 0-1
  consensus: number; // 합의도 (동의한 모델 수 / 전체 모델 수)
  corrections: string[];
  verifiers: {
    gemini: boolean;
    claude?: boolean;
    rag: boolean;
  };
  reasoning: string;
}

class MultiModelVerifier {
  private anthropic: Anthropic | null = null;

  constructor() {
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  /**
   * 메인 검증 함수
   */
  async verifyAnswer(
    question: string,
    answer: string,
    subject: 'math' | 'english' | 'science' | 'social',
    gradeLevel: string,
    useClaudeVerification: boolean = false
  ): Promise<VerificationResult> {

    const verifications: boolean[] = [];
    const corrections: string[] = [];

    // 1. Gemini Flash 빠른 검증
    try {
      const geminiCheck = await this.verifyWithGemini(question, answer, subject);
      verifications.push(geminiCheck.isAccurate);

      if (!geminiCheck.isAccurate) {
        corrections.push(`Gemini: ${geminiCheck.issue}`);
      }
    } catch (error) {
      console.error('[Verifier] Gemini verification failed:', error);
    }

    // 2. RAG 시스템과 비교
    try {
      const ragCheck = await this.verifyWithRAG(question, answer, subject, gradeLevel);
      verifications.push(ragCheck.isAccurate);

      if (!ragCheck.isAccurate) {
        corrections.push(`RAG: ${ragCheck.issue}`);
      }
    } catch (error) {
      console.error('[Verifier] RAG verification failed:', error);
    }

    // 3. Claude 검증 (선택적, 비용 고려)
    let claudeCheck: { isAccurate: boolean; issue?: string } | null = null;
    if (useClaudeVerification && this.anthropic) {
      try {
        claudeCheck = await this.verifyWithClaude(question, answer, subject);
        verifications.push(claudeCheck.isAccurate);

        if (!claudeCheck.isAccurate) {
          corrections.push(`Claude: ${claudeCheck.issue}`);
        }
      } catch (error) {
        console.error('[Verifier] Claude verification failed:', error);
      }
    }

    // 합의 계산
    const agreeCount = verifications.filter(v => v).length;
    const totalCount = verifications.length;
    const consensus = agreeCount / totalCount;

    // 최종 판단 (2/3 이상 동의 필요)
    const isAccurate = consensus >= 0.67;

    return {
      isAccurate,
      confidence: consensus,
      consensus,
      corrections,
      verifiers: {
        gemini: verifications[0] || false,
        claude: claudeCheck?.isAccurate,
        rag: verifications[1] || false,
      },
      reasoning: isAccurate
        ? `${agreeCount}/${totalCount} models agree - Answer verified`
        : `Only ${agreeCount}/${totalCount} models agree - Needs review: ${corrections.join('; ')}`
    };
  }

  /**
   * Gemini로 검증
   */
  private async verifyWithGemini(
    question: string,
    answer: string,
    subject: string
  ): Promise<{ isAccurate: boolean; issue?: string }> {

    const verificationPrompt = `You are an expert ${subject} educator. Verify if this answer is accurate and complete.

Question: ${question}

Student Answer: ${answer}

Provide your verification in this format:
ACCURATE: yes/no
ISSUE: (if not accurate, explain the specific problem)

Be strict and factual. Only mark as accurate if the answer is correct and complete.`;

    try {
      const result = await vertexAIClient.generateContent(
        verificationPrompt,
        'flash', // 빠른 검증
        { temperature: 0.1 }
      );

      const isAccurate = /ACCURATE:\s*yes/i.test(result);
      const issueMatch = result.match(/ISSUE:\s*(.+)/i);
      const issue = issueMatch ? issueMatch[1].trim() : undefined;

      return { isAccurate, issue };
    } catch (error) {
      console.error('[Gemini Verifier] Error:', error);
      return { isAccurate: false, issue: 'Verification failed' };
    }
  }

  /**
   * Claude로 검증
   */
  private async verifyWithClaude(
    question: string,
    answer: string,
    subject: string
  ): Promise<{ isAccurate: boolean; issue?: string }> {

    if (!this.anthropic) {
      return { isAccurate: false, issue: 'Claude not configured' };
    }

    const verificationPrompt = `You are an expert ${subject} educator. Verify if this answer is accurate and complete.

Question: ${question}

Student Answer: ${answer}

Provide your verification in this format:
ACCURATE: yes/no
ISSUE: (if not accurate, explain the specific problem)

Be strict and factual. Only mark as accurate if the answer is correct and complete.`;

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        temperature: 0.1,
        messages: [{
          role: 'user',
          content: verificationPrompt
        }]
      });

      const content = message.content[0];
      const text = content.type === 'text' ? content.text : '';

      const isAccurate = /ACCURATE:\s*yes/i.test(text);
      const issueMatch = text.match(/ISSUE:\s*(.+)/i);
      const issue = issueMatch ? issueMatch[1].trim() : undefined;

      return { isAccurate, issue };
    } catch (error) {
      console.error('[Claude Verifier] Error:', error);
      return { isAccurate: false, issue: 'Claude verification failed' };
    }
  }

  /**
   * RAG 시스템으로 검증
   */
  private async verifyWithRAG(
    question: string,
    answer: string,
    subject: string,
    gradeLevel: string
  ): Promise<{ isAccurate: boolean; issue?: string }> {

    try {
      // RAG에서 관련 검증된 콘텐츠 가져오기
      const ragContent = await retrieveVerifiedContent(
        question,
        subject as any,
        gradeLevel,
        3
      );

      // RAG 콘텐츠가 없으면 검증 불가
      if (ragContent.content.length === 0) {
        return { isAccurate: true, issue: undefined }; // 중립
      }

      // RAG 콘텐츠와 답변 비교
      const ragText = ragContent.content.map(c => c.content).join('\n\n');

      // 간단한 키워드 매칭으로 일치도 확인
      const answerKeywords = this.extractKeywords(answer);
      const ragKeywords = this.extractKeywords(ragText);

      const matchCount = answerKeywords.filter(k => ragKeywords.includes(k)).length;
      const matchRatio = matchCount / Math.max(answerKeywords.length, 1);

      // 50% 이상 일치하면 정확한 것으로 간주
      if (matchRatio >= 0.5) {
        return { isAccurate: true };
      } else {
        return {
          isAccurate: false,
          issue: `Answer diverges from verified curriculum content (${Math.round(matchRatio * 100)}% match)`
        };
      }
    } catch (error) {
      console.error('[RAG Verifier] Error:', error);
      return { isAccurate: true, issue: undefined }; // 중립 (에러 시)
    }
  }

  /**
   * 키워드 추출 (간단한 버전)
   */
  private extractKeywords(text: string): string[] {
    // 불용어 제거 후 주요 단어 추출
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could',
      'can', 'may', 'might', 'must', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with']);

    return text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 20); // 상위 20개 키워드
  }

  /**
   * 통계
   */
  private stats = {
    totalVerifications: 0,
    accurateCount: 0,
    inaccurateCount: 0,
    avgConfidence: 0,
  };

  trackVerification(result: VerificationResult) {
    this.stats.totalVerifications++;

    if (result.isAccurate) {
      this.stats.accurateCount++;
    } else {
      this.stats.inaccurateCount++;
    }

    // 평균 신뢰도 업데이트
    this.stats.avgConfidence =
      (this.stats.avgConfidence * (this.stats.totalVerifications - 1) + result.confidence) /
      this.stats.totalVerifications;
  }

  getStats() {
    return {
      ...this.stats,
      accuracyRate: this.stats.accurateCount / this.stats.totalVerifications,
      hallucinationRate: this.stats.inaccurateCount / this.stats.totalVerifications,
    };
  }
}

// 싱글톤
export const multiModelVerifier = new MultiModelVerifier();
