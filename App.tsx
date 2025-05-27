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
import {WEBSOCKET_URL, API_URL} from '@env';
import RNFS from 'react-native-fs';

const audioRecorderPlayer: AudioRecorderPlayer = new AudioRecorderPlayer();
let ws: WebSocket | null = null;

function App(): React.JSX.Element {
  const [inputText, setInputText] = useState<string>('');
  const [userMessages, setUserMessages] = useState<string[]>([]);
  const [botMessages, setBotMessages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isRecieving, setIsReceiving] = useState<boolean>(false);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const isRecordingRef = React.useRef(isRecording);

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

    ws = new WebSocket(WEBSOCKET_URL);

    if (ws!.readyState === WebSocket.OPEN) {
      ws!.close();
      console.log('WebSocket 연결이 종료되었습니다.');
    } else {
      console.log('WebSocket이 이미 종료되었습니다.');
    }
  };

  const receviedMessage = () => {
    ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      setIsReceiving(true);
      ws!.send(`${inputText}`);
    };

    ws.onmessage = event => {
      console.log(event.data);
      setBotMessages([...botMessages, `${event.data}`]);

      setTimeout(() => setIsReceiving(false), 500);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = error => {
      console.error('WebSocket 에러:', error);
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

  useEffect(() => {
    isRecordingRef.current = isRecording; // isRecording 상태가 변경될 때마다 ref 업데이트
  }, [isRecording]); // isRecording이 변경될 때마다 이 effect 실행

  const startRecording = async () => {
    const path = Platform.select({
      ios: 'recording.m4a',
      android: `${RNFS.DocumentDirectoryPath}/recording.wav`,
    });

    try {
      const result = await audioRecorderPlayer.startRecorder(path);
      console.log('녹음 시작:', result);
      setIsRecording(true);
    } catch (error) {
      console.log('녹음 시작 실패:', error);
    }

    setTimeout(() => {
      if (isRecordingRef.current) {
        stopRecording();
      }
    }, 10000);
  };

  const stopRecording = async () => {
    if (!isRecordingRef.current) {
      console.log('Recording is already stopped.');
      return;
    }

    setIsRecording(false);
    isRecordingRef.current = false;

    try {
      const result = await audioRecorderPlayer.stopRecorder();
      console.log('결과: ', result);
      audioRecorderPlayer.removeRecordBackListener();
      console.log('Recording stopped:', result);
      sendAudioToServer(result);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const sendAudioToServer = async (filePath: string) => {
    const formData = new FormData();
    console.log('파일 위치: ', filePath);
    formData.append('audio', {
      uri: filePath,
      type: 'audio/m4a',
      name: 'audioRecording.m4a',
    });
    setIsReceiving(true);

    try {
      console.log('서버에 보낼 준비');
      console.log('formData: ', formData);
      await axios
        .post(`${API_URL}/stt`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(res => {
          console.log('서버 응답: ', res.data);
          setInputText(inputText + res.data.text);
          setTimeout(() => setIsReceiving(false), 500);
        });
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
            <Text style={styles.resetTest}>리셋하기</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.chattingBox}
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollViewContentStyle}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({animated: true});
          }}>
          {isLoading && (
            <Text style={styles.loadingText}>
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
            style={[styles.input, isFocused && styles.inputFocused]}
            placeholder="입력하세요"
            placeholderTextColor="#888"
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
            maxLength={100}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            selectTextOnFocus={!isRecieving}
            editable={!isRecieving}
          />
          <TouchableOpacity
            style={styles.speackButton}
            disabled={isRecieving}
            onPress={isRecording ? stopRecording : startRecording}>
            <Text style={styles.speakText}>음성</Text>
          </TouchableOpacity>
        </View>

        {isRecording && (
          <TouchableOpacity style={styles.overlay} onPress={stopRecording}>
            <Text style={styles.overlayText}>탭하여 녹음 중지(최대 10초)</Text>
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
    borderBottomColor: '#6A9097',
    borderBottomWidth: 1,
  },
  button: {
    backgroundColor: '#6A9097',
    color: '#fff',
    borderRadius: 5,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  resetTest: {
    color: '#fff',
  },
  chattingBox: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingText: {textAlign: 'center', marginTop: 200},
  scrollViewContentStyle: {flexGrow: 1, paddingBottom: 20},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#6A9097',
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderColor: '#6A9097',
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
  },
  inputFocused: {
    borderWidth: 2,
  },
  speackButton: {
    borderRadius: '50%',
    backgroundColor: '#6A9097',
    textAlign: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    marginRight: 8,
    alignItems: 'center',
  },
  speakText: {
    color: '#fff',
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
