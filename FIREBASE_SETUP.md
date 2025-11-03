# Firebase 연결 가이드 🔥

이 가이드는 디지털 어드벤트 캘린더를 Firebase와 연결하는 방법을 단계별로 설명합니다.

## 📋 사전 준비

1. Google 계정 준비
2. Firebase 계정 (Google 계정으로 자동 로그인 가능)

---

## 1단계: Firebase 프로젝트 생성

### 1-1. Firebase Console 접속
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. Google 계정으로 로그인

### 1-2. 새 프로젝트 생성
1. **"프로젝트 추가"** 클릭
2. 프로젝트 이름 입력 (예: `advent-calendar`)
3. Google Analytics 설정 (선택사항)
   - 켜기/끄기 선택
   - 필요한 경우 사용량 분석 계정 선택
4. **"프로젝트 만들기"** 클릭
5. 몇 초 기다린 후 **"계속"** 클릭

---

## 2단계: Firestore 데이터베이스 생성

### 2-1. Firestore 활성화
1. Firebase Console 왼쪽 메뉴에서 **"Firestore Database"** 클릭
2. **"데이터베이스 만들기"** 클릭

### 2-2. 보안 규칙 선택
**⚠️ 중요**: 처음에는 **"테스트 모드로 시작"**을 선택하세요
- 나중에 보안 규칙을 수정할 예정입니다
- **위치 선택**: `asia-northeast3 (Seoul)` 또는 가장 가까운 지역
- **데이터베이스 ID**: 커스텀 이름을 원하시면 입력하세요 (예: `database1`)
  - 기본값 `(default)` 사용 시 추후 코드에서 지정 불필요
  - 커스텀 이름 사용 시 코드에서 명시 필요

### 2-3. 데이터베이스 생성 완료
- 몇 분 정도 소요될 수 있습니다
- 완료되면 Firestore 데이터베이스 화면이 표시됩니다

---

## 3단계: 웹 앱 추가 및 설정

### 3-1. 웹 앱 추가
1. Firebase Console 왼쪽 상단의 **톱니바퀴 아이콘** 클릭
2. **"프로젝트 설정"** 클릭
3. 아래로 스크롤하여 **"내 앱"** 섹션 찾기
4. **`</>` 웹 아이콘** 클릭 (웹 앱 추가)

### 3-2. 앱 등록
1. 앱 닉네임 입력 (예: `Advent Calendar Web`)
2. **"Firebase Hosting도 설정"** 체크 해제 (나중에 설정 가능)
3. **"앱 등록"** 클릭

### 3-3. Firebase 설정 값 복사
등록 후 표시되는 **firebaseConfig** 객체에서 다음 값들을 복사하세요:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",                    // ← 이것
  authDomain: "your-project.firebaseapp.com",  // ← 이것
  projectId: "your-project-id",               // ← 이것
  storageBucket: "your-project.appspot.com",  // ← 이것
  messagingSenderId: "123456789",              // ← 이것
  appId: "1:123456789:web:abc123"              // ← 이것
};
```

---

## 4단계: 프로젝트에 환경 변수 설정

### 4-1. .env 파일 생성
프로젝트 루트 디렉토리(`D:\BANG\project\advantCalender`)에 `.env` 파일을 생성하세요.

### 4-2. 환경 변수 입력
`.env` 파일에 다음 내용을 입력하고, Firebase Console에서 복사한 값으로 교체하세요:

```env
VITE_FIREBASE_API_KEY=AIzaSy...여기에_실제_값_입력
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

**⚠️ 주의사항:**
- `.env` 파일은 절대 Git에 커밋하지 마세요! (이미 `.gitignore`에 포함되어 있어야 합니다)
- 값들 사이에 공백이나 따옴표가 없어야 합니다
- 실제 값으로 모두 교체해야 합니다

### 4-3. 개발 서버 재시작
`.env` 파일을 생성/수정한 후에는 **반드시 개발 서버를 재시작**해야 합니다:

```bash
# 현재 실행 중인 서버 중지 (Ctrl+C)
# 다시 시작
npm run dev
```

### 4-4. 데이터베이스 이름 확인 (중요!)
**⚠️ 매우 중요**: 만약 Firestore 데이터베이스를 생성할 때 **커스텀 이름**(예: `database1`)을 사용하셨다면, `src/firebase.js` 파일을 수정해야 합니다:

**`src/firebase.js` 수정:**

```javascript
// 36번째 줄을 다음과 같이 수정:
db = getFirestore(app, 'database1');  // 'database1'은 여러분이 만든 데이터베이스 이름으로 변경
```

**기본값 `(default)`를 사용하셨다면:**
```javascript
db = getFirestore(app);  // 이대로 두면 됩니다
```

---

## 5단계: Firestore 보안 규칙 설정

### 5-1. Firestore 규칙 페이지 이동
1. Firebase Console에서 **"Firestore Database"** 클릭
2. 상단 탭에서 **"규칙"** 클릭

### 5-2. 보안 규칙 적용
다음 규칙을 복사하여 붙여넣고 **"게시"** 클릭:

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

