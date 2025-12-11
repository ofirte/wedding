import React, { useState, useCallback } from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SummaryInfo from "./SummaryInfo";
import AddGuestsDialog from "./AddGuestsDialog";
import ContactMatcher from "../contacts/ContactMatcher";
import CSVUploadDialog from "./CSVUploadDialog";
import { useInvitees } from "../../hooks/invitees/useInvitees";
import { useCreateInvitee } from "../../hooks/invitees/useCreateInvitee";
import { useUpdateInvitee } from "../../hooks/invitees/useUpdateInvitee";
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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvitee, setEditingInvitee] = useState<Invitee | null>(null);
  const [isContactMatcherOpen, setIsContactMatcherOpen] = useState(false);
  const [isCSVUploadOpen, setIsCSVUploadOpen] = useState(false);
  const { t } = useTranslation();

  // Use the mutation hooks
  const { mutate: createInvitee } = useCreateInvitee();
  const { mutate: updateInvitee } = useUpdateInvitee();
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

  const handleDialogOpen = () => {
    setEditingInvitee(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingInvitee(null);
  };

  const handleEditStart = (invitee: Invitee) => {
    setEditingInvitee(invitee);
    setIsDialogOpen(true);
  };

  const handleSaveInvitee = async (invitee: Invitee) => {
    try {
      if (editingInvitee) {
        // Update existing invitee using the hook
        updateInvitee({
          id: editingInvitee.id,
          data: {
            name: invitee.name,
            rsvp: invitee.rsvp,
            percentage: invitee.percentage,
            side: invitee.side,
            relation: invitee.relation,
            amount: invitee.amount,
            amountConfirm: invitee.amountConfirm,
            cellphone: invitee.cellphone,
          },
        });
      } else {
        console.log("Creating new invitee: ", invitee);
        createInvitee({
          name: invitee.name,
          rsvp: invitee.rsvp,
          percentage: invitee.percentage,
          side: invitee.side,
          relation: invitee.relation,
          amount: invitee.amount,
          amountConfirm: invitee.amountConfirm,
          cellphone: invitee.cellphone,
        });
      }
      setIsDialogOpen(false);
      setEditingInvitee(null);
    } catch (error) {
      console.error("Error saving invitee: ", error);
    }
  };

  const existingRelations = Array.from(
    new Set(invitees.map((invitee: Invitee) => invitee.relation))
  ).filter(Boolean) as string[];

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

        py: 4,
        px: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <Stack spacing={4}>
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
                Upload CSV
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={handleDialogOpen}
                color="info"
                sx={{
                  borderRadius: 2,
                }}
              >
                {t("guests.addGuest")}
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
      <AddGuestsDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        onSave={handleSaveInvitee}
        relationOptions={existingRelations}
        editInvitee={editingInvitee}
      />
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
