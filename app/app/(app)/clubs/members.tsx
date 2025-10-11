import React from "react";
import { useLocalSearchParams } from "expo-router";
import ClubMembers from "@/screens/ClubMembers";

export default function ClubMembersScreen() {
  const params = useLocalSearchParams<{ club: string }>();

  // Parse the club data if it's passed as a string
  const club = params.club ? JSON.parse(params.club) : null;

  return <ClubMembers club={club} />;
}
