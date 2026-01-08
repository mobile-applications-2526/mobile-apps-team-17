import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

interface InputProps extends TextInputProps {
  className?: string;
  error?: string;
  testID?: string;
}

export default function Input({
  className = "",
  error,
  testID,
  ...props
}: InputProps) {
  const baseClassName =
    "border rounded-[10px] px-4 text-input font-sf-pro text-[17px] text-[#0E121A]";
  const borderColor = error ? "border-red-500" : "border-brand-black";
  const marginBottom = error ? "mb-1" : "mb-3";

  return (
    <View
      className={error ? "mb-3" : ""}
      testID={testID ? `${testID}-container` : undefined}
    >
      <TextInput
        className={`${baseClassName} ${borderColor} ${marginBottom} ${className} h-14`}
        placeholderTextColor="#0E121A80"
        textAlignVertical="center"
        testID={testID}
        {...props}
      />
      {error && (
        <Text
          className="text-red-500 text-sm font-sf-pro mt-1 px-1"
          testID={testID ? `${testID}-error` : undefined}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
