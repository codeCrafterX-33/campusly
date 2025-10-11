import React from "react";
import { useLocalSearchParams } from "expo-router";
import EditClub from "@/screens/EditClub";

export default function EditClubScreen() {
  const params = useLocalSearchParams<{ club: string }>();

  // Parse the club data if it's passed as a string
  const club = params.club ? JSON.parse(params.club) : null;

  return <EditClub club={club} />;
}
