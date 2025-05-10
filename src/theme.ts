import { createTheme } from "@mui/material/styles";

// Define sage color palette
const sageColors = {
  light: "#D1E4C4", // Light sage for backgrounds
  main: "#9BBB9B", // Main sage color
  dark: "#7D9D6E", // Darker sage for icons and accents
  contrastText: "#333333", // Text color that works well on sage backgrounds
};

// Define status colors with a sage-like soft aesthetic
const statusColors = {
  success: {
    light: "#B7D9BD", // Softer light green with sage undertone
    main: "#6DA97A", // Deeper muted sage-green for success
    dark: "#4B7A51", // Darker, richer success green with sage undertone
    contrastText: "#333333",
  },
  pending: {
    light: "#F0E5B2", // Soft light mustard yellow
    main: "#D4B957", // Mustard yellow for pending
    dark: "#B19330", // Darker mustard yellow-gold
    contrastText: "#333333",
  },
  error: {
    light: "#E8C9B9", // Light terracotta/burnt sienna
    main: "#C77C58", // Terracotta/burnt sienna for errors
    dark: "#A35A38", // Darker burnt sienna
    contrastText: "#333333",
  },
};

// Define info colors with soft light blue gradient
const infoColors = {
  dark: "#4A6F8A", // Soft dark blue
  main: "#7A9CB3", // Medium gentle blue-sage
  light: "#B8D1E0", // Light soft blue
  lightest: "#E5EFF5", // Lightest pale blue
  contrastText: "#FFFFFF", // White text for good contrast
};

// Define cream colors for backgrounds
const creamColors = {
  light: "#FFF8E7", // Lightest cream for main backgrounds
  main: "#F5EFE0", // Main cream color
  dark: "#E8E0CC", // Slightly darker cream for accents
  contrastText: "#333333", // Dark text for good contrast on cream
};

// Create a theme instance with sage colors and cream background
const theme = createTheme({
  palette: {
    primary: {
      main: sageColors.main,
      light: sageColors.light,
      dark: sageColors.dark,
      contrastText: sageColors.contrastText,
    },
    // Override default success/error with our sage-harmonized versions
    success: statusColors.success,
    warning: statusColors.pending,
    error: statusColors.error,
    // Add our soft light blue info colors
    info: {
      dark: infoColors.dark,
      main: infoColors.main,
      light: infoColors.light,
      contrastText: infoColors.contrastText,
    },
    // We can also expose our sage colors directly for easier access
    sage: {
      light: sageColors.light,
      main: sageColors.main,
      dark: sageColors.dark,
      contrastText: sageColors.contrastText,
    },
    // Expose cream colors for easier access
    cream: {
      light: creamColors.light,
      main: creamColors.main,
      dark: creamColors.dark,
      contrastText: creamColors.contrastText,
    },
    // Custom status colors that match our sage theme
    status: {
      success: statusColors.success,
      pending: statusColors.pending,
      error: statusColors.error,
    },
  },
});

declare module "@mui/material/styles" {
  interface Palette {
    sage: Palette["primary"];
    cream: Palette["primary"];
    status: {
      success: Palette["primary"];
      pending: Palette["primary"];
      error: Palette["primary"];
    };
  }
  interface PaletteOptions {
    sage?: PaletteOptions["primary"];
    cream?: PaletteOptions["primary"];
    status?: {
      success?: PaletteOptions["primary"];
      pending?: PaletteOptions["primary"];
      error?: PaletteOptions["primary"];
    };
  }
}

export default theme;
