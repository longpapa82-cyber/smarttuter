# 🔧 Kakao 로그인 디버깅 가이드

생성일: 2025-11-09
증상: Kakao 로그인 버튼 클릭 시 로그인 페이지로 리다이렉트 (`error=OAuthCallback`)

---

## 🎯 문제 증상

- ✅ **Google 로그인**: 정상 작동
- ❌ **Kakao 로그인**: 버튼 클릭 → 다시 로그인 페이지로 돌아옴
- ⚠️ **에러 URL**: `aipark.vercel.app/login?callbackUrl=...&error=OAuthCallback`

**원인**: Kakao OAuth 콜백 처리 중 에러 발생

---

## ✅ Kakao Developers Console 설정 체크리스트

### 1️⃣ 카카오 로그인 활성화 상태 확인

**위치**: Kakao Developers Console → 앱 선택 → **"제품 설정" → "카카오 로그인"**

**확인 사항**:
- [ ] **활성화 설정 상태**: `ON` ✅
- [ ] **OpenID Connect 활성화**: `ON` (선택사항)

**설정 방법**:
1. 카카오 로그인 페이지 상단의 토글 스위치 확인
2. `OFF`라면 `ON`으로 변경
3. **저장** 버튼 클릭

---

### 2️⃣ Redirect URI 정확성 확인 ⭐ (가장 중요!)

**위치**: **"제품 설정" → "카카오 로그인" → "Redirect URI"**

**등록되어야 할 URI**:
```
https://aipark.vercel.app/api/auth/callback/kakao
https://smarttuter.vercel.app/api/auth/callback/kakao
https://aipark-090723s-projects.vercel.app/api/auth/callback/kakao
https://aipark-longpapa82-7861-090723s-projects.vercel.app/api/auth/callback/kakao
http://localhost:3000/api/auth/callback/kakao
```

**⚠️ 주의사항**:
- ✅ **대소문자 정확히 일치**: `callback` (소문자)
- ✅ **슬래시 정확히 일치**: `/kakao` (마지막 `/` 없음)
- ✅ **https vs http**: 프로덕션은 `https`, 로컬만 `http`
- ✅ **5개 모두 등록**: 누락된 URI가 없는지 확인

**확인 방법**:
1. Redirect URI 섹션에 **5개의 URI가 모두 등록**되어 있는지 확인
2. 각 URI를 하나씩 클릭해서 **철자가 정확한지** 재확인
3. 특히 `/api/auth/callback/kakao` 경로가 **정확한지** 확인

---

### 3️⃣ Client Secret 설정 확인

**위치**: **"제품 설정" → "카카오 로그인" → "보안"** 탭

**확인 사항**:
- [ ] **Client Secret 코드 생성됨**: 코드가 표시되어야 함
- [ ] **활성화 상태**: `사용함` ✅
- [ ] **생성된 코드와 Vercel 환경 변수 일치**: 확인 필요

**현재 Vercel에 설정된 값**:
```
KAKAO_CLIENT_ID="be6ae0dcfddf2075640b406181a2e5dd"
KAKAO_CLIENT_SECRET="YYK55ToPYwLb4PPxvdgmGJ555iUCDGKm"
```

**확인 방법**:
1. Client Secret 섹션에서 **"보기"** 버튼 클릭
2. 표시된 코드가 `YYK55ToPYwLb4PPxvdgmGJ555iUCDGKm`와 **정확히 일치**하는지 확인
3. **활성화 상태**가 `사용함`인지 확인
4. 코드가 다르다면 → Vercel 환경 변수 업데이트 필요

---

### 4️⃣ 동의 항목 설정 확인

**위치**: **"제품 설정" → "카카오 로그인" → "동의 항목"**

**필수 설정**:
- [ ] **닉네임**: 필수 동의 또는 선택 동의 ✅
- [ ] **프로필 사진**: 선택 동의 ✅

**확인 방법**:
1. 동의 항목 페이지에서 **닉네임** 항목 찾기
2. **상태**가 "필수 동의" 또는 "선택 동의"로 설정되어 있는지 확인
3. 설정되어 있지 않다면:
   - 닉네임 옆의 **"설정"** 버튼 클릭
   - **동의 단계**를 "선택 동의" 또는 "필수 동의"로 설정
   - **저장**

---

### 5️⃣ REST API 키 확인

**위치**: **"앱 설정" → "앱 키"**

**확인 사항**:
- [ ] **REST API 키**: `be6ae0dcfddf2075640b406181a2e5dd` ✅

**확인 방법**:
1. 앱 설정 → 앱 키 페이지 접속
2. **REST API 키** 값이 `be6ae0dcfddf2075640b406181a2e5dd`와 일치하는지 확인
3. 다르다면 → Vercel 환경 변수 업데이트 필요

---

## 🔍 추가 디버깅 단계

### 단계 1: Kakao 로그인 버튼 클릭 시 동작 확인

**브라우저 개발자 도구**로 확인:

