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
import {
  getInvitationToken,
  clearInvitationToken,
} from "../invitations/invitationStorage";

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
    onSuccess: async (data) => {
      // Force token refresh to get the new role claim
      console.log("User initialized successfully:", data);
      setUserClaims({ role: data.role });
      setIsClaimsLoading(false);
    },
    onError: () => {
      // If initialization fails, mark as complete anyway
      setIsClaimsLoading(false);
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
            // Check for invitation token
            const invitationToken = getInvitationToken();
            // Call initializeNewUser - its onSuccess will handle setting claims and isClaimsLoading
            initializeNewUser({
              userId: user.uid,
              invitationToken: invitationToken || undefined,
            });
            // Clear invitation token after use
            if (invitationToken) {
              clearInvitationToken();
            }
            // Don't set claims or mark loading as false here - let the mutation callbacks handle it
          } else {
            // User already has a role, set it immediately
            setUserClaims(claims);
            setIsClaimsLoading(false);
          }
        } catch (error) {
          console.error("Error fetching claims:", error);
          setUserClaims({});
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
