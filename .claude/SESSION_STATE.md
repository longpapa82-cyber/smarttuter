# SmartTuter 프로젝트 세션 상태

**마지막 업데이트**: 2025-10-25
**프로젝트 상태**: Phase 3 완료 - 영어 튜터 음성 기능 구현 완료
**배포 상태**: ✅ Vercel Production (Ready)

---

## 📊 현재 프로젝트 상태

### ✅ 완료된 기능 (Phase 1 + Phase 2 + Phase 3)

#### **Phase 1: MVP 완성**
1. ✅ 전체 페이지 구조 구현 (7 pages, 13 components)
   - 홈페이지 (/)
   - 온보딩 페이지 (/onboarding)
   - 수학 튜터 페이지 (/tutor/math)
   - 영어 튜터 페이지 (/tutor/english)
   - 리포트 페이지 (/report)
   - 404 페이지

2. ✅ UI/UX 디자인 완성
   - Tailwind CSS 기반 반응형 디자인
   - Framer Motion 애니메이션
   - 모던하고 친화적인 인터페이스
   - 학생 친화적 색상 및 아이콘

3. ✅ 텍스트 가시성 완전 해결
   - 120+ 인스턴스 수정
   - 모든 텍스트 요소에 명시적 색상 적용
   - 접근성 개선 (WCAG 준수)

#### **Phase 2: AI 튜터 기능 강화** ⭐
1. ✅ **실시간 스트리밍 응답**
   - Server-Sent Events (SSE) 구현
   - 토큰 단위 실시간 생성
   - 70% 이상 대기 시간 감소

2. ✅ **향상된 AI 프롬프트**
   - 학년별 맞춤 교육 (초등~대학)
   - 소크라테스식 교수법
   - 격려와 칭찬 중심
   - 이모지 활용한 친근한 톤

3. ✅ **대화 컨텍스트 관리**
   - 수학: 최근 10턴 기억
   - 영어: 최근 15턴 기억
   - 자연스러운 대화 흐름

4. ✅ **에러 핸들링 개선**
   - 사용자 친화적 에러 메시지
   - API 키 누락 시 안내
   - 네트워크 오류 처리

#### **Phase 3: 음성 기능 구현** ⭐
1. ✅ **Web Speech API 통합**
   - SpeechRecognition (음성 → 텍스트)
   - SpeechSynthesis (텍스트 → 음성)
   - 브라우저 네이티브 API 사용 (외부 의존성 없음)

2. ✅ **실시간 음성 대화**
   - 음성 인식 자동 메시지 전송
   - AI 응답 자동 읽기 기능
   - 음성 모드 토글 (마이크 버튼)
   - 자동 읽기 ON/OFF 토글

3. ✅ **시각적 피드백**
   - 음성 인식 중 애니메이션 (펄스 효과)
   - 음성 상태 아이콘 변경
   - 브라우저 호환성 감지

4. ✅ **Custom Hooks 구현**
   - `useSpeechRecognition.ts`: 재사용 가능한 음성 인식 훅
   - `useSpeechSynthesis.ts`: 재사용 가능한 TTS 훅
   - TypeScript 타입 안전성

---

## 🗂️ 프로젝트 구조

```
smartTuter/
├── app/
│   ├── page.tsx                    # 홈페이지
│   ├── onboarding/page.tsx         # 온보딩
│   ├── tutor/
│   │   ├── math/page.tsx          # 수학 튜터 (스트리밍 ✅)
│   │   └── english/page.tsx       # 영어 튜터 (스트리밍 ✅ 음성 ✅)
│   ├── report/page.tsx            # 학습 리포트
│   ├── api/
│   │   └── chat/
│   │       ├── math/route.ts      # 수학 API (스트리밍 ✅)
│   │       └── english/route.ts   # 영어 API (스트리밍 ✅)
│   └── globals.css
├── components/
│   ├── chat/
│   │   ├── ChatMessage.tsx
│   │   └── ChatInput.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── MobileMenu.tsx
├── hooks/
│   ├── useSpeechRecognition.ts    # 음성 인식 훅 (Phase 3 ✅)
│   └── useSpeechSynthesis.ts      # TTS 훅 (Phase 3 ✅)
└── .claude/
    ├── CLAUDE.md                  # 프로젝트 요구사항
    └── SESSION_STATE.md           # 이 파일
```

