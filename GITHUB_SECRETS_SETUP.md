# GitHub Secrets 설정 가이드 🔐

이 가이드는 GitHub Actions에서 Firebase와 AdSense를 사용하기 위한 Secrets 설정 방법을 설명합니다.

## 📋 사전 준비

1. GitHub 저장소 관리자 권한
2. Firebase Console 접속 권한
3. `.env` 파일에 있는 모든 환경 변수 값

---

## 설정 방법

### 1단계: GitHub Secrets 접속

1. [GitHub 저장소](https://github.com/SeoulKing/advantcalender) 접속
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Secrets and variables** → **Actions** 클릭
4. **New repository secret** 버튼 클릭

### 2단계: Firebase 환경 변수 추가

다음 6개의 Firebase Secrets를 하나씩 추가하세요:

#### 1. VITE_FIREBASE_API_KEY
- Name: `VITE_FIREBASE_API_KEY`
- Value: Firebase Console에서 복사한 `apiKey` 값

#### 2. VITE_FIREBASE_AUTH_DOMAIN
- Name: `VITE_FIREBASE_AUTH_DOMAIN`
- Value: Firebase Console에서 복사한 `authDomain` 값

#### 3. VITE_FIREBASE_PROJECT_ID
- Name: `VITE_FIREBASE_PROJECT_ID`
- Value: `gyulmo-advant-calendar` (프로젝트 ID)

#### 4. VITE_FIREBASE_STORAGE_BUCKET
- Name: `VITE_FIREBASE_STORAGE_BUCKET`
- Value: Firebase Console에서 복사한 `storageBucket` 값

#### 5. VITE_FIREBASE_MESSAGING_SENDER_ID
- Name: `VITE_FIREBASE_MESSAGING_SENDER_ID`
- Value: Firebase Console에서 복사한 `messagingSenderId` 값

#### 6. VITE_FIREBASE_APP_ID
- Name: `VITE_FIREBASE_APP_ID`
- Value: Firebase Console에서 복사한 `appId` 값

### 3단계: AdSense 환경 변수 추가

#### 7. VITE_ADSENSE_PUBLISHER_ID
- Name: `VITE_ADSENSE_PUBLISHER_ID`
- Value: `ca-pub-1748114809461794`

---

## Firebase Console에서 값 확인하기

1. [Firebase Console](https://console.firebase.google.com/project/gyulmo-advant-calendar/settings/general) 접속
2. 왼쪽 메뉴에서 ⚙️ **프로젝트 설정** 클릭
3. **일반** 탭 선택
4. **내 앱** 섹션에서 웹 앱 선택 (또는 새로 추가)
5. **SDK 설정 및 구성** 섹션에서 `firebaseConfig` 확인

```javascript
const firebaseConfig = {
  apiKey: "AIza...",                    // ← 이것
  authDomain: "your-project.firebaseapp.com",  // ← 이것
  projectId: "gyulmo-advant-calendar",   // ← 이것
  storageBucket: "your-project.appspot.com",   // ← 이것
  messagingSenderId: "123456789",        // ← 이것
  appId: "1:123456789:web:abc123"        // ← 이것
};
```

---

## 확인 방법

Secrets 추가 후:
1. **Actions** 탭에서 최신 워크플로우 확인
2. 푸시할 때마다 자동으로 빌드 및 배포가 진행됩니다
3. 배포된 사이트에서 Firebase가 정상 작동하는지 확인

---

## ⚠️ 중요 사항

1. **Secrets는 한 번만 설정하면 계속 사용됩니다**
2. **Secrets 값은 절대 공개하지 마세요**
3. **모든 값은 따옴표 없이 입력하세요**
4. **Secrets를 수정하면 다음 배포부터 적용됩니다**

---

## 문제 해결

### Secrets가 적용되지 않는 경우
- 저장소 Settings → Secrets and variables → Actions에서 확인
- Secrets 이름이 정확한지 확인 (대소문자 구분)
- GitHub Actions 로그에서 환경 변수 확인

### 빌드 실패 시
- Actions 탭에서 실패한 워크플로우 클릭
- 빌드 단계 로그 확인
- Missing secret 오류인지 확인

---

**이제 GitHub Actions가 자동으로 Firebase와 AdSense를 사용하여 배포합니다!** 🚀

