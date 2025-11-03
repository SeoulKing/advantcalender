# 배포 가이드

## 1. Firebase 프로젝트 설정

### Firebase Console 설정
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. Firestore Database 생성
   - 데이터베이스 유형: **Production 모드** 또는 **테스트 모드**
   - 위치: 가장 가까운 지역 선택 (예: `asia-northeast3`)

### Firestore 보안 규칙 설정
Firestore Console의 "규칙" 탭에서 다음 규칙 적용:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 캘린더 컬렉션
    match /calendars/{calendarId} {
      // 읽기: 모두 허용 (공개 캘린더)
      allow read: if true;
      
      // 생성: 모두 허용 (누구나 캘린더 생성 가능)
      allow create: if true;
      
      // 수정: 모두 허용 (메시지 추가/수정 가능)
      allow update: if true;
    }
  }
}
```

⚠️ **참고**: 프로덕션 환경에서 더 엄격한 보안 규칙을 원하시면 이후에 수정할 수 있습니다.

## 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**자세한 설정 방법은 `FIREBASE_SETUP.md` 파일을 참고하세요!**

Firebase 프로젝트 설정 → 일반 → 앱 추가에서 설정값 확인 가능합니다.

⚠️ **중요**: `.env` 파일 생성 후 개발 서버를 **반드시 재시작**해야 합니다!

## 3. Google AdSense 설정 (선택사항)

1. [Google AdSense](https://www.google.com/adsense/) 접속
2. 사이트 등록 및 승인 대기
3. 광고 단위 생성
4. `index.html`의 AdSense 스크립트에서 발행자 ID 설정
5. `src/components/AdSense.jsx`의 `data-ad-client` 값 수정

## 4. 빌드 및 배포

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 배포 옵션

#### 옵션 1: Firebase Hosting (권장)
```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# Firebase 프로젝트 초기화
firebase init hosting

# 배포
firebase deploy
```

#### 옵션 2: Vercel
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

#### 옵션 3: Netlify
1. Netlify 사이트에 접속
2. `dist` 폴더 드래그 앤 드롭
3. 자동 배포 설정

## 5. 도메인 연결 (선택사항)

Firebase Hosting, Vercel, Netlify 모두 무료 커스텀 도메인 연결을 지원합니다.

## 6. 트러블슈팅

### Firestore 권한 오류
- 보안 규칙이 올바르게 설정되었는지 확인
- 테스트 모드에서는 모든 읽기/쓰기가 허용됩니다 (90일 제한)

### AdSense 광고가 표시되지 않음
- 사이트가 AdSense 승인을 받았는지 확인
- 광고 단위 ID가 올바른지 확인
- 브라우저 광고 차단기가 비활성화되었는지 확인 (개발 중)

### 빌드 오류
- Node.js 버전 확인 (권장: v18 이상)
- `node_modules` 삭제 후 재설치: `npm install`

## 7. 비용 고려사항

- **Firebase Firestore**: 
  - 무료 할당량: 1일 읽기 50,000회, 쓰기 20,000회
  - 초과 시 유료 계획 필요
  
- **Firebase Hosting**: 
  - 무료: 매월 10GB 데이터 전송, 저장공간 10GB
  - 대부분의 프로젝트에서 충분합니다

- **Google AdSense**:
  - 광고 수익 정산 방식

## 8. 추가 기능 제안

향후 추가할 수 있는 기능:
- 사용자 인증 (Firebase Authentication)
- 캘린더 편집/삭제 기능
- 이미지 업로드 (Firebase Storage)
- 다국어 지원
- 반응형 모바일 UI 개선

