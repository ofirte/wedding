import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getCurrentUserData } from "../api/auth/authApi";

interface WeddingContextType {
  currentWeddingId: string | null;
  setCurrentWeddingId: (id: string | null) => void;
  isLoading: boolean;
}

const WeddingContext = createContext<WeddingContextType | null>(null);

interface WeddingProviderProps {
  children: ReactNode;
}

export const WeddingProvider: React.FC<WeddingProviderProps> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  // Try to get stored wedding ID from localStorage
  const [currentWeddingId, setCurrentWeddingIdState] = useState<string | null>(
    null
  );
  const queryClient = useQueryClient();

  // Initial setup - try to get wedding ID from localStorage or user data
  useEffect(() => {
    const initializeWeddingId = async () => {
      try {
        // First check localStorage
        const storedId = localStorage.getItem("currentWeddingId");

        if (storedId) {
          setCurrentWeddingIdState(storedId);
          queryClient.setQueryData(["currentUserWeddingId"], storedId);
        } else {
          // If not in localStorage, try to get from user data
          const userData = await getCurrentUserData();
          if (userData?.weddingId) {
            setCurrentWeddingIdState(userData.weddingId);
            localStorage.setItem("currentWeddingId", userData.weddingId);
            queryClient.setQueryData(
              ["currentUserWeddingId"],
              userData.weddingId
            );
          }
        }
      } catch (error) {
        console.error("Error initializing wedding ID:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeWeddingId();
  }, [queryClient]);

  // Set wedding ID and persist to localStorage
  const setCurrentWeddingId = (id: string | null) => {
    setCurrentWeddingIdState(id);
    if (id) {
      localStorage.setItem("currentWeddingId", id);
      queryClient.setQueryData(["currentUserWeddingId"], id);
    } else {
      localStorage.removeItem("currentWeddingId");
      queryClient.removeQueries({ queryKey: ["currentUserWeddingId"] });
    }
  };

  const value = {
    currentWeddingId,
    setCurrentWeddingId,
    isLoading,
  };

  return (
    <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>
  );
};

export const useWedding = () => {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error("useWedding must be used within a WeddingProvider");
  }
  return context;
};
