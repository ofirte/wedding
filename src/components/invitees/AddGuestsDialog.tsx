import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Autocomplete,
} from "@mui/material";
import { columns } from "./InviteListColumns";
import { Invitee } from "./InviteList";
import DSTable from "../common/DSTable"; // Adjust the import path accordingly

const defaultInvitee: Invitee = {
  id: "",
  name: "",
  rsvp: "Pending",
  percentage: 0,
  side: "חתן",
  relation: "",
  amount: 0,
  amountConfirm: 0,
  cellphone: "",
};

const sideOptions = ["חתן", "כלה"];

interface AddGuestsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (invitee: Invitee) => void;
  relationOptions: string[];
}

const AddGuestsDialog: React.FC<AddGuestsDialogProps> = ({
  open,
  onClose,
  onSave,
  relationOptions,
}) => {
  const [newInvitees, setNewInvitees] = useState<Invitee[]>([]);
  const [editingInviteeId, setEditingInviteeId] = useState<string | null>(null);
  const [draftInvitee, setDraftInvitee] = useState<Invitee>(defaultInvitee);

  const handleInputChange = (field: string, value: any) => {
    setDraftInvitee({
      ...draftInvitee,
      [field]: value,
    });
  };

  const handleAddInvitee = () => {
    // Create a new id based on the last id in the array.
    const newId =
      newInvitees.length > 0
        ? (parseInt(newInvitees[newInvitees.length - 1].id) + 1).toString()
        : "1";
    const inviteeToAdd = { ...draftInvitee, id: newId };
    setNewInvitees([...newInvitees, inviteeToAdd]);
    setDraftInvitee(defaultInvitee);
  };

  const handleEditInvitee = (id: string) => {
    const invitee = newInvitees.find((inv) => inv.id === id);
    if (invitee) {
      setEditingInviteeId(id);
      setDraftInvitee(invitee);
    }
  };

  const handleSaveEdit = () => {
    const updatedInvitees = newInvitees.map((invitee) =>
      invitee.id === editingInviteeId ? draftInvitee : invitee
    );
    setNewInvitees(updatedInvitees);
    setEditingInviteeId(null);
    setDraftInvitee(defaultInvitee);
  };

  const handleDeleteInvitee = (id: string) => {
    setNewInvitees(newInvitees.filter((invitee) => invitee.id !== id));
    if (editingInviteeId === id) {
      setEditingInviteeId(null);
      setDraftInvitee(defaultInvitee);
    }
  };

  const handleSaveAll = () => {
    newInvitees.forEach((invitee) => onSave(invitee));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Guests</DialogTitle>
      <DialogContent>
        {/* Form Section for Adding / Editing a Guest */}
        <Box mb={3}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ mb: 2, fontWeight: "bold" }}>
              {editingInviteeId ? "Edit Guest Details" : "New Guest Details"}
            </Box>
            <Grid container spacing={2}>
              {columns
                .filter((col) => col.id !== "actions")
                .map((column) => (
                  <Grid item xs={12} sm={6} key={column.id}>
                    {column.id === "relation" ? (
                      <Autocomplete
                        freeSolo
                        options={relationOptions}
                        value={draftInvitee.relation}
                        onChange={(event, newValue) =>
                          handleInputChange(column.id, newValue)
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={column.label}
                            margin="normal"
                            fullWidth
                          />
                        )}
                      />
                    ) : column.id === "side" ? (
                      <TextField
                        select
                        label={column.label}
                        value={draftInvitee.side}
                        onChange={(e) =>
                          handleInputChange(column.id, e.target.value)
                        }
                        margin="normal"
                        fullWidth
                      >
                        {sideOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      <TextField
                        label={column.label}
                        value={draftInvitee[column.id as keyof Invitee] ?? ""}
                        onChange={(e) =>
                          handleInputChange(column.id, e.target.value)
                        }
                        margin="normal"
                        fullWidth
                        type={
                          ["percentage", "amount", "amountConfirm"].includes(
                            column.id
                          )
                            ? "number"
                            : "text"
                        }
                      />
                    )}
                  </Grid>
                ))}
            </Grid>
            <Box mt={2}>
              {editingInviteeId ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveEdit}
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingInviteeId(null);
                      setDraftInvitee(defaultInvitee);
                    }}
                    sx={{ ml: 1 }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddInvitee}
                >
                  Add Guest
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
        {/* Table Section Showing All Added Guests */}
        <Paper variant="outlined">
          <DSTable
            columns={columns}
            data={newInvitees}
          />
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSaveAll} variant="contained" color="primary">
          Save All
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddGuestsDialog;
