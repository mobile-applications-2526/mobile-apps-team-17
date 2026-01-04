import { Text, View } from "react-native";

type Props = {
  title: string;
};

export default function PageHeader({ title }: Props) {
  return (
    <View testID="page-header-container">
      <Text
        className=" text-brand-blue text-5xl font-bold font-sf-pro"
        testID="page-header-title"
      >
        {title}
      </Text>
    </View>
  );
}
