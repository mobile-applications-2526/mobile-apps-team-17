import { TextInput, View, Text, TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  className?: string;
  error?: string;
}

export default function Input({ className = "", error, ...props }: InputProps) {
  const baseClassName =
    "border-[1.5px] rounded-[10px] px-4 text-input font-sf-pro text-[17px] text-[#0E121A]";
  const borderColor = error ? "border-red-500" : "border-brand-black";
  const marginBottom = error ? "mb-1" : "mb-3";

  return (
    <View className={error ? "mb-3" : ""}>
      <TextInput
        className={`${baseClassName} ${borderColor} ${marginBottom} ${className} h-14`}
        placeholderTextColor="#0E121A80"
        textAlignVertical="center"
        {...props}
      />
      {error && (
        <Text className="text-red-500 text-sm font-sf-pro mt-1 px-1">
          {error}
        </Text>
      )}
    </View>
  );
}
