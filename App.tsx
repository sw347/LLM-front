import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import axios from 'axios';
import {SafeAreaView} from 'react-native-safe-area-context';

import {Colors} from 'react-native/Libraries/NewAppScreen';

const audioRecorderPlayer = new AudioRecorderPlayer();
let ws: WebSocket | null = null;

function App(): React.JSX.Element {
  const [inputText, setInputText] = useState<string>('');
  const [userMessages, setUserMessages] = useState<string[]>([]);
  const [botMessages, setBotMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const scrollViewRef = React.useRef<ScrollView>(null);

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

    if (ws!.readyState === WebSocket.OPEN) {
      ws!.close();
      console.log('WebSocket 연결이 종료되었습니다.');
    } else {
      console.log('WebSocket이 이미 종료되었습니다.');
    }
  };

  const receviedMessage = () => {
    ws = new WebSocket('ws://172.30.1.120:3333');

    ws.onopen = () => {
      ws!.send(`${inputText}`);
    };

    ws.onmessage = event => {
      console.log(event.data);
      setBotMessages([...botMessages, `${event.data}`]);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = error => {
      console.error('WebSocket Error:', error);
    };
  };

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
  }, []);

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

    try {
      console.log('서버에 보낼 준비');
      await axios.post('http://localhost:3000/stt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('success audio sent to server');
    } catch (error) {
      console.log('Error sending audio to server:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safearea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <View style={styles.resetBox}>
          <TouchableOpacity style={styles.button} onPress={resetChat}>
            <Text>리셋하기</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.chattingBox}
          ref={scrollViewRef}
          contentContainerStyle={{flexGrow: 1, paddingBottom: 20}}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({animated: true});
          }}>
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
        <View style={styles.inputContainer}>
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
            autoCapitalize="none"
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  resetBox: {
    padding: 10,
    width: '100%',
    backgroundColor: '#fff',
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
  chattingBox: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inputContainer: {
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
