import React from "react";
import { useLocalSearchParams } from "expo-router";
import PostScreen from "@/screens/PostScreen";

export default function PostScreenRoute() {
  const params = useLocalSearchParams<{
    post: string;
    threadHistory?: string;
  }>();

  // Parse the post data if it's passed as a string
  const post = params.post ? JSON.parse(params.post) : null;
  const threadHistory = params.threadHistory
    ? JSON.parse(params.threadHistory)
    : undefined;

  return <PostScreen post={post} threadHistory={threadHistory} />;
}
