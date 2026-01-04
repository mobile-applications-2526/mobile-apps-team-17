import React, { useState } from "react";
import { Image, ImageSourcePropType, Text, TouchableOpacity, View } from "react-native";

type DropdownOption = {
  label: string;
  value: string;
};

type Props = {
  options: DropdownOption[];
  onSelect: (value: string) => void;
  triggerContent: React.ReactNode;
  disabled?: boolean;
  iconSource?: ImageSourcePropType;
};

const Dropdown: React.FC<Props> = ({
  options,
  onSelect,
  triggerContent,
  disabled = false,
  iconSource,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (value: string) => {
    setIsOpen(false);
    onSelect(value);
  };

  const borderWidth = 1;

  return (
    <View className="relative">
      <View
        className={`bg-white border-brand-black ${
          isOpen ? "rounded-t-[10px]" : "rounded-[10px]"
        }`}
        style={{
          borderWidth,
          borderBottomWidth: borderWidth,
          borderBottomColor: isOpen ? "transparent" : undefined,
        }}
      >
        <TouchableOpacity
          className="flex-row items-center px-4 py-2"
          onPress={toggleOpen}
          activeOpacity={disabled ? 1 : 0.8}
          disabled={disabled}
        >
          <View className="flex-1 items-center">{triggerContent}</View>
          <View className="w-[20px] items-center">
            {iconSource ? (
              <Image
                source={iconSource}
                style={{
                  width: 20,
                  height: 20,
                  marginLeft: 8,
                  transform: [{ rotate: isOpen ? "90deg" : "-90deg" }],
                  opacity: disabled ? 0.4 : 1,
                }}
              />
            ) : null}
          </View>
        </TouchableOpacity>
      </View>

      {isOpen && (
        <View
          className="absolute top-full left-0 right-0 bg-white border-[1px] border-t-0 border-brand-black rounded-b-[10px] z-10"
          style={{marginTop: -borderWidth}}
        >
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              className="py-2 px-4"
              onPress={() => handleSelect(option.value)}
              activeOpacity={0.8}
            >
              <Text className="text-brand-blue text-sm font-semibold text-center mr-5">
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default Dropdown;
