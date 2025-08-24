import React from "react";
import { Card, CardContent, Typography, Stack, Box } from "@mui/material";
import {
  LocationOn as LocationIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { Wedding } from "../../api/wedding/weddingApi";

interface WeddingDetailsCardProps {
  weddingInfo: Wedding;
}

const WeddingDetailsCard: React.FC<WeddingDetailsCardProps> = ({
  weddingInfo,
}) => {
  return (
    <Card
      elevation={6}
      sx={{
        mt: 4,
        borderRadius: 4,
        background: "linear-gradient(135deg, #FFFFFF, #FFF8E7)",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: "#333333", mb: 3 }}>
          Wedding Details
        </Typography>

        <Stack spacing={2}>
          {weddingInfo.name && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <LocationIcon sx={{ color: "#9BBB9B" }} />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {weddingInfo.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {weddingInfo.date &&
                    new Date(
                      weddingInfo.date.seconds * 1000
                    ).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default WeddingDetailsCard;
