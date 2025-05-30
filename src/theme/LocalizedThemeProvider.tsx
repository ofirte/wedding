import React, { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import {
  LocalizationProvider,
  useLocalization,
} from "../localization/LocalizationContext";
import { RTLCacheProvider } from "../components/common/RTLCacheProvider";
import { createDirectionalTheme } from "./directionalTheme";

interface ThemeWrapperProps {
  children: ReactNode;
}
const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  const { direction, isRtl } = useLocalization();
  const theme = createDirectionalTheme(direction);

  return (
    <RTLCacheProvider isRtl={isRtl}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </RTLCacheProvider>
  );
};

interface LocalizedThemeProviderProps {
  children: ReactNode;
}

export const LocalizedThemeProvider: React.FC<LocalizedThemeProviderProps> = ({
  children,
}) => {
  return (
    <LocalizationProvider>
      <ThemeWrapper>{children}</ThemeWrapper>
    </LocalizationProvider>
  );
};

export default LocalizedThemeProvider;
