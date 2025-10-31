import { TextInput } from "react-native";

export default function Input({ className = "", ...props }) {
  const inputClassName =
    "border-[1.5px] border-brand-black rounded-[10px] px-4 mb-3 text-input font-sf-pro text-[17px] text-[#0E121A]";

  return (
    <TextInput
      className={`${inputClassName} ${className} h-14`}
      placeholderTextColor="#0E121A80"
      textAlignVertical="center"
      {...props}
    />
  );
}
