import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Stack,
} from "@mui/material";
import {
  useResponsive,
  responsivePatterns,
  gridColumns,
} from "../../utils/ResponsiveUtils";

/**
 * Example component demonstrating responsive design patterns
 * This serves as a template for creating new responsive components
 */
const ResponsiveExample: React.FC = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <Box sx={responsivePatterns.containerPadding}>
      {/* Responsive Typography */}
      <Typography
        variant="h1"
        sx={{
          ...responsivePatterns.headingFont,
          mb: { xs: 2, md: 4 },
          textAlign: { xs: "center", md: "left" },
        }}
      >
        Responsive Example
      </Typography>

      {/* Device Detection Display */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={responsivePatterns.cardPadding}>
          <Typography variant="h6" gutterBottom>
            Current Breakpoint
          </Typography>
          <Typography variant="body1">
            {isMobile && "Mobile (xs/sm)"}
            {isTablet && "Tablet (md)"}
            {isDesktop && "Desktop (lg/xl)"}
          </Typography>
        </CardContent>
      </Card>

      {/* Responsive Grid Example */}
      <Typography
        variant="h6"
        sx={responsivePatterns.subheadingFont}
        gutterBottom
      >
        Responsive Cards
      </Typography>

      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((item) => (
          <Grid size={gridColumns.cards} key={item}>
            <Card elevation={2}>
              <CardContent sx={responsivePatterns.cardPadding}>
                <Typography variant="h6" gutterBottom>
                  Card {item}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This card adapts to different screen sizes using responsive
                  grid columns.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Responsive Button Layout */}
      <Typography
        variant="h6"
        sx={responsivePatterns.subheadingFont}
        gutterBottom
      >
        Responsive Actions
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 2, sm: 3 }}
        sx={{ mb: 4 }}
      >
        <Button
          variant="contained"
          size="large"
          sx={{
            ...responsivePatterns.responsiveButton,
            flex: { sm: 1 },
          }}
        >
          Primary Action
        </Button>
        <Button
          variant="outlined"
          size="large"
          sx={{
            ...responsivePatterns.responsiveButton,
            flex: { sm: 1 },
          }}
        >
          Secondary Action
        </Button>
      </Stack>

      {/* Conditional Mobile Content */}
      {isMobile && (
        <Card sx={{ backgroundColor: "info.light" }}>
          <CardContent sx={responsivePatterns.cardPadding}>
            <Typography variant="body2">
              This content only appears on mobile devices!
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Desktop-Only Content */}
      {isDesktop && (
        <Card sx={{ backgroundColor: "success.light" }}>
          <CardContent sx={responsivePatterns.cardPadding}>
            <Typography variant="body2">
              This content only appears on desktop devices!
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ResponsiveExample;
