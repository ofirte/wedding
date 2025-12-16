import React, { useState, useCallback } from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SummaryInfo from "./SummaryInfo";
import ContactMatcher from "../contacts/ContactMatcher";
import CSVUploadDialog from "./CSVUploadDialog";
import { useInvitees } from "../../hooks/invitees/useInvitees";
import { useCreateInvitee } from "../../hooks/invitees/useCreateInvitee";
import { useUpdateInviteeOptimistic } from "../../hooks/invitees/useUpdateInviteeOptimistic";
import { useDeleteInvitee } from "../../hooks/invitees/useDeleteInvitee";
import { useBulkUpdateInvitees } from "../../hooks/invitees/useBulkUpdateInvitees";
import { useBulkDeleteInvitees } from "../../hooks/invitees/useBulkDeleteInvitees";
import InviteeTable from "./InviteeTable";
import { useTranslation } from "../../localization/LocalizationContext";
import { isGoogleContactsConfigured } from "../../api/contacts/googleContactsApi";
import { Invitee } from "@wedding-plan/types";

const WeddingInviteTable = () => {
  // Use raw invitees directly - no transformation to maintain stable object references
  // Sorting by createdAt is handled by DSInlineTable via defaultSortField prop
  const { data: invitees = [] } = useInvitees();
  const [isContactMatcherOpen, setIsContactMatcherOpen] = useState(false);
  const [isCSVUploadOpen, setIsCSVUploadOpen] = useState(false);
  const { t } = useTranslation();
  const { mutate: createInvitee } = useCreateInvitee();
  const { mutateAsync: updateInviteeOptimistic } = useUpdateInviteeOptimistic();
  const { mutate: deleteInvitee } = useDeleteInvitee();
  const { mutate: bulkUpdateInvitees } = useBulkUpdateInvitees();
  const { mutate: bulkDeleteInvitees } = useBulkDeleteInvitees();

  // Handle inline cell updates - use optimistic for instant feedback
  // Returns Promise so Tab navigation can await completion
  const handleCellUpdate = useCallback(
    async (rowId: string | number, field: string, value: any) => {
      await updateInviteeOptimistic({
        id: rowId as string,
        data: { [field]: value },
      });
    },
    [updateInviteeOptimistic]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteInvitee(id);
    },
    [deleteInvitee]
  );

  // Handle inline add row
  const handleAddInvitee = useCallback(
    (newRow: Omit<Invitee, "id">, onSuccess?: (newRowId: string | number) => void) => {
      createInvitee(
        {
          name: newRow.name,
          side: newRow.side || "חתן",
          relation: newRow.relation || "",
          amount: newRow.amount || 1,
          cellphone: newRow.cellphone || "",
          rsvp: newRow.rsvp || "",
          percentage: newRow.percentage || 100,
          amountConfirm: newRow.amountConfirm || 0,
          createdAt: new Date().toISOString(),
        },
        {
          onSuccess: (data) => {
            // data is a DocumentReference with the new ID
            if (onSuccess && data?.id) {
              onSuccess(data.id);
            }
          },
        }
      );
    },
    [createInvitee]
  );

  const handleBulkUpdate = useCallback(
    (invitees: Invitee[], updates: Partial<Invitee>) => {
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(
          ([_, value]) => value !== "" && value !== null && value !== undefined
        )
      );
      const bulkUpdates = invitees.map((invitee) => ({
        id: invitee.id,
        data: cleanUpdates,
      }));
      bulkUpdateInvitees(bulkUpdates);
    },
    [bulkUpdateInvitees]
  );

  const handleBulkDelete = useCallback(
    (invitees: Invitee[]) => {
      const inviteeIds = invitees.map((invitee) => invitee.id);
      bulkDeleteInvitees(inviteeIds);
    },
    [bulkDeleteInvitees]
  );

  const handleContactMatcherOpen = () => {
    setIsContactMatcherOpen(true);
  };

  const handleContactMatcherClose = () => {
    setIsContactMatcherOpen(false);
  };

  const handleContactMatcherComplete = () => {
    // Optionally show a success message or refresh data
    setIsContactMatcherOpen(false);
  };

  const handleCSVUploadOpen = () => {
    setIsCSVUploadOpen(true);
  };

  const handleCSVUploadClose = () => {
    setIsCSVUploadOpen(false);
  };

  // Count invitees without phone numbers
  const inviteesNeedingPhones = invitees.filter(
    (invitee: Invitee) => !invitee.cellphone || invitee.cellphone.trim() === ""
  ).length;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          p: 4,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: "bold", color: "info.dark" }}
            >
              {t("guests.title")}
            </Typography>
            <Stack direction="row" spacing={2}>
              {inviteesNeedingPhones > 0 && isGoogleContactsConfigured() && (
                <Button
                  variant="outlined"
                  startIcon={<ContactPhoneIcon />}
                  onClick={handleContactMatcherOpen}
                  color="primary"
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  {t("contacts.matchContacts")} ({inviteesNeedingPhones})
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={handleCSVUploadOpen}
                color="secondary"
                sx={{
                  borderRadius: 2,
                }}
              >
                {t("guests.uploadCSV")}
              </Button>
            </Stack>
          </Box>
          <SummaryInfo invitees={invitees} />
          <InviteeTable
            invitees={invitees}
            onCellUpdate={handleCellUpdate}
            onDeleteInvitee={handleDelete}
            onAddInvitee={handleAddInvitee}
            onBulkUpdate={handleBulkUpdate}
            onBulkDelete={handleBulkDelete}
            
          />
        </Stack>
      </Box>
      <ContactMatcher
        open={isContactMatcherOpen}
        onClose={handleContactMatcherClose}
        invitees={invitees}
        onComplete={handleContactMatcherComplete}
      />
      <CSVUploadDialog
        open={isCSVUploadOpen}
        onClose={handleCSVUploadClose}
        existingInvitees={invitees}
      />
    </Box>
  );
};

export default WeddingInviteTable;
