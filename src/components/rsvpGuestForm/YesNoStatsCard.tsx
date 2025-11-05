import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { useResponsive, responsivePatterns } from "../../utils/ResponsiveUtils";

interface YesNoStatsCardProps {
  title: string;
  value: number;
  icon: React.ReactElement;
  color?: string;
  onClick?: () => void;
  isActive?: boolean;
}

const YesNoStatsCard: React.FC<YesNoStatsCardProps> = ({
  title,
  value,
  icon,
  color = "primary",
  onClick,
  isActive = false,
}) => {
  const { isMobile } = useResponsive();

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
            {icon}
          </Box>
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
              sx={{ mb: 0.5 }}
            >
              {title}
            </Typography>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              fontWeight="bold"
              color={isActive ? `${color}.main` : color}
              sx={{
                textShadow: isActive ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default YesNoStatsCard;
