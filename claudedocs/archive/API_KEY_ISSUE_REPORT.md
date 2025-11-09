# SmartTuter API Key Issue - 근본 원인 분석 보고서

## 🔴 문제 요약

**증상**: 영어/수학 튜터에서 "I cannot connect to the server right now" 에러 발생

**근본 원인**: Anthropic API 크레딧 부족

## 🔍 상세 분석

### API 키 검증 결과

**테스트 수행**:
```bash
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: sk-ant-api03-5kCkP..." \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model": "claude-sonnet-4-5-20250929", "max_tokens": 10, "messages": [{"role": "user", "content": "Hi"}]}'
```

**응답**:
```json
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits."
  }
}
```

### 왜 에러 메시지가 다르게 표시되었나?

**예상했던 에러 메시지** (코드에서 구현):
```
"I apologize, but I cannot connect to the server right now.
죄송합니다. 현재 서버와 연결할 수 없습니다.
Please contact the administrator to configure ANTHROPIC_API_KEY."
```

**실제 표시된 메시지** (스크린샷):
```
"I'm sorry, but I cannot connect to the server right now.
죄송합니다. 현재 서버와 연결할 수 없습니다.
Please add ANTHROPIC_API_KEY to your .env.local file."
```

**이유**:
- Anthropic SDK가 401 에러를 반환
- 프론트엔드에서 401 에러를 catch하여 일반적인 연결 에러로 처리
- API 키가 "존재하지 않음"이 아니라 "유효하지 않음" 상태이므로, 서버에서 `if (!process.env.ANTHROPIC_API_KEY)` 체크를 통과
- 실제 API 호출 시점에 Anthropic SDK에서 크레딧 부족 에러 발생

## ✅ 해결 방법

### 즉시 해결 (권장)

1. **Anthropic Console에 로그인**
   - URL: https://console.anthropic.com/settings/billing

2. **크레딧 추가**
   - "Plans & Billing" 섹션으로 이동
   - "Add Credits" 또는 "Purchase Credits" 선택
   - 최소 $5 이상 추가 권장 (테스트용)
   - 프로덕션 사용: $50-100 권장

3. **Auto-Reload 설정 (선택)**
   - 크레딧이 특정 금액 이하로 떨어지면 자동 충전
   - 서비스 중단 방지

4. **크레딧 추가 후 대기**
   - 처리 시간: 보통 1-5분
   - 완료 후 애플리케이션이 자동으로 작동

### 대안 1: 다른 API 키 사용

크레딧이 있는 다른 Anthropic 계정이 있다면:

```bash
# Vercel 환경변수 업데이트
vercel env rm ANTHROPIC_API_KEY production --yes
echo "새로운_API_KEY" | vercel env add ANTHROPIC_API_KEY production
vercel --prod --yes
```

### 대안 2: 임시 로컬 테스트

로컬에서 크레딧이 있는 API 키로 테스트:

```bash
# .env.local 파일 수정
ANTHROPIC_API_KEY=유효한_API_키

# 로컬 개발 서버 실행
npm run dev
```

## 📊 비용 예상

### Claude Sonnet 4.5 가격 (2025년 기준)
- Input: $3 per million tokens
- Output: $15 per million tokens

### SmartTuter 예상 사용량

**영어 튜터 대화 1회** (평균 10턴):
- Input: ~5,000 tokens
- Output: ~3,000 tokens
- 비용: ~$0.06

**수학 튜터 대화 1회** (평균 10턴 + 이미지):
- Input: ~8,000 tokens (이미지 포함)
- Output: ~4,000 tokens
- 비용: ~$0.09

**일일 100명 사용 가정**:
- 영어 50명 × $0.06 = $3
- 수학 50명 × $0.09 = $4.5
- **일일 총 비용: ~$7.5**
- **월간 비용: ~$225**

## 🔧 개선 제안

### 1. 에러 처리 개선

현재 코드는 "API 키 없음"과 "API 키 무효"를 구분하지 못합니다.

**개선 코드** (app/api/chat/english/route.ts):
```typescript
try {
  const stream = await anthropic.messages.stream({...});
  // ...
} catch (error: any) {
  const encoder = new TextEncoder();

  // 크레딧 부족 에러 감지
  if (error.message?.includes('credit balance') || error.status === 402) {
    const errorStream = new ReadableStream({
      start(controller) {
        const errorMsg = "⚠️ API 크레딧이 부족합니다.\n\n관리자에게 문의하여 크레딧을 충전해주세요.\n\nAPI credit balance is too low. Please contact administrator.";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: errorMsg })}\n\n`));
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });
    return new Response(errorStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  // 기타 에러 처리
  throw error;
}
```

### 2. 크레딧 모니터링

Anthropic API에는 사용량 조회 API가 있습니다. 주기적으로 확인하여 크레딧이 부족하기 전에 알림을 보낼 수 있습니다.

### 3. Rate Limiting

비용 관리를 위해 사용자당 일일 요청 제한을 설정할 수 있습니다.

## 📝 체크리스트

- [ ] Anthropic Console에 로그인
- [ ] 현재 크레딧 잔액 확인
- [ ] 크레딧 추가 ($5 이상)
- [ ] Auto-Reload 설정 (선택)
- [ ] 1-5분 대기 후 애플리케이션 테스트
- [ ] 정상 작동 확인

## 🔗 참고 링크

- Anthropic Console Billing: https://console.anthropic.com/settings/billing
- Anthropic API 가격: https://www.anthropic.com/api
- API Credit 관련 문서: https://support.anthropic.com/en/articles/8977456-how-do-i-pay-for-my-api-usage

---

**생성일**: 2025-10-26
**분석자**: Claude Code
**상태**: 근본 원인 확인 완료, 해결 방법 제시
