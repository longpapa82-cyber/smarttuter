# 로컬 비디오 파일 설정 가이드

**작성일**: 2025-11-08
**기능**: 로컬 비디오 파일 또는 YouTube 영상 재생 지원
**상태**: ✅ 구현 완료

---

## 📋 개요

VideoModal 컴포넌트가 이제 다음 두 가지 비디오 소스를 모두 지원합니다:
1. **로컬 비디오 파일** (MP4, WebM, OGG)
2. **YouTube 영상** (자동 감지 및 embed 변환)

---

## 🎬 로컬 비디오 파일 추가 방법

### 1단계: 비디오 파일 준비

제작하신 AI 튜터 데모 영상을 준비합니다.

**권장 비디오 설정**:
- **형식**: MP4 (H.264 코덱)
- **해상도**: 1920x1080 (Full HD) 또는 1280x720 (HD)
- **비트레이트**: 5-10 Mbps
- **길이**: 1-3분 (데모 영상 권장 길이)
- **파일 크기**: 10-50MB (로딩 속도 고려)

**브라우저 호환성을 위한 권장 포맷**:
```
MP4 (H.264/AAC) - 모든 브라우저 지원 ✅
WebM (VP9) - Chrome, Firefox 지원 ✅
OGG (Theora) - Firefox 지원 ✅
```

### 2단계: 비디오 파일 복사

터미널에서 다음 명령어를 실행하여 비디오 파일을 복사합니다:

```bash
# 방법 1: cp 명령어 사용
cp /경로/to/your/video.mp4 /Users/hoonjaepark/projects/smartTuter/public/videos/demo.mp4

# 방법 2: Finder에서 복사
# 1. Finder에서 /Users/hoonjaepark/projects/smartTuter/public/videos/ 폴더 열기
# 2. 비디오 파일을 드래그 앤 드롭
# 3. 파일 이름을 demo.mp4로 변경
```

**예시**:
```bash
# 다운로드 폴더의 영상을 복사하는 경우
cp ~/Downloads/ai-tutor-demo.mp4 public/videos/demo.mp4
```

### 3단계: 파일 확인

비디오 파일이 올바른 위치에 있는지 확인:

```bash
ls -lh public/videos/demo.mp4
```

**예상 출력**:
```
-rw-r--r--  1 user  staff   25M Nov  8 10:00 public/videos/demo.mp4
```

---

## 🔧 다른 파일명 사용하기

`demo.mp4`가 아닌 다른 이름을 사용하려면:

### 1. 비디오 파일 복사 (원하는 이름으로)
```bash
cp ~/Downloads/my-video.mp4 public/videos/my-video.mp4
```

### 2. HomeClient.tsx 수정
```typescript
// app/HomeClient.tsx:330
<VideoModal
  videoUrl="/videos/my-video.mp4"  // ← 파일명 변경
  // ...
/>
```

---

## 📁 파일 구조

```
smartTuter/
├── public/
│   └── videos/
│       ├── demo.mp4          ← 메인 데모 영상
│       ├── tutorial.mp4      ← (선택) 튜토리얼 영상
│       └── intro.webm        ← (선택) 인트로 영상
├── app/
│   └── HomeClient.tsx        ← 비디오 URL 설정
└── components/
    └── demo/
        └── VideoModal.tsx    ← 비디오 플레이어 컴포넌트
```

---

## 🎯 비디오 포맷별 설정

### MP4 사용 (권장)
```typescript
videoUrl="/videos/demo.mp4"
```

### WebM 사용
```typescript
videoUrl="/videos/demo.webm"
```

### 여러 포맷 제공 (최상의 호환성)
VideoModal 컴포넌트는 자동으로 여러 포맷을 시도합니다:
```html
<video>
  <source src="/videos/demo.mp4" type="video/mp4" />
  <source src="/videos/demo.webm" type="video/webm" />
  <source src="/videos/demo.ogg" type="video/ogg" />
</video>
```

같은 영상을 여러 포맷으로 준비:
```bash
# FFmpeg로 변환 (FFmpeg 설치 필요)
ffmpeg -i demo.mp4 -c:v libvpx-vp9 -crf 30 demo.webm
ffmpeg -i demo.mp4 -c:v libtheora demo.ogg
```

---

## 🌐 YouTube 영상 사용하기

로컬 파일 대신 YouTube 영상을 사용하려면:

