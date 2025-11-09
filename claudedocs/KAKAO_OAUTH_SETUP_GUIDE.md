# 🔧 Kakao OAuth 설정 가이드 (KOE006 에러 해결)

생성일: 2025-11-09
에러: KOE006 - 앱 관리자 설정 오류

---

## 🎯 문제 원인

**KOE006 에러**는 Kakao Developers Console에서 **Redirect URI가 올바르게 설정되지 않았을 때** 발생합니다.

현재 AI Park는 여러 도메인으로 배포되어 있으므로, **모든 도메인의 Redirect URI**를 Kakao에 등록해야 합니다.

---

## ✅ 해결 방법: Kakao Developers Console 설정

### 1단계: Kakao Developers Console 접속

1. 브라우저에서 접속: **https://developers.kakao.com/console/app**
2. **카카오 계정으로 로그인**
3. **AI Park (SmartTuter) 앱** 선택
   - 앱이 없다면: "애플리케이션 추가하기"로 새 앱 생성

---

### 2단계: 카카오 로그인 활성화

1. 왼쪽 메뉴: **"제품 설정" → "카카오 로그인"** 클릭
2. **"활성화 설정"** 섹션
   - **카카오 로그인**: `ON` 으로 설정
   - **OpenID Connect**: `ON` (선택사항)

---

### 3단계: Redirect URI 등록 ⭐ (가장 중요!)

**"Redirect URI"** 섹션에서 **"Redirect URI 등록"** 버튼 클릭

다음 URI들을 **하나씩 모두 추가**:

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
- ✅ **마지막 슬래시 없음**: `/kakao/` (X) → `/kakao` (O)
- ✅ **각 URI를 별도 항목으로 추가** (한 줄에 하나씩)

**등록 후 화면**:
```
✅ https://aipark.vercel.app/api/auth/callback/kakao
✅ https://smarttuter.vercel.app/api/auth/callback/kakao
✅ https://aipark-090723s-projects.vercel.app/api/auth/callback/kakao
✅ https://aipark-longpapa82-7861-090723s-projects.vercel.app/api/auth/callback/kakao
✅ http://localhost:3000/api/auth/callback/kakao
```

---

### 4단계: Client Secret 생성/확인

1. **"제품 설정" → "카카오 로그인" → "보안"** 탭 클릭
2. **"Client Secret"** 섹션
   - 코드가 없다면: **"코드 생성"** 버튼 클릭
   - 코드가 있다면: **"보기"** 버튼으로 확인
3. **Client Secret 활성화**: `사용함`으로 설정
4. **생성된 Client Secret 복사** (나중에 Vercel에 설정)

---

### 5단계: 동의 항목 설정

1. **"제품 설정" → "카카오 로그인" → "동의 항목"** 클릭
2. 다음 항목들을 설정:

| 항목 | 설정 | 설명 |
|------|------|------|
| **닉네임** | 필수 동의 또는 선택 동의 | 사용자 이름으로 사용 |
| **프로필 사진** | 선택 동의 | 프로필 이미지 |
| **카카오계정(이메일)** | 선택 동의 (심사 필요) | 현재는 미사용 가능 |

**참고**:
- 이메일은 Kakao 비즈니스 인증이 필요하므로, 현재는 **닉네임만 사용**
- AI Park는 이메일 없이도 `kakao_{user_id}@kakao.temp` 형식으로 임시 이메일 생성

---

### 6단계: REST API 키 확인

1. **"앱 설정" → "앱 키"** 메뉴 클릭
2. **REST API 키** 복사
   - 예: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
3. 이 값을 나중에 **KAKAO_CLIENT_ID**로 사용

---

## 🔧 Vercel 환경 변수 설정

Kakao Console 설정 완료 후, Vercel에도 환경 변수를 설정해야 합니다.

### Vercel Dashboard 접속

1. **https://vercel.com/090723s-projects/aipark**
2. **Settings** → **Environment Variables** 클릭

### 환경 변수 확인/추가

