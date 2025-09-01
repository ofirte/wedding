import React from "react";
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Avatar,
  useTheme,
} from "@mui/material";
import { responsivePatterns } from "../../utils/ResponsiveUtils";

export interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  color = "primary",
  onClick,
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={1}
      sx={{
        height: "100%",
        borderRadius: 2,
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{ height: "100%" }}
        disabled={!onClick}
      >
        <CardContent sx={responsivePatterns.cardPadding}>
          <Box sx={responsivePatterns.centerContent}>
            <Avatar
              sx={{
                bgcolor: `${theme.palette[color].light}`,
                color: theme.palette[color].main,
                mr: { xs: 0, sm: 2 },
                mb: { xs: 1, sm: 0 },
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              {icon}
            </Avatar>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={responsivePatterns.bodyFont}
            >
              {title}
            </Typography>
          </Box>

          <Typography
            variant="h4"
            sx={{
              mb: 0.5,
              fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
              fontWeight: "bold",
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            {value}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              ...responsivePatterns.bodyFont,
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            {subtitle}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default StatCard;
