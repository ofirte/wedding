import { createTheme } from "@mui/material/styles";
import { Direction } from "../localization/types";
import baseTheme from "../theme";

// Function to create theme with direction support
export const createDirectionalTheme = (direction: Direction = "ltr") => {
  return createTheme({
    ...baseTheme,
    direction,
  });
};

// Default theme (LTR)
const theme = createDirectionalTheme("ltr");

export default theme;
