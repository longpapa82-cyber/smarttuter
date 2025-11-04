# Gemini API 결제 설정 확인 체크리스트

## 1️⃣ Google Cloud Console 결제 확인

### 방법 1: Google Cloud Console에서 확인
👉 https://console.cloud.google.com/billing

**확인 사항:**
- ✅ 결제 계정이 생성되어 있는지
- ✅ 결제 방법(카드)이 등록되어 있는지
- ✅ 결제 계정 상태가 "활성"인지

**확인 방법:**
1. 왼쪽 메뉴에서 "결제" 클릭
2. "결제 계정 관리" 클릭
3. 카드 정보가 표시되는지 확인
4. 상태가 "활성" 또는 "Active"인지 확인

---

## 2️⃣ Google AI Studio 프로젝트 연결 확인

### 방법 2: AI Studio에서 프로젝트 결제 상태 확인
👉 https://aistudio.google.com/

**확인 방법:**
1. 왼쪽 "Get API key" 클릭
2. 기존 API 키 목록 확인
3. 각 키 옆에 "Tier 1" 또는 "결제 설정" 표시 확인

**중요:**
- "Tier 1" = 결제 활성화됨 ✅
- "무료 등급" 또는 "Free tier" = 무료 (50/일 제한) ⚠️

---

## 3️⃣ 새 API 키 생성 (권장 ⭐)

결제를 **방금** 활성화했다면, **새 API 키 생성**이 가장 확실합니다.

### 새 프로젝트로 API 키 생성하기:

1. **Google AI Studio** 접속: https://aistudio.google.com/
2. 왼쪽 메뉴에서 **"Get API key"** 클릭
3. **"Create API key in new project"** 버튼 클릭
   - ⚠️ "Create API key" (기존 프로젝트)가 아님!
   - ✅ "Create API key **in new project**" 선택
4. 새로 생성된 API 키 복사 (예: AIzaSy...)
5. 아래 명령어로 .env.local 업데이트:

```bash
# 터미널에서 실행 (새 API 키로 교체)
echo "GEMINI_API_KEY=새로운_API_키를_여기에_붙여넣기" > .env.local.new
cat .env.local >> .env.local.new
mv .env.local.new .env.local
```

또는 수동으로:
- `.env.local` 파일 열기
- `GEMINI_API_KEY=` 뒤의 값을 새 API 키로 교체
- 저장

---

## 4️⃣ 즉시 테스트

새 API 키로 업데이트한 후:

```bash
# 1. 테스트 스크립트 실행
node test-gemini-billing.js

# 2. 성공하면 다음과 같이 표시됨:
# ✅ API Call: SUCCESS
# ⏱️  Response Time: ~500ms
# 📝 Response: "4"
```

---

## 5️⃣ 결제 활성화 확인 방법

### ✅ 결제가 제대로 활성화된 경우:
- API 호출 성공 ✅
- 응답 시간: 200-1000ms
- Quota 에러 없음
- 테스트 결과: 5/5 성공

### ⚠️ 아직 활성화 안 된 경우:
- API 호출 실패 ❌
- 에러: "429 Quota exceeded" 또는 "Resource exhausted"
- 5-10분 더 대기 필요

### ❌ 결제 설정 문제가 있는 경우:
- 카드 정보 오류
- 결제 계정 미연결
- 프로젝트에 결제 계정 미할당

---

## 6️⃣ 문제 해결

### 문제 A: "여전히 quota 에러 발생"

**해결:**
1. **완전히 새 프로젝트**로 API 키 생성
2. Google Cloud Console에서 해당 프로젝트에 결제 계정 연결 확인
3. 5-10분 대기 후 재시도

### 문제 B: "결제 계정은 있는데 프로젝트에 연결 안 됨"

**해결:**
1. Google Cloud Console: https://console.cloud.google.com/
2. 프로젝트 선택 (상단 드롭다운)
3. 왼쪽 메뉴 "결제" → "결제 계정 연결"
4. 생성한 결제 계정 선택
5. "계정 설정" 클릭

### 문제 C: "Tier 1인데도 quota 에러"

**원인:** 프로젝트 전체 quota 소진

**해결:**
1. **새 프로젝트**에서 API 키 생성
2. 기존 프로젝트 quota 리셋 대기 (24시간)

---

## 7️⃣ 예상 결과

### 결제 활성화 전:
```
📊 Free Tier
- Quota: 50 requests/day
- Reset: Daily at UTC 00:00 (09:00 Korea)
- Cost: FREE
```

### 결제 활성화 후:
```
📊 Paid Tier (Tier 1)
- Quota: 1,500 requests/minute (= 144,000/day)
- Reset: Per minute
- Cost: FREE until 2025 H1
       Then ~$25/month (100 students)
```

---

## 🎯 가장 빠른 해결 방법 (추천)

```bash
# 1. 새 프로젝트로 API 키 생성
# → https://aistudio.google.com/
# → "Create API key in new project" 클릭

# 2. 새 키를 복사한 후 아래 명령 실행
# (NEW_API_KEY 부분을 실제 키로 교체)

echo 'GEMINI_API_KEY=NEW_API_KEY' > /Users/hoonjaepark/projects/smartTuter/.env.local.temp
grep -v '^GEMINI_API_KEY=' /Users/hoonjaepark/projects/smartTuter/.env.local >> /Users/hoonjaepark/projects/smartTuter/.env.local.temp
mv /Users/hoonjaepark/projects/smartTuter/.env.local.temp /Users/hoonjaepark/projects/smartTuter/.env.local

# 3. 테스트
node test-gemini-billing.js

# 4. 개발 서버 재시작
# Ctrl+C로 종료 후 npm run dev
```

---

## 📞 추가 확인 필요 시

아래 정보를 확인해주세요:

1. **Google Cloud Console 결제 페이지 스크린샷**
   - 카드가 등록되어 있는지
   - 결제 계정 상태가 "활성"인지

2. **Google AI Studio API 키 페이지 스크린샷**
   - 새로 생성한 키가 "Tier 1"인지 확인

3. **테스트 결과**
   - `node test-gemini-billing.js` 실행 결과
