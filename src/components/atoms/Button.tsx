import React from 'react';
import {TouchableOpacity, Text, StyleSheet, ViewStyle} from 'react-native';

interface ButtonProps {
  style?: ViewStyle;
  onPress: () => void;
  disabled?: boolean;
  text: string;
}

const Button = ({style, onPress, disabled = false, text}: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      disabled={disabled}
      onPress={onPress}>
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6A9097',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
  },
});

export default Button;
