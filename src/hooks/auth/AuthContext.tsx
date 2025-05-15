import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { onAuthStateChange, getCurrentUserData } from '../../api/auth/authApi';
import { WeddingUser } from '../../api/auth/authApi';

// Define the context type
type AuthContextType = {
  isLoading: boolean;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isLoading: true,
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const queryClient = useQueryClient();

  // Set up auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setIsLoading(true);
      
      if (user) {
        // User is signed in
        try {
          // Get full user data including wedding ID
          const userData = await getCurrentUserData();
          // Update the query cache with the current user data
          queryClient.setQueryData(['currentUser'], userData);
        } catch (error) {
          console.error('Error getting user data:', error);
          queryClient.setQueryData(['currentUser'], null);
        }
      } else {
        // User is signed out
        queryClient.setQueryData(['currentUser'], null);
      }
      
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [queryClient]);

  // Context value
  const value = {
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
