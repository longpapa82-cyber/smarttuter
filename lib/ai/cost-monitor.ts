/**
 * Cost Monitor & Budget Guardian
 *
 * AI 사용 비용을 실시간 추적하고 예산 초과 방지
 *
 * 기능:
 * - 실시간 비용 추적
 * - 일일/월간 예산 관리
 * - 비용 초과 시 자동 대응
 * - 상세 분석 리포트
 */

import { ModelTier } from './vertex-client';

export interface CostEntry {
  timestamp: Date;
  model: string;
  tier: ModelTier;
  inputTokens: number;
  outputTokens: number;
  cost: number; // USD
  subject: string;
  gradeLevel: string;
  cached: boolean;
}

export interface BudgetAlert {
  level: 'warning' | 'critical' | 'exceeded';
  currentSpend: number;
  budget: number;
  percentage: number;
  message: string;
  recommendedAction: string;
}

class CostMonitor {
  private entries: CostEntry[] = [];
  private dailyBudget: number = 100; // $100/일 기본값
  private monthlyBudget: number = 3000; // $3000/월 기본값

  /**
   * 비용 기록
   */
  trackCost(entry: Omit<CostEntry, 'timestamp'>): void {
    this.entries.push({
      ...entry,
      timestamp: new Date(),
    });

    // 예산 체크
    this.checkBudget();
  }

  /**
   * 비용 추정 (사전 체크)
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
   * 예산 체크
   */
  checkBudget(): BudgetAlert | null {
    const dailySpend = this.getDailySpend();
    const percentage = (dailySpend / this.dailyBudget) * 100;

    if (percentage >= 100) {
      return {
        level: 'exceeded',
        currentSpend: dailySpend,
        budget: this.dailyBudget,
        percentage,
        message: `Daily budget exceeded: $${dailySpend.toFixed(2)} / $${this.dailyBudget}`,
        recommendedAction: 'Switch to cache-only mode or use Flash tier exclusively'
      };
    } else if (percentage >= 90) {
      return {
        level: 'critical',
        currentSpend: dailySpend,
        budget: this.dailyBudget,
        percentage,
        message: `Critical: ${percentage.toFixed(1)}% of daily budget used`,
        recommendedAction: 'Reduce Pro tier usage, prioritize cache hits'
      };
    } else if (percentage >= 75) {
      return {
        level: 'warning',
        currentSpend: dailySpend,
        budget: this.dailyBudget,
        percentage,
        message: `Warning: ${percentage.toFixed(1)}% of daily budget used`,
        recommendedAction: 'Monitor usage closely, consider cost optimization'
      };
    }

    return null;
  }

  /**
   * 일일 지출 계산
   */
  getDailySpend(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.entries
      .filter(e => e.timestamp >= today)
      .reduce((sum, e) => sum + e.cost, 0);
  }

  /**
   * 월간 지출 계산
   */
  getMonthlySpend(): number {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return this.entries
      .filter(e => e.timestamp >= monthStart)
      .reduce((sum, e) => sum + e.cost, 0);
  }

  /**
   * 상세 통계
   */
  getDetailedStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayEntries = this.entries.filter(e => e.timestamp >= today);
    const monthEntries = this.entries.filter(e => e.timestamp >= monthStart);

