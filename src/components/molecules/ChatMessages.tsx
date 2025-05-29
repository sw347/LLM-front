import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface ChatMessagesProps {
  userMessages: string[];
  botMessages: string[];
}

interface ChatMessage {
  type: 'user' | 'bot';
  text: string;
}

const ChatMessages = ({userMessages, botMessages}: ChatMessagesProps) => {
  const mergedMessages: ChatMessage[] = [];

  userMessages.forEach((userMsg, i) => {
    mergedMessages.push({type: 'user', text: userMsg});
    if (botMessages[i]) {
      mergedMessages.push({type: 'bot', text: botMessages[i]});
    }
  });

  return (
    <>
      {mergedMessages.map((msg, index) => (
        <View
          key={index}
          style={msg.type === 'user' ? styles.userChat : styles.botChat}>
          <Text style={styles.messageText}>{msg.text}</Text>
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
