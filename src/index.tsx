import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import AppRoutes from "./Routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./hooks/auth/AuthContext";
import { LocalizedThemeProvider } from "./theme/LocalizedThemeProvider";
import { SnackbarProvider } from "./context/SnackbarContext";
import { GlobalSnackbar } from "./components/common/GlobalSnackbar";

// Create a client
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <LocalizedThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SnackbarProvider>
            <GlobalSnackbar />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </SnackbarProvider>
        </AuthProvider>
      </QueryClientProvider>
    </LocalizedThemeProvider>
  </React.StrictMode>
);
reportWebVitals();