    return {
      today: {
        totalCost: this.getDailySpend(),
        requestCount: todayEntries.length,
        avgCostPerRequest: this.getDailySpend() / Math.max(todayEntries.length, 1),
        budgetRemaining: Math.max(0, this.dailyBudget - this.getDailySpend()),
        budgetUsedPercentage: (this.getDailySpend() / this.dailyBudget) * 100,
        tierBreakdown: {
          flash: todayEntries.filter(e => e.tier === 'flash').length,
          pro: todayEntries.filter(e => e.tier === 'pro').length,
        },
        cacheHitRate: todayEntries.filter(e => e.cached).length / Math.max(todayEntries.length, 1),
      },
      month: {
        totalCost: this.getMonthlySpend(),
        requestCount: monthEntries.length,
        avgCostPerRequest: this.getMonthlySpend() / Math.max(monthEntries.length, 1),
        budgetRemaining: Math.max(0, this.monthlyBudget - this.getMonthlySpend()),
        budgetUsedPercentage: (this.getMonthlySpend() / this.monthlyBudget) * 100,
        tierBreakdown: {
          flash: monthEntries.filter(e => e.tier === 'flash').length,
          pro: monthEntries.filter(e => e.tier === 'pro').length,
        },
        subjectBreakdown: this.getSubjectBreakdown(monthEntries),
      },
      projections: {
        projectedDailyCost: this.projectDailyCost(),
        projectedMonthlyCost: this.projectMonthlyCost(),
      }
    };
  }

  /**
   * 과목별 분석
   */
  private getSubjectBreakdown(entries: CostEntry[]) {
    const subjects = ['math', 'english', 'science', 'social'];
    const breakdown: Record<string, { count: number; cost: number }> = {};

    subjects.forEach(subject => {
      const subjectEntries = entries.filter(e => e.subject === subject);
      breakdown[subject] = {
        count: subjectEntries.length,
        cost: subjectEntries.reduce((sum, e) => sum + e.cost, 0),
      };
    });

    return breakdown;
  }

  /**
   * 일일 비용 예측
   */
  private projectDailyCost(): number {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEntries = this.entries.filter(e => e.timestamp >= today);

    if (todayEntries.length === 0) return 0;

    const hoursElapsed = (now.getTime() - today.getTime()) / (1000 * 60 * 60);
    if (hoursElapsed < 1) return 0;

    const currentSpend = this.getDailySpend();
    const hourlyRate = currentSpend / hoursElapsed;

    return hourlyRate * 24; // 24시간 기준 예측
  }

  /**
   * 월간 비용 예측
   */
  private projectMonthlyCost(): number {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysElapsed = Math.ceil((now.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));

    if (daysElapsed < 1) return 0;

    const currentMonthSpend = this.getMonthlySpend();
    const dailyAverage = currentMonthSpend / daysElapsed;

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    return dailyAverage * daysInMonth;
  }

  /**
   * 예산 설정
   */
  setBudget(daily: number, monthly: number) {
    this.dailyBudget = daily;
    this.monthlyBudget = monthly;

    console.log(`📊 Budget updated: $${daily}/day, $${monthly}/month`);
  }

  /**
   * 비용 최적화 추천
   */
  getOptimizationRecommendations(): string[] {
    const stats = this.getDetailedStats();
    const recommendations: string[] = [];

    // 캐시 히트율이 낮으면
    if (stats.today.cacheHitRate < 0.4) {
      recommendations.push(
        `📈 Improve cache hit rate (current: ${(stats.today.cacheHitRate * 100).toFixed(1)}%). Target: >50%`
      );
    }

    // Pro 티어 사용이 많으면
    const proRatio = stats.today.tierBreakdown.pro / Math.max(stats.today.requestCount, 1);
    if (proRatio > 0.3) {
      recommendations.push(
        `💰 Reduce Pro tier usage (current: ${(proRatio * 100).toFixed(1)}%). Optimize routing logic.`
      );
    }

    // 예산 초과 위험
    if (stats.today.budgetUsedPercentage > 80) {
      recommendations.push(
        `⚠️  Budget risk: ${stats.today.budgetUsedPercentage.toFixed(1)}% used. Enable cost-saving mode.`
      );
    }

    // 예측 초과
    if (stats.projections.projectedDailyCost > this.dailyBudget) {
      recommendations.push(
        `🚨 Projected daily cost: $${stats.projections.projectedDailyCost.toFixed(2)} exceeds budget. Take action now.`
      );
    }

    return recommendations.length > 0
      ? recommendations
      : ['✅ Cost optimization is good. No action needed.'];
  }

  /**
   * 비용 리포트 생성
   */
  generateReport(): string {
    const stats = this.getDetailedStats();
    const alert = this.checkBudget();
    const recommendations = this.getOptimizationRecommendations();

    return `
# AI Cost Report

## Today's Usage
- **Total Cost**: $${stats.today.totalCost.toFixed(4)}
- **Requests**: ${stats.today.requestCount}
- **Avg Cost/Request**: $${stats.today.avgCostPerRequest.toFixed(4)}
- **Budget Remaining**: $${stats.today.budgetRemaining.toFixed(2)} (${(100 - stats.today.budgetUsedPercentage).toFixed(1)}%)
- **Cache Hit Rate**: ${(stats.today.cacheHitRate * 100).toFixed(1)}%

### Tier Distribution
- Flash: ${stats.today.tierBreakdown.flash} requests
- Pro: ${stats.today.tierBreakdown.pro} requests

## This Month
- **Total Cost**: $${stats.month.totalCost.toFixed(2)}
- **Requests**: ${stats.month.requestCount}
- **Budget Remaining**: $${stats.month.budgetRemaining.toFixed(2)}
- **Projected Monthly Cost**: $${stats.projections.projectedMonthlyCost.toFixed(2)}

### Subject Breakdown
${Object.entries(stats.month.subjectBreakdown).map(([subject, data]) =>
  `- ${subject}: ${data.count} requests, $${data.cost.toFixed(4)}`
).join('\n')}

${alert ? `\n## ⚠️  Budget Alert\n- ${alert.message}\n- **Action**: ${alert.recommendedAction}` : ''}

## 💡 Optimization Recommendations
${recommendations.map(r => `- ${r}`).join('\n')}
    `.trim();
  }
}

// 싱글톤
export const costMonitor = new CostMonitor();
