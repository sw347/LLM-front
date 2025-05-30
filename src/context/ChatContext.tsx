import {WEBSOCKET_URL} from '@env';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {Alert} from 'react-native';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isReceiving: boolean;
  isRecording: boolean;
  inputText: string;
}

interface ChatContextType extends ChatState {
  addMessage: (messages: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setIsLoading: (loading: boolean) => void;
  setIsReceiving: (receiving: boolean) => void;
  setIsRecording: (recording: boolean) => void;
  setInputText: (text: string) => void;
  sendMessage: (text: string) => void;
  resetChat: () => void;
}

const defaultChatContextValue: ChatContextType = {
  messages: [],
  isLoading: true,
  isReceiving: false,
  isRecording: false,
  inputText: '',
  addMessage: () => {},
  setMessages: () => {},
  setIsLoading: () => {},
  setIsReceiving: () => {},
  setIsRecording: () => {},
  setInputText: () => {},
  sendMessage: () => {
    console.log('sendMessage기능이 구현되지 않았습니다.');
  },
  resetChat: () => {
    console.log('resetChat기능이 구현되지 않았습니다.');
  },
};

export const ChatContext = createContext<ChatContextType>(
  defaultChatContextValue,
);

export const ChatProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(
    defaultChatContextValue.messages,
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    defaultChatContextValue.isLoading,
  );
  const [isReceiving, setIsReceiving] = useState<boolean>(
    defaultChatContextValue.isReceiving,
  );
  const [isRecording, setIsRecording] = useState<boolean>(
    defaultChatContextValue.isRecording,
  );
  const [inputText, setInputText] = useState<string>(
    defaultChatContextValue.inputText,
  );

  const wsRef = useRef<WebSocket | null>(null);
  const messageQueueRef = useRef<
    {
      userMessageContent: string;
      conversationHistory: ChatMessage[];
    }[]
  >([]);

  const connectWebSocket = useCallback(() => {
    if (
      wsRef.current &&
      (wsRef.current.OPEN === WebSocket.OPEN ||
        wsRef.current?.CONNECTING === WebSocket.CONNECTING)
    ) {
      console.log('WebSocket이 이미 열려있거나 연결중입니다.');
      return;
    }

    wsRef.current = new WebSocket(WEBSOCKET_URL);

    wsRef.current.onopen = () => {
      while (messageQueueRef.current.length > 0) {
        const {userMessageContent, conversationHistory} =
          messageQueueRef.current.shift()!;

        // 이거 이유 찾기
        const payload = {
          type: 'chat_request',
          userMessages: userMessageContent,
          messages: conversationHistory,
        };

        wsRef.current?.send(JSON.stringify(payload));
        setIsReceiving(true);
      }
    };

    wsRef.current.onmessage = event => {
      try {
        const botMsg: ChatMessage = {role: 'assistant', content: event.data};
        setMessages(prev => [...prev, botMsg]);
      } catch (error) {
        console.error('WebSocket에서 발생한: ', error);
      } finally {
        setTimeout(() => setIsReceiving(false), 500);
        if (isLoading) {
          setIsLoading(false);
        }
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      wsRef.current = null;
      setIsReceiving(false);
    };

    wsRef.current.onerror = error => {
      console.error('WebSocket 에러:', error);
      Alert.alert('오류', '서버와의 연결에 문제가 발생했습니다.');
    };
  }, [isLoading]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prevMessages => [...prevMessages, message]);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = {role: 'user', content: text};
      const updateMessages = [...messages, userMsg];

      addMessage(userMsg);
      setInputText('');
      setIsLoading(false);

      const payload = {
        type: 'chat_request',
        userMessage: text,
        messages: updateMessages,
      };

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
        setIsReceiving(true);
      } else {
        messageQueueRef.current.push({
          userMessageContent: text,
          conversationHistory: updateMessages,
        });
        connectWebSocket();
      }
    },
    [messages, addMessage, connectWebSocket],
  );

  const resetChat = useCallback(() => {
    setMessages([]);
    setIsLoading(true);
    setIsReceiving(false);
    setIsRecording(false);
    setInputText('');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    wsRef.current = null;
    messageQueueRef.current = [];
  }, []);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [connectWebSocket]);

  const contextValue = React.useMemo(
    () => ({
      messages,
      isLoading,
      isReceiving,
      isRecording,
      inputText,
      setMessages,
      addMessage,
      setIsLoading,
      setIsReceiving,
      setIsRecording,
      setInputText,
      sendMessage,
      resetChat,
    }),
    [
      messages,
      isLoading,
      isReceiving,
      isRecording,
      inputText,
      setMessages,
      addMessage,
      setIsLoading,
      setIsReceiving,
      setIsRecording,
      setInputText,
      sendMessage,
      resetChat,
    ],
  );

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext는 ChatProvider 내에서 사용해야 합니다.');
  }
  return context;
};
