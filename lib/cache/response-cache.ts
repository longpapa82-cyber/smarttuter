/**
 * Smart Response Cache System
 * 
 * 목적: API 호출을 최소화하여 50회/일 제한으로도 많은 사용자를 지원
 * 
 * 전략:
 * 1. 유사 질문 감지 및 캐시된 응답 재사용
 * 2. RAG 시스템 우선 사용 (API 호출 없이 답변)
 * 3. 세션 기반 캐싱으로 동일 사용자 최적화
 */

import crypto from 'crypto';

export interface CacheEntry {
  key: string;
  question: string;
  questionHash: string;
  response: any;
  subject: string;
  gradeLevel: string;
  timestamp: number;
  hitCount: number;
  expiresAt: number;
}

export interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  apiCallsSaved: number;
}

class ResponseCache {
  private cache: Map<string, CacheEntry> = new Map();
  private stats: CacheStats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    hitRate: 0,
    apiCallsSaved: 0,
  };

  // 캐시 설정
  private readonly MAX_CACHE_SIZE = 1000; // 최대 1000개 항목
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간
  private readonly SIMILARITY_THRESHOLD = 0.85; // 85% 유사도

  /**
   * 질문 정규화 (유사 질문 감지용)
   */
  private normalizeQuestion(question: string): string {
    return question
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, '') // 특수문자 제거
      .replace(/\s+/g, ' ') // 연속 공백 제거
      .trim();
  }

  /**
   * 질문 해시 생성
   */
  private generateHash(question: string, subject: string, gradeLevel: string): string {
    const normalized = this.normalizeQuestion(question);
    const input = `${normalized}|${subject}|${gradeLevel}`;
    return crypto.createHash('md5').update(input).digest('hex');
  }

  /**
   * 간단한 유사도 계산 (Jaccard similarity)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.split(' '));
    const words2 = new Set(str2.split(' '));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * 캐시에서 유사한 질문 찾기
   */
  private findSimilarEntry(
    question: string,
    subject: string,
    gradeLevel: string
  ): CacheEntry | null {
    const normalized = this.normalizeQuestion(question);
    const now = Date.now();

    let bestMatch: CacheEntry | null = null;
    let bestSimilarity = 0;

    for (const entry of this.cache.values()) {
      // 만료된 항목 건너뛰기
      if (entry.expiresAt < now) continue;

      // 같은 과목과 학년만 비교
      if (entry.subject !== subject || entry.gradeLevel !== gradeLevel) continue;

      const similarity = this.calculateSimilarity(
        normalized,
        this.normalizeQuestion(entry.question)
      );

      if (similarity > bestSimilarity && similarity >= this.SIMILARITY_THRESHOLD) {
        bestSimilarity = similarity;
        bestMatch = entry;
      }
    }

    return bestMatch;
  }

  /**
   * 캐시에서 응답 가져오기
   */
  get(question: string, subject: string, gradeLevel: string): any | null {
    this.stats.totalRequests++;

    // 정확한 매치 먼저 확인
    const hash = this.generateHash(question, subject, gradeLevel);
    let entry = this.cache.get(hash);

    // 정확한 매치 없으면 유사 질문 찾기
    if (!entry) {
      entry = this.findSimilarEntry(question, subject, gradeLevel) || undefined;
    }

    // 캐시 히트
    if (entry && entry.expiresAt > Date.now()) {
      entry.hitCount++;
      this.stats.cacheHits++;
      this.stats.apiCallsSaved += 4; // 질문당 평균 4번 API 호출 절약
      this.updateStats();

      console.log(`[Cache HIT] Question: "${question.substring(0, 50)}..." (saved 4 API calls)`);
      return entry.response;
    }

    // 캐시 미스
    this.stats.cacheMisses++;
    this.updateStats();
    console.log(`[Cache MISS] Question: "${question.substring(0, 50)}..."`);
    return null;
  }

  /**
   * 캐시에 응답 저장
   */
  set(
    question: string,
    subject: string,
    gradeLevel: string,
    response: any
  ): void {
    // 캐시 크기 제한
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }

    const hash = this.generateHash(question, subject, gradeLevel);
    const now = Date.now();

    const entry: CacheEntry = {
      key: hash,
      question,
      questionHash: hash,
      response,
      subject,
      gradeLevel,
      timestamp: now,
      hitCount: 0,
      expiresAt: now + this.CACHE_TTL,
    };

    this.cache.set(hash, entry);
    console.log(`[Cache SET] Cached response for: "${question.substring(0, 50)}..."`);
  }

  /**
   * 가장 오래되고 적게 사용된 항목 제거
   */
  private evictOldest(): void {
    let oldestEntry: CacheEntry | null = null;
    let oldestKey: string | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (!oldestEntry || 
          entry.hitCount < oldestEntry.hitCount || 
          (entry.hitCount === oldestEntry.hitCount && entry.timestamp < oldestEntry.timestamp)) {
        oldestEntry = entry;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`[Cache EVICT] Removed oldest entry`);
    }
  }

  /**
   * 통계 업데이트
   */
  private updateStats(): void {
    this.stats.hitRate = 
      this.stats.totalRequests > 0
        ? (this.stats.cacheHits / this.stats.totalRequests) * 100
        : 0;
  }

  /**
   * 만료된 항목 정리
   */
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[Cache CLEANUP] Removed ${cleaned} expired entries`);
    }
  }

  /**
   * 캐시 통계 가져오기
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 캐시 초기화
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      apiCallsSaved: 0,
    };
    console.log('[Cache CLEAR] Cache cleared');
  }

  /**
   * 캐시 크기 가져오기
   */
  size(): number {
    return this.cache.size;
  }
}

// 싱글톤 인스턴스
export const responseCache = new ResponseCache();

// 주기적 정리 (1시간마다)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    responseCache.cleanup();
  }, 60 * 60 * 1000);
}
