import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
import { db } from "../../api/firebaseConfig";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SummaryInfo from "./SummaryInfo";
import { columns } from "./InviteListColumns";
import AddGuestsDialog from "./AddGuestsDialog";
import DSTable from "../common/DSTable";
import InviteeListActionCell from "./InviteeListActionCell";

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
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [displayedInvitees, setDisplayedInvitees] = useState<Invitee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvitee, setEditingInvitee] = useState<Invitee | null>(null);

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
        // Update existing invitee
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
        // Add new invitee
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

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "invitee"),
      (snapshot) => {
        const inviteesData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            rsvp: data.rsvp,
            percentage: data.percentage,
            side: data.side,
            relation: data.relation,
            amount: data.amount,
            amountConfirm: data.amountConfirm,
            cellphone: data.cellphone,
          };
        });
        setInvitees(inviteesData);
      },
      (error) => {
        if (error.code === "permission-denied") {
          console.error("Error fetching invitees: ", error.message);
        } else {
          console.error("Error fetching invitees: ", error);
        }
      }
    );
    return () => unsubscribe();
  }, []);

  const existingRelations = Array.from(
    new Set(invitees.map((invitee) => invitee.relation))
  ).filter(Boolean);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fafafa",
        py: 4,
        px: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
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
              sx={{ fontWeight: "bold", color: "#1a237e" }}
            >
              Wedding Guest Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleDialogOpen}
              sx={{
                bgcolor: "#9c27b0",
                "&:hover": { bgcolor: "#7b1fa2" },
                borderRadius: 2,
              }}
            >
              Add New Guests
            </Button>
          </Box>
          <SummaryInfo invitees={displayedInvitees} />
          <DSTable
            columns={columns.map((col) =>
              col.id === "actions"
                ? {
                    ...col,
                    render: (invitee: Invitee) => (
                      <InviteeListActionCell
                        invitee={invitee}
                        onEditStart={handleEditStart}
                      />
                    ),
                  }
                : col
            )}
            data={invitees}
            onDisplayedDataChange={setDisplayedInvitees}
          />
        </Stack>
      </Box>
      <AddGuestsDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        onSave={handleSaveInvitee}
        relationOptions={existingRelations}
      />
    </Box>
  );
};

export default WeddingInviteTable;
