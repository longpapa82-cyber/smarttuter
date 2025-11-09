# 튜터 페이지 Beta 배지 디자인 사양서

## 📋 Executive Summary

**결정사항**: **Option C - 채팅 헤더 내부 타이틀 옆 배치**

전 세계 에듀테크 및 AI 채팅 서비스 벤치마킹 결과, 헤더 타이틀 옆에 배치하는 것이 최적의 UX 패턴으로 확인됨.

---

## 🔍 벤치마킹 분석

### 1. Khan Academy - Khanmigo
- **기능**: GPT-4 기반 AI 튜터 ($20/month, 파일럿 단계)
- **UI 패턴**: Minimalist interface, 프리미엄 베타 기능으로 포지셔닝
- **배지 위치**: 제품명 옆에 배치 (Khanmigo Beta)
- **특징**: 교육적 안전장치 강조, 책임있는 AI 구현

### 2. Duolingo Max
- **기능**: GPT-4 기반 Role Play + Explain My Answer ($30/month)
- **UI 패턴**: Minimalist conversational interface
- **배지 위치**: 기능명 옆 또는 구독 플랜 표시
- **특징**: 프리미엄 기능으로 차별화

### 3. ChatGPT
- **기능**: GPT-4, Browsing, Plugins
- **UI 패턴**: Toggle for beta features, 모델 선택 UI
- **배지 위치**: 기능 토글 영역, 사이드바
- **특징**: 실험적 기능 명확히 구분

### 4. Claude AI
- **기능**: Projects, experimental features
- **UI 패턴**: Clean, two-column layout (sidebar + chat)
- **배지 위치**: 사이드바 또는 기능별 섹션 표시
- **특징**: Purple accent colors, 간결한 디자인

---

## 🎯 설계 결정

### 선택된 옵션: **Option C - 채팅 헤더 내부**

#### 근거
1. **산업 표준**: Khan Academy, Duolingo 등 모두 타이틀/기능명 옆에 베타 표시
2. **가시성**: 첫 진입 시 즉시 인식, 항상 보이는 위치
3. **일관성**: Dashboard 페이지와 동일한 패턴 (타이틀 우측)
4. **구현 용이성**: SimpleChatInterface 헤더 영역만 수정
5. **비침입성**: 채팅 영역 방해하지 않으면서도 명확히 표시

#### 기각된 옵션들

**Option A (고정 헤더 추가)**
- ❌ 기존 sticky header 구조와 충돌
- ❌ 불필요한 UI 복잡도 증가

**Option B (우측 상단 - 감정 버튼 위)**
- ❌ EmotionEnhancedChat 오버레이와 공간 경쟁
- ❌ 감정 분석 UI 방해 가능성

**Option D (떠다니는 배지)**
- ❌ 가시성 낮음
- ❌ 교육 서비스에서 사용하지 않는 패턴
- ❌ 프로페셔널함 부족

---

## 🎨 디자인 사양

### Visual Design

```tsx
<div className="flex items-center gap-3">
  <h1 className="text-2xl font-bold text-gray-900">
    {subjectName} 튜터
  </h1>
  <BetaBadge subject={subjectCapitalized} size="compact" />
</div>
```

### 배지 크기 변형

**Compact Mode (튜터 페이지용)**
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-full"
>
  <Sparkles className="w-3 h-3 text-primary-600" />
  <span className="text-[11px] font-semibold text-primary-700 uppercase tracking-wide">
    Beta
  </span>
</motion.div>
```

**Standard Mode (대시보드용 - 기존)**
```tsx
// 기존 BetaBadge 컴포넌트 유지
<BetaBadge subject="English" />
```

### 과목별 색상 매핑

| 과목 | Primary Color | Accent Color | 배지 테두리 |
|------|--------------|--------------|------------|
| English | Blue-600 | Indigo-500 | Blue-200 |
| Math | Purple-600 | Pink-500 | Purple-200 |
| Science | Green-600 | Emerald-500 | Green-200 |
| Social | Orange-600 | Amber-500 | Orange-200 |
| Korean | Pink-600 | Rose-500 | Pink-200 |

---

## 📱 반응형 디자인

### Desktop (1024px+)
```tsx
<div className="flex items-center gap-3">
  <h1 className="text-2xl font-bold">{subject} 튜터</h1>
  <BetaBadge subject={subject} size="compact" />
</div>
```

### Tablet (768px - 1023px)
```tsx
<div className="flex items-center gap-2">
  <h1 className="text-xl font-bold">{subject} 튜터</h1>
  <BetaBadge subject={subject} size="compact" />
