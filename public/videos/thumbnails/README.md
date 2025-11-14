# Video Thumbnails Directory

이 디렉토리는 데모 비디오의 썸네일 이미지를 저장합니다.

## 파일 명명 규칙

각 과목별 썸네일은 다음 형식으로 저장해야 합니다:

```
{video-id}-thumbnail.jpg
```

## 필요한 썸네일 파일

1. `english-demo-thumbnail.jpg` - 영어 AI 튜터 체험
2. `math-demo-thumbnail.jpg` - 수학 문제 풀이
3. `science-demo-thumbnail.jpg` - 과학 실험 시뮬레이션
4. `social-demo-thumbnail.jpg` - 사회 탐구 학습
5. `korean-demo-thumbnail.jpg` - 국어 문학 감상

## 썸네일 제작 스펙

- **해상도**: 1280x720 (16:9 비율)
- **포맷**: JPG
- **품질**: 85%
- **파일 크기**: 500KB 이하
- **캡처 시점**: 영상 5초 또는 10초 지점 (오프닝 이후 대표 장면)

## 오버레이 요소

각 썸네일에는 다음 요소들이 포함되어야 합니다:

1. **과목 아이콘** (좌상단)
   - 영어: BookOpen 📖
   - 수학: Calculator 🔢
   - 과학: Beaker 🧪
   - 사회: Landmark 🏛️
   - 국어: Book 📚

2. **재생 시간** (우하단)
   - 영어: 2:30
   - 수학: 3:15
   - 과학: 2:45
   - 사회: 3:00
   - 국어: 2:20

3. **배지** (우상단 - 해당하는 경우)
   - 영어: POPULAR ⭐
   - 수학: HOT 🔥
   - 과학: NEW ✨

## 임시 방안

썸네일이 아직 준비되지 않은 경우, 시스템은 자동으로 그라디언트 배경을 표시합니다.
썸네일 파일이 추가되면 자동으로 감지되어 표시됩니다.