1. **F12** (개발자 도구 열기)
2. **Network** 탭 클릭
3. **"Preserve log"** 체크 ✅
4. **카카오 로그인 버튼** 클릭
5. **Filter**에 `kakao` 입력

**확인할 내용**:
- Kakao 인증 페이지(`kauth.kakao.com`)로 리다이렉트되는지?
  - ✅ **예**: 다음 단계로
  - ❌ **아니오**: JavaScript 에러 확인 (Console 탭)

### 단계 2: Kakao 콜백 URL 확인

**Network 탭에서 확인**:

1. `callback` 필터 입력
2. `/api/auth/callback/kakao` 요청 찾기
3. **Headers** 탭 클릭
4. **Query String Parameters** 확인

**예상되는 파라미터**:
```
code=xxxxx
state=xxxxx
```

**에러 파라미터가 있다면**:
```
error=xxxxx
error_description=xxxxx
```

### 단계 3: Console 에러 확인

**Console 탭에서 확인**:

현재 보이는 에러:
```
Uncaught (in promise) TypeError: Failed to execute 'addAll' on 'Cache': Request failed
```

**해결 방법**:
- 이 에러는 Service Worker 캐시 관련 에러이며, OAuth 로그인과는 무관
- 하드 리프레시 (`Cmd+Shift+R`)로 Service Worker 재등록

---

## 🛠️ 문제 해결 방법

### 방법 1: Kakao Developers Console 재설정

**모든 설정을 처음부터 다시 확인**:

1. ✅ 카카오 로그인 활성화 `ON`
2. ✅ Redirect URI 5개 정확히 등록
3. ✅ Client Secret 활성화 `사용함`
4. ✅ 동의 항목 (닉네임) 설정
5. ✅ **저장** 버튼 클릭 (매우 중요!)

### 방법 2: Client Secret 재생성 (마지막 수단)

**현재 Client Secret이 작동하지 않는다면**:

1. Kakao Developers Console → 카카오 로그인 → 보안
2. **"코드 재발급"** 클릭
3. **새 Client Secret 복사**
4. Vercel 환경 변수 업데이트:
   ```bash
   npx vercel env rm KAKAO_CLIENT_SECRET production --yes
   echo "<새_시크릿>" | npx vercel env add KAKAO_CLIENT_SECRET production
   npx vercel --prod --yes
   ```

### 방법 3: Redirect URI 재등록

**URI 삭제 후 재등록**:

1. 기존 Redirect URI **모두 삭제**
2. 다시 5개 URI를 **하나씩 정확히** 등록:
   ```
   https://aipark.vercel.app/api/auth/callback/kakao
   https://smarttuter.vercel.app/api/auth/callback/kakao
   https://aipark-090723s-projects.vercel.app/api/auth/callback/kakao
   https://aipark-longpapa82-7861-090723s-projects.vercel.app/api/auth/callback/kakao
   http://localhost:3000/api/auth/callback/kakao
   ```
3. **저장**

---

## 🧪 재테스트

**설정 변경 후**:

1. **브라우저 캐시 완전 클리어**
   - Mac: `Cmd + Shift + R` (하드 리프레시)
   - 또는 시크릿 모드 사용

2. **새 시크릿 창**으로 접속
   - https://aipark.vercel.app/login

3. **카카오 로그인 버튼 클릭**

4. **예상 흐름**:
   ```
   /login
     → kauth.kakao.com (Kakao 로그인)
     → 동의 화면
     → /api/auth/callback/kakao
     → /dashboard
   ```

---

## 📋 체크리스트 (사용자 확인용)

**Kakao Developers Console**:
- [ ] 앱 선택: AI Park / SmartTuter
- [ ] 카카오 로그인 활성화: `ON`
- [ ] Redirect URI 5개 등록 완료
- [ ] Client Secret 활성화: `사용함`
- [ ] Client Secret 코드 일치 확인
- [ ] 동의 항목 (닉네임) 설정 완료
- [ ] 모든 변경사항 **저장** 버튼 클릭 ✅

**확인 방법**:
- [ ] 각 설정 페이지 스크린샷 캡처
- [ ] Redirect URI 목록 스크린샷 캡처
- [ ] Client Secret 활성화 상태 스크린샷 캡처

---

## 🆘 추가 지원

**여전히 문제가 해결되지 않는다면**:

1. **Kakao Developers Console 스크린샷 제공**:
   - 카카오 로그인 활성화 상태
   - Redirect URI 목록
   - Client Secret 활성화 상태

2. **브라우저 개발자 도구 정보 제공**:
   - Network 탭 → callback 요청의 Headers
   - Console 탭 → 에러 메시지

3. **Vercel 로그 확인**:
   ```bash
   npx vercel logs aipark-7p8sy1oy8-090723s-projects.vercel.app --since 5m
   ```

---

**작성자**: Claude (SuperClaude Framework)
**작성일**: 2025-11-09
**상태**: 디버깅 진행 중
