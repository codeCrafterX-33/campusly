import React, { createContext, useContext, useRef } from "react";

interface PreloaderContextType {
  preloadedItems: React.MutableRefObject<Set<string>>;
}

const PreloaderContext = createContext<PreloaderContextType | undefined>(
  undefined
);

export const PreloaderProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const preloadedItems = useRef<Set<string>>(new Set());

  return (
    <PreloaderContext.Provider value={{ preloadedItems }}>
      {children}
    </PreloaderContext.Provider>
  );
};

export const usePreloaderContext = () => {
  const context = useContext(PreloaderContext);
  if (!context) {
    throw new Error(
      "usePreloaderContext must be used within a PreloaderProvider"
    );
  }
  return context;
};
