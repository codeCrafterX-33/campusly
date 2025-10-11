import React from "react";
import { useLocalSearchParams } from "expo-router";
import ClubRules from "@/screens/ClubRules";

export default function ClubRulesScreen() {
  const params = useLocalSearchParams<{ club: string }>();

  // Parse the club data if it's passed as a string
  const club = params.club ? JSON.parse(params.club) : null;

  return <ClubRules club={club} />;
}
