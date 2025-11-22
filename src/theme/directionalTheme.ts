import { createTheme } from "@mui/material/styles";
import { Direction } from "../localization/types";
import baseTheme from "../theme";

// Hebrew fonts for RTL
const hebrewFonts = '"Rubik", "Heebo", "Assistant", "Alef", sans-serif';

// English fonts for LTR
const englishFonts = '"Roboto", "Helvetica Neue", "Arial", sans-serif';

// Function to create theme with direction support
export const createDirectionalTheme = (direction: Direction = "ltr") => {
  const isRtl = direction === "rtl";

  return createTheme({
    ...baseTheme,
    direction,
    typography: {
      fontFamily: isRtl ? hebrewFonts : englishFonts,
      // Enhance typography for better readability
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        fontWeight: 500,
        textTransform: 'none', // Remove uppercase for Hebrew
      },
    },
  });
};

// Default theme (LTR)
const theme = createDirectionalTheme("ltr");

export default theme;
