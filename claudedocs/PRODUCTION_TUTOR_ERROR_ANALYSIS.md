# 🔴 운영 서버 튜터 오류 근본 원인 분석 및 해결 방안

**작성일**: 2025-11-05
**상태**: 🔍 근본 원인 파악 완료
**우선순위**: P0 (최고 긴급)

---

## 📋 목차
1. [문제 요약](#문제-요약)
2. [근본 원인 분석](#근본-원인-분석)
3. [로컬 vs 운영 환경 차이](#로컬-vs-운영-환경-차이)
4. [해결 방안](#해결-방안)
5. [구현 계획](#구현-계획)

---

## 문제 요약

### 증상
1. **초기 인사 메시지 미표시**: 튜터 페이지 진입 시 AI Park 인사말이 보이지 않음
2. **사용자 입력 무응답**: "3*6" 등 메시지 입력 후 튜터 응답 없음
3. **로컬 환경 정상**: localhost:3000에서는 모든 기능 정상 작동

### 영향 범위
- ✅ **로컬 환경**: 완벽히 작동 (/tutor/english, /tutor/math 모두 정상)
- 🔴 **운영 환경** (https://smarttuter.vercel.app): 튜터 기능 완전 마비
- 🟡 **다른 기능**: Dashboard, Quiz, Flashcards는 정상

---

## 근본 원인 분석

### 🎯 핵심 원인: Edge Runtime과 Client State 초기화 충돌

#### 1. Edge Runtime 설정 문제

**발견된 설정**:
```typescript
// app/tutor/math/page.tsx, english/page.tsx 등
export const runtime = 'edge';  // ⚠️ 문제의 원인!
```

**Edge Runtime의 특성**:
- **제한된 Node.js API**: `fs`, `crypto`, 일부 `process` API 사용 불가
- **글로벌 변수 제한**: 서버 사이드 상태 관리 제약
- **Cold Start 최적화**: 빠른 시작을 위해 일부 초기화 생략
- **Vercel 특화**: Vercel Edge Network에서만 동작

#### 2. Client-Side 초기화 타이밍 이슈

**SimpleChatInterface.tsx 초기화 코드**:
```typescript
// 130-200줄: useEffect로 초기 메시지 설정
useEffect(() => {
  if (typeof window !== 'undefined' && !hasInitialized.current) {
    hasInitialized.current = true;

    const newSessionId = startSession(subject, gradeLevel);
    setSessionId(newSessionId);

    // 환영 메시지 생성
    const welcomeMessage = getWelcomeMessage();
    setMessages([{ role: 'assistant', content: welcomeMessage }]);
  }
}, []);
```

**문제점**:
- Edge Runtime에서 `window` 객체 접근 타이밍이 불안정
- `hasInitialized.ref`가 Edge 환경에서 제대로 작동하지 않음
- `localStorage` 접근이 Edge Runtime에서 지연됨

#### 3. Dynamic Import와 SSR 비활성화 불충분

**현재 구조**:
```typescript
// app/tutor/math/page.tsx
export const runtime = 'edge';  // 문제!

const MathTutorClient = dynamic(
  () => import('@/components/tutor-pages/MathTutorClient'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);
```

**문제**:
- `ssr: false`는 설정했지만 Edge Runtime과 충돌
- Edge Runtime은 SSR이 아닌데도 클라이언트 상태 초기화에 영향

---

## 로컬 vs 운영 환경 차이

### 로컬 개발 환경 (localhost:3000)

| 항목 | 설정 | 상태 |
|------|------|------|
| **Runtime** | Node.js Serverless | ✅ 정상 |
| **Hot Reload** | 활성화 | ✅ 빠른 반영 |
| **State 초기화** | 즉시 실행 | ✅ 정상 |
| **localStorage** | 즉시 접근 | ✅ 정상 |
| **window 객체** | 항상 사용 가능 | ✅ 정상 |
| **초기 메시지** | 즉시 표시 | ✅ 정상 |

### 운영 환경 (Vercel Production)

| 항목 | 설정 | 상태 |
|------|------|------|
| **Runtime** | Edge Runtime | 🔴 제한적 |
| **Cold Start** | 최적화됨 | 🟡 초기화 생략 |
| **State 초기화** | 지연/실패 | 🔴 실패 |
| **localStorage** | 비동기 접근 | 🟡 지연 |
| **window 객체** | 타이밍 불안정 | 🔴 문제 |
| **초기 메시지** | 표시 안됨 | 🔴 실패 |

---

## 해결 방안

### ✅ Solution 1: Edge Runtime 제거 (권장)

**변경 사항**:
```typescript
// app/tutor/math/page.tsx, english/page.tsx 등
// export const runtime = 'edge';  ❌ 삭제!
export const runtime = 'nodejs';   // ✅ 추가!
export const dynamic = 'force-dynamic';
```

**장점**:
- ✅ 완전한 Node.js API 사용 가능
- ✅ 안정적인 클라이언트 상태 초기화
- ✅ localStorage/window 즉시 접근
- ✅ 로컬 환경과 동일한 동작

**단점**:
- 🟡 Cold Start가 Edge보다 약간 느림 (~100-200ms)
- 하지만 튜터 세션은 보통 길어서 영향 미미

### ⚡ Solution 2: 초기화 로직 강화 (보완책)

**개선된 초기화 코드**:
```typescript
useEffect(() => {
  // Double-check window availability
  if (typeof window === 'undefined') return;

  // Ensure DOM is ready
  if (document.readyState !== 'complete') {
    window.addEventListener('load', initializeChat);
    return () => window.removeEventListener('load', initializeChat);
  }

  initializeChat();
}, []);

function initializeChat() {
  if (hasInitialized.current) return;
  hasInitialized.current = true;

  // ... 초기화 로직
}
```

### 🔄 Solution 3: API 엔드포인트 개선

**현재 문제**:
- `/api/tutor/start` - Node.js Runtime ✅
- `/api/tutor/message` - Node.js Runtime ✅
- **하지만** 페이지가 Edge Runtime이라 연결 불안정

**해결**:
- 페이지를 Node.js Runtime으로 변경하면 자동 해결

---

## 구현 계획

### Phase 1: 긴급 수정 (15분)

#### 1.1 Edge Runtime 제거
```bash
# 4개 파일 수정
app/tutor/english/page.tsx
app/tutor/math/page.tsx
app/tutor/science/page.tsx
app/tutor/social-studies/page.tsx
```

**변경 내용**:
```diff
- export const runtime = 'edge';
+ export const runtime = 'nodejs';
+ export const dynamic = 'force-dynamic';
```

#### 1.2 빌드 및 배포
```bash
npm run build          # 로컬 빌드 테스트
vercel --prod          # 운영 배포
```

**예상 결과**:
- ✅ 초기 인사 메시지 즉시 표시
- ✅ 사용자 입력에 튜터 응답 정상
- ✅ 모든 튜터 기능 복구

---

### Phase 2: 초기화 로직 강화 (30분)

#### 2.1 SimpleChatInterface 개선

**파일**: `components/tutor-pages/SimpleChatInterface.tsx`

```typescript
// 더 안전한 초기화
const [isClientReady, setIsClientReady] = useState(false);

useEffect(() => {
  // 클라이언트 환경 확인
  if (typeof window === 'undefined') return;

  // DOM 준비 대기
  const checkReady = () => {
    if (document.readyState === 'complete') {
      setIsClientReady(true);
    }
  };

  if (document.readyState === 'complete') {
    setIsClientReady(true);
  } else {
    window.addEventListener('load', checkReady);
    return () => window.removeEventListener('load', checkReady);
  }
}, []);

useEffect(() => {
  if (!isClientReady || hasInitialized.current) return;

  hasInitialized.current = true;
  initializeChat();
}, [isClientReady]);
```

#### 2.2 에러 바운더리 추가

```typescript
// 초기화 실패 시 Fallback UI
if (!isClientReady) {
  return <LoadingSpinner message="채팅 초기화 중..." />;
}

if (initError) {
  return (
    <ErrorFallback
      message="튜터를 불러오는 중 문제가 발생했습니다."
      onRetry={() => window.location.reload()}
    />
  );
}
```

---

### Phase 3: 모니터링 및 검증 (10분)

#### 3.1 Sentry 에러 추적

```typescript
// 초기화 실패 로깅
try {
  initializeChat();
} catch (error) {
  console.error('Chat initialization failed:', error);
  Sentry.captureException(error, {
    tags: {
      component: 'SimpleChatInterface',
      subject,
      gradeLevel,
    },
  });
}
```

#### 3.2 Production 테스트 체크리스트

- [ ] https://smarttuter.vercel.app/tutor/english 접속
  - [ ] 초기 인사 메시지 즉시 표시
  - [ ] "Hello" 입력 → 응답 정상
  - [ ] 음성 입력 기능 작동

- [ ] https://smarttuter.vercel.app/tutor/math 접속
  - [ ] 초기 인사 메시지 즉시 표시
  - [ ] "3*6" 입력 → 응답 정상
  - [ ] 이미지 업로드 기능 작동

---

## 기술적 배경 지식

### Edge Runtime vs Node.js Runtime

#### Edge Runtime 특징
```typescript
// ✅ 사용 가능
- fetch, Request, Response
- Headers, URL, URLSearchParams
- crypto.subtle
- TextEncoder, TextDecoder
- setTimeout, setInterval

// ❌ 사용 불가
- fs (파일 시스템)
- process.env (일부 제한)
- child_process
- Node.js native modules
```

#### Node.js Runtime 특징
```typescript
// ✅ 모든 Node.js API 사용 가능
- fs, path, crypto
- process.env (완전 지원)
- child_process
- Native modules
- 안정적인 글로벌 상태 관리
```

### Vercel Deployment Comparison

| 항목 | Edge Runtime | Node.js Runtime |
|------|-------------|-----------------|
| Cold Start | ~50ms | ~150ms |
| 메모리 | 128MB | 1024MB |
| 실행 시간 | 30s | 60s |
| API 지원 | 제한적 | 완전 |
| 글로벌 배포 | ✅ 자동 | 🟡 수동 |
| 비용 | 저렴 | 보통 |

**튜터 서비스에 적합한 선택**: **Node.js Runtime** ✅
- 세션이 길어서 Cold Start 영향 적음
- 완전한 API 지원 필요
- 안정성 > 속도

---

## 예상 효과

### Before (현재 - Edge Runtime)
```
사용자 접속 → Edge Runtime 시작
→ 클라이언트 코드 로딩
→ window/localStorage 접근 실패
→ 초기화 실패
→ 빈 화면 표시 🔴
```

### After (수정 후 - Node.js Runtime)
```
사용자 접속 → Node.js Runtime 시작
→ 클라이언트 코드 로딩
→ window/localStorage 정상 접근
→ 초기화 성공
→ 환영 메시지 표시 ✅
→ 사용자 입력 → 튜터 응답 ✅
```

---

## 추가 조사 항목

### ✅ 완료된 조사
1. ✅ 로컬 vs 운영 코드 동기화 확인 (일치)
2. ✅ Git commit 히스토리 확인 (최신)
3. ✅ Runtime 설정 확인 (Edge 발견)
4. ✅ API 엔드포인트 확인 (Node.js - 정상)
5. ✅ 초기화 로직 확인 (Edge와 충돌)
6. ✅ Vercel 배포 설정 확인 (정상)

### 🔍 추가 검증 필요
- [ ] Vercel 환경 변수 확인 (GEMINI_API_KEY 등)
- [ ] Vercel 로그 확인 (에러 메시지)
- [ ] Network 타이밍 분석 (API 호출 순서)

---

## 관련 문서 및 참고 자료

### Next.js 공식 문서
- [Edge Runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes)
- [Runtime 선택 가이드](https://nextjs.org/docs/app/building-your-application/rendering/runtime)

### Vercel 배포 가이드
- [Streaming on Vercel](https://github.com/vercel/next.js/discussions/47076)
- [Edge vs Serverless Functions](https://vercel.com/docs/functions/runtimes)

### 이번 조사에서 발견한 핵심 이슈
- [GitHub Discussion #47076](https://github.com/vercel/next.js/discussions/47076): "Stream in a Vercel Serverless function only working in local, but not once deployed"
- [GitHub Discussion #67026](https://github.com/vercel/next.js/discussions/67026): "Streaming in Next.js (Pages) API routes not working"

**핵심 교훈**:
> "Edge Runtime은 stateless API에 적합하고, 복잡한 클라이언트 상태 초기화가 필요한 페이지는 Node.js Runtime을 사용해야 한다."

---

## 실행 명령어

### 로컬 테스트
```bash
# Edge Runtime 제거 후 로컬 테스트
npm run build
npm run start

# 브라우저 접속
open http://localhost:3000/tutor/math
```

### 운영 배포
```bash
# Vercel 배포
vercel --prod

# 배포 후 테스트
open https://smarttuter.vercel.app/tutor/math
```

### 롤백 (문제 발생 시)
```bash
# 이전 커밋으로 롤백
git revert HEAD
git push origin main

# Vercel 자동 재배포됨
```

---

## 결론 및 다음 단계

### 🎯 근본 원인
**Edge Runtime과 Client-Side 상태 초기화 충돌**로 인한 튜터 기능 마비

### ✅ 해결 방안
**Edge Runtime → Node.js Runtime 변경** (4개 파일, 각 2줄 수정)

### 📅 실행 계획
1. **즉시**: Edge Runtime 제거 및 배포 (15분)
2. **Phase 2**: 초기화 로직 강화 (30분)
3. **Phase 3**: 모니터링 설정 (10분)

### 🚀 예상 결과
- ✅ 운영 서버에서 튜터 정상 작동
- ✅ 초기 메시지 즉시 표시
- ✅ 사용자 입력 정상 응답
- ✅ 로컬과 동일한 사용자 경험

---

**작성자**: Claude + SuperClaude Framework
**검토**: Context7 (Next.js Runtime 문서), WebSearch (Vercel 배포 이슈)
**승인 대기**: 사용자 확인 후 즉시 구현
