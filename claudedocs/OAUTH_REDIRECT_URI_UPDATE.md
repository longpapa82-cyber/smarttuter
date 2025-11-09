# 🔧 OAuth Redirect URI 업데이트 가이드 (도메인 변경)

생성일: 2025-11-09
이슈: Google 및 Kakao 로그인 오류 (Redirect URI 불일치)

---

## 🎯 문제 원인

도메인이 **smarttuter.vercel.app → aipark.vercel.app**으로 변경되면서:
- ❌ **Google OAuth**: Redirect URI 불일치
- ❌ **Kakao OAuth**: Redirect URI 불일치 (KOE006 에러)

**해결**: Google Cloud Console과 Kakao Developers Console에서 **모든 도메인의 Redirect URI**를 등록해야 합니다.

---

## ✅ 1️⃣ Google Cloud Console 설정

### 1단계: Google Cloud Console 접속

1. 브라우저에서 접속: **https://console.cloud.google.com**
2. **AI Park (SmartTuter) 프로젝트** 선택
   - 프로젝트가 없다면: "새 프로젝트" 생성

### 2단계: OAuth 동의 화면 설정 확인

1. 왼쪽 메뉴: **"API 및 서비스" → "OAuth 동의 화면"**
2. **승인된 도메인** 섹션에 다음 도메인 추가:
   ```
   aipark.vercel.app
   smarttuter.vercel.app
   ```

### 3단계: OAuth 클라이언트 ID 수정 ⭐ (가장 중요!)

1. 왼쪽 메뉴: **"API 및 서비스" → "사용자 인증 정보"**
2. **OAuth 2.0 클라이언트 ID** 섹션에서 기존 클라이언트 ID 클릭
   - 이름: 예) "AI Park Web Client"
3. **승인된 리디렉션 URI** 섹션에서 **"URI 추가"** 클릭

다음 URI들을 **모두 추가**:

```
https://aipark.vercel.app/api/auth/callback/google
https://smarttuter.vercel.app/api/auth/callback/google
https://aipark-090723s-projects.vercel.app/api/auth/callback/google
https://aipark-longpapa82-7861-090723s-projects.vercel.app/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

**⚠️ 주의사항**:
- ✅ **정확히 복사**: `/api/auth/callback/google` 경로 필수
- ✅ **https vs http**: 프로덕션은 `https`, 로컬만 `http`
- ✅ **각 URI를 별도 항목으로 추가**

### 4단계: 저장 및 확인

1. **저장** 버튼 클릭
2. **클라이언트 ID** 및 **클라이언트 보안 비밀** 복사
   - Vercel 환경 변수 확인용

---

## ✅ 2️⃣ Kakao Developers Console 설정

### 1단계: Kakao Developers Console 접속

1. 브라우저에서 접속: **https://developers.kakao.com/console/app**
2. **AI Park (SmartTuter) 앱** 선택

### 2단계: 카카오 로그인 활성화 확인

1. 왼쪽 메뉴: **"제품 설정" → "카카오 로그인"**
2. **활성화 설정**: `ON`

### 3단계: Redirect URI 등록 ⭐ (가장 중요!)

1. **"Redirect URI"** 섹션에서 **"Redirect URI 등록"** 버튼 클릭

다음 URI들을 **모두 추가**:

```
https://aipark.vercel.app/api/auth/callback/kakao
https://smarttuter.vercel.app/api/auth/callback/kakao
https://aipark-090723s-projects.vercel.app/api/auth/callback/kakao
https://aipark-longpapa82-7861-090723s-projects.vercel.app/api/auth/callback/kakao
http://localhost:3000/api/auth/callback/kakao
```

**⚠️ 주의사항**:
- ✅ **정확히 복사**: `/api/auth/callback/kakao` 경로 필수
- ✅ **https vs http**: 프로덕션은 `https`, 로컬만 `http`
- ✅ **각 URI를 별도 항목으로 추가**

### 4단계: Client Secret 확인

1. **"제품 설정" → "카카오 로그인" → "보안"** 탭
2. **Client Secret** 활성화 및 확인
3. **REST API 키** 복사 (앱 설정 → 앱 키)

---

## 🔧 3️⃣ Vercel 환경 변수 확인

### Vercel Dashboard 접속

1. **https://vercel.com/090723s-projects/aipark**
2. **Settings** → **Environment Variables**

### 환경 변수 확인 (이미 설정됨 ✅)

| 변수명 | 값 | 상태 |
|--------|-----|------|
| `GOOGLE_CLIENT_ID` | `<Google Client ID>` | ✅ 설정됨 |
| `GOOGLE_CLIENT_SECRET` | `<Google Secret>` | ✅ 설정됨 |
| `KAKAO_CLIENT_ID` | `be6ae0dcfddf2075640b406181a2e5dd` | ✅ 설정됨 |
| `KAKAO_CLIENT_SECRET` | `YYK55ToPYwLb4PPxvdgmGJ555iUCDGKm` | ✅ 설정됨 |
| `NEXTAUTH_URL` | `https://aipark.vercel.app` | ✅ **방금 업데이트됨** |
| `NEXTAUTH_SECRET` | `<JWT Secret>` | ✅ 설정됨 |

