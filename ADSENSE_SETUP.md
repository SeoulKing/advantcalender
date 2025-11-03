# Google AdSense 설정 가이드 📢

이 가이드는 디지털 어드벤트 캘린더에 Google AdSense를 연동하는 방법을 단계별로 설명합니다.

## 📋 사전 준비

1. Google 계정 준비
2. 웹사이트가 Firebase Hosting에 배포되어 있어야 함
3. 사이트에 실제 콘텐츠가 있어야 함 (AdSense 승인 조건)

---

## 1단계: AdSense 계정 생성 및 승인

### 1-1. AdSense 신청
1. [Google AdSense 공식 사이트](https://www.google.com/adsense/start/) 접속
2. Google 계정으로 로그인
3. **"시작하기"** 클릭

### 1-2. 사이트 등록
1. 웹사이트 URL 입력 (예: `https://gyulmo-advant-calendar.web.app`)
2. 사이트 언어 선택: 한국어
3. 국가/지역 선택: 대한민국
4. 동의 확인 및 **"계속"** 클릭

### 1-3. 승인 대기
⚠️ **중요**: AdSense 승인은 보통 **24-48시간** 소요됩니다.
- 이메일로 승인 여부가 전달됩니다
- 승인되기 전까지는 Mock 광고만 표시됩니다
- 승인 전에 실제 광고 코드를 넣어도 작동하지 않습니다

---

## 2단계: 광고 단위 생성

### 2-1. 광고 단위 추가
1. AdSense 계정에 로그인
2. 왼쪽 메뉴에서 **"광고"** 클릭
3. **"광고 단위"** 섹션에서 **"+ 새 광고 단위"** 클릭

### 2-2. 광고 단위 설정
1. **광고 이름**: 적절한 이름 입력 (예: "Advant Calendar Bottom Ad")
2. **광고 크기**: **"반응형"** 또는 **"자동 크기"** 선택
3. **광고 유형**: **"디스플레이 광고"** 선택
4. **"생성"** 클릭

### 2-3. 광고 코드 확인
생성된 광고 단위에서 다음 정보를 확인하세요:
- **발행자 ID** (Publisher ID): `ca-pub-XXXXXXXXXX` 형식
- **광고 슬롯 ID** (Ad Slot ID): 숫자로 구성

---

## 3단계: 환경 변수 설정

### 3-1. `.env` 파일 설정
프로젝트 루트의 `.env` 파일에 다음 변수를 추가하세요:

```env
# 기존 Firebase 설정 변수들...
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Google AdSense 설정 (승인 받은 후 추가)
VITE_ADSENSE_ENABLED=true
VITE_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXX
```

⚠️ **주의**:
- `VITE_ADSENSE_PUBLISHER_ID`는 AdSense 승인 후 받은 실제 발행자 ID로 교체하세요
- 승인 전에는 `VITE_ADSENSE_ENABLED=true`를 추가하지 말고 Mock 광고로 테스트하세요

### 3-2. 광고 슬롯별 설정 (선택사항)
광고를 여러 개 넣고 싶다면, 각 페이지에서 `adSlot` prop을 지정할 수 있습니다:

```jsx
// Home.jsx
<AdSenseController 
  adSlot="1234567890"  // 실제 광고 슬롯 ID
  position="bottom" 
/>
```

---

## 4단계: 광고 표시 확인

### 4-1. 개발 서버에서 테스트
1. 개발 서버 재시작:
   ```bash
   npm run dev
   ```

2. 브라우저에서 사이트 접속 및 광고 영역 확인:
   - Mock 광고: 회색 점선 박스로 표시
   - 실제 광고: Google AdSense 광고가 표시됨

### 4-2. 배포 후 확인
1. GitHub에 푸시:
   ```bash
   git add .
   git commit -m "feat: AdSense 추가"
   git push
   ```

2. 자동 배포 완료 후 Firebase Hosting 사이트 방문
3. 실제 광고가 표시되는지 확인

---

## 5단계: 수익 확인

### 5-1. AdSense 대시보드 확인
1. [AdSense 대시보드](https://www.google.com/adsense/) 접속
2. **"수익"** 섹션에서 실시간 수익 확인
3. **"광고 보고서"**에서 클릭률(CTR) 등 성과 지표 확인

### 5-2. 최적화 팁
- **광고 위치**: 콘텐츠와 균형을 맞춰 사용자 경험을 해치지 않는 위치
- **광고 크기**: 반응형 광고 사용으로 다양한 화면 크기에 대응
- **광고 개수**: 너무 많으면 사용자 경험이 나빠질 수 있음

---

## ⚠️ 주의사항

### AdSense 정책 준수
1. **클릭 유도 금지**: "클릭하세요" 등 광고 클릭 유도 금지
2. **자동 클릭 금지**: 봇 등으로 광고 클릭 시도 금지
3. **콘텐츠 요구사항**: 최소한의 품질 있는 콘텐츠 필요
4. **트래픽**: 실제 사용자 트래픽 필요 (가짜 트래픽 금지)

### 정책 위반 시
- 계정 경고 또는 정지 가능
- 수익 지급 중단 가능
- 계정 영구 정지 가능

---

## 🔧 문제 해결

### 광고가 표시되지 않는 경우

1. **AdSense 승인 확인**
   - AdSense 계정에서 "사이트" 상태 확인
   - 승인 대기 중이면 기다리기

2. **환경 변수 확인**
   ```bash
   # .env 파일에서 확인
   VITE_ADSENSE_ENABLED=true
   VITE_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXX
   ```

3. **빌드 확인**
   - 개발 서버 재시작
   - `npm run build` 후 배포

4. **브라우저 캐시 초기화**
   - Chrome: Ctrl+Shift+Delete
   - 캐시 및 쿠키 삭제 후 새로고침

### Mock 광고가 계속 표시되는 경우

- AdSense가 아직 승인되지 않았거나
- 환경 변수가 제대로 설정되지 않았을 가능성
- 위의 "광고가 표시되지 않는 경우" 섹션 참고

---

## 📚 참고 자료

- [AdSense 공식 사이트](https://www.google.com/adsense/)
- [AdSense 정책](https://support.google.com/adsense/answer/48182)
- [AdSense 도움말](https://support.google.com/adsense/)

---

**부자가 되는 그날까지 화이팅!** 💰🎉

