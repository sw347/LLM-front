import {useRef} from 'react';
import {WEBSOCKET_URL} from '@env';
import {Alert} from 'react-native';
import {ChatMessageType} from '../types/ChatMessageType';

export default function useWebSocket(
  messages: ChatMessageType[],
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageType[]>>,
  setIsReceiving: (val: boolean) => void,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const messageQueueRef = useRef<
    {userMessageContent: string; conversationHistory: ChatMessageType[]}[]
  >([]);

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
      receviedMessage(); // 연결 재시도
    }
  };

  const receviedMessage = () => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    if (wsRef.current) {
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

    wsRef.current.onerror = err => {
      console.error('WebSocket 에러:', err);
      Alert.alert('오류', '서버와 WebSocket 연결 실패');
    };
  };

  const resetWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
  };

  return {sendMessage, receviedMessage, resetWebSocket};
}
