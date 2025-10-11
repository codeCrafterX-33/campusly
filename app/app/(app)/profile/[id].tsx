import React from "react";
import { useLocalSearchParams } from "expo-router";
import Profile from "@/screens/(profile)/Profile";

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <Profile user_id={id} />;
}
