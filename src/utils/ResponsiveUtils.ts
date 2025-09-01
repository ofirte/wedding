import { useMediaQuery, useTheme } from "@mui/material";

/**
 * Custom hook to detect device type and breakpoints
 * This centralizes all responsive logic for easy maintenance
 */
export const useResponsive = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));

  return {
    // Device detection
    isMobile,
    isTablet,
    isDesktop,

    // Specific breakpoint checks
    isXs,
    isSm,
    isMd,
    isLg,

    // Theme reference for custom queries
    theme,
  };
};

/**
 * Get responsive spacing values based on current breakpoint
 * Usage: const spacing = getResponsiveSpacing({ xs: 1, sm: 2, md: 3 })
 */
export const getResponsiveSpacing = (values: {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}) => values;

/**
 * Common responsive patterns for sx prop
 */
export const responsivePatterns = {
  // Padding patterns
  containerPadding: {
    px: { xs: 1, sm: 2, md: 3 },
    py: { xs: 2, sm: 3, md: 4 },
  },

  cardPadding: {
    p: { xs: 1.5, sm: 2, md: 2.5 },
  },

  sectionPadding: {
    py: { xs: 2, md: 4 },
    px: { xs: 1, sm: 2 },
  },

  // Typography patterns
  headingFont: {
    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
    fontWeight: "bold",
  },

  subheadingFont: {
    fontSize: { xs: "1.125rem", sm: "1.25rem", md: "1.5rem" },
    fontWeight: "medium",
  },

  bodyFont: {
    fontSize: { xs: "0.875rem", sm: "1rem" },
  },

  // Layout patterns
  flexColumn: {
    display: "flex",
    flexDirection: { xs: "column", md: "row" },
    gap: { xs: 2, md: 3 },
  },

  centerContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: { xs: "center", md: "left" },
  },

  // Button patterns
  responsiveButton: {
    minHeight: { xs: 44, sm: "auto" }, // iOS minimum touch target
    width: { xs: "100%", sm: "auto" },
    fontSize: { xs: "0.875rem", sm: "1rem" },
  },

  // Grid patterns
  cardGrid: {
    spacing: { xs: 1.5, sm: 2, md: 3 },
  },

  // Modal/Dialog patterns
  responsiveDialog: {
    "& .MuiDialog-paper": {
      margin: { xs: 1, sm: 2 },
      width: { xs: "calc(100% - 16px)", sm: "auto" },
      maxWidth: { xs: "100%", sm: 600 },
    },
  },
};

/**
 * Responsive grid column configurations
 */
export const gridColumns = {
  // 1 column on mobile, 2 on tablet, 3+ on desktop
  cards: { xs: 12, sm: 6, md: 4, lg: 3 },

  // 2 columns on mobile, 4 on desktop (for stat cards)
  stats: { xs: 6, sm: 3 },

  // Full width on mobile, half on tablet+
  halfWidth: { xs: 12, md: 6 },

  // Full width on mobile, third on desktop
  thirdWidth: { xs: 12, md: 4 },

  // Sidebar layout
  sidebar: { xs: 12, md: 3 },
  content: { xs: 12, md: 9 },
};

/**
 * Touch-friendly configurations for mobile
 */
export const touchConfig = {
  minTouchTarget: 44, // iOS HIG minimum
  tapGesture: {
    sx: {
      minHeight: 44,
      minWidth: 44,
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "action.hover",
      },
    },
  },

  swipeableDrawer: {
    puller: {
      width: 30,
      height: 6,
      backgroundColor: "grey.300",
      borderRadius: 3,
      margin: "8px auto",
    },
  },
};

export default useResponsive;
