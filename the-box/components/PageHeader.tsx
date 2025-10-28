import { Text, View } from "react-native";

type Props = {
  title: string;
};

export default function PageHeader({ title }: Props) {
  return (
    <View className="px-6">
      <Text className=" text-brand-blue text-5xl font-bold font-sf-pro">
        {title}
      </Text>
    </View>
  );
}
