# 🖍️ SketchaRoom

실시간으로 생각을 선과 색으로 이어주는 초경량 협업 화이트보드 ✍️  
친구, 가족, 연인과 함께 웹 브라우저만으로 그림 기반 소통을 경험하세요.

[👉 배포 링크](https://sketcharoom-bcd40.web.app)

---

## 🧩 기획 배경

- 친구, 가족, 연인과 **전화나 디스코드 등으로 통화하면서 말로만 설명하려다 이해가 안 되는 상황**이 자주 발생합니다.
- 특히 **공간 배치, 도식 설명, 아이디어 스케치 등은 말보다 그림이 훨씬 효과적**인데, 이를 실시간으로 공유할 수 있는 도구는 제한적입니다.
- 구글 잼보드, 슬랙 캔버스 등 유사 툴은 **복잡하고 무거운 UX로 인해 일상적 사용에는 부담**이 있습니다.

---

## 🔍 해결 컨셉

- **설명이 막힐 때 바로 열 수 있는 초경량 웹 기반 실시간 화이트보드**를 제공합니다.
- 로그인 없이도 URL 또는 QR 초대만으로 **누구나 접속 가능**
- 로그인 시 **방 생성 및 히스토리 열람** 기능 제공
- **WebSocket 기반 실시간 동기화**
- 브라우저만 있으면 설치 없이 즉시 사용 가능

**공유 흐름:**

1. 로그인 → 방 만들기  
2. URL/QR 코드로 친구 초대  
3. 실시간 드로잉 협업

---

## ✍️ 기대 효과

- **즉흥적인 설명/소통에서의 높은 이해도 증가**  
  → "아! 이 말이었구나"를 유도하는 직관적 소통 도구  
- **복잡한 UX 없이 최소한의 UI에 집중**  
  → 그림 그리고 나누는 데에만 집중된 경험  
- **협업, 브레인스토밍, 강의 등 확장성 높은 활용도**  
  → 친구·연인·동료와 일상 속 아이디어 공유 도구로 발전 가능성

---

## 💬 와이어프레임

👉 [와이어프레임 링크 (Canva)](https://www.canva.com/design/DAGnSGK8BbM/QPT2M9Pinb-6b7u02sPRDA/edit?utm_content=DAGnSGK8BbM&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

---

## 🧭 프로젝트 주요 기능

### 1. 🔗 방 생성 및 초대
- 로그인 후 고유한 방 생성 (UUID 기반)
- URL 복사 및 QR 코드 공유
- 로그인 없이 누구나 즉시 입장 가능

### 2. 🖌️ 실시간 드로잉 캔버스
- `fabric.js` 기반 자유 드로잉, 텍스트, 도형, 이미지 삽입
- 객체 선택/이동/삭제 등 기본 편집 기능
- `Zustand`로 캔버스 상태 전역 관리

### 3. 🔄 WebSocket 실시간 협업
- 같은 방 사용자 간 드로잉 작업 실시간 반영
- 다중 사용자 간 동시에 협업 가능

### 4. 💾 히스토리 저장 및 불러오기
- Firestore에 방 정보 및 캔버스 스냅샷 저장
- 이전 기록 클릭 시 상태 복원 가능

### 5. 🔐 Firebase 기반 인증
- 이메일/비밀번호 및 Google 소셜 로그인 지원
- `onAuthStateChanged`로 로그인 상태 전역 감지

---

## ⚙️ 기술 스택

| 항목             | 구성                                                           |
|------------------|----------------------------------------------------------------|
| Frontend         | React 18, TypeScript, Vite, styled-components                 |
| 상태 관리        | Zustand                                                        |
| 인증 / DB        | Firebase Authentication / Firestore / Storage                |
| 실시간 동기화    | WebSocket (Render 서버)                                       |
| 배포             | Firebase Hosting, Vercel                                      |
| UI 라이브러리    | Radix UI, react-icons                                         |

---

## 🗂️ 주요 폴더 구조

```bash
sketcha-room/
├── src/
│   ├── apis/        # Firebase 및 WebSocket 연동 함수
│   ├── components/
│   │   ├── common/  # Header, Button, Toolbar 등 공통 UI
│   │   ├── canvas/  # FabricCanvas, ToolButtons 등 화이트보드 요소
│   │   ├── room/    # 방 생성, 입장 카드, History 컴포넌트
│   │   └── modal/   # 공유 모달 등 Radix 기반 모달
│   ├── hooks/       # 커스텀 훅 (예: useCanvasStore, useLeaveRoom)
│   ├── libs/        # Firebase 초기화, Google 로그인 등 유틸
│   ├── pages/       # 주요 라우팅 페이지 (Home, Room 등)
│   ├── routes/      # 라우팅 정의 및 입장 처리
│   ├── stores/      # Zustand 상태 관리 (캔버스, 사용자 등)
│   ├── styles/      # 전역 스타일, reset.css 등
│   ├── types/       # 프로젝트 전역 타입 정의
│   ├── App.tsx      # 전체 앱 구성 및 인증 상태 연결
│   ├── main.tsx     # ReactDOM 렌더링 진입점
│   └── vite-env.d.ts # Vite + TS용 환경 타입 선언
```
📦 설치 및 실행

```bash
# 1. 필수 개발 의존성 설치 (Vite + TypeScript)
npm install --save-dev vite typescript

# 2. 프로젝트 의존성 설치
npm install

# 3. 프론트엔드 개발 서버 실행
npm run dev

# 4. 백엔드(WebSocket 서버 등) 실행
node server.js
```

📄 .env 환경 변수 예시
```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_WS_SERVER_URL=wss://your-websocket-server```