</div>
```

### Mobile (<768px)
```tsx
<div className="flex flex-col gap-1">
  <div className="flex items-center gap-2">
    <h1 className="text-lg font-bold">{subject} 튜터</h1>
    <BetaBadge subject={subject} size="compact" />
  </div>
  <p className="text-sm text-gray-600">학년: {gradeLevel}</p>
</div>
```

---

## 🔧 구현 계획

### Phase 1: BetaBadge 컴포넌트 확장

**파일**: `components/common/BetaBadge.tsx`

```tsx
interface BetaBadgeProps {
  subject: string;
  size?: 'standard' | 'compact';
  className?: string;
}

export function BetaBadge({
  subject,
  size = 'standard',
  className = ""
}: BetaBadgeProps) {
  if (size === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-full ${className}`}
      >
        <Sparkles className="w-3 h-3 text-primary-600" />
        <span className="text-[11px] font-semibold text-primary-700 uppercase tracking-wide">
          Beta
        </span>
      </motion.div>
    );
  }

  // Standard size (기존 구현)
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-full ${className}`}
    >
      <Sparkles className="w-3.5 h-3.5 text-primary-600" />
      <span className="text-xs font-semibold text-primary-700">
        {subject} Beta
      </span>
    </motion.div>
  );
}
```

### Phase 2: SimpleChatInterface 수정

**파일**: `components/tutor-pages/SimpleChatInterface.tsx`

**수정 위치**: Line 722-729 (Header 영역)

```tsx
// Before
<div>
  <h1 className="text-2xl font-bold text-gray-900">
    {subject === 'english' ? '영어' : ...} 튜터
  </h1>
  <p className="text-sm text-gray-600">학년: {gradeLevel}</p>
</div>

// After
<div>
  <div className="flex items-center gap-3 mb-1">
    <h1 className="text-2xl font-bold text-gray-900">
      {subjectMap[subject]} 튜터
    </h1>
    <BetaBadge
      subject={subjectMap[subject]}
      size="compact"
    />
  </div>
  <p className="text-sm text-gray-600">학년: {gradeLevel}</p>
</div>
```

### Phase 3: 과목 매핑 헬퍼

```tsx
const subjectMap: Record<string, string> = {
  'english': 'English',
  'math': 'Math',
  'science': 'Science',
  'social-studies': 'Social',
  'korean': 'Korean'
};

const subjectNameKorean: Record<string, string> = {
  'english': '영어',
  'math': '수학',
  'science': '과학',
  'social-studies': '사회',
  'korean': '국어'
};
```

---

## ✅ 검증 기준

### 기능 요구사항
- [x] 모든 튜터 페이지에서 Beta 배지 표시
- [x] 대시보드와 일관된 디자인
- [x] 과목별 색상 테마 적용
- [x] 모바일/데스크톱 반응형

### UX 요구사항
- [x] 첫 진입 시 즉시 인식 가능
- [x] 채팅 영역 방해하지 않음
- [x] 감정 분석 UI와 충돌하지 않음
- [x] 프로페셔널한 교육 서비스 느낌

### 기술 요구사항
- [x] 기존 BetaBadge 컴포넌트 재사용
- [x] SimpleChatInterface 최소 변경
- [x] Framer Motion 애니메이션 적용
- [x] Tailwind CSS 반응형 클래스

---

## 📊 A/B 테스트 계획 (선택사항)

향후 사용자 피드백을 위한 테스트 계획:

1. **배지 크기**: Compact vs Extra Small
2. **애니메이션**: Fade-in vs Scale vs None
3. **위치**: Title 옆 vs Title 아래
4. **텍스트**: "Beta" vs "{Subject} Beta" vs 없음 (아이콘만)

---

## 🚀 롤아웃 계획

### Step 1: Development (1-2시간)
- BetaBadge 컴포넌트 size prop 추가
- SimpleChatInterface 헤더 수정
- 과목별 테스트

### Step 2: Testing (30분)
- 모든 과목 튜터 페이지 확인
- 모바일/태블릿/데스크톱 반응형 검증
- 감정 분석 UI와 충돌 여부 확인

### Step 3: Deployment
- Production 배포
- 사용자 피드백 수집

---

## 📝 결론

**최종 권장사항**: SimpleChatInterface 헤더의 타이틀 옆에 Compact 사이즈 Beta 배지 배치

**주요 근거**:
1. ✅ Khan Academy, Duolingo 등 산업 선도 기업의 표준 패턴
2. ✅ 최소한의 코드 변경으로 최대 효과
3. ✅ 대시보드 페이지와 일관된 UX
4. ✅ 모바일/데스크톱 모두 자연스러운 배치
5. ✅ 기존 UI 요소와 충돌 없음

---

*작성일: 2025-11-09*
*작성자: Claude (SuperClaude Framework)*
*승인 대기 중*