**변경 사항**:
- ✅ `NEXTAUTH_URL`: `smarttuter.vercel.app` → **`aipark.vercel.app`** (업데이트 완료)
- ✅ **Redeploy 완료**: 최신 환경 변수 반영됨

---

## 🔄 4️⃣ 배포 상태 확인

### 최신 배포 정보

| 항목 | 값 |
|------|-----|
| **배포 URL** | https://aipark-7p8sy1oy8-090723s-projects.vercel.app |
| **상태** | ✅ Ready |
| **배포 시간** | 방금 전 |
| **환경 변수** | NEXTAUTH_URL 업데이트 반영됨 |

### 메인 도메인

- ✅ https://aipark.vercel.app
- ✅ https://smarttuter.vercel.app (alias)
- ✅ https://aipark-090723s-projects.vercel.app

---

## 🧪 5️⃣ 테스트

### 테스트 전 준비

1. **Google과 Kakao Console에서 Redirect URI 등록 완료 확인**
2. **브라우저 캐시 클리어**
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`

### 로그인 테스트

**1. Google 로그인**
1. https://aipark.vercel.app/login 접속
2. **Google로 로그인** 버튼 클릭
3. Google 계정 선택
4. AI Park 대시보드로 리다이렉트 확인

**2. Kakao 로그인**
1. https://aipark.vercel.app/login 접속
2. **Kakao로 로그인** 버튼 클릭
3. 동의 화면 확인 (닉네임, 프로필 사진)
4. AI Park 대시보드로 리다이렉트 확인

**예상 흐름**:
```
/login
  → OAuth 제공자 페이지 (Google/Kakao)
  → 동의/인증
  → /api/auth/callback/{provider}
  → /dashboard (또는 /onboarding)
```

---

## 🐛 6️⃣ 문제 해결

### Google 로그인 오류

**오류 메시지**: "redirect_uri_mismatch" 또는 "400: redirect_uri_mismatch"

**해결 방법**:
1. Google Cloud Console → OAuth 클라이언트 ID 확인
2. Redirect URI가 **정확히** 등록되었는지 확인
3. 대소문자, 슬래시, http/https 모두 일치해야 함
4. 브라우저 개발자 도구(F12) → Network 탭에서 실제 redirect_uri 확인

### Kakao 로그인 오류 (KOE006)

**오류 메시지**: "앱 관리자 설정 오류 (KOE006)"

**해결 방법**:
1. Kakao Developers Console → Redirect URI 확인
2. Redirect URI가 **정확히** 등록되었는지 확인
3. 카카오 로그인 활성화 상태 `ON` 확인
4. Client Secret 활성화 확인

### 여전히 오류가 발생한다면?

**1. 브라우저 개발자 도구로 디버그**
```
F12 → Network 탭 → "callback" 필터
→ redirect_uri 파라미터 확인
→ OAuth Console에 등록된 URI와 비교
```

**2. Vercel Logs 확인**
```bash
npx vercel logs --prod
```

**3. OAuth Console 재확인**
- Google: https://console.cloud.google.com
- Kakao: https://developers.kakao.com/console/app

---

## 📋 완료 체크리스트

### Google Cloud Console
- [ ] OAuth 동의 화면에 도메인 추가
- [ ] OAuth 클라이언트 ID에 Redirect URI 5개 등록
- [ ] 저장 완료

### Kakao Developers Console
- [ ] 카카오 로그인 활성화 `ON`
- [ ] Redirect URI 5개 모두 등록
- [ ] Client Secret 활성화 확인

### Vercel
- [ ] `NEXTAUTH_URL` = `https://aipark.vercel.app` ✅ (완료)
- [ ] Redeploy 완료 ✅ (완료)
- [ ] 최신 배포 상태 "Ready" 확인

### 테스트
- [ ] 브라우저 캐시 클리어
- [ ] Google 로그인 테스트
- [ ] Kakao 로그인 테스트
- [ ] 대시보드 접속 확인

---

## 📚 참고 문서

### Google OAuth
- https://console.cloud.google.com
- https://developers.google.com/identity/protocols/oauth2

### Kakao OAuth
- https://developers.kakao.com/console/app
- https://developers.kakao.com/docs/latest/ko/kakaologin/common

### NextAuth
- https://next-auth.js.org/providers/google
- https://next-auth.js.org/providers/kakao

---

## 🎯 다음 단계

1. ✅ **Vercel 환경 변수 업데이트 완료**
2. ✅ **Vercel Redeploy 완료**
3. ⏳ **Google Cloud Console에서 Redirect URI 등록** (사용자 작업 필요)
4. ⏳ **Kakao Developers Console에서 Redirect URI 등록** (사용자 작업 필요)
5. 🧪 **로그인 테스트**

---

**작성자**: Claude (SuperClaude Framework)
**작성일**: 2025-11-09
**상태**: Vercel 설정 완료 → OAuth Console 설정 대기 중
