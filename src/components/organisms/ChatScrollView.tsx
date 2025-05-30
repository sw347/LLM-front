import React from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';
import ChatMessages from '../molecules/ChatMessages';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatScrollViewProps {
  messages: ChatMessage[];
  isLoading: boolean;
  scrollViewRef: React.RefObject<ScrollView | null>;
  onContentSizeChange: () => void;
}

const ChatScrollView = ({
  messages,
  isLoading,
  scrollViewRef,
  onContentSizeChange,
}: ChatScrollViewProps) => {
  return (
    <ScrollView
      style={styles.chattingBox}
      ref={scrollViewRef}
      contentContainerStyle={styles.scrollViewContentStyle}
      onContentSizeChange={onContentSizeChange}>
      {isLoading && (
        <Text style={styles.loadingText}>
          뭐든지 물어보세요! {'\n'}AI가 대답합니다
        </Text>
      )}
      <ChatMessages messages={messages} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  chattingBox: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContentStyle: {flexGrow: 1, paddingBottom: 20},
  loadingText: {textAlign: 'center', marginTop: 200},
});

export default ChatScrollView;
