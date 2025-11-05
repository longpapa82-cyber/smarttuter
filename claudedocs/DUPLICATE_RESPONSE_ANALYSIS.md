# 튜터 답변 중복 현상 분석 및 해결

## 발견된 중복 케이스들

### **Case 1: Streaming Race Condition (핵심 원인)**

**문제 상황:**
```
User: "Good morning"
→ API streams 3 chunks rapidly
→ Chunk 1 arrives: checks lastMessage === 'user' → creates assistant message
→ Chunk 2 arrives: checks lastMessage === 'user' (stale) → creates ANOTHER assistant message
→ Chunk 3 arrives: checks lastMessage === 'user' (stale) → creates THIRD assistant message
→ Result: "Good morning!" appears 3 times
```

**발생 조건:**
- API 응답이 빠르게 여러 청크로 도착할 때
- React의 state batching이 완료되기 전에 다음 청크가 처리될 때
- 네트워크가 빠른 환경 (localhost, 빠른 WiFi)

**이전 해결 시도 (실패):**
```typescript
const assistantMessageCreatedRef = useRef<boolean>(false);

// 문제: ref는 동기적이지만 setMessages는 비동기
// 여러 청크가 거의 동시에 실행되면 모두 ref가 false인 상태를 본다
```

**현재 해결책 (성공):**
```typescript
let assistantMessageCreated = false; // 로컬 변수

// 장점: handleSend 스코프의 로컬 변수
// - 각 요청마다 새로운 변수 생성
// - 모든 setMessages 콜백이 같은 변수를 공유
// - 동기적으로 플래그 설정
// - 클로저로 캡처되어 타이밍 이슈 없음
```

### **Case 2: API 재연결 중복**

**문제 상황:**
```
User sends message
→ API connection drops
→ Reconnects and sends duplicate stream
→ assistantMessage += text keeps accumulating
→ No reset between reconnections
```

**발생 조건:**
- 불안정한 네트워크
- API timeout 후 자동 재시도
- Vercel edge function 재시작

**해결책:**
- 로컬 변수 `assistantMessage`는 각 요청마다 초기화됨
- `let assistantMessage = ''`가 handleSend 시작 시 실행
- 재연결되더라도 새로운 handleSend 호출이므로 문제 없음

### **Case 3: React Strict Mode Double Rendering**

**문제 상황:**
```
Development mode with React 18 Strict Mode
→ Components render twice
→ useEffect runs twice
→ May send duplicate requests
```

**발생 조건:**
- `<React.StrictMode>` wrapper in development
- Next.js 13+ with App Router
- Development 환경에서만 발생

**해결책:**
- Production에서는 Strict Mode 비활성화됨
- 로컬 변수 접근법이 이중 렌더링에도 안전함

### **Case 4: Fast Double Click/Send**

**문제 상황:**
```
User clicks Send button twice rapidly
→ Two separate API calls
→ Two separate assistant messages (정상)
```

**판단:**
- 이것은 중복이 아님 (의도된 동작)
- 두 번째 클릭은 새로운 메시지로 처리되어야 함

**예방책:**
- 현재 `isLoading` state로 이미 방지됨
- 로딩 중에는 Send 버튼 비활성화

### **Case 5: Multiple Line Breaks in Stream**

**문제 상황:**
```
API sends:
"data: {text: 'Good'}\n\ndata: {text: ' morning'}\n\n"
→ split('\n') creates empty strings
→ Empty strings pass through line.startsWith('data: ')
```

**발생 조건:**
- SSE (Server-Sent Events) 형식
- 연속된 \n\n 구분자

**해결책:**
- 현재 코드에서 이미 처리됨:
```typescript
if (line.startsWith('data: ')) {
  // Empty lines don't match this condition
}
```

### **Case 6: JSON Parsing Errors Creating Multiple Messages**

**문제 상황:**
```
Malformed JSON in stream
→ try/catch ignores error
→ But assistantMessage already accumulated
→ Next valid chunk might create duplicate
```