### 1. YouTube에 영상 업로드
1. YouTube Studio (https://studio.youtube.com)
2. 비디오 업로드
3. 공개 설정 (공개/일부 공개/비공개)

### 2. 영상 URL 복사
- 주소창에서 URL 복사 (예: `https://www.youtube.com/watch?v=ABC123xyz`)

### 3. HomeClient.tsx에서 URL 변경
```typescript
// app/HomeClient.tsx:330
<VideoModal
  videoUrl="https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
  // ...
/>
```

**지원하는 YouTube URL 형식**:
```typescript
"https://www.youtube.com/watch?v=ABC123"        ✅ 표준 형식
"https://youtu.be/ABC123"                       ✅ 짧은 형식
"https://www.youtube.com/embed/ABC123"          ✅ Embed 형식
```

---

## ⚙️ 비디오 설정 커스터마이징

### 자동 재생 끄기
```typescript
// components/demo/VideoModal.tsx:150
<video
  autoPlay={false}  // ← false로 변경
  // ...
/>
```

### 음소거 기본값 설정
```typescript
<video
  muted
  // ...
/>
```

### 반복 재생
```typescript
<video
  loop
  // ...
/>
```

### 전체 설정 예시
```typescript
<video
  src={embedUrl}
  controls
  autoPlay
  muted={false}
  loop={false}
  playsInline  // iOS에서 인라인 재생
  preload="metadata"  // 메타데이터만 미리 로드
  className="absolute inset-0 w-full h-full object-contain"
/>
```

---

## 🎨 비디오 최적화 팁

### 1. 파일 크기 최적화
```bash
# FFmpeg로 압축 (품질 유지하면서 크기 줄이기)
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4

# CRF 값 (낮을수록 고품질, 높을수록 작은 파일)
# 18 = 시각적으로 무손실
# 23 = 기본값 (권장)
# 28 = 저품질 (작은 파일)
```

### 2. 해상도 조정
```bash
# 1080p → 720p 변환
ffmpeg -i input.mp4 -vf scale=1280:720 -c:v libx264 -crf 23 output.mp4
```

### 3. 썸네일 생성
```bash
# 비디오 첫 프레임을 썸네일로 추출
ffmpeg -i demo.mp4 -ss 00:00:01 -vframes 1 public/videos/demo-thumbnail.jpg
```

썸네일을 VideoModal에 추가:
```typescript
<video
  poster="/videos/demo-thumbnail.jpg"  // 재생 전 표시될 이미지
  // ...
/>
```

---

## 🧪 테스트 방법

### 1. 개발 서버 시작
```bash
npm run dev
```

### 2. 브라우저에서 확인
1. http://localhost:3000 열기
2. "데모 영상 보기 ▶" 버튼 클릭
3. 비디오 재생 확인

### 3. 체크리스트
- [ ] 모달이 부드럽게 열림
- [ ] 로딩 스피너 표시 (1-2초)
- [ ] 비디오 자동 재생
- [ ] 컨트롤 작동 (재생/일시정지/볼륨/전체화면)
- [ ] 모바일에서 정상 작동
- [ ] ESC/오버레이/X 버튼으로 닫기

### 4. 브라우저별 테스트
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge
- [ ] 모바일 Safari (iOS)
- [ ] 모바일 Chrome (Android)

---

## 🐛 문제 해결

### 비디오가 재생되지 않음

#### 1. 파일 경로 확인
```bash
# 파일 존재 여부 확인
ls public/videos/demo.mp4

# 파일 권한 확인
ls -la public/videos/demo.mp4
```

#### 2. 파일 형식 확인
```bash
# 파일 정보 확인 (FFmpeg 필요)
ffmpeg -i public/videos/demo.mp4

# 또는
file public/videos/demo.mp4
```

#### 3. 브라우저 콘솔 확인
- F12 → Console 탭
- 에러 메시지 확인
- 네트워크 탭에서 비디오 로드 상태 확인

#### 4. 코덱 호환성 문제
```bash
# H.264/AAC로 재인코딩
ffmpeg -i input.mp4 -c:v libx264 -c:a aac -strict experimental output.mp4
```

### 로딩이 너무 느림

#### 1. 파일 크기 확인
```bash
ls -lh public/videos/demo.mp4
```

**권장 크기**:
- 1분 영상: 5-10MB
- 2분 영상: 10-20MB
- 3분 영상: 15-30MB

#### 2. 비디오 압축
```bash
# 고품질 유지하면서 압축
ffmpeg -i demo.mp4 -c:v libx264 -crf 28 -preset slow demo-compressed.mp4
```

#### 3. 해상도 낮추기
```bash
# 1080p → 720p
ffmpeg -i demo.mp4 -vf scale=1280:720 demo-720p.mp4
```

### 모바일에서 자동 재생 안 됨

모바일 브라우저는 자동 재생을 제한합니다:

```typescript
// 음소거 상태에서만 자동 재생 허용
<video
  autoPlay
  muted  // ← 필수!
  playsInline  // iOS 필수
/>
```

---

## 📊 권장 비디오 사양

### 데모 영상 (1-3분)
```yaml
해상도: 1920x1080 (Full HD)
프레임레이트: 30fps
비디오 코덱: H.264
오디오 코덱: AAC
비트레이트:
  비디오: 5 Mbps
  오디오: 128 kbps
파일 크기: 15-25MB (1분당 약 10MB)
```

### 빠른 로딩 우선 (모바일)
```yaml
해상도: 1280x720 (HD)
프레임레이트: 30fps
비디오 코덱: H.264
오디오 코덱: AAC
비트레이트:
  비디오: 2-3 Mbps
  오디오: 96 kbps
파일 크기: 5-10MB (1분당 약 5MB)
```

---

## 🚀 프로덕션 배포 시 고려사항

### 1. CDN 사용 권장
로컬 파일 대신 CDN에 업로드:

```typescript
// Vercel Blob Storage
videoUrl="https://your-blob-url.vercel-storage.com/demo.mp4"

// AWS S3 + CloudFront
videoUrl="https://your-cdn.cloudfront.net/videos/demo.mp4"

// Cloudinary
videoUrl="https://res.cloudinary.com/your-account/video/upload/demo.mp4"
```

### 2. Next.js Static Export 시
```json
// next.config.js
{
  "images": {
    "unoptimized": true
  },
  "output": "export"
}
```

비디오 파일은 자동으로 public 폴더에서 복사됩니다.

### 3. Vercel 배포 시
- `public/videos/` 폴더의 모든 파일이 자동으로 배포됩니다
- 큰 파일(>50MB)은 Vercel Blob Storage 사용 권장

---

## 💡 고급 기능

### 여러 비디오 지원
```typescript
// 비디오 목록 관리
const videos = [
  {
    id: 'demo',
    url: '/videos/demo.mp4',
    title: 'AI 튜터 기본 기능',
  },
  {
    id: 'tutorial',
    url: '/videos/tutorial.mp4',
    title: '튜터 사용 방법',
  },
];

<VideoModal
  videoUrl={selectedVideo.url}
  title={selectedVideo.title}
/>
```

### 자막 추가
```typescript
<video>
  <source src="/videos/demo.mp4" type="video/mp4" />
  <track
    kind="subtitles"
    src="/videos/demo-ko.vtt"
    srclang="ko"
    label="한국어"
    default
  />
  <track
    kind="subtitles"
    src="/videos/demo-en.vtt"
    srclang="en"
    label="English"
  />
</video>
```

### 재생 이벤트 추적
```typescript
<video
  onPlay={() => console.log('재생 시작')}
  onPause={() => console.log('일시정지')}
  onEnded={() => console.log('재생 완료')}
  onTimeUpdate={(e) => {
    const percent = (e.currentTarget.currentTime / e.currentTarget.duration) * 100;
    console.log(`재생 진행: ${percent.toFixed(0)}%`);
  }}
/>
```

---

## 📝 요약

### 간단한 사용법
1. **비디오 파일 복사**:
   ```bash
   cp your-video.mp4 public/videos/demo.mp4
   ```

2. **서버 재시작**:
   ```bash
   npm run dev
   ```

3. **테스트**:
   - http://localhost:3000
   - "데모 영상 보기 ▶" 클릭

### 현재 설정
- **파일 경로**: `public/videos/demo.mp4`
- **코드 위치**: [app/HomeClient.tsx:330](../app/HomeClient.tsx#L330)
- **컴포넌트**: [components/demo/VideoModal.tsx](../components/demo/VideoModal.tsx)

### 지원 형식
- ✅ MP4 (H.264/AAC) - 권장
- ✅ WebM (VP9)
- ✅ OGG (Theora)
- ✅ YouTube URL

---

**작성 완료일**: 2025-11-08
**상태**: 로컬 비디오 지원 준비 완료
**다음 단계**: 비디오 파일 복사 및 테스트

---

## 📞 추가 도움말

비디오 파일 복사나 설정에 문제가 있으시면:
1. 비디오 파일 경로 확인
2. 파일 형식 확인 (MP4 권장)
3. 브라우저 콘솔 에러 확인
4. 개발 서버 재시작

**End of Guide**
