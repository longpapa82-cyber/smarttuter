# SmartTuter 배포 URL 가이드

## ✅ 올바른 Production URL

**메인 URL (공개 접속 가능):**
```
https://smarttuter.vercel.app
```

### 주요 페이지:
- 메인 페이지: https://smarttuter.vercel.app
- 온보딩: https://smarttuter.vercel.app/onboarding
- 대시보드: https://smarttuter.vercel.app/dashboard
- 영어 튜터: https://smarttuter.vercel.app/tutor/english
- 수학 튜터: https://smarttuter.vercel.app/tutor/math
- 퀴즈: https://smarttuter.vercel.app/quiz
- 플래시카드: https://smarttuter.vercel.app/flashcards
- 학습 분석: https://smarttuter.vercel.app/analytics

## ⚠️ Preview URLs (인증 필요)

Preview 배포 URL들은 Vercel 팀 인증이 필요합니다:
- `smarttuter-[hash]-090723s-projects.vercel.app` 형식의 URL들
- 이 URL들은 개발/테스트용이며 공개 접속이 제한됨

## 🔧 최신 배포 확인

최신 코드가 반영된 버전을 확인하려면:

```bash
# 최신 배포 확인
vercel ls --scope 090723s-projects

# Production URL 상태 확인
curl -I https://smarttuter.vercel.app
```

## 📝 중요 사항

1. **항상 `https://smarttuter.vercel.app` 사용**
   - 이 URL은 공개적으로 접근 가능
   - 인증이 필요 없음
   - 최신 production 배포가 자동으로 반영됨

2. **Preview URL은 사용하지 마세요**
   - Preview URL은 Vercel 팀 멤버만 접근 가능
   - 일반 사용자에게는 "Authenticating..." 페이지가 표시됨
   - 500 에러처럼 보일 수 있지만 실제로는 인증 문제

## 🚀 최신 변경사항 (2025-10-26)

### Phase 10: Voice Tutor API 구현
- ✅ 서버 사이드 API 라우트 완료
- ✅ `/api/tutor/start`, `/api/tutor/message`, `/api/tutor/hint`, `/api/tutor/problem`
- ✅ 500 에러 완전 해결 (Anthropic client 서버 사이드 전용)
- ✅ 학습 분석 버튼 여백 추가 (`mt-6` 클래스)

### 테스트 방법:
```
1. https://smarttuter.vercel.app 접속
2. 온보딩 완료 (이름 입력 → 학교급 선택)
3. 대시보드에서 영어/수학 튜터 클릭
4. Voice Tutor 인터페이스 정상 작동 확인
```

---

**마지막 업데이트**: 2025-10-26 22:10 KST
**최신 커밋**: e5b9145 (feat: Implement server-side Voice Tutor API routes)
