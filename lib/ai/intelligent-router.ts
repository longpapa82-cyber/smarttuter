/**
 * Intelligent Router
 *
 * 질문 복잡도를 분석하여 최적의 AI 모델 티어를 선택
 *
 * 목표: 비용 vs 품질 최적화
 * - Simple questions → Flash (저비용)
 * - Complex questions → Pro (고품질)
 * - Critical verification → Multi-model
 */

import { ModelTier } from './vertex-client';

export interface ComplexityAnalysis {
  score: number; // 0-1
  factors: string[];
  reasoning: string;
}

export interface RoutingDecision {
  tier: ModelTier;
  model: string;
  estimatedCost: number; // USD
  confidence: number; // 0-1
  reasoning: string;
}

class IntelligentRouter {
  /**
   * 질문을 분석하여 최적 티어 결정
   */
  async routeQuestion(
    question: string,
    subject: 'math' | 'english' | 'science' | 'social-studies',
    gradeLevel: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): Promise<RoutingDecision> {

    // 복잡도 분석
    const complexity = this.analyzeComplexity(question, subject, gradeLevel);

    // 티어 결정
    if (complexity.score < 0.4) {
      // Simple questions → Flash
      return {
        tier: 'flash',
        model: 'gemini-2.5-flash',
        estimatedCost: 0.0008, // ~$0.0008 per avg question
        confidence: 0.95,
        reasoning: `Low complexity (${complexity.score.toFixed(2)}): ${complexity.factors.join(', ')}`
      };
    } else if (complexity.score < 0.7) {
      // Moderate questions → Flash with higher quality
      return {
        tier: 'flash',
        model: 'gemini-2.5-flash',
        estimatedCost: 0.001,
        confidence: 0.9,
        reasoning: `Moderate complexity (${complexity.score.toFixed(2)}): Can handle with Flash`
      };
    } else {
      // Complex questions → Pro
      return {
        tier: 'pro',
        model: 'gemini-2.5-pro',
        estimatedCost: 0.004, // ~$0.004 per avg question
        confidence: 0.98,
        reasoning: `High complexity (${complexity.score.toFixed(2)}): ${complexity.factors.join(', ')}`
      };
    }
  }

  /**
   * 질문 복잡도 분석
   */
  private analyzeComplexity(
    question: string,
    subject: string,
    gradeLevel: string
  ): ComplexityAnalysis {
    const factors: string[] = [];
    let score = 0;

    // 1. 수학적 복잡도
    if (subject === 'math') {
      // 고급 수학 기호
      if (/[∫∑∏√∂∇]/u.test(question)) {
        score += 0.3;
        factors.push('advanced-math-symbols');
      }

      // 미적분, 벡터, 행렬
      if (/calculus|derivative|integral|matrix|vector|eigen/i.test(question)) {
        score += 0.25;
        factors.push('advanced-math-concepts');
      }

      // 다항식, 복잡한 방정식
      if (/polynomial|quadratic|cubic|exponential/i.test(question)) {
        score += 0.15;
        factors.push('complex-equations');
      }
    }

    // 2. 다단계 추론
    const stepIndicators = question.match(/then|after|next|finally|따라서|그리고|그러면|다음으로/gi);
    if (stepIndicators && stepIndicators.length > 2) {
      score += 0.2 * Math.min(stepIndicators.length, 3);
      factors.push(`multi-step-reasoning(${stepIndicators.length})`);
    }

    // 3. 학년 수준
    const grade = parseInt(gradeLevel) || 5;
    if (grade >= 10) {
      score += 0.2;
      factors.push(`high-school-level(grade-${grade})`);
    } else if (grade >= 12) {
      score += 0.3;
      factors.push(`university-level`);
    }

    // 4. 분석/설명 요구
    if (/why|how|explain|analyze|describe|compare|contrast|evaluate|왜|어떻게|설명|분석/i.test(question)) {
      score += 0.25;
      factors.push('analytical-question');
    }

    // 5. 문제 해결 vs 단순 사실
    if (/solve|calculate|find|prove|determine|풀|계산|구하|증명/i.test(question)) {
      score += 0.15;
      factors.push('problem-solving');
    }

    // 6. 질문 길이 (복잡한 질문은 보통 길다)
    const wordCount = question.split(/\s+/).length;
    if (wordCount > 50) {
      score += 0.15;
      factors.push(`long-question(${wordCount}-words)`);
    }

    // 7. 과학 실험/추론
    if (subject === 'science') {
      if (/experiment|hypothesis|observe|conclude|실험|가설|관찰|결론/i.test(question)) {
        score += 0.2;
        factors.push('scientific-method');
      }
    }

    // 8. 영어 문법 분석
    if (subject === 'english') {
      if (/grammar|syntax|tense|clause|문법|구문|시제/i.test(question)) {
        score += 0.15;
        factors.push('grammar-analysis');
      }
    }

    // 정규화
    score = Math.min(score, 1.0);

    const reasoning = factors.length > 0
      ? `Detected: ${factors.join(', ')}`
      : 'Simple, direct question';

    return { score, factors, reasoning };
  }

  /**
   * 히스토리 기반 컨텍스트 복잡도 추가
   */
  private analyzeContextComplexity(
    history: Array<{ role: string; content: string }>
  ): number {
    if (!history || history.length === 0) return 0;

    let contextScore = 0;

    // 긴 대화 히스토리는 복잡도 증가
    if (history.length > 5) {
      contextScore += 0.1;
    }

    // 이전 질문이 복잡했다면 후속 질문도 복잡할 가능성
    const lastUserMessage = history
      .filter(m => m.role === 'user')
      .slice(-1)[0];

    if (lastUserMessage) {
      const prevComplexity = this.analyzeComplexity(
        lastUserMessage.content,
        'math', // 기본값
        '5'
      );
      contextScore += prevComplexity.score * 0.2;
    }

    return Math.min(contextScore, 0.3); // 최대 0.3 추가
  }

  /**
   * 비용 추정
   */
  estimateCost(
    inputTokens: number,
    outputTokens: number,
    tier: ModelTier
  ): number {
    if (tier === 'flash') {
      // Gemini 2.5 Flash: $0.30 per 1M input, $2.50 per 1M output
      return (inputTokens / 1_000_000 * 0.30) + (outputTokens / 1_000_000 * 2.50);
    } else {
      // Gemini 2.5 Pro: $1.25 per 1M input, $10.00 per 1M output
      return (inputTokens / 1_000_000 * 1.25) + (outputTokens / 1_000_000 * 10.00);
    }
  }

  /**
   * 통계 추적
   */
  private stats = {
    flashCount: 0,
    proCount: 0,
    totalCost: 0,
  };

  trackUsage(tier: ModelTier, cost: number) {
    if (tier === 'flash') {
      this.stats.flashCount++;
    } else {
      this.stats.proCount++;
    }
    this.stats.totalCost += cost;
  }

  getStats() {
    return {
      ...this.stats,
      avgCostPerQuery: this.stats.totalCost / (this.stats.flashCount + this.stats.proCount),
      tierDistribution: {
        flash: this.stats.flashCount / (this.stats.flashCount + this.stats.proCount),
        pro: this.stats.proCount / (this.stats.flashCount + this.stats.proCount),
      }
    };
  }
}

// 싱글톤
export const intelligentRouter = new IntelligentRouter();
