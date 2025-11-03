# 🎙️ 자연스러운 음성 개선 계획

## 📊 조사 결과 요약

### 전 세계 최고의 무료 TTS 솔루션 (2025)

#### **Tier 1: 최고 품질 (무료 제한 있음)**
1. **Google Cloud TTS** ⭐ 추천
   - 무료: 월 4백만 자 (Standard), 1백만 자 (Neural2/WaveNet)
   - 품질: 매우 자연스러움
   - 언어: 한국어/영어 완벽 지원
   - 장점: 기업급 안정성, 다양한 음성, SSML 지원

2. **ElevenLabs**
   - 무료: 월 10,000자
   - 품질: 최고 수준의 자연스러움
   - 언어: 한국어/영어 지원 (29개 언어)
   - 단점: 제한이 너무 적음 (튜터 서비스에는 부족)

#### **Tier 2: 오픈소스 로컬 실행 (완전 무료)**
1. **Chatterbox** ⭐⭐ 최고 추천
   - 무료: 100% 무료, 사용량 제한 없음
   - 품질: ElevenLabs와 동등 (블라인드 테스트 63.8% 선호)
   - 언어: 영어 최고, 다국어 지원
   - 장점: 5-10초 음성으로 voice cloning 가능
   - MIT 라이선스 (상업적 사용 가능)

2. **Kokoro**
   - 무료: 100% 무료, 사용량 제한 없음
   - 품질: 매우 자연스러움
   - 크기: 82M 파라미터 (경량)
   - 장점: 저사양에서도 빠른 실행

3. **GPT-SoVITS**
   - 무료: 100% 무료
   - 품질: 우수
   - 장점: 감정 제어, voice cloning

#### **Tier 3: 클라우드 무료 티어**
1. **TTSMaker**
   - 무료: 영구 무료, 제한 없음
   - 품질: 양호
   - API: 제공
   - 상업적 사용: 무료

2. **PlayHT**
   - 무료: 월 12,500자
   - 품질: 800+ AI voices
   - 단점: 제한 적음

---

## 🎯 권장 솔루션

### **최종 추천: 3단계 하이브리드 전략**

```
우선순위 1: Google Cloud TTS (기본)
         ↓ (월 한도 초과 시)
우선순위 2: Chatterbox (로컬 백업)
         ↓ (특수 케이스)
우선순위 3: 브라우저 Web Speech API (폴백)
```

---

## 📋 상세 구현 계획

### **Phase 1: Google Cloud TTS 통합** (1-2일)

#### 장점:
- ✅ 월 4백만 자 무료 (튜터 서비스로 충분)
- ✅ 한국어 Neural2 음성 (가장 자연스러움)
- ✅ SSML 지원 (감정, 속도, 피치 조절)
- ✅ 스트리밍 지원
- ✅ 기업급 안정성

#### 구현 단계:
1. **Google Cloud 프로젝트 설정**
   ```bash
   # Google Cloud Console에서
   1. 프로젝트 생성
   2. Text-to-Speech API 활성화
   3. API 키 또는 서비스 계정 생성
   4. 무료 티어 한도 확인
   ```

2. **서버 측 API 구현**
   ```typescript
   // app/api/tts/google/route.ts
   - Google TTS Node.js SDK 설치
   - SSML 기반 음성 합성
   - 한국어 Neural2 음성 사용
   - 캐싱 전략 (동일 텍스트 재사용)
   ```

3. **클라이언트 통합**
   ```typescript
   // hooks/useGoogleTTS.ts
   - API 호출
   - 오디오 재생
   - 에러 처리
   - Web Speech API 폴백
   ```

4. **SSML 최적화**
   ```xml
   <speak>
     <prosody rate="medium" pitch="+2st">
       <emphasis level="moderate">
         안녕하세요! 수학 튜터입니다!
       </emphasis>
     </prosody>
     <break time="300ms"/>
     오늘은 무엇을 배울까요?
   </speak>
   ```

#### 예상 비용: $0 (월 4백만 자 이내)

---

### **Phase 2: Chatterbox 로컬 백업** (2-3일)

#### 장점:
- ✅ 100% 무료, 무제한
- ✅ ElevenLabs 수준 품질
- ✅ Voice cloning (선생님 음성 복제 가능)
- ✅ 프라이버시 (모든 처리가 로컬)
- ✅ 오프라인 동작

#### 구현 단계:
1. **Docker 컨테이너 설정**
   ```dockerfile
   # Dockerfile.chatterbox
   FROM python:3.10-slim
   RUN pip install chatterbox-ai
   EXPOSE 5000
   CMD ["python", "tts_server.py"]
   ```

2. **마이크로서비스 구축**
   ```python
   # tts_server.py
   from chatterbox import Chatterbox
   from flask import Flask, request, send_file

   app = Flask(__name__)
   tts = Chatterbox()

   @app.route('/tts', methods=['POST'])
   def synthesize():
       text = request.json['text']
       audio = tts.speak(text, voice='korean_female')
       return send_file(audio, mimetype='audio/wav')
   ```

3. **Next.js API 통합**
   ```typescript
   // app/api/tts/chatterbox/route.ts
   - Docker 컨테이너로 요청 전달
   - 음성 파일 스트리밍
   - 캐싱
   ```

#### 배포 옵션:
- **로컬 개발**: Docker Desktop
- **프로덕션**: Railway.app (무료 티어) 또는 Fly.io

---

### **Phase 3: 스마트 음성 관리 시스템** (1일)

