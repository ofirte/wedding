import React, { useState, useMemo } from "react";
import { Box, Typography, Button } from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { useInvitees } from "../../hooks/invitees/useInvitees";
import { Invitee } from "../invitees/InviteList";
import { createColumns } from "../invitees/InviteListColumns";
import DSTable from "../common/DSTable";
import SendMessageDialog from "./SendMessageDialog";

const SendRSVPTab: React.FC = () => {
  const { t } = useTranslation();
  const { data: allInvitees = [] } = useInvitees();
  const [selectedGuests, setSelectedGuests] = useState<Invitee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter invitees to only include those with phone numbers
  const inviteesWithPhones = useMemo(() => {
    return allInvitees.filter(
      (invitee) => invitee.cellphone && invitee.cellphone.trim() !== ""
    );
  }, [allInvitees]);

  // Get columns using the existing createColumns function
  const allColumns = createColumns(t);

  // Filter out the actions column for the send tab since we don't need edit/delete
  const columns = useMemo(() => {
    return allColumns.filter((column) => column.id !== "actions");
  }, [allColumns]);

  const handleSelectionChange = (selected: Invitee[]) => {
    setSelectedGuests(selected);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t("rsvp.sendRSVP")}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("rsvp.sendRSVPDescription", {
          count: inviteesWithPhones.length,
        })}
      </Typography>

      {inviteesWithPhones.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {t("rsvp.noGuestsWithPhones")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t("rsvp.addPhoneNumbersHint")}
          </Typography>
        </Box>
      ) : (
        <DSTable
          columns={columns}
          data={inviteesWithPhones}
          showSelectColumn={true}
          onSelectionChange={handleSelectionChange}
          showExport={false}
        />
      )}

      {selectedGuests.length > 0 && (
        <Box sx={{ mt: 2, p: 2, bgcolor: "primary.light", borderRadius: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2">
              {t("rsvp.selectedGuestsCount", { count: selectedGuests.length })}
            </Typography>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleOpenDialog}
              color="primary"
              sx={{
                borderRadius: 2,
              }}
            >
              {t("rsvp.sendMessage")}
            </Button>
          </Box>
        </Box>
      )}

      <SendMessageDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        selectedGuests={selectedGuests}
      />
    </Box>
  );
};

export default SendRSVPTab;
