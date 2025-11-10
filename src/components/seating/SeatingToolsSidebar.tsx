import React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  MeetingRoom as StageIcon,
  LocalBar as BarIcon,
  Restaurant as FoodIcon,
  MusicNote as DanceIcon,
  Input as EntranceIcon,
  Wc as BathroomIcon,
} from "@mui/icons-material";
import { LayoutElement } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";

interface SeatingToolsSidebarProps {
  onBulkAddClick: () => void;
  onAddLayoutElement?: (type: LayoutElement["type"]) => void;
}

const SeatingToolsSidebar: React.FC<SeatingToolsSidebarProps> = ({
  onBulkAddClick,
  onAddLayoutElement,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        width: 280,
        height: "100%",
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {/* Actions Section */}
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          color="info"
          fullWidth
          startIcon={<AddIcon />}
          onClick={onBulkAddClick}
        >
          {t("seating.actions.addTables")}
        </Button>
      </Box>

      <Divider />

      {/* Layout Elements Section */}
      {onAddLayoutElement && (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
            {t("seating.layoutElements.title")}
          </Typography>
          <Stack spacing={1}>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<StageIcon />}
              onClick={() => onAddLayoutElement("stage")}
              sx={{ justifyContent: "flex-start" }}
            >
              {t("seating.layoutElements.types.stage")}
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<BarIcon />}
              onClick={() => onAddLayoutElement("bar")}
              sx={{ justifyContent: "flex-start" }}
            >
              {t("seating.layoutElements.types.bar")}
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<FoodIcon />}
              onClick={() => onAddLayoutElement("food-court")}
              sx={{ justifyContent: "flex-start" }}
            >
              {t("seating.layoutElements.types.foodCourt")}
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<DanceIcon />}
              onClick={() => onAddLayoutElement("dance-floor")}
              sx={{ justifyContent: "flex-start" }}
            >
              {t("seating.layoutElements.types.danceFloor")}
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<EntranceIcon />}
              onClick={() => onAddLayoutElement("entrance")}
              sx={{ justifyContent: "flex-start" }}
            >
              {t("seating.layoutElements.types.entrance")}
            </Button>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              startIcon={<BathroomIcon />}
              onClick={() => onAddLayoutElement("bathroom")}
              sx={{ justifyContent: "flex-start" }}
            >
              {t("seating.layoutElements.types.bathroom")}
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default SeatingToolsSidebar;
