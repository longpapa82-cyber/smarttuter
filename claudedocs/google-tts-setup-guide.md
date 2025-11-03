# 🎙️ Google Cloud TTS 설정 가이드

## 📋 개요

SmartTuter는 이제 Google Cloud Text-to-Speech API를 사용하여 자연스러운 한국어 음성을 제공합니다.
- **무료 티어**: 월 4백만 자 (튜터 서비스로 충분)
- **음성 품질**: Neural2 한국어 음성 (사람과 거의 구분 불가)
- **자동 폴백**: Google TTS가 없으면 Web Speech API로 자동 전환

## 🚀 빠른 시작

### 1. Google Cloud 프로젝트 생성 (5분)

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "Text-to-Speech API" 검색 및 활성화

### 2. API 키 발급 (5분)

1. [API 자격 증명 페이지](https://console.cloud.google.com/apis/credentials) 이동
2. "+ 사용자 인증 정보 만들기" → "API 키" 선택
3. API 키 복사

### 3. 환경 변수 설정 (1분)

프로젝트 루트에 `.env.local` 파일 생성:

```bash
# .env.local
GOOGLE_CLOUD_API_KEY=your_api_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
```

### 4. 테스트 (1분)

```bash
npm run dev
```

브라우저에서 http://localhost:3000/tutor/english 또는 /tutor/math 접속

콘솔에서 다음 메시지를 확인:
- ✅ `Using Google Cloud TTS (Neural2)` - 성공!
- ⚠️ `Google TTS unavailable, falling back to Web Speech API` - API 키 확인 필요

## 🎯 학년별 음성 맞춤

### 초등학교
- **속도**: 15% 느림 (rate: 0.85)
- **피치**: +2 반음 (더 높고 친근한 음성)
- **강조**: 적절한 감정 표현
- **예시**: "안녕! 😊 영어 튜터예요!"

### 중학교
- **속도**: 5% 느림 (rate: 0.95)
- **피치**: +1 반음 (약간 높은 음성)
- **예시**: "안녕하세요! 👋 영어 튜터입니다!"

### 고등학교
- **속도**: 정상 (rate: 1.0)
- **피치**: 정상 (자연스러운 음성)
- **예시**: "안녕하세요! 영어 튜터입니다."

### 대학교
- **속도**: 정상
- **피치**: 정상
- **톤**: 전문적이고 학술적
- **예시**: "안녕하세요. 영어 튜터입니다."

## 📊 사용량 모니터링

### 예상 월간 사용량 (100명 기준)
```
평균 세션: 10분
평균 AI 응답: 100자/응답
응답 수/세션: 10개
월 세션/사용자: 20회

총 문자 수 = 100명 × 20세션 × 10응답 × 100자
           = 2,000,000자/월 (Google 무료 티어 범위 내)
```

### 사용량 확인
1. [Google Cloud Console](https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/metrics)
2. "Text-to-Speech API" 메트릭 확인
3. 월별 문자 수 모니터링

## 🔧 문제 해결

### "Google TTS unavailable, falling back"
**원인**: API 키가 설정되지 않음
**해결**:
1. `.env.local` 파일 확인
2. `GOOGLE_CLOUD_API_KEY=실제_API_키` 설정
3. 서버 재시작 (`npm run dev`)

### "Failed to generate speech"
**원인**: API 키가 잘못됨 또는 할당량 초과
**해결**:
1. API 키 재확인
2. [할당량 페이지](https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/quotas)에서 사용량 확인
3. 필요시 청구 활성화 (무료 티어는 청구 없이 사용 가능)

### 음성이 재생되지 않음
**원인**: 브라우저 자동재생 정책
**해결**:
1. 페이지를 먼저 클릭하여 사용자 상호작용 발생
2. 음성 설정에서 "자동 재생" 활성화 확인
3. 브라우저 콘솔에서 오류 메시지 확인

## 🎨 커스터마이징

### 음성 변경
[`app/api/tts/google/route.ts:117`](../app/api/tts/google/route.ts#L117)에서 음성 선택:

```typescript
function selectVoice(language: string, gradeLevel: string) {
  if (isKorean) {
    return {
      languageCode: 'ko-KR',
      name: 'ko-KR-Neural2-A', // 여성 음성
      // name: 'ko-KR-Neural2-C', // 남성 음성으로 변경 가능
    };
  }
}
```

### 속도/피치 조절
[`app/api/tts/google/route.ts:129-143`](../app/api/tts/google/route.ts#L129-L143)에서 조절:

```typescript
function getSpeakingRate(gradeLevel: string): number {
  if (isElementary) return 0.85; // 0.25 ~ 4.0
  return 1.0;
}

function getPitch(gradeLevel: string): number {
  if (isElementary) return 2.0; // -20.0 ~ 20.0
  return 0.0;
}
```

## 📚 참고 자료

- [Google Cloud TTS 공식 문서](https://cloud.google.com/text-to-speech/docs)
- [한국어 Neural2 음성 목록](https://cloud.google.com/text-to-speech/docs/voices)
- [SSML 레퍼런스](https://cloud.google.com/text-to-speech/docs/ssml)
- [가격 정책](https://cloud.google.com/text-to-speech/pricing)

## ✨ 기술 스택

- **Google Cloud TTS**: Neural2 한국어 음성
- **자동 폴백**: Web Speech API
- **SSML 지원**: 학년별 맞춤 음성
- **스트리밍**: MP3 오디오 스트리밍
- **캐싱**: 동일 텍스트 재사용 최적화 (향후 추가 예정)

## 🎯 다음 단계

### 즉시 가능
- ✅ Google Cloud TTS 통합 완료
- ✅ 학년별 SSML 맞춤 완료
- ✅ 자동 폴백 시스템 완료

### 선택적 향상 (나중에 추가 가능)
- ⏳ Chatterbox 로컬 백업 시스템 (무제한 무료)
- ⏳ 인텔리전트 캐싱 (동일 텍스트 재사용)
- ⏳ Voice cloning (선생님 목소리 복제)
- ⏳ 사용량 모니터링 대시보드

## 💰 비용

**현재**: $0/월 (Google 무료 티어 범위 내)
**향후 확장**: 사용자 500명까지 무료 범위 유지 가능
