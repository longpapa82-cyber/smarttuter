# 온보딩 흐름 테스트 방법

## 🔄 최신 변경사항 적용 방법

변경사항이 GitHub에 푸시되었습니다 (Commit: `6752fe1`). 로컬 테스트를 위해:

### 1. 브라우저 캐시 및 상태 완전 정리

```javascript
// 브라우저 콘솔(F12)에서 실행:
localStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
console.log("✅ 모든 로컬 데이터 정리 완료");
```

### 2. 완전 새로고침
- Windows/Linux: `Ctrl + Shift + R` 또는 `Ctrl + F5`
- Mac: `Cmd + Shift + R`

### 3. 개발 서버 재시작 (선택사항)
```bash
# 터미널에서:
pkill -f "npm run dev"
rm -rf .next
npm run dev
```

## ✅ 정상 작동 흐름

### 신규 사용자 온보딩
```
1. 홈페이지 (/)
   ↓ [무료로 시작하기] 또는 [시작하기] 클릭

2. 로그인 페이지 (/login)
   ↓ 이메일 + 비밀번호 입력

3. 빠른 온보딩 (/onboarding/quick)
   ↓ Step 1: 학교급 선택 (초등/중등/고등/대학)
   ↓ Step 2: 과목 선택 (영어/수학/과학/사회)

4. 대시보드 (/dashboard) ✅
   - 로딩 중 표시
   - 프로필 로드
   - 대시보드 콘텐츠 표시
```

### 기존 사용자 (프로필 있음)
```
1. 홈페이지 (/)
   ↓ [무료로 시작하기] 클릭

2. 대시보드 (/dashboard) ✅ 직접 이동
```

## 🐛 문제 발생 시 확인사항

### "진행상황을 안전하게 저장하세요" 반복
**원인**: 이전 세션의 쿠키/localStorage 남아있음
**해결**: 위의 "브라우저 캐시 및 상태 완전 정리" 실행

### 무한 리다이렉트 루프
**원인**: Hot Reload가 최신 코드 반영 안 됨
**해결**:
1. 브라우저 완전 새로고침 (Shift + F5)
2. 개발 서버 재시작
3. 브라우저 완전 종료 후 재시작

### 대시보드 로딩 중 멈춤
**원인**: 프로필 API 응답 대기 중
**해결**:
1. F12 → Console 탭에서 에러 확인
2. Network 탭에서 `/api/user/profile` 요청 상태 확인
3. Redis 서버 정상 작동 확인 (Upstash 대시보드)

## 🧪 테스트 체크리스트

### 필수 테스트
- [ ] 신규 회원가입 → 온보딩 → 대시보드
- [ ] 로그아웃 → 재로그인 → 대시보드 (프로필 유지 확인)
- [ ] 학교급 변경 후 대시보드 접근
- [ ] 다양한 과목 선택 (영어, 수학, 과학, 사회)

### 추가 테스트
- [ ] 브라우저 새로고침 시 상태 유지
- [ ] 뒤로가기 버튼 동작
- [ ] 모바일 반응형 테스트
- [ ] 네트워크 느린 환경 테스트

## 📊 성공 지표

### 온보딩 완료 확인
```
브라우저 콘솔 로그:
✅ Guest mode - skipping profile
   OR
✅ 서버 프로필 저장 성공
✅ 프로필 확인 완료
✅ Dashboard initialized from database

서버 로그:
✅ User updated in Redis: [email]
✅ Profile saved for [email]: gradeLevel=[grade], subjects=[subject]
GET /dashboard 200
```

### 프로필 저장 확인
```javascript
// 브라우저 콘솔에서:
localStorage.getItem('aipark_user_profile')
// 결과: {"id":"user_xxx", "gradeLevel":"middle", ...}
```

## 🚀 프로덕션 배포 확인

Vercel 자동 배포 후 (약 2-3분):
1. https://smarttuter-[hash].vercel.app 접속
2. 새 계정으로 회원가입 테스트
3. 온보딩 → 대시보드 흐름 확인

## 📝 변경사항 요약

### Commit 6752fe1
**파일**: `app/onboarding/quick/page.tsx`

**변경내용**:
1. `gradeDetail` 자동 생성 로직 추가
2. 프로필 저장 확인 재시도 로직 추가 (최대 3회)
3. 대시보드 리다이렉트 타이밍 개선

**목적**:
- 대시보드가 "프로필 불완전"으로 판단하여 온보딩으로 돌려보내는 문제 해결
- `gradeLevel`과 `gradeDetail` 둘 다 존재해야 완전한 프로필로 인정

### 이전 Commit ea62030
**파일**: `app/dashboard/page.tsx`, `app/onboarding/page.tsx`

**변경내용**:
1. 모든 `/onboarding` 리다이렉트를 `/onboarding/quick`으로 변경
2. `/onboarding` 페이지 자동 리다이렉트 추가

**목적**: 6단계 온보딩 제거, 2단계 빠른 온보딩으로 통일

## 🔍 디버깅 팁

### 프로필 상태 확인
```javascript
// 브라우저 콘솔:
const profile = localStorage.getItem('aipark_user_profile');
console.log('Profile:', JSON.parse(profile));
```

### 쿠키 확인
```javascript
// 브라우저 콘솔:
document.cookie.split('; ').forEach(c => console.log(c));
```

### API 응답 확인
```javascript
// 브라우저 콘솔:
fetch('/api/user/profile')
  .then(r => r.json())
  .then(data => console.log('User profile:', data));
```

## 📞 문제 발생 시

1. **브라우저 콘솔 로그 확인** (F12 → Console)
2. **네트워크 탭 확인** (F12 → Network)
3. **개발 서버 로그 확인** (터미널)
4. **Redis 연결 확인** (Upstash 대시보드)

모든 로그와 에러 메시지를 첨부해서 문의해주세요.
