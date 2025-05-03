import { createContext, useState } from "react";
import usePersistedState from "../util/PersistedState";
import axios from "axios";
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

  const GetPosts = async () => {
    const orderField = "posts.id";
    const visibleIn = "public";

    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/posts?visibleIn=${visibleIn}&orderField=${orderField}`
      );
      if (response.status === 200) {
        const data = response.data;
        setPosts(data.data);
        console.log(data);
      } else {
        console.log("Error fetching posts");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    GetPosts();
    setRefreshing(false);
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
