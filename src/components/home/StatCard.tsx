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
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: `${theme.palette[color].light}`,
                color: theme.palette[color].main,
                mr: 2,
              }}
            >
              {icon}
            </Avatar>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
          </Box>

          <Typography variant="h4" sx={{ mb: 0.5, fontWeight: "bold" }}>
            {value}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default StatCard;
