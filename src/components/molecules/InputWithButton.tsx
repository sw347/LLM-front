import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import TextInputBox from '../atoms/TextInput';
import Button from '../atoms/Button';

interface Props {
  containerStyle?: ViewStyle;
  inputValue: string;
  onInputChange: (text: string) => void;
  onSubmitEditing: () => void;
  onButtonPress: () => void;
  inputPlaceholder?: string;
  buttonText: string;
  maxLength: number;
  disabled: boolean;
}

const InputWithButton = ({
  containerStyle,
  inputValue,
  onInputChange,
  onButtonPress,
  onSubmitEditing,
  inputPlaceholder,
  buttonText,
  maxLength,
  disabled,
}: Props) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInputBox
        style={styles.input}
        placeholder={inputPlaceholder}
        placeholderTextColor="#888"
        value={inputValue}
        onChangeText={onInputChange}
        onSubmitEditing={onSubmitEditing}
        maxLength={maxLength}
        editable={!disabled}
      />
      <Button
        style={styles.button}
        onPress={onButtonPress}
        text={buttonText}
        disabled={disabled}
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
  input: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderColor: '#6A9097',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: '50%',
  },
});

export default InputWithButton;
