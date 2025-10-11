import React from "react";
import { useLocalSearchParams } from "expo-router";
import ClubScreen from "@/screens/ClubScreen";

export default function ClubScreenRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <ClubScreen club={{ id }} />;
}
