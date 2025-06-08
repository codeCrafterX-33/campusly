import { createContext, useContext, useEffect, useState } from "react";
import usePersistedState from "../util/PersistedState";
import axios, { AxiosError } from "axios";
import { AuthContext } from "./AuthContext";
import Toast from "react-native-toast-message";

const PostContext = createContext<any>({
  posts: [],
  setPosts: () => {},
  getPosts: () => {},
  refreshing: false,
  onRefresh: () => {},
});

function PostProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = usePersistedState("posts", []);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);

  type getPosts = {
    id?: [];
    name?: string;
    clubPosts?: any;
    setClubPosts?: any;
  };

  const GetPosts = async (club?: getPosts) => {
    const orderField = "posts.id";
    const forYou = [0];

    const showPosts = club?.id ? club.id : forYou;

    try {
      console.log("Fetching posts");

      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/posts?club=${showPosts.join(
          ","
        )}&orderField=${orderField}`
      );

      if (response.status === 200) {
        const data = response.data;

        if (club?.setClubPosts) {
          club.setClubPosts(data.data);
        } else {
          setPosts(data.data);
        }
        console.log("Posts fetched successfully");
      } else {
        console.log("Error fetching posts");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Posts fetching failed", error.response?.data);
        Toast.show({
          text1: "Couldn't load posts",
          text2: "Please check your internet or try again later.",
          type: "error",
        });
      } else {
        console.log("Unknown error while fetching posts:", error);
      }
    }
  };

  // useEffect(() => {
  //   if (user) {
  //     GetPosts(visibleIn);
  //   }
  // }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await GetPosts();
    } catch (error) {
      console.log("Error in onRefresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const value = {
    posts: posts,
    setPosts: setPosts,
    getPosts: GetPosts,
    refreshing: refreshing,
    onRefresh: onRefresh,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

export { PostContext, PostProvider };
