import React, {useEffect} from 'react';
import {Keyboard, KeyboardAvoidingView, Platform, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {styles} from './ChatTemplate.styles.ts';
import ChatScrollView from '../organisms/ChatScrollView.tsx';
import Button from '../atoms/Button.tsx';
import InputWithButton from '../molecules/InputWithButton.tsx';
import LoadingSpinner from '../atoms/LoadingOveray.tsx';
import {useChatContext} from '../../context/ChatContext.tsx';

const ChatTemplate = () => {
  const {isRecording, stopRecording, resetChat, scrollViewRef} =
    useChatContext();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollViewRef.current?.scrollToEnd({animated: true});
      },
    );

    return () => {
      keyboardDidShowListener.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.safearea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        {/* 상단 리셋 버트 */}
        <View style={styles.resetBox}>
          <Button style={styles.button} onPress={resetChat} text="리셋하기" />
        </View>
        {/* 채팅 메시지 표시 영역 */}
        <ChatScrollView />
        {/* 입력창 및 음성 버튼 */}
        <InputWithButton />

        {/* 녹음 중일 때 생기는 오버레이*/}
        <LoadingSpinner isRecording={isRecording} onPress={stopRecording} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatTemplate;
