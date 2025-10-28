import { TextInput } from "react-native";

export default function Input({ className = "", ...props }) {
  const inputClassName =
    "border-2 border-brand-black rounded-[10px] px-4 py-4 mb-4 text-input font-sf-pro";

  return (
    <TextInput
      className={`${inputClassName} ${className}`}
      placeholderTextColor="#0E121A80"
      color="#0E121A"
      {...props}
    />
  );
}