#### 기능:
1. **자동 우선순위 전환**
   ```typescript
   class SmartTTS {
     async speak(text: string) {
       // 1순위: Google Cloud TTS
       try {
         if (!this.isQuotaExceeded()) {
           return await this.googleTTS(text);
         }
       } catch (error) {
         console.log('Google TTS 실패, 백업으로 전환');
       }

       // 2순위: Chatterbox
       try {
         return await this.chatterboxTTS(text);
       } catch (error) {
         console.log('Chatterbox 실패, 폴백으로 전환');
       }

       // 3순위: Web Speech API
       return this.webSpeechTTS(text);
     }
   }
   ```

2. **지능형 캐싱**
   ```typescript
   - 동일 텍스트 캐싱 (Redis/localStorage)
   - 자주 사용되는 인사말 미리 생성
   - 학년별 격려 메시지 캐싱
   ```

3. **사용량 모니터링**
   ```typescript
   - Google Cloud TTS 월별 사용량 추적
   - 90% 도달 시 자동으로 Chatterbox 전환
   - 대시보드에 사용량 표시
   ```

---

## 🔧 기술 스택

### **Google Cloud TTS**
```json
{
  "dependencies": {
    "@google-cloud/text-to-speech": "^5.0.0"
  }
}
```

### **Chatterbox (선택사항)**
```json
{
  "dockerfiles": ["Dockerfile.chatterbox"],
  "python_deps": ["chatterbox-ai", "flask"]
}
```

### **클라이언트**
```typescript
// 기존 useSpeechSynthesis 훅 확장
- Google TTS 우선 사용
- 캐싱 로직 추가
- 에러 처리 강화
```

---

## 📈 예상 품질 개선

### Before (현재 Web Speech API):
- 품질: ⭐⭐⭐ (3/5)
- 자연스러움: 로봇 같은 음성
- 감정: 없음
- 한국어: 부정확한 발음

### After (Google Cloud Neural2):
- 품질: ⭐⭐⭐⭐⭐ (5/5)
- 자연스러움: 사람과 거의 구분 불가
- 감정: SSML로 조절 가능
- 한국어: 완벽한 발음

### After (Chatterbox - 백업):
- 품질: ⭐⭐⭐⭐⭐ (5/5)
- 자연스러움: ElevenLabs 수준
- Voice cloning: 선생님 목소리 복제 가능
- 무제한: 비용 걱정 없음

---

## 💰 비용 분석

### **월 예상 사용량**
```
사용자 100명 기준:
- 평균 세션: 10분
- 평균 AI 응답: 100자/응답
- 응답 수/세션: 10개
- 월 세션/사용자: 20회

총 문자 수 = 100명 × 20세션 × 10응답 × 100자
           = 2,000,000자/월
```

### **비용**
- Google Cloud TTS: **$0** (4백만 자 무료 범위 내)
- Chatterbox: **$0** (완전 무료)
- Web Speech API: **$0** (브라우저 기본 기능)

**총 비용: $0/월** ✅

---

## 🚀 구현 우선순위

### **즉시 구현 (1-2일):**
1. ✅ Google Cloud 프로젝트 설정
2. ✅ Text-to-Speech API 활성화
3. ✅ 서버 API 엔드포인트 생성
4. ✅ 클라이언트 훅 수정
5. ✅ 한국어 Neural2 음성 적용

### **단기 구현 (3-5일):**
1. ⏳ SSML 최적화 (감정, 속도)
2. ⏳ 인텔리전트 캐싱
3. ⏳ 사용량 모니터링
4. ⏳ 에러 처리 강화

### **중기 구현 (1-2주, 선택사항):**
1. ⏳ Chatterbox Docker 설정
2. ⏳ 마이크로서비스 배포
3. ⏳ Voice cloning (선생님 목소리)
4. ⏳ 자동 우선순위 전환

---

## 🎯 성공 지표

### **품질 목표:**
- ✅ 사용자 만족도: 90% 이상
- ✅ 발음 정확도: 95% 이상
- ✅ 자연스러움: "사람 같다" 평가 80% 이상

### **기술 목표:**
- ✅ 응답 시간: < 1초
- ✅ 에러율: < 1%
- ✅ 월 비용: $0
- ✅ 가동률: 99.9%

---

## 📝 다음 단계

1. **Google Cloud 계정 생성** (5분)
2. **API 키 발급** (5분)
3. **코드 구현** (2-3시간)
4. **테스트** (1시간)
5. **배포** (30분)

**총 소요 시간: 약 4-5시간**

---

## 🔗 참고 자료

- [Google Cloud TTS 문서](https://cloud.google.com/text-to-speech/docs)
- [SSML 레퍼런스](https://cloud.google.com/text-to-speech/docs/ssml)
- [Chatterbox GitHub](https://github.com/resemble-ai/chatterbox)
- [한국어 Neural2 음성 목록](https://cloud.google.com/text-to-speech/docs/voices)

---

## ✨ 핵심 요약

**최적 솔루션: Google Cloud TTS (Neural2 한국어 음성)**

**이유:**
1. ✅ 완전 무료 (월 4백만 자)
2. ✅ 최고 품질 (사람과 거의 구분 불가)
3. ✅ 한국어 완벽 지원
4. ✅ SSML로 감정 표현 가능
5. ✅ 기업급 안정성
6. ✅ 구현 간단 (4-5시간)
7. ✅ 유지보수 필요 없음

**백업: Chatterbox (선택사항, 나중에 추가 가능)**
- 무제한 무료
- Voice cloning
- 로컬 실행

**결론: Google Cloud TTS 우선 구현 후, 필요시 Chatterbox 추가** ✅
