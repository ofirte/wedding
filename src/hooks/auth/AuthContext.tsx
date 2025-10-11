import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../api/firebaseConfig";
import { useQueryClient } from "@tanstack/react-query";
import { useInitializeNewUser } from "./useInitializeNewUser";

interface UserClaims {
  role?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userClaims: UserClaims;
  isLoading: boolean;
  isClaimsLoading: boolean;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userClaims, setUserClaims] = useState<UserClaims>({});
  const [isClaimsLoading, setIsClaimsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { mutate: initializeNewUser } = useInitializeNewUser({
    onSuccess: () => {
      setUserClaims({ role: "user" });
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);

      if (!user) {
        setUserClaims({});
        return;
      }

      const fetchClaims = async () => {
        setIsClaimsLoading(true);
        try {
          const idTokenResult = await user.getIdTokenResult();
          const claims: UserClaims = {
            role: idTokenResult.claims.role as string | undefined,
          };

          if (!claims.role) {
            initializeNewUser({ userId: user.uid });
          }

          setUserClaims(claims);
        } catch (error) {
          console.error("Error fetching claims:", error);
          setUserClaims({});
        } finally {
          setIsClaimsLoading(false);
        }

        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      };

      fetchClaims();
    });

    return () => unsubscribe();
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userClaims,
        isLoading,
        isClaimsLoading,
        role: userClaims.role || "not set",
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
