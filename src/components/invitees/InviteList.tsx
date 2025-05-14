import React, { useState } from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SummaryInfo from "./SummaryInfo";
import { columns } from "./InviteListColumns";
import AddGuestsDialog from "./AddGuestsDialog";
import DSTable from "../common/DSTable";
import InviteeListActionCell from "./InviteeListActionCell";
import { useInvitees } from "../../hooks/invitees/useInvitees";
import { db } from "../../api/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useQueryClient } from "@tanstack/react-query";
import InviteeTable from "./InviteeTable";

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
}

const WeddingInviteTable = () => {
  const { data: invitees = [] } = useInvitees();
  const [displayedInvitees, setDisplayedInvitees] = useState<Invitee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvitee, setEditingInvitee] = useState<Invitee | null>(null);
  const queryClient = useQueryClient();
  const handleDialogOpen = () => {
    setEditingInvitee(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingInvitee(null);
    queryClient.invalidateQueries({ queryKey: ["invitees"] });
  };

  const handleEditStart = (invitee: Invitee) => {
    setEditingInvitee(invitee);
    setIsDialogOpen(true);
  };

  const handleSaveInvitee = async (invitee: Invitee) => {
    try {
      if (editingInvitee) {
        const inviteeRef = doc(db, "invitee", editingInvitee.id);
        await updateDoc(inviteeRef, {
          name: invitee.name,
          rsvp: invitee.rsvp,
          percentage: invitee.percentage,
          side: invitee.side,
          relation: invitee.relation,
          amount: invitee.amount,
          amountConfirm: invitee.amountConfirm,
          cellphone: invitee.cellphone,
        });
      } else {
        await addDoc(collection(db, "invitee"), {
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
    new Set(invitees.map((invitee) => invitee.relation))
  ).filter(Boolean);

  const handleDelete = async (invitee: Invitee) => {
    try {
      await deleteDoc(doc(db, "invitee", invitee.id));
      queryClient.invalidateQueries({ queryKey: ["invitees"] });
    } catch (error) {
      console.error("Error deleting invitee: ", error);
    }
  };

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
              Wedding Guest Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleDialogOpen}
              color="info"
              sx={{
                borderRadius: 2,
              }}
            >
              Add New Guests
            </Button>
          </Box>
          <SummaryInfo invitees={displayedInvitees} />
          <InviteeTable
            columns={columns}
            invitees={invitees}
            onDeleteInvitee={handleDelete}
            onEditInvitee={handleEditStart}
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
    </Box>
  );
};

export default WeddingInviteTable;
