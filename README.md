# 디지털 어드벤트 캘린더 🎄

## 프로젝트 개요
- 100% 무료 디지털 어드벤트 캘린더 플랫폼
- Google AdSense 광고 기반
- 12월 달력에 따뜻한 메시지를 전달할 수 있는 서비스
- 주 사용 플로우: 캘린더 생성 → 공유/작성 링크 제공 → 메시지 작성 → 시간 잠금에 따라 메시지 확인

## 주요 페이지/라우팅
- `/` : 나의 캘린더 목록 (Home)
- `/write/:calendarId` : 메시지 작성 페이지 (12월 달력에서 날짜 선택 후 작성)
- `/calendar/:calendarId` : 캘린더 확인 페이지 (12월 달력 표시)

## 기술스택
- 프론트: React + Vite
- 백엔드: Firebase Firestore
- 광고: Google AdSense
- 스타일: 크리스마스 테마 CSS

## 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. Firebase 설정
`.env` 파일을 생성하고 Firebase 설정 정보를 입력하세요:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. 개발 서버 실행
```bash
npm run dev
```

## Firebase 데이터베이스 구조

### collections/calendars
```javascript
{
  startDate: "2025-12-01",     // 고정: 12월 1일 (월요일)
  endDate: "2025-12-31",       // 고정: 12월 31일
  createdAt: timestamp,        // 생성 시간
  messages: {                  // 날짜별 메시지 배열
    "2025-12-01": [
      { text: "메시지 내용", createdAt: "2025-12-01T..." },
      ...
    ],
    "2025-12-02": [...],
    ...
  }
}
```

## 주요 기능
- ✅ 간단한 캘린더 생성 (버튼 클릭만으로 즉시 생성)
- ✅ 나의 캘린더 목록 관리 (localStorage 기반)
- ✅ 공유 링크 생성 (확인용 - 캘린더 보기)
- ✅ 작성 링크 생성 (메시지 작성용)
- ✅ 12월 달력에서 날짜 선택 후 메시지 작성
- ✅ 날짜별 메시지 개수 표시
- ✅ 시간잠금: 날짜가 되기 전에는 메시지 확인 불가
- ✅ 크리스마스 테마 UI/UX
- ✅ 눈 내리는 배경 애니메이션

## 프로젝트 구조
```
src/
├── components/
│   ├── AdSense.jsx          # Google AdSense 광고 컴포넌트
│   └── Snowfall.jsx         # 눈 내리는 효과 컴포넌트
├── lib/
│   ├── firestore.js         # Firebase Firestore CRUD 함수
│   └── localStorage.js    # localStorage 캘린더 관리
├── pages/
│   ├── Home.jsx             # 나의 캘린더 목록
│   ├── Calendar.jsx         # 12월 달력 확인
│   ├── Write.jsx            # 메시지 작성 (12월 달력 포함)
│   └── NotFound.jsx        # 404 페이지
├── styles/
│   └── christmas.css        # 크리스마스 테마 스타일
├── App.jsx                  # 레이아웃 및 네비게이션
├── firebase.js              # Firebase 설정
└── main.jsx                 # 진입점
```

## 사용 방법

### 캘린더 생성
1. 홈 페이지에서 "새 캘린더 만들기" 버튼 클릭
2. 즉시 생성되어 캘린더 페이지로 이동

### 메시지 작성
1. 작성 링크를 복사하여 공유
2. 받는 사람이 작성 링크 접속
3. 12월 달력에서 날짜 선택
4. 메시지 작성 후 저장

### 캘린더 확인
1. 공유 링크 또는 홈의 캘린더 카드에서 접속
2. 12월 달력에서 날짜 클릭 (해당 날짜가 되면 열림)
3. 해당 날짜의 모든 메시지 확인

## 배포
배포 관련 자세한 내용은 `DEPLOYMENT.md`를 참고하세요.

### 자동 배포
GitHub Actions가 `main` 브랜치에 푸시할 때마다 자동으로 Firebase Hosting에 배포됩니다.

배포된 사이트: https://gyulmo-advant-calendar.web.app

---
**크리스마스 분위기의 따뜻한 메시지를 전달하세요!** 🎁✨
