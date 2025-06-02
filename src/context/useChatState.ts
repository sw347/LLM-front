import {useRef, useState} from 'react';
import {ScrollView} from 'react-native';
import {ChatMessageType} from '../types/ChatMessageType';
import useWebSocket from './useWebSocket.ts';
import useAudioRecorder from './useAudioRecorder.ts';

export default function useChatState() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const {sendMessage, receviedMessage, resetWebSocket} = useWebSocket(
    messages,
    setMessages,
    setIsReceiving,
  );

  const {startRecording, stopRecording} = useAudioRecorder(
    setIsReceiving,
    setInputText,
    setIsRecording,
    inputText,
  );

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

  const resetChat = () => {
    setMessages([]);
    setIsLoading(true);
    resetWebSocket();
  };

  return {
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
    setIsRecording,
    receviedMessage,
  };
}