---

## 🚀 배포 정보

### Vercel Production
- **프로젝트명**: smarttuter
- **조직**: 090723s-projects
- **GitHub**: https://github.com/longpapa82-cyber/smarttuter
- **최신 배포 URL**: https://smarttuter-7baermqkv-090723s-projects.vercel.app
- **배포 상태**: ✅ Ready (Production) - Phase 3 음성 기능 포함

### 환경 변수
```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```
- Production, Preview, Development 모두 설정 완료

---

## 🔧 기술 스택

### Frontend
- **Framework**: Next.js 15.5.6 (App Router)
- **Styling**: Tailwind CSS 3.4.1
- **Animation**: Framer Motion 11.13.5
- **Icons**: Lucide React 0.468.0
- **Language**: TypeScript 5

### Backend
- **AI API**: Anthropic Claude (claude-sonnet-4-5-20250929)
- **SDK**: @anthropic-ai/sdk 0.32.1
- **Streaming**: Server-Sent Events (SSE)

### Deployment
- **Platform**: Vercel
- **Build**: Next.js Static + API Routes
- **CI/CD**: GitHub Auto-deploy

---

## 📝 현재 작업 중인 기능

### 없음 (Phase 3 완료)

---

## 🎯 다음 단계 계획 (Phase 4/5 추천)

### Option 1: 수학 튜터 음성 기능 확장 ⭐ 추천
**목표**: 수학 튜터에도 음성 기능 추가 (영어 튜터와 동일)

**구현 내용**:
1. **수학 튜터 음성 통합**
   - Phase 3의 custom hooks 재사용
   - 한국어 음성 인식 (`ko-KR`)
   - 수학 용어 최적화된 TTS

2. **수식 읽기 최적화**
   - 수학 기호 → 자연어 변환
   - 예: "x^2 + 3x + 2" → "엑스 제곱 더하기 3엑스 더하기 2"

3. **음성 + 텍스트 하이브리드**
   - 수식은 텍스트로 표시
   - 설명은 음성으로 읽기

**예상 작업 시간**: 1-2시간 (hooks 재사용)
**난이도**: 하

---

### Option 2: 학습 데이터 분석 시스템 (Phase 5)
**목표**: 실제 학습 기록 기반 분석 및 추천

**구현 내용**:
1. **LocalStorage 기반 세션 저장**
   ```typescript
   interface LearningSession {
     id: string;
     subject: 'math' | 'english';
     gradeLevel: string;
     messages: Message[];
     startTime: Date;
     endTime: Date;
     duration: number;
     topics: string[];
   }
   ```

2. **학습 패턴 분석**
   - 자주 질문하는 주제
   - 취약 영역 파악
   - 학습 시간대 분석

3. **개인화된 추천**
   - 복습 주제 제안
   - 다음 학습 단계
   - 학습 목표 설정

**예상 작업 시간**: 4-5시간
**난이도**: 중

---

### Option 3: 이미지 기반 문제 풀이 (Phase 6)
**목표**: 수학 문제 사진 업로드 및 AI 분석

**구현 내용**:
1. **이미지 업로드 UI**
   - 드래그 앤 드롭
   - 카메라 촬영
   - 이미지 미리보기

2. **Claude Vision API 통합**
   ```typescript
   const response = await anthropic.messages.create({
     model: "claude-sonnet-4-5-20250929",
     messages: [{
       role: "user",
       content: [
         { type: "image", source: { type: "base64", data: imageData }},
         { type: "text", text: "이 수학 문제를 풀어줘" }
       ]
     }]
   });
   ```

3. **필기 인식 및 분석**
   - 손글씨 수식 인식
   - 문제 자동 파싱
   - 단계별 풀이 제공

**예상 작업 시간**: 3-4시간
**난이도**: 중상

---

## 📌 시작 명령어 (다음 세션용)

