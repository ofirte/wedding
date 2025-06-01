import React from "react";
import { Box, Button, Chip, Stack } from "@mui/material";
import { Invitee } from "./InviteList";
import { useTranslation } from "../../localization/LocalizationContext";

interface InviteeBulkActionsProps {
  selectedRows: Invitee[];
  onBulkUpdate: () => void;
  onBulkDelete: () => void;
}

const InviteeBulkActions: React.FC<InviteeBulkActionsProps> = ({
  selectedRows,
  onBulkUpdate,
  onBulkDelete,
}) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ borderRadius: 1 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="outlined" size="small" onClick={onBulkUpdate}>
          {t("guests.bulkUpdate")}
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={onBulkDelete}
        >
          {t("guests.bulkDelete")}
        </Button>
        <Chip
          label={t("common.selected", { count: selectedRows.length })}
          color="primary"
          variant="outlined"
        />
      </Stack>
    </Box>
  );
};

export default InviteeBulkActions;