다음 변수들이 **Production** 환경에 설정되어 있는지 확인:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `KAKAO_CLIENT_ID` | `<REST API 키>` | Kakao 앱 키 → 앱 설정 → 앱 키 |
| `KAKAO_CLIENT_SECRET` | `<Client Secret>` | 카카오 로그인 → 보안 → Client Secret |
| `NEXTAUTH_URL` | `https://aipark.vercel.app` | NextAuth 콜백 베이스 URL |
| `NEXTAUTH_SECRET` | `<랜덤 문자열>` | JWT 암호화 키 (32자 이상) |

**환경 변수 추가 방법**:
1. **Add New** 버튼 클릭
2. **Name**: 변수명 입력 (예: `KAKAO_CLIENT_ID`)
3. **Value**: 값 입력 (예: REST API 키)
4. **Environment**: **Production** 체크 ✅
5. **Save** 클릭

**⚠️ 중요**: 환경 변수 추가/수정 후 **반드시 Redeploy 실행**!

---

## 🔄 Redeploy 실행

환경 변수를 추가/수정한 후:

### 방법 1: Vercel Dashboard
1. **Deployments** 탭 클릭
2. 최신 배포의 **점 3개 (⋯)** 클릭
3. **Redeploy** 선택

### 방법 2: CLI
```bash
npx vercel --prod --force --yes
```

---

## 🧪 테스트

설정 완료 후 테스트:

1. **브라우저 캐시 클리어**
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`

2. **시크릿 모드**로 접속
   - https://aipark.vercel.app/login

3. **카카오 로그인 버튼** 클릭

4. **예상 흐름**:
   ✅ 카카오 로그인 페이지로 이동
   ✅ 동의 화면 (닉네임, 프로필 사진)
   ✅ AI Park 대시보드로 리다이렉트

---

## 🐛 문제 해결

### 여전히 KOE006 에러가 발생한다면?

**1. Redirect URI 재확인**
- Kakao Console에서 등록한 URI와 실제 콜백 URL이 **정확히 일치**하는지 확인
- 대소문자, `/` 슬래시, `http` vs `https` 모두 정확해야 함

**2. 브라우저 개발자 도구 확인**
```
F12 → Network 탭 → kakao 필터 → redirect_uri 파라미터 확인
```

**3. Vercel 환경 변수 재확인**
```bash
npx vercel env ls production | grep KAKAO
```

**4. 최신 배포 확인**
- Vercel Dashboard → Deployments
- 가장 최근 배포가 "Ready" 상태인지 확인

---

## 📋 완료 체크리스트

### Kakao Developers Console
- [ ] 카카오 로그인 활성화 `ON`
- [ ] Redirect URI 5개 모두 등록
- [ ] Client Secret 생성 및 활성화
- [ ] 동의 항목에서 닉네임 설정
- [ ] REST API 키 복사

### Vercel
- [ ] `KAKAO_CLIENT_ID` 설정 (Production)
- [ ] `KAKAO_CLIENT_SECRET` 설정 (Production)
- [ ] `NEXTAUTH_URL` = `https://aipark.vercel.app` (Production)
- [ ] `NEXTAUTH_SECRET` 설정 (Production)
- [ ] 환경 변수 수정 후 Redeploy 실행

### 테스트
- [ ] 브라우저 캐시 클리어
- [ ] 시크릿 모드로 로그인 테스트
- [ ] 카카오 로그인 정상 작동 확인
- [ ] 대시보드 접속 확인

---

## 🆘 추가 도움말

### Kakao Developers 문서
- https://developers.kakao.com/docs/latest/ko/kakaologin/common

### NextAuth Kakao Provider
- https://next-auth.js.org/providers/kakao

### AI Park 관련 파일
- `/lib/auth/config.ts` - NextAuth 설정
- `/app/api/auth/[...nextauth]/route.ts` - NextAuth API 라우트
- `/app/login/LoginClient.tsx` - 로그인 UI

---

**작성자**: Claude (SuperClaude Framework)
**작성일**: 2025-11-09
**상태**: 설정 대기 중
