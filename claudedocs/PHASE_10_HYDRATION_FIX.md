# Phase 10: Voice Tutor Hydration 오류 해결

## 문제 상황

### 증상
- `/tutor/math` 및 `/tutor/english` 페이지에서 **500 Internal Server Error** 발생
- 브라우저 콘솔에 **React error #185 (Hydration error)** 반복 출력
- 페이지가 로드되지 않고 에러 화면만 표시

### 사용자 보고
"아직도 500 오류가 발생되고 있어요. 근본적인 오류의 원인이 무엇인지 확인해 주세요."

## 근본 원인 분석

### React Hydration Error란?
React에서 서버 사이드 렌더링(SSR)과 클라이언트 사이드 렌더링이 **불일치**할 때 발생하는 오류입니다.

**Hydration 과정**:
1. **서버**: Next.js가 React 컴포넌트를 HTML로 렌더링
2. **클라이언트**: 브라우저가 HTML을 받아 React가 다시 렌더링
3. **Hydration**: React가 서버 HTML과 클라이언트 렌더링 결과를 비교하여 이벤트 핸들러 연결
4. **문제**: 서버 HTML ≠ 클라이언트 HTML → Hydration error 발생

### VoiceTutorInterface.tsx의 문제점

**문제가 된 코드 (수정 전)**:
```typescript
// Line 48-75: useEffect without SSR safety
useEffect(() => {
  const initSession = async () => {
    try {
      const greeting = await startSession(subject, gradeLevel, userId);
      await speakText(greeting); // ❌ window 접근 가능
    } catch (error: any) {
      console.error('Failed to start session:', error);
      setError(error?.message || '...');
    }
  };

  initSession();
}, [subject, gradeLevel, userId, startSession]);

// Line 115-144: speakText without SSR safety
const speakText = async (text: string) => {
  setIsSpeaking(true);

  try {
    // ❌ 서버에서도 실행 가능 → window is undefined
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      await new Promise<void>((resolve) => {
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance); // ❌ SSR에서 에러
      });
    }
  } catch (error) {
    console.error('TTS error:', error);
  } finally {
    setIsSpeaking(false);
  }
};
```

**왜 문제인가?**
1. `useEffect`가 서버에서도 실행됨 (Next.js App Router의 기본 동작)
2. `speakText` 함수가 `window.speechSynthesis`에 접근
3. **서버에는 `window` 객체가 없음** → `undefined` 에러
4. 서버 렌더링 결과와 클라이언트 렌더링 결과가 달라짐
5. React Hydration Error 발생 → 500 에러로 전파

## 해결 방법

### 1. typeof window 검증 추가

**수정된 코드 (Line 48-75)**:
```typescript
useEffect(() => {
  // ✅ SSR 환경에서는 즉시 종료
  if (typeof window === 'undefined') return;

  let mounted = true;

  const initSession = async () => {
    try {
      const greeting = await startSession(subject, gradeLevel, userId);

      if (!mounted) return; // ✅ 언마운트된 경우 종료

      await speakText(greeting);
    } catch (error: any) {
      if (!mounted) return;
      console.error('Failed to start session:', error);
      setError(error?.message || 'Voice Tutor is currently under maintenance...');
    }
  };

  initSession();

  return () => {
    mounted = false; // ✅ 클린업 함수
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

**개선점**:
- `typeof window === 'undefined'` 체크로 서버 환경에서 즉시 종료
- `mounted` 플래그로 컴포넌트 언마운트 후 상태 업데이트 방지
- 의존성 배열을 `[]`로 변경하여 초기 마운트 시에만 실행

### 2. speakText 함수 안전성 강화

**수정된 코드 (Line 115-144)**:
```typescript
const speakText = async (text: string) => {
  // ✅ 클라이언트 사이드 전용
  if (typeof window === 'undefined') return;

  setIsSpeaking(true);

  try {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      await new Promise<void>((resolve) => {
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      });
    } else {
      // 대체 동작: 텍스트 길이에 비례한 대기 시간
      await new Promise(resolve => setTimeout(resolve, text.length * 50));
    }
  } catch (error) {
    console.error('TTS error:', error);
  } finally {
    setIsSpeaking(false);
  }
};
```

**개선점**:
- 함수 시작 시 `typeof window === 'undefined'` 체크
- 서버 환경에서는 함수 실행 자체를 건너뜀
- `speechSynthesis` 미지원 브라우저를 위한 fallback 추가

## 기술적 배경

### Next.js App Router의 SSR 동작
- **기본**: 모든 컴포넌트가 서버에서 먼저 렌더링됨
- **'use client'**: 클라이언트 컴포넌트지만 여전히 SSR 적용됨
- **hydration**: 서버 HTML + 클라이언트 React = 상호작용 가능한 페이지

### 브라우저 전용 API 안전하게 사용하기

**패턴 1: typeof window 체크**
```typescript
if (typeof window === 'undefined') return; // 서버에서 종료
// 클라이언트 전용 코드
```

**패턴 2: useEffect 활용**
```typescript
useEffect(() => {
  // useEffect는 클라이언트에서만 실행됨
  // 하지만 Next.js App Router에서는 서버에서도 실행될 수 있으므로
  // typeof window 체크를 함께 사용하는 것이 안전
}, []);
```

**패턴 3: dynamic import with ssr: false**
```typescript
import dynamic from 'next/dynamic';

