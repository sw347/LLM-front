import React from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';
import ChatMessages from '../molecules/ChatMessages';

interface ChatScrollViewProps {
  usermessages: string[];
  botmessages: string[];
  isLoading: boolean;
  scrollViewRef: React.RefObject<ScrollView | null>;
  onContentSizeChange: () => void;
}

const ChatScrollView = ({
  usermessages,
  botmessages,
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
      <ChatMessages userMessages={usermessages} botMessages={botmessages} />
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
