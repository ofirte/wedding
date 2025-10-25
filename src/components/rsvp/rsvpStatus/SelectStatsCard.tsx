import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { People as PeopleIcon } from "@mui/icons-material";
import {
  useResponsive,
  responsivePatterns,
} from "../../../utils/ResponsiveUtils";

interface SelectStatsCardProps {
  title: string;
  options: Array<{ label: string; count: number; guestCount: number }>;
  color?: string;
  onClick?: () => void;
  isActive?: boolean;
}

const SelectStatsCard: React.FC<SelectStatsCardProps> = ({
  title,
  options,
  color = "info",
  onClick,
  isActive = false,
}) => {
  const { isMobile } = useResponsive();

  // Calculate max value for scaling bars
  const maxGuestCount = Math.max(...options.map((opt) => opt.guestCount));

  // Generate colors for each option
  const getBarColor = (index: number, total: number) => {
    const hue = (index * 360) / total;
    return `hsl(${hue}, 65%, 55%)`;
  };

  return (
    <Card
      sx={{
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease-in-out",
        border: isActive ? 2 : 1,
        borderColor: isActive ? `${color}.main` : "divider",
        bgcolor: isActive ? `${color}.50` : "background.paper",
        boxShadow: isActive ? 3 : 1,
        "&:hover": onClick
          ? {
              transform: isMobile ? "none" : "translateY(-2px)",
              boxShadow: isActive ? 4 : 2,
              borderColor: `${color}.main`,
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={responsivePatterns.cardPadding}>
        <Box
          display="flex"
          alignItems="center"
          gap={isMobile ? 1.5 : 2}
          flexDirection={isMobile ? "column" : "row"}
          textAlign={isMobile ? "center" : "left"}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48,
              borderRadius: 2,
              bgcolor: isActive ? `${color}.main` : `${color}.light`,
              color: isActive ? "white" : `${color}.main`,
              boxShadow: isActive ? 2 : 0,
              mb: isMobile ? 1 : 0,
            }}
          >
            <PeopleIcon />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ mb: 0.5 }}
            >
              {title}
            </Typography>

            {/* Distribution Bars */}
            <Box sx={{ mt: 1, mb: 1 }}>
              {options.map((option, index) => (
                <Box
                  key={option.label}
                  sx={{
                    mb: 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.65rem",
                      minWidth: "40px",
                      textAlign: "right",
                      color: "text.secondary",
                    }}
                  >
                    {option.label}:
                  </Typography>
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        height: 8,
                        backgroundColor: "#f0f0f0",
                        borderRadius: 4,
                        overflow: "hidden",
                        flex: 1,
                        maxWidth: "60px",
                      }}
                    >
                      <Box
                        sx={{
                          width:
                            maxGuestCount > 0
                              ? `${(option.guestCount / maxGuestCount) * 100}%`
                              : "0%",
                          height: "100%",
                          backgroundColor: getBarColor(index, options.length),
                          transition: "width 0.5s ease",
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.6rem",
                        color: "text.secondary",
                        minWidth: "12px",
                      }}
                    >
                      {option.guestCount}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SelectStatsCard;
