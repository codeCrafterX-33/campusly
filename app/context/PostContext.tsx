import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import usePersistedState from "../util/PersistedState";
import axios, { AxiosError } from "axios";
import { AuthContext } from "./AuthContext";
import Toast from "react-native-toast-message";

const PostContext = createContext<any>({
  posts: [],
  commentPosts: [],
  postMedia: [],
  setPosts: () => {},
  getPosts: () => {},
  deletePost: () => {},
  refreshing: false,
  onRefresh: () => {},
  getUserPosts: () => {},
  setUserPosts: () => {},
  userPosts: [],
  viewingUserPosts: [],
  setViewingUserPosts: () => {},
  getComments: () => {},
  setComments: () => {},
  comments: [],
  viewingUserComments: [],
  setViewingUserComments: () => {},
});

function PostProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = usePersistedState("posts", []);
  const [userPosts, setUserPosts] = usePersistedState("userPosts", []);
  const [comments, setComments] = usePersistedState("comments", []);
  const [refreshing, setRefreshing] = useState(false);
  const [postMedia, setPostMedia] = useState<any>([]);
  const [viewingUserPosts, setViewingUserPosts] = useState<any>([]);
  const [viewingUserComments, setViewingUserComments] = useState<any>([]);
  const { userData, onLogout } = useContext(AuthContext);

  // Register logout callback to clear post data
  const hasRegisteredCallback = useRef(false);

  const clearPostData = useCallback(() => {
    setPosts([]);
    setUserPosts([]);
    setComments([]);
    setPostMedia([]);
    setViewingUserPosts([]);
    setViewingUserComments([]);
  }, []);

  useEffect(() => {
    if (!hasRegisteredCallback.current) {
      onLogout(clearPostData);
      hasRegisteredCallback.current = true;
    }
  }, [onLogout, clearPostData]);

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
        `${process.env.EXPO_PUBLIC_SERVER_URL}/post/posts?club=${showPosts.join(
          ","
        )}&orderField=${orderField}`
      );

      if (response.status === 200) {
        const data = response.data;

        if (club?.setClubPosts) {
          club.setClubPosts(data.data);
        } else {
          setPosts(data.data);
          setPostMedia(data.data[0].media.media);
        }
        const latestPost = posts[0];

        // console.log("Posts fetched successfully", postMedia);
      } else {
        console.log("Error fetching posts");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log("Posts fetching failed");
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

  const GetUserPosts = async (userId?: string) => {
    console.log(
      "GetUserPosts called with userId:",
      userId,
      "Type:",
      typeof userId
    );

    let url;
    if (userId) {
      url = `${process.env.EXPO_PUBLIC_SERVER_URL}/post/posts?userId=${userId}`;
      console.log("Using userId URL:", url);
    } else {
      url = `${process.env.EXPO_PUBLIC_SERVER_URL}/post/posts?userEmail=${userData?.email}`;
      console.log("Using userEmail URL:", url);
    }

    try {
      const response = await axios.get(url);
      console.log("GetUserPosts response status:", response.status);
      console.log(
        "GetUserPosts response data length:",
        response.data?.data?.length || 0
      );

      if (response.status === 200) {
        const data = response.data;
        if (userId) {
          console.log("Setting viewingUserPosts with data:", data.data);
          setViewingUserPosts(data.data);
          console.log("Viewing user posts fetched successfully");
        } else {
          setUserPosts(data.data);
          console.log("User posts fetched successfully");
        }
      } else {
        console.log("Error fetching user posts - status:", response.status);
      }
      return response.status;
    } catch (error) {
      console.error("GetUserPosts error:", error);
      throw error;
    }
  };

  const GetComments = async (userId?: string) => {
    console.log(
      "GetComments called with userId:",
      userId,
      "Type:",
      typeof userId
    );

    let url;
    if (userId) {
      url = `${process.env.EXPO_PUBLIC_SERVER_URL}/post/comments?userId=${userId}`;
      console.log("Using userId URL for comments:", url);
    } else {
      url = `${process.env.EXPO_PUBLIC_SERVER_URL}/post/comments?userEmail=${userData?.email}`;
      console.log("Using userEmail URL for comments:", url);
    }

    try {
      const response = await axios.get(url);
      console.log("GetComments response status:", response.status);
      console.log(
        "GetComments response data length:",
        response.data?.data?.length || 0
      );

      if (response.status === 200) {
        const data = response.data;
        if (userId) {
          console.log("Setting viewingUserComments with data:", data.data);
          setViewingUserComments(data.data);
          console.log("Viewing user comments fetched successfully");
        } else {
          setComments(data.data);
          console.log("Comments fetched successfully");
        }
      } else {
        console.log("Error fetching comments - status:", response.status);
      }
      return response.status;
    } catch (error) {
      console.error("GetComments error:", error);
      throw error;
    }
  };

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

  const deletePost = async (postId: number, userId: number) => {
    try {
      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_SERVER_URL}/post/${postId}`,
        {
          data: { user_id: userId },
        }
      );

      if (response.status === 200) {
        // Remove the post from local state
        setPosts((prevPosts: any[]) =>
          prevPosts.filter((post) => post.id !== postId)
        );
        setUserPosts((prevPosts: any[]) =>
          prevPosts.filter((post) => post.id !== postId)
        );

        Toast.show({
          type: "success",
          text1: "Post deleted successfully",
        });
        return true;
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      Toast.show({
        type: "error",
        text1: "Failed to delete post",
        text2: "Please try again",
      });
      return false;
    }
  };

  const value = {
    posts: posts,
    setPosts: setPosts,
    getPosts: GetPosts,
    deletePost: deletePost,
    refreshing: refreshing,
    onRefresh: onRefresh,
    getUserPosts: GetUserPosts,
    setUserPosts: setUserPosts,
    userPosts: userPosts,
    viewingUserPosts: viewingUserPosts,
    setViewingUserPosts: setViewingUserPosts,
    getComments: GetComments,
    setComments: setComments,
    comments: comments,
    viewingUserComments: viewingUserComments,
    setViewingUserComments: setViewingUserComments,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

export { PostContext, PostProvider };
