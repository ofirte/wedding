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

interface UserClaims {
  isAdmin?: boolean;
  role?: string;
  defaultWeddingRole?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userClaims: UserClaims;
  isLoading: boolean;
  isClaimsLoading: boolean;
  isAdmin: boolean;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsLoading(false);

      // Fetch user claims when user changes
      if (!user) {
        setUserClaims({});
        return;
      }

      setIsClaimsLoading(true);
      try {
        const idTokenResult = await user.getIdTokenResult();
        console.log("ID Token Result:", idTokenResult);
        const claims: UserClaims = {
          isAdmin: Boolean(idTokenResult.claims.admin),
          role: (idTokenResult.claims.role as string) || "user",
          defaultWeddingRole:
            (idTokenResult.claims.defaultWeddingRole as string) || "user",
        };
        console.log("Fetched user claims:", claims);
        setUserClaims(claims);
      } catch (error) {
        console.error("Error fetching user claims:", error);
        setUserClaims({});
      } finally {
        setIsClaimsLoading(false);
      }

      queryClient.invalidateQueries({
        queryKey: ["currentUser"],
      });
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
        isAdmin: userClaims.isAdmin || false,
        role: userClaims.role || "user",
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
