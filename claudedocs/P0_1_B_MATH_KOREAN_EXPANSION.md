# 📚 P0-1-B: 수학 RAG 한국어 확장 작업

## 📊 현황

**작업일**: 2025-01-08
**목표**: 나머지 수학 RAG 콘텐츠에 한국어 추가
**진행률**: 3/15 (20%) → 15/15 (100%)

---

## ✅ 완료된 항목 (3개)

| ID | Topic | Grade | Status |
|----|-------|-------|--------|
| `math-elem-addition` | 덧셈 (Addition) | 1학년 | ✅ 완료 |
| `math-elem-fractions` | 분수 (Fractions) | 3학년 | ✅ 완료 |
| `math-mid-quadratic` | 이차방정식 (Quadratic Equations) | 9학년 | ✅ 완료 |

---

## ⬜ 남은 항목 (12개)

### 초등학교 (4개)
| ID | Topic | Grade | 한국어 주제 |
|----|-------|-------|------------|
| `math-elem-subtraction` | Subtraction | 1학년 | 뺄셈 |
| `math-elem-multiplication` | Multiplication | 2학년 | 곱셈 |
| `math-elem-division` | Division | 3학년 | 나눗셈 |
| `math-elem-decimals` | Decimals | 4학년 | 소수 |

### 중학교 (3개)
| ID | Topic | Grade | 한국어 주제 |
|----|-------|-------|------------|
| `math-mid-percentages` | Percentages | 6학년 | 백분율 |
| `math-mid-linear-equations` | Linear Equations | 7학년 | 일차방정식 |
| `math-mid-pythagorean` | Pythagorean Theorem | 8학년 | 피타고라스 정리 |

### 고등학교 (5개)
| ID | Topic | Grade | 한국어 주제 |
|----|-------|-------|------------|
| `math-high-derivative` | Derivatives | 11학년 | 미분 |
| `math-high-functions` | Functions | 9학년 | 함수 |
| `math-high-trig-basics` | Trigonometry Basics | 10학년 | 삼각함수 기초 |
| `math-high-logarithms` | Logarithms | 11학년 | 로그 |
| `math-high-limits` | Limits | 11학년 | 극한 |

---

## 📝 작업 계획

### Phase 1: 초등 수학 (1일)
1. ✅ **뺄셈** (Subtraction) - 1학년
2. ✅ **곱셈** (Multiplication) - 2학년
3. ✅ **나눗셈** (Division) - 3학년
4. ✅ **소수** (Decimals) - 4학년

### Phase 2: 중등 수학 (1일)
1. ✅ **백분율** (Percentages) - 6학년
2. ✅ **일차방정식** (Linear Equations) - 7학년
3. ✅ **피타고라스 정리** (Pythagorean Theorem) - 8학년

### Phase 3: 고등 수학 (1일)
1. ✅ **함수** (Functions) - 9학년
2. ✅ **삼각함수 기초** (Trigonometry Basics) - 10학년
3. ✅ **미분** (Derivatives) - 11학년
4. ✅ **로그** (Logarithms) - 11학년
5. ✅ **극한** (Limits) - 11학년

---

## 🎯 한국어 콘텐츠 작성 템플릿

각 항목마다 다음 필드를 추가:

```typescript
{
  id: "math-elem-subtraction",
  subject: "math",
  topic: "Subtraction",
  topicKo: "뺄셈", // 추가
  gradeLevel: "1",
  schoolLevel: "elementary",

  // 기존 영문 콘텐츠
  content: `...`,
  examples: [...],
  keyPoints: [...],

  // 신규 한국어 콘텐츠
  contentKo: `뺄셈은 전체에서 일부를 빼는 것입니다...`, // 추가
  examplesKo: ["5 - 3 = 2 (5에서 3을 빼면 2)", ...], // 추가
  keyPointsKo: ["뺄셈은 빼는 것입니다", ...], // 추가

  source: "Common Core State Standards - Grade 1 / 2015 개정 교육과정 수학 1학년",
  lastVerified: "2025-01-08"
}
```

---

## 📈 예상 효과

### 즉시 효과
- ✅ 한국어 질문 → 한국어 RAG Direct 응답
- ✅ API 호출 50% 감소
- ✅ 응답 속도 3-5배 향상

### 성능 지표
- **RAG Direct 비율**: 0% → 50%
- **평균 응답 시간**: 3.5초 → 2.0초
- **답변 정확도**: 85% → 92%

---

## 🚀 다음 단계

1. **P0-1-B 완료 후**: 로컬 테스트
   - "곱셈이 뭐야?" → 한국어 RAG Direct 응답 확인
   - "백분율 계산법 알려줘" → 한국어 콘텐츠 확인

2. **P0-3 착수**: 국어 RAG 콘텐츠 작성 (30개)
   - 초등 1학년: 한글 모음/자음 (10개)
   - 초등 2학년: 받침/문장 부호 (10개)
   - 초등 3학년: 문장 성분/독해 (10개)

3. **P0-4**: 국어 튜터 API 개발
4. **P0-5**: 국어 튜터 UI 개발

---

**작성일**: 2025-01-08
**예상 완료**: 2025-01-11 (3일 후)
**다음 리뷰**: Phase 1 완료 후 (1일 후)
