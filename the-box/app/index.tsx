import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function RootIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/(tabs)");
  }, [router]);

  return null;
}
