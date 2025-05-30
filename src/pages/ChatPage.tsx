import React, {useEffect, useRef, useState} from 'react';
import {Platform, ScrollView, Keyboard, Alert} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import axios from 'axios';
import {WEBSOCKET_URL, API_URL} from '@env';
import RNFS from 'react-native-fs';
import ChatLayout from '../components/layouts/ChatLayout.tsx';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// 오디오 녹음 객체 생성
const audioRecorderPlayer: AudioRecorderPlayer = new AudioRecorderPlayer();

const ChatPage = () => {
  // 상태 변수를 선언
  const [inputText, setInputText] = useState<string>(''); // 입력 테스트
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true); // 초기 로딩 상태
  const [isRecording, setIsRecording] = useState<boolean>(false); // 녹음 중인지 여부
  const [isRecieving, setIsReceiving] = useState<boolean>(false); // 응답 수신 중 여부

  const scrollViewRef = React.useRef<ScrollView>(null); // ScrollView 참조
  const isRecordingRef = React.useRef(isRecording); // 녹음 상태 저장 Ref

  const wsRef = useRef<WebSocket | null>(null);
  const messageQueueRef = useRef<
    {
      userMessageContent: string;
      conversationHistory: ChatMessage[];
    }[]
  >([]);

  const resetChat = () => {
    setMessages([]);
    setIsLoading(true);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
  };

  const sendMessage = (
    userMessageContent: string,
    conversationHistory: ChatMessage[],
  ) => {
    const payload = {
      type: 'chat_request',
      userMessages: userMessageContent,
      messages: conversationHistory,
    };
    console.log('Sending payload:', payload);

    // WebSocket이 연결되어 있으면 즉시 전송
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      setIsReceiving(true);
    } else {
      // 연결되지 않았으면 큐에 저장하고 연결 시도
      messageQueueRef.current.push({userMessageContent, conversationHistory});
      // WebSocket 재연결 로직이 있다면 여기서 호출
      receviedMessage();
    }
  };

  // 서버에 전송 시 호출
  const handleSend = () => {
    const text = inputText.trim();
    if (!text) {
      return;
    }

    const userMsg: ChatMessage = {role: 'user', content: text};
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    setInputText(''); // 입력값 초기화
    setIsLoading(false);

    // 메시지 전송 (WebSocket으로)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // WebSocket이 열려있으면 즉시 전송
      sendMessage(text, updatedMessages);
    } else {
      // WebSocket이 닫혀있으면 큐에 추가하고 연결 시도
      messageQueueRef.current.push({
        userMessageContent: text,
        conversationHistory: updatedMessages,
      });
      receviedMessage(); // WebSocket 연결 시도
    }
  };

  // WebSocket을 통한 메시지 수신 처리
  const receviedMessage = () => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current?.readyState === WebSocket.CONNECTING)
    ) {
      console.log('웹소켓이 이미 연결되어 있습니다.');
      return;
    }

    wsRef.current = new WebSocket(WEBSOCKET_URL);

    wsRef.current.onopen = () => {
      while (messageQueueRef.current.length > 0) {
        const {userMessageContent, conversationHistory} =
          messageQueueRef.current.shift()!;

        const payload = {
          type: 'chat_request',
          userMessages: userMessageContent,
          messages: conversationHistory,
        };

        console.log('Sending queued payload:', payload);
        wsRef.current?.send(JSON.stringify(payload));
        setIsReceiving(true);
      }
    };

    wsRef.current.onmessage = event => {
      try {
        const botMsg: ChatMessage = {role: 'assistant', content: event.data};
        setMessages(prev => [...prev, botMsg]);

        setTimeout(() => setIsReceiving(false), 500);
      } catch (error) {
        console.error('WebSocket에서 발생한: ', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    wsRef.current.onerror = error => {
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
      // userMessages={userMessages}
      // botMessages={botMessages}
      messages={messages}
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
