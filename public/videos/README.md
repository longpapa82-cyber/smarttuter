# 비디오 파일 디렉토리

이 디렉토리는 AI 튜터 데모 영상을 저장하는 곳입니다.

## 📹 비디오 파일 추가 방법

### 1. 비디오 파일 준비
- 형식: MP4 (권장)
- 해상도: 1280x720 또는 1920x1080
- 파일명: `demo.mp4`

### 2. 파일 복사
터미널에서 다음 명령어 실행:

```bash
cp /경로/to/your/video.mp4 public/videos/demo.mp4
```

또는 Finder에서:
1. 이 폴더 열기
2. 비디오 파일 드래그 앤 드롭
3. 파일명을 `demo.mp4`로 변경

### 3. 확인
```bash
ls public/videos/demo.mp4
```

## 📚 상세 가이드

자세한 설정 방법은 [LOCAL_VIDEO_SETUP_GUIDE.md](../../claudedocs/LOCAL_VIDEO_SETUP_GUIDE.md)를 참고하세요.

## 🎯 현재 설정

- **예상 파일**: `demo.mp4`
- **접근 URL**: `/videos/demo.mp4`
- **사용 위치**: 메인 페이지 "데모 영상 보기" 버튼

---

**참고**: 이 디렉토리의 파일은 Git에 커밋되지 않습니다 (.gitignore 설정).
