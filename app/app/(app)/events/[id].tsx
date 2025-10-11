import React from "react";
import { useLocalSearchParams } from "expo-router";
import Event from "@/screens/(tab)/Event";

export default function EventScreenRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <Event eventId={id} />;
}
