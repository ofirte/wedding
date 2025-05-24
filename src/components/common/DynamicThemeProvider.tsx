import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useLanguage } from "../../context/LanguageContext";
import baseTheme from "../../theme";

interface DynamicThemeProviderProps {
  children: React.ReactNode;
}

const DynamicThemeProvider: React.FC<DynamicThemeProviderProps> = ({
  children,
}) => {
  const { isRTL } = useLanguage();

  const theme = createTheme({
    ...baseTheme,
    direction: isRTL ? "rtl" : "ltr",
    components: {
      ...baseTheme.components,
      // Override MUI components to handle RTL automatically
      MuiButton: {
        ...baseTheme.components?.MuiButton,
        styleOverrides: {
          ...baseTheme.components?.MuiButton?.styleOverrides,
          startIcon: {
            marginLeft: 0,
            marginRight: 8,
            ...(isRTL && {
              marginLeft: 8,
              marginRight: 0,
            }),
          },
        },
      },
      MuiListItemIcon: {
        ...baseTheme.components?.MuiListItemIcon,
        styleOverrides: {
          ...baseTheme.components?.MuiListItemIcon?.styleOverrides,
          root: {
            minWidth: 40,
            ...(isRTL && {
              marginLeft: 16,
              marginRight: 0,
            }),
          },
        },
      },
      MuiChip: {
        ...baseTheme.components?.MuiChip,
        styleOverrides: {
          ...baseTheme.components?.MuiChip?.styleOverrides,
          icon: {
            marginInlineEnd: -0.5,
            marginInlineStart: 0.5,
          },
        },
      },
    },
  });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default DynamicThemeProvider;
