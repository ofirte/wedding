import React, { createContext, useState, useCallback, ReactNode } from 'react';

export type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

interface SnackbarContextType {
  showSnackbar: (message: string, severity: SnackbarSeverity) => void;
  hideSnackbar: () => void;
  snackbarState: SnackbarState;
}

export const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [snackbarState, setSnackbarState] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = useCallback((message: string, severity: SnackbarSeverity = 'success') => {
    setSnackbarState({
      open: true,
      message,
      severity,
    });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbarState((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar, snackbarState }}>
      {children}
    </SnackbarContext.Provider>
  );
};
