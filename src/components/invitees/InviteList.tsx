import React, { useState, useMemo } from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import SummaryInfo from "./SummaryInfo";
import { createColumns } from "./InviteListColumns";
import AddGuestsDialog from "./AddGuestsDialog";
import ContactMatcher from "../contacts/ContactMatcher";
import { useInvitees } from "../../hooks/invitees/useInvitees";
import { useCreateInvitee } from "../../hooks/invitees/useCreateInvitee";
import { useUpdateInvitee } from "../../hooks/invitees/useUpdateInvitee";
import { useDeleteInvitee } from "../../hooks/invitees/useDeleteInvitee";
import { useBulkUpdateInvitees } from "../../hooks/invitees/useBulkUpdateInvitees";
import { useBulkDeleteInvitees } from "../../hooks/invitees/useBulkDeleteInvitees";
import InviteeTable from "./InviteeTable";
import { useTranslation } from "../../localization/LocalizationContext";
import { isGoogleContactsConfigured } from "../../api/contacts/googleContactsApi";
import { isNil } from "lodash";
import { RSVPStatus } from "../../api/rsvp/rsvpStatusTypes";

export interface Invitee {
  id: string;
  name: string;
  rsvp: string;
  percentage: number;
  side: string;
  relation: string;
  amount: number;
  amountConfirm: number;
  cellphone: string;
  rsvpStatus?: RSVPStatus;
}

const WeddingInviteTable = () => {
  const columns = createColumns(useTranslation().t);
  const { data: invitees = [] } = useInvitees();

  // Use denormalized RSVP data directly from invitees
  const inviteesWithRSVP = useMemo(() => {
    return invitees.map((invitee) => ({
      ...invitee,
      amountConfirm: Number(invitee.rsvpStatus?.amount || 0),
      rsvp: (invitee.rsvpStatus?.attendance === true
        ? "Confirmed"
        : isNil(invitee.rsvpStatus?.attendance)
        ? "Pending"
        : "Declined") as "Confirmed" | "Pending" | "Declined",
    }));
  }, [invitees]);

  const [displayedInvitees, setDisplayedInvitees] = useState<Invitee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvitee, setEditingInvitee] = useState<Invitee | null>(null);
  const [isContactMatcherOpen, setIsContactMatcherOpen] = useState(false);
  const { t } = useTranslation();

  // Use the mutation hooks
  const { mutate: createInvitee } = useCreateInvitee();
  const { mutate: updateInvitee } = useUpdateInvitee();
  const { mutate: deleteInvitee } = useDeleteInvitee();
  const { mutate: bulkUpdateInvitees } = useBulkUpdateInvitees();
  const { mutate: bulkDeleteInvitees } = useBulkDeleteInvitees();

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
    new Set(inviteesWithRSVP.map((invitee) => invitee.relation))
  ).filter(Boolean);

  const handleDelete = async (invitee: Invitee) => {
    try {
      // Delete invitee using the hook
      deleteInvitee(invitee.id);
    } catch (error) {
      console.error("Error deleting invitee: ", error);
    }
  };

  const handleBulkUpdate = async (
    invitees: Invitee[],
    updates: Partial<Invitee>
  ) => {
    try {
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
    } catch (error) {
      console.error("Error updating invitees in bulk: ", error);
    }
  };

  const handleBulkDelete = async (invitees: Invitee[]) => {
    try {
      // Use the bulk delete hook with proper batch operations
      const inviteeIds = invitees.map((invitee) => invitee.id);
      bulkDeleteInvitees(inviteeIds);
    } catch (error) {
      console.error("Error deleting invitees in bulk: ", error);
    }
  };

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

  // Count invitees without phone numbers
  const inviteesNeedingPhones = inviteesWithRSVP.filter(
    (invitee) => !invitee.cellphone || invitee.cellphone.trim() === ""
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
          <SummaryInfo invitees={displayedInvitees} />
          <InviteeTable
            columns={columns}
            invitees={inviteesWithRSVP}
            onDeleteInvitee={handleDelete}
            onEditInvitee={handleEditStart}
            onBulkUpdate={handleBulkUpdate}
            onBulkDelete={handleBulkDelete}
            showExport={true}
            onDisplayDataChange={(data: Invitee[]) =>
              setDisplayedInvitees(data)
            }
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
        invitees={inviteesWithRSVP}
        onComplete={handleContactMatcherComplete}
      />
    </Box>
  );
};

export default WeddingInviteTable;
