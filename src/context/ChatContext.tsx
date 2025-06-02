import React, {createContext, useContext, useRef, useState} from 'react';
import {ScrollView, Platform, Alert} from 'react-native';
import {ChatMessageType} from '../types/ChatMessageType';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import axios from 'axios';
import {WEBSOCKET_URL, API_URL} from '@env';

const ChatContext = createContext<any>(null);
export const useChatContext = () => useContext(ChatContext);

const audioRecorderPlayer = new AudioRecorderPlayer();

export const ChatProvider = ({children}: {children: React.ReactNode}) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messageQueueRef = useRef<
    {userMessageContent: string; conversationHistory: ChatMessageType[]}[]
  >([]);
  const isRecordingRef = useRef(isRecording);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetChat = () => {
    setMessages([]);
    setIsLoading(true);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
  };

  const sendMessage = (
    userMessageContent: string,
    conversationHistory: ChatMessageType[],
  ) => {
    const payload = {
      type: 'chat_request',
      userMessages: userMessageContent,
      messages: conversationHistory,
    };
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
      setIsReceiving(true);
    } else {
      messageQueueRef.current.push({userMessageContent, conversationHistory});
      receviedMessage(); // 재연결 요청만
    }
  };

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) {
      return;
    }
    const userMsg: ChatMessageType = {role: 'user', content: text};
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(false);

    sendMessage(text, updatedMessages);
  };

  const receviedMessage = () => {
    // WEBSOCKET_URL이 올바른지 확인 필요
    if (wsRef.current) {
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        return;
      }
      // 기존 연결 정리
      wsRef.current.close();
    }

    wsRef.current = new WebSocket(WEBSOCKET_URL);

    wsRef.current.onopen = () => {
      console.log('WebSocket 연결됨');

      while (messageQueueRef.current.length > 0) {
        const {userMessageContent, conversationHistory} =
          messageQueueRef.current.shift()!;
        wsRef.current?.send(
          JSON.stringify({
            type: 'chat_request',
            userMessages: userMessageContent,
            messages: conversationHistory,
          }),
        );
        setIsReceiving(true);
      }
    };

    wsRef.current.onmessage = event => {
      const botMsg: ChatMessageType = {
        role: 'assistant',
        content: event.data,
      };
      setMessages(prev => [...prev, botMsg]);
      setTimeout(() => setIsReceiving(false), 500);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket 닫힘');
    };

    wsRef.current.onerror = error => {
      console.error('WebSocket 에러:', error);
      Alert.alert('오류', '서버와 WebSocket 연결 실패');
      wsRef.current = null;
    };
  };

  const startRecording = async () => {
    if (isRecordingRef.current) {
      return;
    }

    const path = Platform.select({
      ios: 'recording.m4a',
      android: `${RNFS.DocumentDirectoryPath}/recording.wav`,
    });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      await audioRecorderPlayer.startRecorder(path!);
      setIsRecording(true);
      isRecordingRef.current = true;
    } catch (e) {
      console.log('녹음 시작 실패:', e);
    }

    timeoutRef.current = setTimeout(() => {
      if (isRecordingRef.current) {
        stopRecording();
      }
    }, 10000);
  };

  const stopRecording = async () => {
    if (!isRecordingRef.current) {
      return;
    }

    setIsRecording(false);
    isRecordingRef.current = false;

    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      sendAudioToServer(result);
    } catch (e) {
      console.error('녹음 종료 실패:', e);
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const sendAudioToServer = async (filePath: string) => {
    const formData = new FormData();
    formData.append('audio', {
      uri: filePath,
      type: 'audio/m4a',
      name: 'audioRecording.m4a',
    });

    setIsReceiving(true);
    const saveText = inputText;
    setInputText('입력 및 음성 녹음이 불가능합니다.');

    try {
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
    } catch (err) {
      console.log('오디오 전송 실패:', err);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        inputText,
        setInputText,
        messages,
        isLoading,
        isRecording,
        isReceiving,
        scrollViewRef,
        handleSend,
        startRecording,
        stopRecording,
        resetChat,
        receviedMessage,
      }}>
      {children}
    </ChatContext.Provider>
  );
};
