# LLM 애플리케이션

이 앱은 **Whisper를 이용한 음성 인식(STT)**과 WebSocket을 통한 GPT 챗봇 기능을 제공하는 React Native 기반의 모바일 애플리케이션입니다.

Whisper STT와 OpenAI 기반 챗봇 서버와 연동하여, 사용자가 음성 또는 텍스트로 질문하면 AI가 답변을 제공합니다.

## 주요 기능

### 음성 녹음 및 변환

- 버튼을 눌러 음성 녹음을 시작할 수 있습니다.
- 최대 10초 동안 녹음이 가능하며, 자동 또는 수동으로 종료됩니다.
- 서버에서 텍스트를 반환하는 시간은 최대 10초 정도 걸릴 수 있습니다.
- 녹음된 음성 파일은 Whisper STT 서버에 전송되어 텍스트로 변환됩니다.
- 변환된 텍스트는 자동으로 삽입되어 GPT 챗봇과의 대화에 활용됩니다.
- 음성 파일이 텍스트로 변환되어 서버에서 돌아올 동안 텍스트 입력 및 음성 녹음이 불가능합니다.

### WebSocket 기반 GPT 챗봇

- 사용자가 텍스트 입력 후 enter키를 눌러서 전송하면 WebSocket을 통해 GPT 서버와 통신합니다.
- 입력한 메시지에 대한 GPT의 답변을 받아 화면에 출력합니다.
- 리셋 버튼을 통해 채팅 내역을 초기화 할 수 있습니다.
- 서버에 데이터를 전송 후 돌아올 동안 텍스트 입력 및 음성 녹음이 불가능합니다.

## 아토믹 디자인 적용

Atomic Design 패턴을 적용하여 컴포넌트를 세분화하고, 재사용성과 유지보수성을 강화하였습니다.

## 프로젝트 구조

- App.tsx - 전체 앱의 뷰, 음성녹음, WebSocket 통신, 메시지 렌더링 로직 포함
- src/<br/>
  ├── components/<br/>
  │ ├── atoms/ - 기본 단위 UI 컴포넌트<br/>
  │ ├── molecules/ - 두 개 이상의 atom 조합<br/>
  │ ├── organisms/ - 완전한 기능 단위 구성<br/>
  │ └── layouts/ - 전체 페이지 구조 (e.g. ChatLayout.tsx)<br/>
  ├── pages/ - 비즈니스 로직을 포함하는 페이지 컴포넌트<br/>
  └── api/ - Axios 기반 API 통신 로직

## 기능 흐름도

1. 사용자가 음성 또는 텍스트를 입력
2. 음성 입력 시 Whisper STT 서버로 오디오 전송
3. 텍스트 결과 수신 후 GPT 서버에 전송
4. WebSocket을 통해 GPT 응답 수신 후 화면에 출력

## 실행 방법

1. 패키지 설치

```
npm install
```

2. .env 파일에 환경 변수 설정:

```
WEBSOCKET_URL=ws://<your-server>:<port>
API_URL=http://<your-server>:<port>
```

3. Android/iOS 환경에서 앱 실행:

```
npx react-native run-android
또는
npx react-native run-ios
```

## 사용 기술 스택

- React Native
- TypeScript
- WebSocket
- Axios
- react-native-audio-recorder-player
