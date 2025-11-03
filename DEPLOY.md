# 🚀 Firebase Hosting 배포 가이드

Firebase Hosting으로 어드벤트 캘린더를 배포하는 방법입니다.

## 📋 사전 준비

1. ✅ Firebase 프로젝트 생성 완료 (`gyulmo-advant-calendar`)
2. ✅ Firestore 데이터베이스 생성 완료 (이름: `database1`)
3. ✅ Firebase 보안 규칙 설정 완료

---

## 1단계: Firebase CLI 설치

Firebase CLI가 설치되어 있는지 확인:
```bash
firebase --version
```

설치되어 있지 않다면:
```bash
npm install -g firebase-tools
```

---

## 2단계: Firebase 로그인

터미널에서 실행 (브라우저가 열리면서 로그인 진행):
```bash
firebase login
```

로그인 완료되면 ✅ 체크 표시와 함께 완료 메시지가 나타납니다.

---

## 3단계: Firebase 프로젝트 초기화

### 3-1. 호스팅 초기화
```bash
firebase init hosting
```

### 3-2. 질문에 답변
다음과 같이 진행하세요:

1. **Use an existing project**: `Yes` 선택
2. **Select a default Firebase project**: `gyulmo-advant-calendar` 선택
3. **What do you want to use as your public directory?**: `dist` 입력
   - Vite는 빌드 결과를 `dist` 폴더에 생성합니다
4. **Configure as a single-page app (rewrite all urls to /index.html)?**: `Yes` 선택
   - React Router를 사용하므로 SPA로 설정해야 합니다
5. **Set up automatic builds and deploys with GitHub?**: `No` 선택
   - 나중에 설정할 수 있습니다

완료되면 `firebase.json`과 `.firebaserc` 파일이 생성됩니다.

---

## 4단계: 프로젝트 빌드

Vite 프로젝트를 빌드합니다:
```bash
npm run build
```

빌드 성공 시 `dist` 폴더에 정적 파일들이 생성됩니다.

---

## 5단계: 배포

```bash
firebase deploy --only hosting
```

배포 진행 상황이 표시되고, 완료되면 다음과 같은 URL을 제공합니다:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/gyulmo-advant-calendar
Hosting URL: https://gyulmo-advant-calendar.web.app
```

이제 제공된 URL로 접속하면 배포된 서비스를 사용할 수 있습니다!

---

## 📝 배포 후 확인 사항

배포가 완료되면 다음을 확인하세요:

1. ✅ **홈페이지 접속**: 배포된 URL로 접속이 되는지
2. ✅ **캘린더 생성**: 새 캘린더를 만들 수 있는지
3. ✅ **메시지 저장**: 메시지를 저장할 수 있는지
4. ✅ **Firestore 연동**: Firebase Console에서 데이터가 저장되는지

---

## 🔄 재배포

코드를 수정한 후 다시 배포하려면:

```bash
npm run build
firebase deploy --only hosting
```

---

## 🌐 커스텀 도메인 연결 (선택사항)

Firebase Hosting은 커스텀 도메인 연결을 지원합니다:

1. Firebase Console → Hosting → "커스텀 도메인 추가"
2. 도메인 이름 입력
3. Firebase가 제공하는 DNS 레코드를 도메인 제공자에 추가

자세한 내용: [Firebase 공식 문서](https://firebase.google.com/docs/hosting/custom-domain)

---

## ⚠️ 주의사항

- Firebase Hosting 무료 플랜은 충분한 트래픽을 지원합니다
- `.env` 파일은 이미 `.gitignore`에 포함되어 있어 안전합니다
- Firebase 설정 값들은 클라이언트에 노출되어도 괜찮습니다 (보안에 영향 없음)

---

## 🆘 문제 해결

### 빌드 실패
- `npm run build` 실행 시 오류가 발생하면 콘솔 메시지 확인
- 주로 의존성 패키지 문제

### 배포 실패
- `firebase deploy` 실행 시 권한 오류가 발생하면 `firebase login` 다시 실행
- `firebase init hosting`을 다시 실행해 설정 확인

### 접속은 되지만 Firebase 연동 실패
- Firebase Console에서 보안 규칙 게시 여부 확인
- Firestore 데이터베이스 이름이 `database1`인지 확인