**규칙 설명:**
- `read: true` - 모든 사용자가 캘린더를 읽을 수 있습니다
- `create: true` - 누구나 캘린더를 생성할 수 있습니다
- `update: true` - 누구나 메시지를 추가/수정할 수 있습니다

⚠️ **참고**: 프로덕션 환경에서 더 엄격한 보안 규칙을 원하시면 이후에 수정할 수 있습니다.

### 5-3. 규칙 테스트 (선택사항)
규칙 편집기에서 **"시뮬레이션"** 버튼으로 테스트할 수 있습니다.

---

## 6단계: 연결 테스트

### 6-1. 개발 서버 실행
```bash
npm run dev
```

### 6-2. 브라우저 콘솔 확인
1. 브라우저에서 `http://localhost:5173` 접속
2. **F12** 키를 눌러 개발자 도구 열기
3. **Console 탭** 확인
4. 다음 메시지가 보이면 성공:
   ```
   ✅ Firebase 초기화 완료
   ```

### 6-3. 캘린더 생성 테스트
1. Home 페이지에서 **"새 캘린더 만들기"** 클릭
2. 이름과 비밀번호 입력 후 생성
3. Firebase Console → Firestore Database에서 `calendars` 컬렉션이 생성되고 데이터가 저장되는지 확인

---

## 7단계: 프로덕션 빌드 및 배포

### 7-1. 빌드
```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 7-2. Firebase Hosting 배포 (권장)

#### Firebase CLI 설치
```bash
npm install -g firebase-tools
```

#### Firebase 로그인
```bash
firebase login
```

#### Firebase 프로젝트 초기화
```bash
firebase init hosting
```

초기화 중 선택 사항:
- **프로젝트 선택**: 방금 만든 Firebase 프로젝트 선택
- **디렉토리**: `dist` 입력
- **SPA로 설정**: `Yes` (React Router 사용)
- **자동 빌드**: 필요시 설정

#### 배포
```bash
firebase deploy --only hosting
```

배포 완료 후 Firebase에서 제공하는 URL로 접속 가능합니다!
예: `https://your-project.web.app`

---

## 🔍 문제 해결

### 문제 1: "Firebase 설정이 필요합니다" 메시지
**원인**: `.env` 파일이 없거나 환경 변수가 제대로 설정되지 않음
**해결**:
- `.env` 파일이 프로젝트 루트에 있는지 확인
- 모든 환경 변수가 올바르게 입력되었는지 확인
- 개발 서버를 재시작

### 문제 2: Firestore 권한 오류
**원인**: 보안 규칙이 올바르게 설정되지 않음
**해결**:
- Firebase Console → Firestore → 규칙에서 규칙이 게시되었는지 확인
- 규칙 구문 오류가 없는지 확인

### 문제 3: 캘린더 생성이 안 됨
**원인**: Firestore에 연결이 안 되거나 규칙 문제
**해결**:
- 브라우저 콘솔에서 에러 메시지 확인
- Firebase Console에서 `calendars` 컬렉션이 생성되는지 확인
- 네트워크 탭에서 Firebase 요청이 실패하는지 확인

### 문제 4: 목업 모드로 계속 작동
**원인**: Firebase 초기화 실패
**해결**:
- `.env` 파일의 값이 정확한지 확인
- Firebase 프로젝트가 활성화되어 있는지 확인
- 브라우저 콘솔의 에러 메시지 확인

---

## 📊 Firebase 사용량 모니터링

Firebase Console에서 다음을 확인할 수 있습니다:

1. **사용량 대시보드**: Firestore 읽기/쓰기 횟수
2. **비용**: 무료 할당량 초과 여부
3. **실시간 데이터**: Firestore에서 데이터 실시간 확인

### 무료 할당량 (Spark 플랜)
- **Firestore 읽기**: 50,000건/일
- **Firestore 쓰기**: 20,000건/일
- **저장공간**: 1GB
- **다운로드**: 10GB/일

---

## ✅ 체크리스트

배포 전 확인사항:

- [ ] Firebase 프로젝트 생성 완료
- [ ] Firestore 데이터베이스 생성 완료
- [ ] 웹 앱 등록 완료
- [ ] `.env` 파일 생성 및 값 입력 완료
- [ ] Firestore 보안 규칙 설정 완료
- [ ] 개발 환경에서 테스트 완료
- [ ] 프로덕션 빌드 성공 (`npm run build`)
- [ ] Firebase Hosting 배포 완료

---

## 🚀 추가 최적화 (선택사항)

1. **커스텀 도메인 연결**: Firebase Hosting에서 무료로 지원
2. **CDN 캐싱**: Firebase Hosting이 자동으로 처리
3. **SSL 인증서**: Firebase Hosting이 자동으로 제공

---

## 📞 도움이 필요하신가요?

문제가 발생하면:
1. 브라우저 콘솔의 에러 메시지 확인
2. Firebase Console의 사용량/에러 로그 확인
3. Firestore 규칙 테스트 기능 사용

성공적으로 연결되면 "✅ Firebase 초기화 완료" 메시지가 콘솔에 표시됩니다!


