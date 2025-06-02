import React, {createContext, useContext} from 'react';
import useChatState from './useChatState';

const ChatContext = createContext<any>(null);
export const useChatContext = () => useContext(ChatContext);

export const ChatProvider = ({children}: {children: React.ReactNode}) => {
  const chatState = useChatState();

  return (
    <ChatContext.Provider value={chatState}>{children}</ChatContext.Provider>
  );
};
