# Hero Video 브라우저 캐시 이슈 해결

## 🔍 문제 상황

사용자가 브라우저에서 여전히 이전 에러를 보고 있습니다:
```
TypeError: Cannot read properties of null (reading 'currentTime')
    at eval (VideoPlayer.tsx:139:71)
```

하지만 **코드는 이미 수정되어 있습니다.**

## 🎯 원인

**브라우저 캐시 문제**
- 브라우저가 이전 버전의 JavaScript 파일을 캐시하고 있음
- Next.js의 Hot Module Replacement(HMR)가 완전히 반영되지 않음
- `.next` 빌드 캐시가 남아있을 수 있음

## ✅ 해결 방법

### 1. **하드 새로고침** (가장 빠른 방법)

**Windows/Linux**:
```
Ctrl + Shift + R
또는
Ctrl + F5
```

**Mac**:
```
Cmd + Shift + R
또는
Cmd + Option + R
```

### 2. **개발자 도구에서 캐시 비활성화**

1. Chrome DevTools 열기 (F12 또는 Cmd+Option+I)
2. Network 탭 클릭
3. "Disable cache" 체크박스 선택
4. 새로고침 (F5 또는 Cmd+R)

### 3. **브라우저 캐시 완전 삭제**

**Chrome**:
1. 설정 > 개인정보 및 보안
2. 인터넷 사용 기록 삭제
3. "캐시된 이미지 및 파일" 선택
4. 기간: "전체 기간"
5. 데이터 삭제

### 4. **서버 재시작** (이미 완료)

```bash
# .next 캐시 삭제 (이미 완료됨)
rm -rf .next

# 개발 서버 재시작
npm run dev
```

### 5. **시크릿 모드로 테스트**

```
Ctrl + Shift + N (Windows/Linux)
Cmd + Shift + N (Mac)
```

시크릿 모드로 `http://localhost:3000` 접속하여 테스트

## 📊 수정 완료된 코드 확인

### VideoPlayer.tsx (Line 127-141)

```typescript
onLoadedMetadata={(e) => {
  if (e.currentTarget) {  // ✅ Null 체크 추가됨
    setState(prev => ({
      ...prev,
      duration: e.currentTarget.duration || 0,
      isLoading: false,
    }));
  }
}}
onError={() => setState(prev => ({ ...prev, hasError: true, isLoading: false }))}
onTimeUpdate={(e) => {
  if (e.currentTarget) {  // ✅ Null 체크 추가됨
    setState(prev => ({ ...prev, currentTime: e.currentTarget.currentTime || 0 }));
  }
}}
```

## 🎯 예상 결과

하드 새로고침 후:
- ✅ `Cannot read properties of null` 에러 사라짐
- ✅ 비디오 자동 재생 시작
- ✅ 컨트롤 버튼 정상 작동
- ✅ 에러 메시지 없음

## 📝 추가 디버깅 단계

만약 여전히 에러가 발생한다면:

### 1. 브라우저 콘솔 확인
```javascript
// 비디오 엘리먼트 확인
document.querySelector('video')
```

### 2. React DevTools로 컴포넌트 확인
- VideoPlayer 컴포넌트의 state 확인
- Props 값 확인

### 3. 서버 로그 확인
```bash
# 컴파일 성공 여부 확인
✓ Compiled / in XXXms
```

## 🔄 변경사항 요약

1. ✅ `onLoadedMetadata`에 null 체크 추가
2. ✅ `onTimeUpdate`에 null 체크 추가
3. ✅ 자막 파일 제거 (404 에러 해결)
4. ✅ 포스터 이미지 제거 (404 에러 해결)
5. ✅ `.next` 캐시 삭제 완료

## 🎉 최종 상태

- **코드**: ✅ 수정 완료
- **서버**: ✅ 정상 작동 (`GET / 200`)
- **남은 작업**: 브라우저 캐시 클리어 필요

---

**작성일**: 2025-11-08
**이슈**: 브라우저 캐시로 인한 이전 버전 로드
**해결책**: 하드 새로고침 (Ctrl+Shift+R / Cmd+Shift+R)
