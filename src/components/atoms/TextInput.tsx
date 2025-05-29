import React from 'react';
import {TextInput, ViewStyle} from 'react-native';

interface TextInputProps {
  style?: ViewStyle;
  placeholder?: string;
  placeholderTextColor?: string;
  value?: string;
  scrollEnabled?: boolean;
  onChangeText?: (text: string) => void;
  onSubmitEditing?: () => void;
  maxLength?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  selectTextOnFocus?: boolean;
  editable?: boolean;
}

const TextInputBox = ({
  style,
  placeholder,
  placeholderTextColor,
  value,
  scrollEnabled,
  onChangeText,
  onSubmitEditing,
  maxLength,
  onFocus,
  onBlur,
  selectTextOnFocus,
  editable,
}: TextInputProps) => {
  return (
    <TextInput
      style={style}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      value={value}
      scrollEnabled={scrollEnabled}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmitEditing}
      maxLength={maxLength}
      onBlur={onBlur}
      onFocus={onFocus}
      selectTextOnFocus={selectTextOnFocus}
      editable={editable}
    />
  );
};

export default TextInputBox;
