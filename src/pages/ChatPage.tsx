import React, {useEffect, useState} from 'react';
import {Platform, ScrollView, Keyboard, Alert} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import axios from 'axios';
import {WEBSOCKET_URL, API_URL} from '@env';
import RNFS from 'react-native-fs';
import ChatLayout from '../components/layouts/ChatLayout.tsx';

// 오디오 녹음 객체 생성
const audioRecorderPlayer: AudioRecorderPlayer = new AudioRecorderPlayer();

// WebSocket 전역 변수 선언
let ws: WebSocket | null = null;

const ChatPage = () => {
  // 상태 변수를 선언
  const [inputText, setInputText] = useState<string>(''); // 입력 테스트
  const [userMessages, setUserMessages] = useState<string[]>([]); // 사용자 메시지 리스트
  const [botMessages, setBotMessages] = useState<string[]>([]); // AI 응답 메시지 리스트
  const [isLoading, setIsLoading] = useState<boolean>(true); // 초기 로딩 상태
  const [isRecording, setIsRecording] = useState<boolean>(false); // 녹음 중인지 여부
  const [isRecieving, setIsReceiving] = useState<boolean>(false); // 응답 수신 중 여부

  const scrollViewRef = React.useRef<ScrollView>(null); // ScrollView 참조
  const isRecordingRef = React.useRef(isRecording); // 녹음 상태 저장 Ref

  // 서버에 전송 시 호출
  const handleSend = () => {
    if (inputText.trim()) {
      setUserMessages([...userMessages, inputText]); // 사용자 메시지 추가
      setInputText(''); // 입력값 초기화
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setUserMessages([]);
    setBotMessages([]);
    setIsLoading(true);

    ws = new WebSocket(WEBSOCKET_URL);

    if (ws!.readyState === WebSocket.OPEN) {
      ws!.close();
    }
  };

  // WebSocket을 통한 메시지 수신 처리
  const receviedMessage = () => {
    ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      setIsReceiving(true);
      ws!.send(`${inputText}`);
    };

    ws.onmessage = event => {
      setBotMessages([...botMessages, `${event.data}`]);

      setTimeout(() => setIsReceiving(false), 500);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = error => {
      console.error('WebSocket 에러:', error);
      Alert.alert('오류', '서버와의 연결에 문제가 발생했습니다.');
    };
  };

  // 키보드 올라왔을 때 자동으로 스크롤 맨 아래로 이동
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollViewRef.current?.scrollToEnd({animated: true});
      },
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  // isRecording 상태가 변경될 때마다 ref도 업데이트
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // 녹음 시작 함수
  const startRecording = async () => {
    const path = Platform.select({
      ios: 'recording.m4a',
      android: `${RNFS.DocumentDirectoryPath}/recording.wav`,
    });

    try {
      await audioRecorderPlayer.startRecorder(path);
      setIsRecording(true);
    } catch (error) {
      console.log('녹음 시작 실패:', error);
    }

    setTimeout(() => {
      if (isRecordingRef.current) {
        stopRecording();
      }
    }, 10000);
  };

  // 녹음 종료 함수
  const stopRecording = async () => {
    if (!isRecordingRef.current) {
      console.log('Recording is already stopped.');
      return;
    }

    setIsRecording(false);
    isRecordingRef.current = false;

    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      sendAudioToServer(result);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  // 서버로 오디오 파일 전송 함수
  const sendAudioToServer = async (filePath: string) => {
    const formData = new FormData();
    formData.append('audio', {
      uri: filePath,
      type: 'audio/m4a',
      name: 'audioRecording.m4a',
    });

    setIsReceiving(true);

    try {
      const saveText = inputText;
      setInputText('입력 및 음성 녹음이 불가능합니다.');
      await axios
        .post(`${API_URL}/stt`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(res => {
          const text = res.data.text;
          setInputText(saveText + decodeURI(text));
          setTimeout(() => setIsReceiving(false), 500);
        });
    } catch (error) {
      console.log('Error sending audio to server:', error);
    }
  };

  return (
    <ChatLayout
      userMessages={userMessages}
      botMessages={botMessages}
      scrollViewRef={scrollViewRef}
      isLoading={isLoading}
      inputText={inputText}
      isRecieving={isRecieving}
      isRecording={isRecording}
      setInputText={setInputText}
      handleSend={handleSend}
      receviedMessage={receviedMessage}
      startRecording={startRecording}
      stopRecording={stopRecording}
      resetChat={resetChat}
    />
  );
};

export default ChatPage;