const ClientOnlyComponent = dynamic(
  () => import('./ClientOnlyComponent'),
  { ssr: false } // 서버 렌더링 비활성화
);
```

## 검증 결과

### 로컬 테스트
```bash
npm run dev
✓ http://localhost:3000/tutor/math - 정상 작동 ✅
✓ http://localhost:3000/tutor/english - 정상 작동 ✅
✓ 콘솔 에러 없음 ✅
```

### 프로덕션 배포
```bash
Commit: 741dc75
Message: fix: Fix Voice Tutor hydration error and client-side rendering issues
Status: ✅ Ready (Production)
URL: https://smarttuter.vercel.app
```

**배포 상태**:
- 빌드: 성공 ✅
- 배포: 완료 ✅
- 상태: Ready ✅
- 접근: HTTP 200 OK ✅

## 테스트 가이드

### 사용자 테스트 절차
1. **브라우저 캐시 초기화**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **URL 접속**
   - https://smarttuter.vercel.app

3. **온보딩 완료**
   - 이름 입력
   - 학교급 선택 (초등/중등/고등/대학)

4. **Voice Tutor 접속**
   - 대시보드에서 "수학 튜터" 또는 "영어 튜터" 클릭
   - `/tutor/math` 또는 `/tutor/english` 페이지 로드 확인

5. **정상 작동 확인**
   - 500 에러 없이 페이지 로드 ✅
   - Voice Tutor 인터페이스 표시 ✅
   - 브라우저 콘솔에 Hydration 에러 없음 ✅

### 개발자 검증 항목
- [ ] React Hydration Error 미발생
- [ ] 500 Internal Server Error 미발생
- [ ] `typeof window === 'undefined'` 체크 작동
- [ ] `speechSynthesis` API 정상 호출
- [ ] useEffect 클린업 함수 작동
- [ ] 컴포넌트 언마운트 시 메모리 누수 없음

## 학습 포인트

### Next.js SSR에서 주의할 점
1. **브라우저 API 접근 전 항상 환경 체크**
   ```typescript
   if (typeof window === 'undefined') return;
   ```

2. **useEffect도 서버에서 실행될 수 있음**
   - App Router에서는 useEffect가 서버에서도 실행될 수 있음
   - 항상 `typeof window` 체크를 추가하는 것이 안전

3. **상태 업데이트 전 마운트 상태 체크**
   ```typescript
   let mounted = true;
   // ... async work
   if (!mounted) return;
   setState(value);
   ```

4. **ESLint exhaustive-deps 규칙 이해**
   - 무한 루프 방지를 위해 의존성 배열 최소화
   - 필요한 경우 `// eslint-disable-next-line` 주석으로 예외 처리

### Hydration Error 디버깅 방법
1. **브라우저 콘솔 확인**: React error #185 메시지
2. **서버/클라이언트 차이점 찾기**: window, document, localStorage 등 브라우저 API 사용
3. **조건부 렌더링 체크**: 서버와 클라이언트에서 다른 결과를 반환하는 코드
4. **typeof window 추가**: 브라우저 API 접근 전 환경 검증

## 참고 자료

- [Next.js Hydration Errors](https://nextjs.org/docs/messages/react-hydration-error)
- [React error #185](https://react.dev/errors/185)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Next.js App Router SSR](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

---

**작성일**: 2025-10-27
**작성자**: Claude Code
**최종 수정**: 2025-10-27 16:14 KST
