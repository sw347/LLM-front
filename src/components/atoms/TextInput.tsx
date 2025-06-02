import React from 'react';
import {StyleSheet, TextInput} from 'react-native';
import {useChatContext} from '../../context/ChatContext';

const TextInputBox = () => {
  const {inputText, handleSend, setInputText, receviedMessage, isReceiving} =
    useChatContext();

  const handleChange = (text: string) => {
    setInputText(text);
    if (text.endsWith('\n')) {
      handleSend();
      receviedMessage();
    }
  };

  const handleSubmit = () => {
    handleSend();
    receviedMessage();
  };

  return (
    <TextInput
      style={styles.input}
      placeholder="메시지를 입력해주세요"
      placeholderTextColor="#888"
      value={inputText}
      onChangeText={handleChange}
      onSubmitEditing={handleSubmit}
      maxLength={100}
      editable={!isReceiving}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderColor: '#6A9097',
  },
});

export default TextInputBox;
