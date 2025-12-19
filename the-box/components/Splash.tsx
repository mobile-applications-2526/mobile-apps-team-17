import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Text,
  View,
} from "react-native";

export default function Splash() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const screenWidth = Dimensions.get("window").width;
  const logoWidth = screenWidth * 0.5;
  const logoHeight = logoWidth * 1.35;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center"
      >
        <View className="">
          <Image
            source={require("../assets/images/the-box-splash.png")}
            style={{ width: logoWidth, height: logoHeight }}
            resizeMode="contain"
          />
        </View>
        <Text className=" text-xl text-black -mt-32 mb-20 font-semibold">
          Just say it.<Text className="text-blue-500"> Anonymously.</Text>
        </Text>
        <ActivityIndicator className="text-blue-500" size="large" />
      </Animated.View>
    </View>
  );
}
