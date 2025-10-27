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

## 🚀 최신 변경사항 (2025-10-27)

### Phase 10: Voice Tutor Hydration 오류 해결
- ✅ React Hydration Error (#185) 근본 원인 확인 및 해결
- ✅ VoiceTutorInterface.tsx SSR 안전성 개선
- ✅ `typeof window === 'undefined'` 체크 추가
- ✅ useEffect 및 speakText 함수에 클라이언트 사이드 검증 적용
- ✅ 500 에러 완전 해결

### 기술적 수정사항:
- **문제**: 서버 사이드 렌더링 중 브라우저 전용 API(window.speechSynthesis) 접근으로 인한 hydration 불일치
- **해결**: 모든 브라우저 API 접근 전 클라이언트 환경 검증
- **파일**: [components/voice-tutor/VoiceTutorInterface.tsx](../components/voice-tutor/VoiceTutorInterface.tsx)

### 테스트 방법:
```
1. https://smarttuter.vercel.app 접속
2. 온보딩 완료 (이름 입력 → 학교급 선택)
3. 대시보드에서 영어/수학 튜터 클릭
4. Voice Tutor 인터페이스 정상 작동 확인
5. 브라우저 콘솔에서 500 에러 또는 Hydration 에러 없음 확인
```

### 캐시 초기화 방법:
브라우저 하드 리프레시로 최신 버전 확인:
- **Windows/Linux**: Ctrl + Shift + R
- **Mac**: Cmd + Shift + R

---

**마지막 업데이트**: 2025-10-27 16:14 KST
**최신 커밋**: 741dc75 (fix: Fix Voice Tutor hydration error and client-side rendering issues)
**배포 상태**: ✅ Ready (Production)
