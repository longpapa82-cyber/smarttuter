# 튜터 중복 답변 디버깅 접근법

## 문제 현상
튜터가 한 번의 질문에 대해 2-3번 중복으로 답변하는 현상 발생

## 이전 해결 시도 (모두 실패)

### 시도 1: useRef 기반 플래그
```typescript
const assistantMessageCreatedRef = useRef<boolean>(false);
```
**문제점**: Ref는 동기적이지만 setMessages는 비동기라서 여러 청크가 동시에 ref를 false로 보게 됨

### 시도 2: 로컬 변수 + 플래그 체크
```typescript
let assistantMessageCreated = false;
if (assistantMessageCreated && lastMessage?.role === 'assistant') { ... }
```
**문제점**: 플래그는 즉시 업데이트되지만 `prev` state는 stale하여 조건이 맞지 않음

### 시도 3: State만 체크
```typescript
if (lastMessage && lastMessage.role === 'assistant') { ... }
```
**문제점**: 여전히 중복 발생 - 콘솔에서 "Created NEW assistant message" 확인됨

## 현재 디버깅 전략

### 추가한 로깅
1. **handleSubmit 진입점** (SimpleChatInterface.tsx:378)
   ```typescript
   console.log('🚀 ===== handleSubmit CALLED =====', {
     timestamp: new Date().toISOString(),
     messageText,
     inputValue: input,
     isLoading,
   });
   ```
   **목적**: handleSubmit이 여러 번 호출되는지 확인

2. **사용자 메시지 추가** (SimpleChatInterface.tsx:421)
   ```typescript
   console.log('📝 Adding user message to state:', {
     previousCount: messages.length,
     newCount: updatedMessages.length,
     userMessage: userMessage.substring(0, 50),
   });
   ```
   **목적**: 사용자 메시지가 제대로 한 번만 추가되는지 확인

3. **청크 수신** (SimpleChatInterface.tsx:477)
   ```typescript
   console.log(`📦 Chunk ${chunkCount} received:`, chunk.substring(0, 100));
   ```
   **목적**: API가 중복 스트림을 보내는지, 같은 청크를 여러 번 읽는지 확인

4. **기존 로깅** (SimpleChatInterface.tsx:478-502)
   - Before update: 업데이트 전 상태
   - Action: "Updated" 또는 "Created NEW"
   - After update: 업데이트 후 메시지 배열

## 가설 검증 단계

### Step 1: handleSubmit 호출 횟수 확인
- **기대**: 한 번의 입력에 한 번만 호출
- **로그**: "🚀 ===== handleSubmit CALLED =====" 개수 세기
- **결과**:
  - 1번 → 문제는 streaming 로직에 있음
  - 2번+ → 컴포넌트가 중복 호출되거나 이벤트 핸들러 문제

### Step 2: 청크 처리 확인
- **기대**: 청크마다 순차적으로 번호 증가
- **로그**: "📦 Chunk N received" 순서와 내용 확인
- **결과**:
  - 정상 순서 → 스트리밍은 정상, 문제는 setMessages 로직
  - 중복/뒤섞임 → API나 Reader 문제

### Step 3: 메시지 생성 시점 확인
- **기대**: "Created NEW" 한 번, 이후 모두 "Updated"
- **로그**: "Created NEW assistant message" 개수
- **결과**:
  - 1번 → 정상, 문제는 렌더링이나 다른 setMessages 호출
  - 2번+ → setMessages 조건 로직 문제 확인됨

### Step 4: 메시지 배열 상태 추적
- **기대**: newLength가 2 → 3 → 3 (user 1, assistant 1)
- **로그**: "After update" newLength 추적
- **결과**:
  - newLength: 2 → 3 → 3 → 정상
  - newLength: 2 → 3 → 4 → 중복 생성 확인

## 다음 단계

### 콘솔 로그 분석 후:
1. **handleSubmit 1회 + 청크 정상 + "Created NEW" 1회**
   → 다른 setMessages 호출 찾기 (line 199, 279, 594, 772)

2. **handleSubmit 1회 + 청크 정상 + "Created NEW" 2회+**
   → 조건 로직 재검토, React state batching 문제 확인

3. **handleSubmit 2회+**
   → 컴포넌트 마운트/언마운트, 이벤트 핸들러 중복 등록 확인

4. **청크 중복/비정상**
   → API 응답 확인, Reader 로직 확인

## 근본 원인 후보

### 가설 A: React State Batching 타이밍
여러 청크가 빠르게 도착할 때 React가 업데이트를 배치하기 전에 다음 청크가 도착하여, 여러 청크가 동시에 같은 `prev` 상태를 보게 됨.

**검증**: 청크 타이밍과 "Created NEW" 발생 횟수 비교

### 가설 B: 클로저 캡처 문제
`assistantMessage` 변수가 여러 setMessages 콜백에 다른 값으로 캡처되어, 각각 다른 메시지를 생성.

**검증**: assistantMessage 길이 변화 추적

### 가설 C: 다중 API 호출
handleSubmit이 여러 번 호출되거나, 다른 곳에서 setMessages를 호출하여 중복 메시지 생성.

**검증**: handleSubmit 호출 횟수, 다른 setMessages 위치 확인

## 테스트 시나리오
1. English tutor에 "Good morning" 입력
2. Math tutor에 "Good morning" 입력
3. Science/Social Studies tutor 테스트
4. 긴 답변 유도 (복잡한 질문)
5. 짧은 답변 유도 (간단한 질문)

## 성공 기준
- handleSubmit: 1회 호출
- Chunk N: 순차적 증가
- "Created NEW": 정확히 1회
- After update newLength: 2 → 3 (고정)
- 최종 messages 배열: [user, assistant] 정확히 2개
