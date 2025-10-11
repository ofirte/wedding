import { useEffect } from "react";
import { useCurrentUser } from "./useCurrentUser";
import { initializeNewUser } from "../../api/firebaseFunctions/auth";

/**
 * Hook to initialize user roles when user signs up or first signs in
 */
export const useInitializeUserRole = () => {
  const { data: user } = useCurrentUser();

  useEffect(() => {
    const initializeRole = async () => {
      if (!user?.uid) return;

      try {
        // Call Firebase Function to initialize user with default role
        await initializeNewUser();
        console.log("User role initialized successfully");
      } catch (error) {
        console.error("Failed to initialize user role:", error);
        // Don't throw here - just log the error as role initialization is not critical
      }
    };

    // Only initialize on first login/signup - the function handles checking if already initialized
    initializeRole();
  }, [user?.uid]);
};

export default useInitializeUserRole;
