import React from "react";
import { Box, Stack, Typography, Button } from "@mui/material";
import { Download as DownloadIcon, PersonAdd as PersonAddIcon } from "@mui/icons-material";
import { Table, Invitee } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import SeatingStats from "./SeatingStats";

interface SeatingToolbarProps {
  tables: Table[];
  invitees: Invitee[];
  onOpenAssignment: () => void;
  onExport?: () => void;
  isSaving?: boolean;
}

const SeatingToolbar: React.FC<SeatingToolbarProps> = ({
  tables,
  invitees,
  onOpenAssignment,
  onExport,
  isSaving = false,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        flexWrap: { xs: "wrap", md: "nowrap" },
        gap: 2,
      }}
    >
      {/* Left: Title and Stats */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {t("seating.title")}
        </Typography>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <SeatingStats tables={tables} invitees={invitees} inline />
        </Box>
      </Stack>

      {/* Right: Action Buttons */}
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={onOpenAssignment}
          disabled={tables.length === 0}
          sx={{ borderRadius: 2 }}
        >
          {t("seating.actions.assignGuests")}
        </Button>

        {onExport && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onExport}
            disabled={tables.length === 0}
            sx={{ borderRadius: 2 }}
          >
            {t("seating.preview.export")}
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default SeatingToolbar;
