import React from "react";
import { useLocalSearchParams } from "expo-router";
import CommentScreen from "@/screens/CommentScreen";

export default function CommentScreenRoute() {
  const params = useLocalSearchParams<{
    post: string;
    parentComment?: string;
    onCommentPosted?: string;
  }>();

  // Parse the data if it's passed as a string
  const post = params.post ? JSON.parse(params.post) : null;
  const parentComment = params.parentComment
    ? JSON.parse(params.parentComment)
    : undefined;
  const onCommentPosted = params.onCommentPosted
    ? JSON.parse(params.onCommentPosted)
    : undefined;

  return (
    <CommentScreen
      post={post}
      parentComment={parentComment}
      onCommentPosted={onCommentPosted}
    />
  );
}
