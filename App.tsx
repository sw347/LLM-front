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

// 오디오 녹음 객체 생성
const audioRecorderPlayer: AudioRecorderPlayer = new AudioRecorderPlayer();

// WebSocket 전역 변수 선언
let ws: WebSocket | null = null;

function App(): React.JSX.Element {
  // 상태 변수를 선언
  const [inputText, setInputText] = useState<string>(''); // 입력 테스트
  const [userMessages, setUserMessages] = useState<string[]>([]); // 사용자 메시지 리스트
  const [botMessages, setBotMessages] = useState<string[]>([]); // AI 응답 메시지 리스트
  const [isLoading, setIsLoading] = useState<boolean>(true); // 초기 로딩 상태
  const [isRecording, setIsRecording] = useState<boolean>(false); // 녹음 중인지 여부
  const [isFocused, setIsFocused] = useState<boolean>(false); // 입력창 포커스 상태
  const [isRecieving, setIsReceiving] = useState<boolean>(false); // 응답 수신 중 여부

  const scrollViewRef = React.useRef<ScrollView>(null); // ScrollView 참조
  const isRecordingRef = React.useRef(isRecording); // 녹음 상태 저장 Ref

  // 서버에 전송 시 호출
  const handleSend = () => {
    if (inputText.trim()) {
      setUserMessages([...userMessages, inputText]); // 사용자 메시지 추가
      setInputText(''); // 입력값 초기화
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
    }
  };

  // WebSocket을 통한 메시지 수신 처리
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

  // 키보드 올라왔을 때 자동으로 스크롤 맨 아래로 이동
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

  // isRecording 상태가 변경될 때마다 ref도 업데이트
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // 녹음 시작 함수
  const startRecording = async () => {
    const path = Platform.select({
      ios: 'recording.m4a',
      android: `${RNFS.DocumentDirectoryPath}/recording.wav`,
    });

    try {
      await audioRecorderPlayer.startRecorder(path);
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

  // 녹음 종료 함수
  const stopRecording = async () => {
    if (!isRecordingRef.current) {
      console.log('Recording is already stopped.');
      return;
    }

    setIsRecording(false);
    isRecordingRef.current = false;

    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      sendAudioToServer(result);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  // 서버로 오디오 파일 전송 함수
  const sendAudioToServer = async (filePath: string) => {
    const formData = new FormData();
    formData.append('audio', {
      uri: filePath,
      type: 'audio/m4a',
      name: 'audioRecording.m4a',
    });

    setIsReceiving(true);

    try {
      await axios
        .post(`${API_URL}/stt`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(res => {
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
        {/* 상단 리셋 버트 */}
        <View style={styles.resetBox}>
          <TouchableOpacity style={styles.button} onPress={resetChat}>
            <Text style={styles.resetTest}>리셋하기</Text>
          </TouchableOpacity>
        </View>
        {/* 채팅 메시지 표시 영역 */}
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
        {/* 입력창 및 음성 버튼 */}
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

        {/* 녹음 중일 때 생기는 오버레이*/}
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
