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
  const [currentWeddingId, setCurrentWeddingIdState] = useState<string | null>(
    null
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    const initializeWeddingId = async () => {
      try {
        const userData = await getCurrentUserData();
        if (userData?.weddingId) {
          setCurrentWeddingIdState(userData.weddingId);
          queryClient.setQueryData(
            ["currentUserWeddingId"],
            userData.weddingId
          );
        }
      } catch (error) {
        console.error("Error initializing wedding ID:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeWeddingId();
  }, [queryClient]);

  const setCurrentWeddingId = (id: string | null) => {
    setCurrentWeddingIdState(id);
    if (id) {
      queryClient.setQueryData(["currentUserWeddingId"], id);
    } else {
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
