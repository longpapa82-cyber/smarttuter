# 🎯 Gemini API 설정 가이드 (100% 무료!)

## 왜 Gemini로 전환했나요?

| 항목 | Claude API | Gemini API |
|------|-----------|------------|
| 💰 **비용** | 유료 (크레딧 필요) | **완전 무료** |
| 💳 **신용카드** | 필수 | **불필요** |
| 📊 **성능** | GPT-4급 | **GPT-4급** |
| ⚡ **할당량** | 제한적 | **10 RPM, 250 req/day** |
| 🎓 **교육용** | 비용 부담 | **최적화** |

**결론: Gemini는 무료이면서도 동일한 성능을 제공합니다!** ✨

---

## 📝 설정 방법 (5분 소요)

### 1️⃣ 무료 API 키 발급받기

1. **Google AI Studio 접속**
   - 링크: https://aistudio.google.com/apikey
   - Google 계정으로 로그인 (Gmail 계정)

2. **API 키 생성**
   - "Create API Key" 버튼 클릭
   - 프로젝트 선택 또는 새 프로젝트 생성
   - API 키가 즉시 생성됩니다!

3. **API 키 복사**
   - 생성된 API 키를 복사합니다
   - 예시: `AIzaSyD...` 형식

---

### 2️⃣ 로컬 개발 환경 설정

`.env.local` 파일에 API 키 추가:

```bash
# .env.local 파일 수정
GEMINI_API_KEY=your_api_key_here  # 여기에 복사한 API 키 붙여넣기
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**테스트:**
```bash
npm run dev
# http://localhost:3000 접속
# Math Tutor 또는 English Tutor 테스트
```

---

### 3️⃣ Vercel 프로덕션 환경 설정

#### 방법 A: Vercel CLI 사용 (추천)

```bash
# 1. Vercel 환경 변수 추가
vercel env add GEMINI_API_KEY

# 프롬프트가 나타나면:
# - Value: 복사한 API 키 붙여넣기
# - Environment: Production, Preview, Development 모두 선택

# 2. 재배포
vercel --prod
```

#### 방법 B: Vercel Dashboard 사용

1. **Vercel Dashboard 접속**
   - https://vercel.com
   - 프로젝트 선택: `smarttuter`

2. **Settings → Environment Variables**
   - Key: `GEMINI_API_KEY`
   - Value: 복사한 API 키 붙여넣기
   - Environment: Production, Preview, Development 체크

3. **Redeploy**
   - Deployments 탭으로 이동
   - 최신 배포의 "..." 메뉴 → "Redeploy"

---

## ✅ 설정 확인

### 로컬 테스트
```bash
npm run dev
```
- Math Tutor: http://localhost:3000/tutor/math
- English Tutor: http://localhost:3000/tutor/english

### 프로덕션 테스트
- Math Tutor: https://smarttuter.vercel.app/tutor/math
- English Tutor: https://smarttuter.vercel.app/tutor/english

**정상 작동 확인:**
- ✅ 채팅 메시지가 즉시 응답
- ✅ 500 에러 없음
- ✅ "API 설정 오류" 메시지 없음

---

## 🚨 문제 해결

### "API 설정 오류" 메시지가 나올 때

**원인:** GEMINI_API_KEY가 설정되지 않음

**해결:**
```bash
# 1. 환경 변수 확인
echo $GEMINI_API_KEY  # 로컬
vercel env ls         # Vercel

# 2. 환경 변수 추가
vercel env add GEMINI_API_KEY

# 3. 재배포
vercel --prod
```

### "API rate limit reached" 메시지가 나올 때

**원인:** 무료 할당량 초과 (10 RPM = 분당 10회)

**해결:**
- 잠시 대기 (1분)
- 할당량은 매일 자정(PST)에 리셋됩니다

**무료 할당량:**
- Gemini 2.0 Flash: 10 RPM, 250 requests/day
- 일반 교육용 앱에 충분한 용량

---

## 📊 Gemini API 무료 할당량

| Model | RPM | RPD | Tokens/Min |
|-------|-----|-----|------------|
| Gemini 2.0 Flash (Exp) | 10 | 250 | 250,000 |
| Gemini 2.5 Flash | 10 | 250 | 250,000 |
| Gemini 2.5 Pro | 5 | 100 | 250,000 |

**RPM:** Requests Per Minute (분당 요청)
**RPD:** Requests Per Day (일일 요청)

**학습 튜터 앱 예상 사용량:**
- 학생 1명 x 30분 세션 = 약 60 요청
- 무료 할당량으로 **하루 4명 학생** 서비스 가능
- 비용: **$0 (완전 무료)**

---

## 💡 추가 정보

### 다른 무료 LLM API 옵션

1. **Groq (Llama 3.3 70B)**
   - 초고속 응답 (300 tokens/sec)
   - 무료 할당량: 높음
   - 링크: https://console.groq.com

2. **OpenRouter**
   - 50+ 모델 액세스
   - $5 무료 크레딧
   - 링크: https://openrouter.ai

3. **Together AI**
   - $25 무료 크레딧
   - 최신 오픈소스 모델
   - 링크: https://together.ai

### 유료 옵션 (필요시)

유료 전환 시 Gemini가 가장 저렴합니다:

| Provider | 1M tokens 비용 |
|----------|----------------|
| **Gemini 2.5 Flash** | **$0.075** |
| Claude Sonnet 4.5 | $3.00 |
| GPT-4o | $2.50 |

**결론: Gemini가 40배 저렴합니다!** 💰

---

## 🎓 학습 튜터 최적화 팁

1. **System Prompt 최적화**
   - 현재 프롬프트는 학교급별로 최적화되어 있습니다
   - 소크라테스식 교수법 적용
   - 친근하고 격려하는 톤

2. **대화 히스토리 관리**
   - Math: 최근 10개 메시지
   - English: 최근 15개 메시지
   - 컨텍스트를 유지하면서 토큰 절약

3. **스트리밍 응답**
   - 실시간 응답으로 사용자 경험 개선
   - 긴 답변도 즉시 시작

---

## 📞 문의 및 지원

문제가 계속되면:
1. GitHub Issues: https://github.com/your-repo/issues
2. Gemini API 문서: https://ai.google.dev/docs
3. Google AI Studio: https://aistudio.google.com

---

## 🎉 완료!

축하합니다! 이제 **완전 무료**로 **GPT-4급 성능**의 AI 튜터 서비스를 운영할 수 있습니다!

**핵심 장점:**
- ✅ 신용카드 불필요
- ✅ 크레딧 충전 불필요
- ✅ 동일한 성능
- ✅ 높은 할당량
- ✅ 교육용 최적화

**다음 단계:**
1. API 키 발급받기
2. 환경 변수 설정
3. 배포 및 테스트
4. 학생들에게 서비스 제공!

Happy Teaching! 📚✨
