# 남은 작업 - 우선순위별 정리

**현재 상태**: Week 4 반응형 구현 완료 (95%) + 코드 품질 이슈 수정 완료 ✅
**서버 상태**: ✅ 정상 작동 중 (http://localhost:3000)
**최근 업데이트**: 2025-11-09
**프로덕션 빌드**: ✅ 성공 (TypeScript 에러 0개)

## ✅ 최근 완료 작업 (2025-11-09)

### 1. ESLint 에러 수정 완료
- ✅ app/HomeClient.tsx - 2개 `<a>` → `<Link>` 변경
- ✅ components/tutor-pages/SimpleChatInterface.tsx - 3개 `<a>` → `<Link>` 변경 + import 추가

### 2. Next.js 메타데이터 수정 완료
- ✅ app/layout.tsx - viewport를 별도 export로 분리

### 3. TypeScript 타입 에러 수정 완료 (korean 과목 추가)
- ✅ types/tutor.ts - Subject 타입에 'korean' 추가
- ✅ lib/voice/subject-defaults.ts - korean 파라미터 추가
- ✅ lib/utils/learningData.ts - korean 지원
- ✅ app/api/user/save-learning-session/route.ts - korean 타입 추가
- ✅ components/ui/Avatar.tsx - korean 아바타 추가
- ✅ lib/learning-progress/progress-tracker.ts - korean 진도 추적
- ✅ app/api/chat/korean/route.ts - 타입 에러 수정
- ✅ lib/tutor/content-level-detector.ts - 기본값 추가
- ✅ lib/tutor/rag-system.ts - 타입 재export, 중복 제거
- ✅ lib/tutor/response-quality-enhancer.ts - LEARNING_KEYWORDS에 korean 추가

### 4. 빌드 환경 수정
- ✅ .next 디렉토리 재생성 (corrupted files 해결)
- ✅ 개발 서버 정상 재시작
- ✅ 프로덕션 빌드 테스트 성공

---

## 🔴 우선순위 1: 필수 (배포 전 반드시 해결)

### 1.1 코드 품질 이슈 수정 ⚠️
**중요도**: 높음
**예상 시간**: 30분
**영향**: 프로덕션 빌드 실패 가능

#### ESLint 에러 (5개)
```bash
# 빌드 시 발생하는 에러들
./app/HomeClient.tsx
- Line 124: <a> → <Link> 변경 필요
- Line 129: <a> → <Link> 변경 필요

./components/tutor-pages/SimpleChatInterface.tsx
- Line 1173: <a> → <Link> 변경 필요
- Line 1190: <a> → <Link> 변경 필요
- Line 1195: <a> → <Link> 변경 필요
```

**해결 방법**:
```tsx
// Before
<a href="/">홈으로</a>

// After
import Link from 'next/link';
<Link href="/">홈으로</Link>
```

**작업 파일**:
- [x] `app/HomeClient.tsx` (2개) - ✅ 완료
- [x] `components/tutor-pages/SimpleChatInterface.tsx` (3개) - ✅ 완료

---

### 1.2 Viewport 메타데이터 이동 ⚠️
**중요도**: 중간
**예상 시간**: 10분
**영향**: Next.js 경고 (기능엔 영향 없음)

#### 문제
```
⚠ Unsupported metadata viewport is configured in metadata export.
Please move it to viewport export instead.
```

#### 해결 방법
[app/layout.tsx](app/layout.tsx#L43-L48) 수정:

```tsx
// Before (현재)
export const metadata: Metadata = {
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  // ...
}

// After (권장)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  // viewport 제거
  // ...
}
```

**작업 파일**:
- [x] `app/layout.tsx` - viewport export 분리 - ✅ 완료

---

### 1.3 실제 디바이스 테스트 📱
**중요도**: 높음
**예상 시간**: 1-2시간
**영향**: 실사용 환경 검증

#### 필수 테스트 디바이스
- [ ] **iPhone** (iOS 15+)
  - Safari 브라우저
  - 입력 필드 키보드 확인
  - 터치 타겟 크기 확인

- [ ] **Android** (Android 11+)
  - Chrome 브라우저
  - 입력 필드 동작 확인
  - 네비게이션 터치 확인

- [ ] **iPad** 또는 Android 태블릿
  - 중간 크기 레이아웃 확인
  - 2-4열 그리드 확인

#### 테스트 체크리스트
```
로그인/회원가입:
- [ ] 이메일 입력 - 이메일 키보드 표시
- [ ] 비밀번호 입력 - 마스킹 정상 작동
- [ ] "다음"/"완료" 버튼 확인

대시보드:
- [ ] 320px: 1열 그리드
- [ ] 768px: 2-4열 그리드
- [ ] 1280px+: 5-6열 그리드
- [ ] 카드 간격 일관성

채팅 인터페이스:
- [ ] 메시지 입력 - "전송" 버튼
- [ ] 자동교정/대문자 작동
- [ ] 6개 버튼 모두 48px 이상
- [ ] 터치 피드백 즉각 표시

네비게이션:
- [ ] 햄버거 메뉴 44x44px
- [ ] 모든 링크 터치 가능
- [ ] 드롭다운 메뉴 작동
```

---

## 🟡 우선순위 2: 권장 (1-2주 내)

### 2.1 React Hook 경고 해결
**중요도**: 중간
**예상 시간**: 20분
**영향**: 코드 품질 개선

#### 경고 2개
```
./components/home/VideoPlayerV2.tsx
- Line 79: useEffect missing dependencies

./components/pronunciation/PronunciationAnalyzer.tsx
- Line 39: ref cleanup issue
```

**해결 방법**:
```tsx
// VideoPlayerV2.tsx
useEffect(() => {
  // togglePlay, toggleMute를 useCallback으로 감싸기
}, [state.isPlaying, state.isMuted, togglePlay, toggleMute]);

// 또는
const togglePlayCallback = useCallback(() => {
  // logic
}, []);
```

---

### 2.2 Sentry 설정 업데이트
**중요도**: 중간
**예상 시간**: 15분
**영향**: 향후 Turbopack 호환성

```
DEPRECATION WARNING: Rename sentry.client.config.ts to instrumentation-client.ts
```

**작업**:
- [ ] `sentry.client.config.ts` → `instrumentation-client.ts` 이름 변경
- [ ] Sentry 설정 마이그레이션

---

### 2.3 성능 모니터링 설정
**중요도**: 중간
**예상 시간**: 1-2시간

#### 설정할 항목
- [ ] **Google Analytics 4**
  - 페이지뷰 추적
  - 이벤트 추적 (버튼 클릭 등)

- [ ] **Web Vitals 추적**
  - LCP, FID, CLS 실시간 모니터링
  - 성능 저하 알림

- [ ] **에러 모니터링** (Sentry)
  - 프로덕션 에러 추적
  - 소스맵 업로드

---

### 2.4 크로스 브라우저 테스트
**중요도**: 중간
**예상 시간**: 2-3시간

#### 테스트할 브라우저
- [ ] **Chrome** (최신) - 기본 개발 브라우저
- [ ] **Safari** (macOS/iOS) - WebKit 엔진
- [ ] **Firefox** (최신) - Gecko 엔진
- [ ] **Edge** (최신) - Chromium 기반
- [ ] **Chrome Mobile** (Android)
- [ ] **Safari Mobile** (iOS) - **가장 중요!**

**iOS Safari 주의사항**:
- 입력 필드 줌 이슈
- 터치 이벤트 차이
- viewport 동작 차이

---

## 🟢 우선순위 3: 선택 (시간 여유 있을 때)

### 3.1 추가 반응형 기능
**중요도**: 낮음
**예상 시간**: 4-8시간

#### Container Queries (실험적)
```tsx
// 컴포넌트 기반 반응형 (브라우저 지원 90%+)
@container (min-width: 640px) {
  .card {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

**장점**:
- 컴포넌트 단위 반응형 가능
- 더 유연한 레이아웃

**단점**:
- 아직 실험적 기능
- 일부 구형 브라우저 미지원

---

### 3.2 스와이프 제스처
**중요도**: 낮음
**예상 시간**: 3-4시간

#### 구현 위치
- [ ] **모바일 네비게이션**
  - 왼쪽에서 스와이프 → 메뉴 열기
  - 메뉴에서 오른쪽 스와이프 → 닫기

- [ ] **이미지 갤러리** (미래)
  - 좌우 스와이프로 이미지 넘기기

**라이브러리**:
```bash
npm install react-swipeable
```

---

### 3.3 PWA 기능 강화
**중요도**: 낮음
**예상 시간**: 2-3시간

#### 개선 항목
- [ ] App-like 설치 경험
- [ ] 오프라인 캐싱 전략
- [ ] 백그라운드 동기화
- [ ] 푸시 알림 (선택)

---

### 3.4 이미지 최적화
**중요도**: 낮음 (현재 이미지 거의 없음)
**예상 시간**: 1-2시간

#### 작업
- [ ] WebP 형식 변환
- [ ] 반응형 이미지 (srcset)
- [ ] Blur placeholder

---

## 📊 작업 우선순위 타임라인

### 🔴 즉시 (배포 전, 1-2일)
```
Day 1:
├─ ESLint 에러 수정 (30분)
├─ Viewport export 분리 (10분)
└─ 로컬 테스트 (1시간)

Day 2:
├─ 실제 디바이스 테스트 (2-3시간)
└─ 발견된 이슈 수정 (1-2시간)
```

### 🟡 1주일 내
```
Week 1:
├─ React Hook 경고 수정 (20분)
├─ Sentry 업데이트 (15분)
├─ 크로스 브라우저 테스트 (2-3시간)
└─ 성능 모니터링 설정 (2시간)
```

### 🟢 시간 여유 있을 때
```
Later:
├─ Container Queries (선택)
├─ 스와이프 제스처 (선택)
├─ PWA 강화 (선택)
└─ 추가 이미지 최적화 (선택)
```

---

## 🎯 배포 준비 체크리스트

### 코드 품질
- [ ] ESLint 에러 0개
- [ ] TypeScript 에러 0개
- [ ] 빌드 성공
- [ ] 프로덕션 빌드 테스트

### 기능 테스트
- [ ] 로그인/회원가입 작동
- [ ] 대시보드 표시
- [ ] 영어/수학/국어 튜터 작동
- [ ] 채팅 인터페이스 정상
- [ ] 학습 리포트 표시

### 반응형 테스트
- [ ] 모바일 (320-640px)
- [ ] 태블릿 (641-1024px)
- [ ] 데스크톱 (1025px+)
- [ ] 4K (3840px)

### 성능 테스트
- [ ] Lighthouse Mobile 96+
- [ ] Lighthouse Desktop 96+
- [ ] Core Web Vitals 통과
- [ ] 실제 디바이스 성능 확인

### 접근성 테스트
- [ ] WCAG 2.1 AA 준수
- [ ] 키보드 네비게이션
- [ ] 스크린리더 호환
- [ ] 터치 타겟 크기

### 브라우저 호환성
- [ ] Chrome (최신)
- [ ] Safari (최신)
- [ ] Firefox (최신)
- [ ] Edge (최신)
- [ ] Mobile Safari (iOS 15+)
- [ ] Chrome Mobile (Android 11+)

---

## 💡 권장 작업 순서

```
1. ESLint 에러 수정 (30분)
   ↓
2. Viewport export 분리 (10분)
   ↓
3. 프로덕션 빌드 테스트 (10분)
   ↓
4. 로컬 디바이스 시뮬레이션 테스트 (1시간)
   ↓
5. 실제 모바일 디바이스 테스트 (2-3시간)
   ↓
6. 발견된 이슈 수정 (1-2시간)
   ↓
7. 최종 빌드 및 Lighthouse 테스트 (30분)
   ↓
8. 🚀 배포!
```

---

## 📞 다음 단계

### 지금 당장 해야 할 것
1. **ESLint 에러 수정** - 5개 파일
2. **Viewport export 분리** - layout.tsx
3. **빌드 테스트** - `npm run build`

### 이번 주 안에 해야 할 것
1. **실제 디바이스 테스트**
2. **크로스 브라우저 테스트**
3. **성능 모니터링 설정**

### 나중에 고려할 것
1. Container Queries (선택)
2. 스와이프 제스처 (선택)
3. PWA 강화 (선택)

---

**현재 완료율**: 95%
**배포 가능 상태**: 코드 품질 이슈 수정 후 ✅
**예상 추가 시간**: 4-6시간 (필수 작업만)

---

**작성**: Claude (SuperClaude Framework)
**업데이트**: 2025-11-09
**버전**: 1.0
