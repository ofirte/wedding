import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "../../../localization/LocalizationContext";

interface ResponseRateRatioProps {
  responded: number;
  notResponded: number;
  total: number;
  rate: number;
}

const ResponseRateRatio: React.FC<ResponseRateRatioProps> = ({
  responded,
  notResponded,
  total,
}) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Box
        sx={{
          flex: 1,
          maxWidth: 180,
          minWidth: 120,
          mt: ({ spacing }) => spacing(1.5),
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: 6,
            backgroundColor: "#f0f0f0",
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
          }}
        >
          <Box
            sx={{
              width: `${(responded / total) * 100}%`,
              height: "100%",
              backgroundColor: "#4caf50",
              transition: "width 0.5s ease",
            }}
          />
          <Box
            sx={{
              width: `${(notResponded / total) * 100}%`,
              height: "100%",
              backgroundColor: "#e0e0e0",
            }}
          />
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 2, fontSize: "0.75rem", flexShrink: 0 }}>
        <Typography
          variant="caption"
          sx={{
            color: "#4caf50",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: "0.7rem",
          }}
        >
          ● {responded} {t("rsvpStatusTab.responded")}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "#9e9e9e",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: "0.7rem",
          }}
        >
          ● {notResponded} {t("rsvpStatusTab.pending")}
        </Typography>
      </Box>
    </Box>
  );
};

export default ResponseRateRatio;
