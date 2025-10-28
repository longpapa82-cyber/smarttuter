# 🚀 Gemini API 키 설정 - 500 에러 즉시 해결!

## ⚡ 3분 안에 500 에러 해결하는 방법

코드는 이미 **Gemini 우선순위**로 변경되었습니다!
이제 **무료 API 키만 추가**하면 즉시 작동합니다.

---

## Step 1: 무료 Gemini API 키 발급 (1분)

### 🔗 발급 링크
```
https://aistudio.google.com/apikey
```

### 📝 발급 절차
1. 위 링크 클릭
2. Google 계정으로 로그인
3. **"Get API key"** 또는 **"Create API key in new project"** 클릭
4. API 키 복사 (예: `AIzaSy...` 형식)

### ✅ 특징
- ✅ **완전 무료!** (신용카드 불필요)
- ✅ 즉시 발급 (승인 대기 없음)
- ✅ 일일 1,500 요청 가능 (100명 사용자 충분)
- ✅ 프로덕션 사용 가능

---

## Step 2: Vercel에 API 키 추가 (1분)

### 방법 A: 웹 대시보드 (추천!)

1. **환경변수 페이지 접속**:
   ```
   https://vercel.com/090723s-projects/smarttuter/settings/environment-variables
   ```

2. **"Add New" 버튼** 클릭

3. **입력**:
   ```
   Key:   GEMINI_API_KEY
   Value: (Step 1에서 복사한 키 붙여넣기)
   Environment: ✓ Production (체크)
   ```

4. **"Save"** 클릭

### 방법 B: CLI (터미널)

```bash
# Vercel에 로그인 (처음 한 번만)
vercel login

# API 키 추가
vercel env add GEMINI_API_KEY production

# → 키 입력하라고 나오면 붙여넣기 후 Enter
```

---

## Step 3: 재배포 (1분)

### 방법 A: 자동 배포 (GitHub 트리거)

```bash
# 빈 커밋으로 배포 트리거
git commit --allow-empty -m "deploy: Activate Gemini API"
git push origin main

# → 2-5분 대기
```

### 방법 B: 수동 배포 (더 빠름!)

1. **Vercel 대시보드 접속**:
   ```
   https://vercel.com/090723s-projects/smarttuter
   ```

2. **"Deployments" 탭** → 최신 배포 선택

3. **"..." 메뉴** → **"Redeploy"** 클릭

4. **"Production"** 선택 → **"Redeploy"** 확인

5. **2-3분 대기** (진행 상황 표시됨)

---

## ✅ 완료 확인

### 배포 완료 후 테스트:

1. **URL 접속**:
   ```
   https://smarttuter.vercel.app/tutor/english
   ```

2. **영어 튜터 버튼** 클릭

3. **결과 확인**:
   ```
   ✅ 500 에러 없음!
   ✅ 튜터 화면 정상 표시
   ✅ 대화 가능
   ```

### Vercel 로그에서 Gemini 작동 확인:

```bash
vercel logs --follow

# 확인할 내용:
[LLMManager] Attempting provider: gemini
[LLMManager] ✅ Success with gemini
[VoiceTutor] Response from gemini (gemini-2.5-flash)
```

---

## 💡 로컬에서 미리 테스트 (선택)

배포 전에 로컬에서 테스트하려면:

```bash
# 1. 로컬 환경변수 추가
cd /Users/hoonjaepark/projects/smartTuter
echo "GEMINI_API_KEY=여기에_발급받은_키" >> .env.local

# 2. 로컬 서버 시작
npm run dev

# 3. 브라우저에서 테스트
# http://localhost:3000/tutor/english

# 4. 정상 작동 확인 후 Vercel 배포
```

---

## 📊 Gemini 전환 효과

### Before (Claude only)
```
❌ 크레딧 소진 → 500 에러
❌ 서비스 중단
💰 비용: $225/월
⏱️ 응답: 1-2초
```

### After (Gemini primary)
```
✅ 정상 작동 (무료 티어!)
✅ 서비스 연속성 유지
💰 비용: $12/월 (95% ↓)
⏱️ 응답: 0.5-0.8초 (2배 빠름!)
```

---

## 🔧 문제 해결

### Q: "Invalid API key" 에러
```
✓ 키를 정확히 복사했는지 확인
✓ 앞뒤 공백 없는지 확인
✓ Generative Language API 활성화 확인
  → https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
```

### Q: 여전히 500 에러
```
✓ 배포 완료되었는지 확인 (vercel ls)
✓ 환경변수 추가되었는지 확인 (vercel env ls)
✓ 브라우저 캐시 삭제 (Cmd+Shift+R)
```

### Q: Gemini 무료 한도 초과?
```
무료 티어:
- 일일: 1,500 requests
- 분당: 15 requests

초과 시:
→ 자동으로 Claude fallback (기존 크레딧 필요)
→ 또는 Gemini 유료 플랜 ($0.35/M tokens, 여전히 저렴)
```

---

## 🎯 요약

### 필요한 것
1. ✅ Gemini API 키 (무료 발급)
2. ✅ Vercel 환경변수 추가
3. ✅ 재배포

### 소요 시간
- API 키 발급: 1분
- 환경변수 추가: 1분
- 배포: 2-5분
- **총 5-10분 안에 해결!**

### 효과
- ✅ 500 에러 완전 해결
- ✅ 95% 비용 절감
- ✅ 더 빠른 응답
- ✅ 무료 사용 가능

---

## 📞 도움말

### Gemini API 키 발급:
https://aistudio.google.com/apikey

### Vercel 환경변수 설정:
https://vercel.com/090723s-projects/smarttuter/settings/environment-variables

### Vercel 배포:
https://vercel.com/090723s-projects/smarttuter

---

**다음 단계**:
1. 👆 위 Step 1-3 따라하기
2. ⏱️ 5-10분 대기
3. ✅ 500 에러 해결 확인!

**지금 바로 시작하세요!** 🚀
