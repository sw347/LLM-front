import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface ChatMessagesProps {
  messages: ChatMessage[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const ChatMessages = ({messages}: ChatMessagesProps) => {
  return (
    <>
      {messages.map((msg, index) => (
        <View
          key={index}
          style={msg.role === 'user' ? styles.userChat : styles.botChat}>
          <Text style={styles.messageText}>{msg.content}</Text>
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  userChat: {
    padding: 10,
    borderRadius: 8,
    borderColor: '#000',
    borderWidth: 1,
    alignSelf: 'flex-end',
    marginTop: 10,
    marginRight: 10,
    marginLeft: 32,
  },
  botChat: {
    padding: 10,
    borderRadius: 8,
    borderColor: '#000',
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginLeft: 10,
    marginRight: 32,
  },
  messageText: {fontSize: 16},
});

export default ChatMessages;