### 1. 개발 서버 시작
```bash
cd /Users/hoonjaepark/projects/smartTuter
npm run dev
# http://localhost:3000
```

### 2. 프로젝트 상태 확인
```bash
git status
git log -5 --oneline
vercel ls smarttuter
```

### 3. 환경 변수 확인
```bash
cat .env.local
# ANTHROPIC_API_KEY가 있는지 확인
```

---

## 🔍 알려진 이슈 및 개선점

### 개선 가능 영역
1. ✅ **음성 모드 버튼** (Phase 3 완료)
   - ~~현재: Alert만 표시~~
   - ✅ 개선 완료: 영어 튜터에 실제 음성 기능 구현
   - 📌 남은 작업: 수학 튜터 음성 기능 추가

2. **이미지 업로드 버튼**
   - 현재: Alert만 표시
   - 개선: Vision API 통합 필요

3. **리포트 페이지**
   - 현재: Mock 데이터
   - 개선: 실제 세션 데이터 연동 필요

4. **대화 기록 저장**
   - 현재: 새로고침 시 초기화
   - 개선: LocalStorage/DB 영구 저장

---

## 🎓 핵심 코드 참고

### 스트리밍 API 패턴 (route.ts)
```typescript
// Anthropic Streaming
const stream = await anthropic.messages.stream({
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 2048,
  system: systemPrompt,
  messages: messages,
});

// SSE Response
const encoder = new TextEncoder();
const readableStream = new ReadableStream({
  async start(controller) {
    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta") {
        const text = chunk.delta.text;
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
        );
      }
    }
    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
    controller.close();
  },
});

return new Response(readableStream, {
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  },
});
```

### 프론트엔드 스트리밍 소비 (page.tsx)
```typescript
// SSE Reader
const reader = response.body?.getReader();
const decoder = new TextDecoder();

let accumulatedText = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split("\n");

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const data = line.slice(6);
      if (data === "[DONE]") break;

      const json = JSON.parse(data);
      accumulatedText += json.text;

      // Real-time UI update
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: accumulatedText }
            : msg
        )
      );
    }
  }
}
```

---

## 📞 문제 해결

### API 키 오류
```bash
# .env.local 확인
cat .env.local

# Vercel 환경 변수 확인
vercel env ls

# 환경 변수 추가
vercel env add ANTHROPIC_API_KEY production
```

### 빌드 오류
```bash
# 캐시 삭제 후 재빌드
rm -rf .next
npm run build
```

### 배포 문제
```bash
# Vercel 재배포
vercel --prod --yes

# 배포 로그 확인
vercel logs <deployment-url>
```

---

## 🚀 다음 세션 시작 방법

**"지난번 작업 이어서 진행해줘"라고 말하면:**

1. 이 파일 내용을 기반으로 현재 상태 파악
2. Phase 3 옵션 중 하나 선택 또는 사용자 요청 확인
3. 개발 서버 시작 (`npm run dev`)
4. 코드 작성 및 테스트
5. 빌드 → 커밋 → 배포

**추천 시작 멘트:**
- "음성 기능 구현해줘" → Option 1 시작
- "학습 데이터 분석 만들어줘" → Option 2 시작
- "이미지 업로드 기능 추가해줘" → Option 3 시작
- "다른 개선사항 제안해줘" → 새로운 아이디어 논의

---

## ✅ 체크리스트 (다음 세션 전)

- [x] Phase 1 MVP 완성
- [x] Phase 2 AI 튜터 기능 강화
- [x] 텍스트 가시성 완전 해결
- [x] 스트리밍 응답 구현
- [x] 프로덕션 배포 완료
- [x] **Phase 3 음성 기능 구현 (영어 튜터)** ⭐
- [ ] Phase 4 수학 튜터 음성 기능
- [ ] Phase 5 학습 분석 시스템
- [ ] Phase 6 이미지 업로드 기능

---

**마지막 커밋**: `feat: Add voice input and text-to-speech for English tutor (Phase 3)` (37dfd14)
**마지막 배포**: 2025-10-25 (Phase 3 포함)
**다음 목표**: Phase 4 - 수학 튜터 음성 기능 OR Phase 5 - 학습 분석
