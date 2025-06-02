import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import axios from 'axios';
import {API_URL} from '@env';
import {useRef} from 'react';

const audioRecorderPlayer = new AudioRecorderPlayer();

export default function useAudioRecorder(
  setIsReceiving: (val: boolean) => void,
  setInputText: (val: string) => void,
  setIsRecording: (val: boolean) => void,
  inputText: string,
) {
  const isRecordingRef = useRef(false);
  let timeoutRef: NodeJS.Timeout | null = null;

  const startRecording = async () => {
    if (isRecordingRef.current) {
      return;
    }

    const path = Platform.select({
      ios: 'recording.m4a',
      android: `${RNFS.DocumentDirectoryPath}/recording.m4a`,
    });

    if (timeoutRef) {
      clearTimeout(timeoutRef);
      timeoutRef = null;
    }

    try {
      await audioRecorderPlayer.startRecorder(path!);
      isRecordingRef.current = true;
      setIsRecording(true);
    } catch (e) {
      console.error('녹음 실패:', e);
    }

    timeoutRef = setTimeout(stopRecording, 10000);
  };

  const stopRecording = async () => {
    if (!isRecordingRef.current) {
      return;
    }

    isRecordingRef.current = false;
    setIsRecording(false);

    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      sendAudioToServer(result);
    } catch (e) {
      console.error('녹음 종료 실패:', e);
    }

    if (timeoutRef) {
      clearTimeout(timeoutRef);
      timeoutRef = null;
    }
  };

  const sendAudioToServer = async (filePath: string) => {
    const formData = new FormData();
    formData.append('audio', {
      uri: filePath,
      type: 'audio/m4a',
      name: 'audioRecording.m4a',
    });

    setIsReceiving(true);
    const prevText = inputText;
    setInputText('입력 및 음성 녹음이 불가능합니다.');

    try {
      await axios
        .post(`${API_URL}/stt`, formData, {
          headers: {'Content-Type': 'multipart/form-data'},
        })
        .then(res => {
          const text = res.data.text;
          setInputText(prevText + decodeURI(text));
          setTimeout(() => setIsReceiving(false), 500);
        });
    } catch (err) {
      console.error('오디오 전송 실패:', err);
    }
  };

  return {startRecording, stopRecording};
}
