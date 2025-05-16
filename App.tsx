import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Platform,
  TextInput,
  ScrollView,
  Keyboard,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const audioRecorderPlayer = new AudioRecorderPlayer();

function App(): React.JSX.Element {
  const [inputText, setInputText] = useState<string>('');
  const [userMessages, setUserMessages] = useState<string[]>([]);
  const [botMessages, setBotMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const handleSend = () => {
    if (inputText.trim()) {
      setUserMessages([...userMessages, inputText]);
      setInputText('');

      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setUserMessages([]);
    setBotMessages([]);
    setIsLoading(true);
  };

  const receviedMessage = () => {
    setBotMessages([...botMessages, 'AI 답변']);
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollToBottom();
      },
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [userMessages, botMessages]);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({animated: true});
  };

  const startRecording = async () => {
    setIsRecording(true);
    await audioRecorderPlayer.startRecorder();
  };

  const stopRecording = async () => {
    if (!isRecording) {
      console.log('Recording is already stopped.');
      return;
    }

    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      console.log('Recording stopped:', result);
      sendAudioToServer(result);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const sendAudioToServer = async (filePath: string) => {
    const formData = new FormData();
    formData.append('audio', {
      uri: filePath,
      type: 'audio/mp4',
      name: 'audioRecording.mp4',
    });
  };

  // useEffect로 키보드 높이 감지
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      e => {
        setKeyboardHeight(e.endCoordinates.height);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safearea}>
      <View style={styles.container}>
        <View style={styles.resetBox}>
          <TouchableOpacity style={styles.button} onPress={resetChat}>
            <Text>리셋하기</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          ref={scrollViewRef}
          style={{width: '100%'}}
          contentContainerStyle={styles.chatingBox}
          keyboardShouldPersistTaps="handled">
          {isLoading && (
            <Text style={{textAlign: 'center', marginTop: 200}}>
              뭐든지 물어보세요! {'\n'}AI가 대답합니다
            </Text>
          )}
          {userMessages.map((msg, index) => (
            <React.Fragment key={index}>
              <View style={styles.userChat}>
                <Text style={styles.messageText}>{msg}</Text>
              </View>
              {botMessages[index] && (
                <View style={styles.botChat}>
                  <Text style={styles.messageText}>{botMessages[index]}</Text>
                </View>
              )}
            </React.Fragment>
          ))}
        </ScrollView>
        <View style={[styles.inputContainer, {marginBottom: keyboardHeight}]}>
          <TextInput
            style={styles.input}
            placeholder="입력하세요"
            value={inputText}
            scrollEnabled={false}
            onChangeText={text => {
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
            maxLength={50}
            returnKeyType="send"
            blurOnSubmit={false}
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
            keyboardType="default"
          />
          <TouchableOpacity
            style={styles.speackButton}
            onPress={isRecording ? stopRecording : startRecording}>
            <Text>음성</Text>
          </TouchableOpacity>
        </View>

        {isRecording && (
          <TouchableOpacity style={styles.overlay} onPress={stopRecording}>
            <Text style={styles.overlayText}>탭하여 녹음 중지</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    paddingBottom: Platform.OS === 'android' ? 48 : 0,
  },
  container: {
    flex: 1,
    borderRadius: 0,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  resetBox: {
    padding: 10,
    width: '100%',
    alignItems: 'flex-end',
    borderBottomColor: Colors.darker,
    borderBottomWidth: 1,
  },
  button: {
    backgroundColor: Colors.lighter,
    borderStyle: 'solid',
    borderColor: Colors.darker,
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  chatingBox: {
    flexGrow: 1,
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 96,
    alignItems: 'stretch',
  },
  inputContainer: {
    // flex: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#000',
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
  },
  speackButton: {
    borderRadius: '50%',
    borderColor: '#000',
    borderWidth: 1,
    textAlign: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    marginRight: 8,
    alignItems: 'center',
  },
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
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default App;
