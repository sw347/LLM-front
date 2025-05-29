import React from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {styles} from './ChatLayout.styles.ts';
import ChatScrollView from '../organisms/ChatScrollView';
import Button from '../atoms/Button.tsx';
import InputWithButton from '../molecules/InputWithButton';

interface ChatLayoutProps {
  userMessages: string[];
  botMessages: string[];
  scrollViewRef: React.RefObject<ScrollView | null>;
  isLoading: boolean;
  inputText: string;
  isRecording: boolean;
  isRecieving: boolean;
  setInputText: (text: string) => void;
  handleSend: () => void;
  receviedMessage: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  resetChat: () => void;
}

const ChatLayout = ({
  userMessages,
  botMessages,
  scrollViewRef,
  isLoading,
  inputText,
  isRecording,
  isRecieving,
  setInputText,
  handleSend,
  receviedMessage,
  startRecording,
  stopRecording,
  resetChat,
}: ChatLayoutProps) => {
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
        <ChatScrollView
          usermessages={userMessages}
          botmessages={botMessages}
          scrollViewRef={scrollViewRef}
          isLoading={isLoading}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({animated: true});
          }}
        />
        {/* 입력창 및 음성 버튼 */}
        <InputWithButton
          inputValue={inputText}
          onInputChange={text => {
            setInputText(text);
            if (text.endsWith('\n')) {
              handleSend();
              receviedMessage();
            }
          }}
          onSubmitEditing={() => {
            handleSend();
            receviedMessage();
          }}
          onButtonPress={isRecording ? stopRecording : startRecording}
          inputPlaceholder="메시지를 입력하세요"
          buttonText="음성"
          maxLength={100}
          disabled={isRecieving}
        />

        {/* 녹음 중일 때 생기는 오버레이*/}
        {isRecording && (
          <Button
            style={styles.overlay}
            onPress={stopRecording}
            text="탭하여 녹음 중지(최대 10초)"
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatLayout;
