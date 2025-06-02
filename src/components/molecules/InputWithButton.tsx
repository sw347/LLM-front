import React from 'react';
import {StyleSheet, View} from 'react-native';
import TextInputBox from '../atoms/TextInput';
import Button from '../atoms/Button';
import {useChatContext} from '../../context/ChatContext';

const InputWithButton = () => {
  const {isRecording, isReceiving, startRecording, stopRecording} =
    useChatContext();

  return (
    <View style={[styles.container]}>
      <TextInputBox />
      <Button
        style={styles.button}
        onPress={isRecording ? stopRecording : startRecording}
        text="음성"
        disabled={isReceiving}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#6A9097',
  },
  button: {
    height: 40,
    width: 40,
    borderRadius: '100%',
  },
});

export default InputWithButton;
