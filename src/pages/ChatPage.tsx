import React from 'react';
import ChatTemplate from '../components/template/ChatTemplate.tsx';
import {ChatProvider} from '../context/ChatContext.tsx';

const ChatPage = () => {
  return (
    <ChatProvider>
      <ChatTemplate />
    </ChatProvider>
  );
};

export default ChatPage;
