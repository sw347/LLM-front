import React from 'react';
import {StyleSheet} from 'react-native';
import Button from './Button';

interface OveralyProp {
  isRecording: boolean;
  onPress: () => void;
}

const LoadingSpinner = ({isRecording, onPress}: OveralyProp) => {
  return (
    <>
      {isRecording && (
        <Button
          style={styles.overlay}
          onPress={onPress}
          text="탭하여 녹음 중지(최대 10초)"
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
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
});

export default LoadingSpinner;
