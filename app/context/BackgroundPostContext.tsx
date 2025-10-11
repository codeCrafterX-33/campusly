import React, { createContext, useContext, useState, ReactNode } from "react";

interface BackgroundPostState {
  isPosting: boolean;
  progress: number;
  message: string;
  totalFiles: number;
  completedFiles: number;
}

interface BackgroundPostContextType {
  postState: BackgroundPostState;
  startPosting: (totalFiles: number) => void;
  updateProgress: (completedFiles: number, message: string) => void;
  completePosting: () => void;
  resetPosting: () => void;
}

const BackgroundPostContext = createContext<
  BackgroundPostContextType | undefined
>(undefined);

export const useBackgroundPost = () => {
  const context = useContext(BackgroundPostContext);
  if (!context) {
    throw new Error(
      "useBackgroundPost must be used within a BackgroundPostProvider"
    );
  }
  return context;
};

interface BackgroundPostProviderProps {
  children: ReactNode;
}

export const BackgroundPostProvider: React.FC<BackgroundPostProviderProps> = ({
  children,
}) => {
  const [postState, setPostState] = useState<BackgroundPostState>({
    isPosting: false,
    progress: 0,
    message: "",
    totalFiles: 0,
    completedFiles: 0,
  });

  const startPosting = (totalFiles: number) => {
    setPostState({
      isPosting: true,
      progress: 0,
      message: "Starting upload...",
      totalFiles,
      completedFiles: 0,
    });
  };

  const updateProgress = (completedFiles: number, message: string) => {
    setPostState((prev) => {
      const progress =
        prev.totalFiles > 0 ? (completedFiles / prev.totalFiles) * 100 : 0;
      return {
        ...prev,
        progress,
        message,
        completedFiles,
      };
    });
  };

  const completePosting = () => {
    setPostState((prev) => ({
      ...prev,
      isPosting: false,
      progress: 100,
      message: "Post uploaded successfully!",
    }));

    // Auto-hide after 3 seconds
    setTimeout(() => {
      resetPosting();
    }, 3000);
  };

  const resetPosting = () => {
    setPostState({
      isPosting: false,
      progress: 0,
      message: "",
      totalFiles: 0,
      completedFiles: 0,
    });
  };

  return (
    <BackgroundPostContext.Provider
      value={{
        postState,
        startPosting,
        updateProgress,
        completePosting,
        resetPosting,
      }}
    >
      {children}
    </BackgroundPostContext.Provider>
  );
};
