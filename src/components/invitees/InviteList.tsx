import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import { db } from "../../api/firebaseConfig";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SummaryInfo from "./SummaryInfo";
import { columns } from "./InviteListColumns";
import AddGuestsDialog from "./AddGuestsDialog";
import DSTable from "../common/DSTable";

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
  const [editingInviteeId, setEditingInviteeId] = useState<string | null>(null);
  const [newInvitee, setNewInvitee] = useState<Invitee | null>(null);
  const [isAddGuestsDialogOpen, setIsAddGuestsDialogOpen] = useState(false);
  const [tableColumns, setTableColumns] = useState(columns);

  const handleEditInvitee = async (updatedInvitee: Invitee) => {
    try {
      const inviteeRef = doc(db, "invitee", updatedInvitee.id);
      await updateDoc(inviteeRef, {
        name: updatedInvitee.name,
        rsvp: updatedInvitee.rsvp ?? "",
        percentage: updatedInvitee.percentage,
        side: updatedInvitee.side,
        relation: updatedInvitee.relation,
        amount: updatedInvitee.amount,
        amountConfirm: updatedInvitee.amountConfirm,
        cellphone: updatedInvitee.cellphone ?? "",
      });
      setEditingInviteeId(null);
    } catch (error) {
      console.error("Error updating invitee: ", error);
    }
  };

  const handleDeleteInvitee = async (id: string) => {
    try {
      await deleteDoc(doc(db, "invitee", id));
    } catch (error) {
      console.error("Error deleting invitee: ", error);
    }
  };

  const handleAddInvitee = () => {
    const newId = invitees.length
      ? (parseInt(invitees[invitees.length - 1].id) + 1).toString()
      : "1";
    setNewInvitee({
      id: newId,
      name: "",
      rsvp: "Pending",
      percentage: 0,
      side: "חתן",
      relation: "",
      amount: 0,
      amountConfirm: 0,
      cellphone: "",
    });
    setEditingInviteeId(newId);
  };

  const handleSaveNewInvitee = async (invitee: Invitee) => {
    try {
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
      setNewInvitee(null);
      setEditingInviteeId(null);
    } catch (error) {
      console.error("Error adding invitee: ", error);
    }
  };

  const handleAddGuestsDialogOpen = () => {
    setIsAddGuestsDialogOpen(true);
  };

  const handleAddGuestsDialogClose = () => {
    setIsAddGuestsDialogOpen(false);
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
        
        // Update relation filter options dynamically based on invitees
        const existingRelations = Array.from(
          new Set(inviteesData.map((invitee) => invitee.relation))
        );
        
        // Find relation column and update its filterConfig options
        const updatedColumns = tableColumns.map(column => {
          if (column.id === "relation" && column.filterConfig) {
            return {
              ...column,
              filterConfig: {
                ...column.filterConfig,
                options: existingRelations.map(relation => ({
                  value: relation,
                  label: relation
                }))
              }
            };
          }
          return column;
        });
        
        setTableColumns(updatedColumns);
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
  );

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
              onClick={handleAddGuestsDialogOpen}
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

          <DSTable columns={tableColumns} data={invitees} 
            onDisplayedDataChange={
              (displayedData) => setDisplayedInvitees(displayedData)
            }
          />
        </Stack>
      </Box>
      <AddGuestsDialog
        open={isAddGuestsDialogOpen}
        onClose={handleAddGuestsDialogClose}
        onSave={handleSaveNewInvitee}
        relationOptions={existingRelations}
      />
    </Box>
  );
};

export default WeddingInviteTable;
