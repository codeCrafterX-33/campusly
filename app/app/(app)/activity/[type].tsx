import React from "react";
import { useLocalSearchParams } from "expo-router";
import AllActivityScreen from "@/screens/allActivityScreen/AllActivityScreen";

export default function ActivityScreenRoute() {
  const params = useLocalSearchParams<{
    type: string;
    user_id?: string;
  }>();

  return <AllActivityScreen activeTab={params.type} user_id={params.user_id} />;
}
