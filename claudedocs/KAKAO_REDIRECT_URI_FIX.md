# Kakao OAuth Redirect URI 긴급 수정 가이드

생성일: 2025-11-10 10:27 KST

## 🚨 문제 원인 확인

**최신 배포 URL**: `https://aipark-6vc6igft9-090723s-projects.vercel.app`

이 URL의 Redirect URI가 Kakao Console에 **등록되어 있지 않습니다**.

## ✅ 즉시 조치사항

### Kakao Developers Console에 Redirect URI 추가

1. **Kakao Developers Console 접속**
   - URL: https://developers.kakao.com/console/app/1331312

2. **앱 설정 → 카카오 로그인 → Redirect URI**
   - "Redirect URI 등록" 버튼 클릭

3. **다음 URI 추가**
   ```
   https://aipark-6vc6igft9-090723s-projects.vercel.app/api/auth/callback/kakao
   ```

4. **저장** 버튼 클릭

## 📝 현재 등록된 Redirect URIs (예상)

기존에 등록된 URIs:
1. `https://aipark.vercel.app/api/auth/callback/kakao`
2. `https://aipark-090723s-projects.vercel.app/api/auth/callback/kakao`
3. `https://aipark-git-main-090723s-projects.vercel.app/api/auth/callback/kakao`
4. `https://aipark-longpapa82-7861-090723s-projects.vercel.app/api/auth/callback/kakao`
5. `https://aipark-e5avqf4cf-090723s-projects.vercel.app/api/auth/callback/kakao`

## ➕ 추가해야 할 URI

**신규 배포 URL**:
```
https://aipark-6vc6igft9-090723s-projects.vercel.app/api/auth/callback/kakao
```

## 🔍 왜 이런 문제가 발생하나요?

Vercel은 각 배포마다 고유한 URL을 생성합니다:
- `aipark-[고유ID]-090723s-projects.vercel.app` 형식
- 새로 배포할 때마다 고유ID가 바뀝니다
- Kakao OAuth는 **정확히 등록된 Redirect URI**로만 콜백을 허용합니다

## 💡 근본적인 해결책

### Option 1: Production URL 고정 (권장)

Vercel의 프로덕션 도메인(`aipark.vercel.app`)을 사용하면 URL이 고정됩니다.

현재 Vercel 설정을 확인해야 합니다:
- Vercel Dashboard → Project Settings → Domains
- `aipark.vercel.app`이 Production 도메인으로 설정되어 있는지 확인

### Option 2: 와일드카드 사용 (Kakao 미지원)

Kakao는 와일드카드 Redirect URI를 지원하지 않습니다.
❌ `https://*.vercel.app/api/auth/callback/kakao` (불가능)

### Option 3: 모든 배포 URL 등록

매 배포마다 새로운 URL을 Kakao Console에 추가해야 합니다.
⚠️ 번거롭고 실수하기 쉽습니다.

## 🎯 추천 해결 방법

1. **즉시**: 위의 새 URL을 Kakao Console에 추가
2. **장기적**: Vercel 도메인 설정 확인 및 고정

## ✅ 추가 후 테스트

1. Kakao Console에 URI 추가 후 **저장**
2. 시크릿 모드 브라우저 열기
3. https://aipark.vercel.app/login 접속
4. "카카오로 계속하기" 클릭
5. 정상 로그인 확인

## 📊 참고: Vercel 도메인 구조

```
Production (고정):
└─ aipark.vercel.app ✅ 항상 동일

Deployment Preview (변동):
├─ aipark-[random]-090723s-projects.vercel.app ⚠️ 매번 변경
├─ aipark-git-[branch]-090723s-projects.vercel.app
└─ aipark-[username]-090723s-projects.vercel.app
```

**핵심**: Production URL(`aipark.vercel.app`)만 사용하면 Redirect URI 문제가 없습니다!
