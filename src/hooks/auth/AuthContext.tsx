import React, {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onAuthStateChange, getCurrentUserData } from "../../api/auth/authApi";

// Define the context type
type AuthContextType = {
  isLoading: boolean;
  weddingId: string | null; // Make the wedding ID available throughout the app
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  weddingId: null,
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setIsLoading(true);

      if (user) {
        try {
          const userData = await getCurrentUserData();
          queryClient.setQueryData(["currentUser"], userData);
          if (userData?.weddingId) {
            setWeddingId(userData.weddingId);
            queryClient.setQueryData(
              ["currentUserWeddingId"],
              userData.weddingId
            );
          } else {
            setWeddingId(null);
            queryClient.setQueryData(["currentUserWeddingId"], null);
          }
        } catch (error) {
          console.error("Error getting user data:", error);
          queryClient.setQueryData(["currentUser"], null);
          setWeddingId(null);
        }
      } else {
        queryClient.setQueryData(["currentUser"], null);
        setWeddingId(null);
        queryClient.setQueryData(["currentUserWeddingId"], null);
      }

      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [queryClient]);

  const value = {
    isLoading,
    weddingId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
