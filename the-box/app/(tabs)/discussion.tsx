import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import AddIcon from "../../assets/images/add-icon.png";

export default function DiscussionScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      {/* <IdeaCard></IdeaCard> */}
      <View>
        <Text className="text-brand-blue text-[32px] font-bold">Comments</Text>

        <View className="flex flex-row gap-2">
          <TouchableOpacity className="bg-[#1877F2] rounded-[20px] py-2 px-5 flex-row items-center justify-start">
            <Text className="text-white text-base font-bold">All comments</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white rounded-[20px] py-2 px-5 flex-row items-center justify-start border-[1.5px] border-brand-black">
            <Text className="text-brand-black text-base font-bold">
              Comments by management
            </Text>
          </TouchableOpacity>
        </View>

        <View></View>
      </View>

      <View className="absolute bottom-5 left-4 right-4">
        <View
          className="p-3 rounded-3xl bg-white"
          style={{
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.25,
            shadowRadius: 30,
            elevation: 5,
          }}
        >
          <TouchableOpacity
            className="bg-[#1877F2] rounded-2xl py-4 px-5 flex-row items-center justify-start"
            activeOpacity={0.8}
          >
            <Image source={AddIcon} style={{ width: 29, height: 29 }} />

            <View className="flex-1 items-center justify-center">
              <Text className="text-white text-lg font-bold">Add comment</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
