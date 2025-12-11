import React from "react";
import { Button, Stack } from "@mui/material";
import { Invitee } from "@wedding-plan/types";
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

  if (selectedRows.length === 0) return null;

  return (
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
    </Stack>
  );
};

export default InviteeBulkActions;