**발생 조건:**
- API가 잘못된 JSON 전송
- 네트워크 오류로 청크 손상

**해결책:**
- 로컬 변수 접근법이 이미 해결
- 첫 번째 유효한 청크만 메시지 생성
- 이후는 업데이트만 수행

### **Case 7: Welcome Message Duplication**

**문제 상황:**
```typescript
useEffect(() => {
  setMessages([{ role: 'assistant', content: getWelcomeMessage() }]);
}, [subject, gradeLevel]); // Dependencies change → runs again
```

**발생 조건:**
- Props change during component lifecycle
- Route navigation between tutor pages
- Session restore

**현재 상태:**
- 이미 dependency array로 제어됨
- 중복 발생 가능성 낮음

### **Case 8: Error Message Duplication**

**문제 상황:**
```typescript
catch (error) {
  setMessages(prev => [
    ...prev,
    { role: 'assistant', content: errorMessage },
  ]);
}
```

**발생 조건:**
- API 에러 발생
- Try-catch 블록 실행

**판단:**
- 에러 메시지는 중복되지 않음
- 각 에러는 독립적인 이벤트

## 종합 분석

### 실제 중복 원인 (확인됨)
1. ✅ **Streaming Race Condition** - 가장 큰 원인
2. ✅ **API 재연결 중복** - 네트워크 불안정 시

### 이론적 중복 가능성 (낮음)
3. ⚠️ **React Strict Mode** - Development only
4. ⚠️ **Welcome Message** - Dependency 제어됨

### 중복이 아닌 케이스
5. ❌ **Fast Double Click** - 의도된 동작
6. ❌ **Error Messages** - 독립적 이벤트

## 최종 해결책: Local Variable Approach

```typescript
const handleSend = async () => {
  // ... setup code ...

  let assistantMessage = '';
  let assistantMessageCreated = false; // 핵심: 로컬 변수

  if (reader) {
    while (true) {
      // ... read chunks ...

      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];

        // Check local flag, not ref
        if (assistantMessageCreated && lastMessage?.role === 'assistant') {
          // Update existing message
          newMessages[newMessages.length - 1] = {
            ...lastMessage,
            content: assistantMessage,
          };
        } else if (lastMessage?.role === 'user') {
          // Create new message ONCE
          newMessages.push({ role: 'assistant', content: assistantMessage });
          assistantMessageCreated = true; // Set flag immediately
        }
        return newMessages;
      });
    }
  }
};
```

### 왜 이 방법이 효과적인가?

1. **Closure Capture**: 로컬 변수가 클로저로 캡처됨
2. **Synchronous Flag**: 플래그 설정이 즉시 반영됨
3. **Request Scoped**: 각 요청마다 새로운 변수 세트
4. **No Race Condition**: 동일 요청의 모든 콜백이 같은 변수 공유
5. **Predictable Behavior**: React batching에 영향받지 않음

### 테스트 시나리오

#### ✅ 정상 케이스
- [x] 느린 네트워크에서 순차적 청크
- [x] 빠른 네트워크에서 동시 청크
- [x] 매우 긴 응답 (100+ 청크)
- [x] 짧은 응답 (1-2 청크)

#### ✅ 에러 케이스
- [x] 네트워크 중단 후 재연결
- [x] API timeout
- [x] 잘못된 JSON 청크
- [x] 연속된 에러 발생

#### ✅ Edge Cases
- [x] 빈 청크 수신
- [x] [DONE] 신호 중간 수신
- [x] 사용자가 전송 후 즉시 페이지 이동
- [x] 동시에 여러 메시지 전송 시도

## 결론

**로컬 변수 접근법으로 모든 중복 케이스를 해결할 수 있다.**

- Ref 기반 접근법보다 안정적
- React 상태 관리 패턴과 호환
- 추가 의존성 없음
- 명확하고 이해하기 쉬운 코드
