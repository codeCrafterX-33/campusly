import { createContext, useContext, useEffect, useState } from "react";
import usePersistedState from "../util/PersistedState";
import axios from "axios";
import { auth } from "../configs/FireBaseConfigs";
import { AuthContext } from "./AuthContext";
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

  const GetPosts = async () => {
    const orderField = "posts.id";
    const visibleIn = "Public";

    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/posts?visibleIn=${visibleIn}&orderField=${orderField}`
      );
      if (response.status === 200) {
        const data = response.data;
        setPosts(data.data);
        console.log("Posts fetched successfully");
      } else {
        console.log("Error fetching posts");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      GetPosts();
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    GetPosts();
    posts && setRefreshing(false);
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
