import { router } from "expo-router";

// Navigation utility functions to replace React Navigation calls
export const NavigationUtils = {
  // Navigate to a route
  navigate: (route: string, params?: Record<string, any>) => {
    if (params) {
      // Convert params to query string for dynamic routes
      const queryString = Object.entries(params)
        .map(
          ([key, value]) =>
            `${key}=${encodeURIComponent(JSON.stringify(value))}`
        )
        .join("&");
      router.push(`${route}?${queryString}`);
    } else {
      router.push(route);
    }
  },

  // Replace current route
  replace: (route: string, params?: Record<string, any>) => {
    if (params) {
      const queryString = Object.entries(params)
        .map(
          ([key, value]) =>
            `${key}=${encodeURIComponent(JSON.stringify(value))}`
        )
        .join("&");
      router.replace(`${route}?${queryString}`);
    } else {
      router.replace(route);
    }
  },

  // Go back
  goBack: () => {
    router.back();
  },

  // Navigate to profile
  navigateToProfile: (user_id?: string) => {
    if (user_id) {
      router.push(`/(app)/profile/${user_id}`);
    } else {
      router.push("/(app)/(tabs)/profile");
    }
  },

  // Navigate to club
  navigateToClub: (club: any) => {
    router.push(`/(app)/clubs/${club.id}`);
  },

  // Navigate to post
  navigateToPost: (post: any, threadHistory?: any[]) => {
    const params: Record<string, string> = {
      post: JSON.stringify(post),
    };
    if (threadHistory) {
      params.threadHistory = JSON.stringify(threadHistory);
    }
    NavigationUtils.navigate(`/(app)/posts/${post.id}`, params);
  },

  // Navigate to add post
  navigateToAddPost: () => {
    router.push("/(app)/posts/add");
  },

  // Navigate to create club
  navigateToCreateClub: () => {
    router.push("/(app)/clubs/create");
  },

  // Navigate to add event
  navigateToAddEvent: () => {
    router.push("/(app)/events/add");
  },

  // Navigate to edit profile
  navigateToEditProfile: () => {
    router.push("/(app)/profile/edit");
  },

  // Navigate to edit club
  navigateToEditClub: (club: any) => {
    NavigationUtils.navigate("/(app)/clubs/edit", { club });
  },

  // Navigate to club members
  navigateToClubMembers: (club: any) => {
    NavigationUtils.navigate("/(app)/clubs/members", { club });
  },

  // Navigate to club rules
  navigateToClubRules: (club: any) => {
    NavigationUtils.navigate("/(app)/clubs/rules", { club });
  },

  // Navigate to explore clubs
  navigateToExploreClubs: () => {
    router.push("/(app)/clubs/explore");
  },

  // Navigate to comment screen
  navigateToComment: (
    post: any,
    parentComment?: any,
    onCommentPosted?: (updatedComment: any) => void
  ) => {
    const params: Record<string, string> = {
      post: JSON.stringify(post),
    };
    if (parentComment) {
      params.parentComment = JSON.stringify(parentComment);
    }
    if (onCommentPosted) {
      params.onCommentPosted = JSON.stringify(onCommentPosted);
    }
    NavigationUtils.navigate(`/(app)/comments/${post.id}`, params);
  },

  // Navigate to activity screen
  navigateToActivity: (type: string, user_id?: string) => {
    const params: Record<string, string> = {};
    if (user_id) {
      params.user_id = user_id;
    }
    NavigationUtils.navigate(`/(app)/activity/${type}`, params);
  },

  // Navigate to verification modal
  navigateToVerification: () => {
    router.push("/(modals)/verification");
  },

  // Navigate to OTP verification modal
  navigateToOTPVerification: () => {
    router.push("/(modals)/otp-verification");
  },

  // Navigate to profile setup
  navigateToProfileSetup: () => {
    router.push("/(app)/profile/setup");
  },

  // Navigate to edit education
  navigateToEditEducation: () => {
    router.push("/(app)/profile/edit-education");
  },
};

// Export individual functions for easier use
export const {
  navigate,
  replace,
  goBack,
  navigateToProfile,
  navigateToClub,
  navigateToPost,
  navigateToAddPost,
  navigateToCreateClub,
  navigateToAddEvent,
  navigateToEditProfile,
  navigateToEditClub,
  navigateToClubMembers,
  navigateToClubRules,
  navigateToExploreClubs,
  navigateToComment,
  navigateToActivity,
  navigateToVerification,
  navigateToOTPVerification,
  navigateToProfileSetup,
  navigateToEditEducation,
} = NavigationUtils;
