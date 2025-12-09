import { useEffect, useRef, useState } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";
import ArrowUpIcon from "../assets/images/arrow-up-icon.png";
import DropDownIcon from "../assets/images/drop-down-icon.png";

interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function CustomDropdown({
  options,
  selectedValue,
  onValueChange,
  placeholder = "Select...",
  isOpen: controlledIsOpen,
  onToggle,
}: CustomDropdownProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  useEffect(() => {
    if (isOpen) {
      Animated.timing(animatedHeight, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const displayText = selectedOption?.label || placeholder;

  const availableOptions = options.filter((opt) => opt.value !== selectedValue);

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const handleSelect = (value: string) => {
    onValueChange(value);
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(false);
    }
  };

  return (
    <View
      style={{
        position: "relative",
        zIndex: isOpen ? 1000 : 1,
      }}
    >
      <View
        className="bg-white border border-brand-blue"
        style={{
          borderRadius: 25,
          borderBottomLeftRadius: isOpen ? 0 : 25,
          borderBottomRightRadius: isOpen ? 0 : 25,
          borderBottomWidth: isOpen ? 0 : 1,
        }}
      >
        <TouchableOpacity
          onPress={handleToggle}
          className="flex-row items-center justify-between px-4 py-2"
        >
          <Text
            className="text-brand-blue font-medium flex-1 text-center"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayText}
          </Text>
          <View
            className="w-6 h-6 items-center justify-center"
            style={{ borderRadius: 12 }}
          >
            <Image
              source={isOpen ? ArrowUpIcon : DropDownIcon}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>

      {isOpen && (
        <View
          className="bg-white border border-brand-blue border-t-0"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
          }}
        >
          {availableOptions.map((option) => (
            <View key={option.value}>
              <View className="h-[1px] bg-gray-300" />
              <TouchableOpacity
                onPress={() => handleSelect(option.value)}
                className="px-4 py-2"
              >
                <Text
                  className="text-brand-blue font-medium text-center"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
