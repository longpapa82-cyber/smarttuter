# Vertex AI 설정 가이드

완전 무제한 AI 튜터 서비스를 위한 Google Vertex AI 설정 가이드입니다.

## 📋 목차

1. [사전 준비](#사전-준비)
2. [Google Cloud 설정](#google-cloud-설정)
3. [Vertex AI 활성화](#vertex-ai-활성화)
4. [서비스 계정 생성](#서비스-계정-생성)
5. [로컬 환경 설정](#로컬-환경-설정)
6. [Vercel 배포 설정](#vercel-배포-설정)
7. [테스트 및 확인](#테스트-및-확인)
8. [비용 모니터링](#비용-모니터링)
9. [문제 해결](#문제-해결)

---

## 사전 준비

### 필요한 것들

✅ Google 계정 (Gmail 등)
✅ 신용/체크카드 (결제 수단)
✅ 터미널 또는 명령 프롬프트 접근
✅ Node.js 프로젝트 실행 환경

### 예상 비용

**신규 가입 시**: $300 무료 크레딧 (90일)
- 이 크레딧으로 초기 개발 및 테스트 완전 무료!

**실제 운영 시** (100명 사용자 기준):
- 월 약 $93 (사용자당 $0.93)
- 1,000명 기준: 월 약 $563 (사용자당 $0.56)

---

## Google Cloud 설정

### Step 1: Google Cloud Console 접속

1. https://console.cloud.google.com 접속
2. Google 계정으로 로그인

### Step 2: 신규 프로젝트 생성

```bash
# 웹 UI에서:
1. 상단 "프로젝트 선택" 클릭
2. "새 프로젝트" 클릭
3. 프로젝트 이름: "smarttuter-production" 입력
4. "만들기" 클릭
```

또는 CLI로:

```bash
# Google Cloud CLI 설치 (Mac)
brew install google-cloud-sdk

# Windows는 https://cloud.google.com/sdk/docs/install 참고

# 로그인
gcloud auth login

# 프로젝트 생성
gcloud projects create smarttuter-production \
  --name="Smart Tutor Production"

# 프로젝트 설정
gcloud config set project smarttuter-production
```

### Step 3: 결제 계정 연결

```bash
# 웹 UI에서:
1. 좌측 메뉴 → "결제" 클릭
2. "결제 계정 연결" 클릭
3. 카드 정보 입력
4. 프로젝트에 연결

# ✅ 신규 가입 시 $300 무료 크레딧 자동 적용!
```

---

## Vertex AI 활성화

### Step 1: API 활성화

```bash
# CLI로 (추천):
gcloud services enable aiplatform.googleapis.com

# 또는 웹 UI에서:
1. "API 및 서비스" → "라이브러리"
2. "Vertex AI API" 검색
3. "사용 설정" 클릭
```

### Step 2: 활성화 확인

```bash
gcloud services list --enabled | grep aiplatform

# 출력 예시:
# aiplatform.googleapis.com          Vertex AI API
```

---

## 서비스 계정 생성

### Step 1: 서비스 계정 만들기

```bash
# 서비스 계정 생성
gcloud iam service-accounts create vertex-ai-tutor \
  --display-name="Smart Tutor Vertex AI Service Account" \
  --description="Service account for AI tutor application"

# 생성 확인
gcloud iam service-accounts list

# 출력 예시:
# DISPLAY NAME: Smart Tutor Vertex AI Service Account
# EMAIL: vertex-ai-tutor@smarttuter-production.iam.gserviceaccount.com
```

### Step 2: 권한 부여

```bash
# Vertex AI User 역할 부여
gcloud projects add-iam-policy-binding smarttuter-production \
  --member="serviceAccount:vertex-ai-tutor@smarttuter-production.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# Service Account User 역할 부여 (필요 시)
gcloud projects add-iam-policy-binding smarttuter-production \
  --member="serviceAccount:vertex-ai-tutor@smarttuter-production.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# 권한 확인
gcloud projects get-iam-policy smarttuter-production \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:vertex-ai-tutor@smarttuter-production.iam.gserviceaccount.com"
```

### Step 3: 키 파일 생성

```bash
# 키 생성 (프로젝트 루트에서 실행)
gcloud iam service-accounts keys create vertex-ai-key.json \
  --iam-account=vertex-ai-tutor@smarttuter-production.iam.gserviceaccount.com

# 파일 생성 확인
ls -la vertex-ai-key.json

# ⚠️  중요: 이 파일은 절대 Git에 커밋하지 마세요!
```

### Step 4: 키 파일 보안

```bash
# .gitignore에 추가
echo "vertex-ai-key.json" >> .gitignore

# 파일 권한 설정 (Mac/Linux)
chmod 600 vertex-ai-key.json
```

---

## 로컬 환경 설정

### Step 1: 환경 변수 파일 생성

```bash
# .env.local 파일 편집
code .env.local

# 또는
vim .env.local
```

### Step 2: 환경 변수 추가

```.env.local
# ==========================================
# Vertex AI Configuration
# ==========================================

GCP_PROJECT_ID=smarttuter-production
GCP_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/Users/your-username/projects/smartTuter/vertex-ai-key.json

# ⚠️  절대 경로로 작성하세요!
# Mac/Linux: /Users/username/...
# Windows: C:/Users/username/...

# ==========================================
# Fallback (기존 Gemini API)
# ==========================================

GEMINI_API_KEY=your_existing_gemini_key

# ==========================================
# 기능 토글
# ==========================================

ENABLE_VERTEX_AI=true  # Vertex AI 사용
ENABLE_MULTI_MODEL_VERIFICATION=false  # 일단 false
```

### Step 3: 설정 확인

```bash
# Node.js로 설정 테스트
node -e "
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
console.log('✅ GCP_PROJECT_ID:', process.env.GCP_PROJECT_ID);
console.log('✅ GCP_LOCATION:', process.env.GCP_LOCATION);
console.log('✅ Credentials file exists:', require('fs').existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS));
"
```

---

## Vercel 배포 설정

### Step 1: Vercel에서 환경 변수 설정

```bash
# Vercel CLI로 설정
vercel env add GCP_PROJECT_ID production
# 입력: smarttuter-production

vercel env add GCP_LOCATION production
# 입력: us-central1

vercel env add ENABLE_VERTEX_AI production
# 입력: true
```

### Step 2: 서비스 계정 키 JSON 내용 추가

```bash
# vertex-ai-key.json 내용을 한 줄로 변환
cat vertex-ai-key.json | jq -c

# 출력된 JSON을 복사

# Vercel에 추가
vercel env add VERTEX_AI_CREDENTIALS production
# 복사한 JSON 붙여넣기
```

### Step 3: Vercel 프로젝트에서 키 사용

`vercel.json` 또는 코드에서 환경 변수 파싱:

```typescript
// lib/ai/vertex-client.ts에 추가
if (process.env.VERTEX_AI_CREDENTIALS) {
  // Vercel 환경: JSON 문자열 파싱
  const credentials = JSON.parse(process.env.VERTEX_AI_CREDENTIALS);

  this.vertexAI = new VertexAI({
    project: process.env.GCP_PROJECT_ID!,
    location: process.env.GCP_LOCATION || 'us-central1',
    googleAuthOptions: {
      credentials
    }
  });
} else {
  // 로컬 환경: 파일 경로 사용
  this.vertexAI = new VertexAI({
    project: process.env.GCP_PROJECT_ID!,
    location: process.env.GCP_LOCATION || 'us-central1',
  });
}
```

---

## 테스트 및 확인

### Step 1: 로컬 테스트

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000
```

### Step 2: 첫 번째 질문 테스트

```
1. 수학 튜터 선택
2. "2 + 2는 얼마인가요?" 질문
3. 콘솔에서 로그 확인:
   ✅ Vertex AI initialized successfully
   ✅ Vertex AI gemini-2.5-flash generation complete
```

### Step 3: 상태 확인 API

```bash
# 터미널에서
curl http://localhost:3000/api/stats

# 응답 예시:
{
  "success": true,
  "cache": { ... },
  "api": { "remaining": 50 },
  "vertexAI": {
    "enabled": true,
    "project": "smarttuter-production"
  }
}
```

---

## 비용 모니터링

### Google Cloud Console에서 모니터링

```bash
1. https://console.cloud.google.com/billing
2. 좌측 "비용 테이블" 클릭
3. "Vertex AI" 필터

실시간 비용 확인 가능!
```

### 예산 알림 설정

```bash
# 웹 UI에서:
1. "결제" → "예산 및 알림"
2. "예산 만들기" 클릭
3. 월 예산: $100 (또는 원하는 금액)
4. 알림 임계값: 50%, 90%, 100%
5. 이메일 알림 받을 주소 입력
```

### CLI로 비용 확인

```bash
# 현재 월 비용 확인
gcloud billing projects describe smarttuter-production \
  --format="table(billingAccountName, billingEnabled)"

# 상세 비용 조회 (BigQuery 필요)
# 설정 방법: https://cloud.google.com/billing/docs/how-to/export-data-bigquery
```

---

## 문제 해결

### 문제 1: "Vertex AI not initialized" 에러

**원인**: 환경 변수가 제대로 설정되지 않음

**해결**:
```bash
# 환경 변수 확인
echo $GCP_PROJECT_ID
echo $GCP_LOCATION
echo $GOOGLE_APPLICATION_CREDENTIALS

# 파일 존재 확인
ls -la $GOOGLE_APPLICATION_CREDENTIALS

# Node.js 재시작
npm run dev
```

### 문제 2: "Permission denied" 에러

**원인**: 서비스 계정 권한 부족

**해결**:
```bash
# 권한 재부여
gcloud projects add-iam-policy-binding smarttuter-production \
  --member="serviceAccount:vertex-ai-tutor@smarttuter-production.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# Vertex AI API 활성화 재확인
gcloud services enable aiplatform.googleapis.com
```

### 문제 3: "Quota exceeded" 에러

**원인**: 무료 크레딧 소진 또는 결제 수단 미등록

**해결**:
```bash
# 결제 계정 확인
gcloud billing accounts list

# 프로젝트에 결제 연결 확인
gcloud billing projects describe smarttuter-production

# 결제 수단 등록
# → https://console.cloud.google.com/billing
```

### 문제 4: Vercel 배포 후 작동 안 함

**원인**: Vercel 환경 변수 미설정

**해결**:
```bash
# Vercel Dashboard에서 확인:
# Settings → Environment Variables

# 필수 변수:
# - GCP_PROJECT_ID
# - GCP_LOCATION
# - VERTEX_AI_CREDENTIALS (JSON 형식)
# - ENABLE_VERTEX_AI=true

# 재배포
vercel --prod
```

---

## 고급 설정

### Multi-Region 배포

더 빠른 응답을 위해 여러 지역에 배포:

```typescript
// lib/ai/vertex-client.ts
const REGIONS = {
  'us': 'us-central1',      // 미국
  'asia': 'asia-northeast3', // 서울
  'europe': 'europe-west4',  // 네덜란드
};

// 사용자 위치에 따라 자동 선택
const userRegion = detectUserRegion(req);
const location = REGIONS[userRegion] || 'us-central1';
```

### 프롬프트 캐싱 (90% 비용 절감)

```typescript
// 시스템 프롬프트를 캐시하여 재사용
const model = vertexAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  cachedContent: cachedSystemPromptId, // 캐시된 프롬프트 ID
});
```

### Provisioned Throughput

대규모 사용자를 위한 예약 용량:

```bash
# Google Cloud 영업팀 문의
# https://cloud.google.com/vertex-ai/docs/generative-ai/provisioned-throughput
```

---

## 체크리스트

### 설정 완료 확인

- [ ] Google Cloud 프로젝트 생성
- [ ] 결제 계정 연결
- [ ] Vertex AI API 활성화
- [ ] 서비스 계정 생성 및 권한 부여
- [ ] 키 파일 생성 및 보안 설정
- [ ] 로컬 환경 변수 설정
- [ ] 로컬 테스트 성공
- [ ] Vercel 환경 변수 설정
- [ ] 프로덕션 배포 성공
- [ ] 비용 모니터링 설정

### 운영 전 확인

- [ ] 예산 알림 설정
- [ ] 일일/월간 예산 한도 설정
- [ ] 비용 추적 대시보드 확인
- [ ] Fallback 메커니즘 테스트
- [ ] Multi-model 검증 테스트 (선택)

---

## 지원 및 문의

### 공식 문서

- [Vertex AI 문서](https://cloud.google.com/vertex-ai/docs)
- [Gemini API 문서](https://ai.google.dev/gemini-api/docs)
- [가격 정보](https://cloud.google.com/vertex-ai/pricing)

### 커뮤니티

- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-vertex-ai)
- [Google Cloud Community](https://www.googlecloudcommunity.com/)

---

**생성일**: 2025-01-04
**버전**: 1.0
**작성자**: Claude Code
