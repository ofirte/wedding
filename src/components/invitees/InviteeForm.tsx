import React from "react";
import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Grid,
  Autocomplete,
  Button,
} from "@mui/material";
import { Invitee } from "./InviteList";
import { columns } from "./InviteListColumns";

interface InviteeFormProps {
  draftInvitee: Invitee;
  relationOptions: string[];
  editingInviteeId: string | null;
  handleInputChange: (field: string, value: any) => void;
  handleSaveEdit: () => void;
  handleAddInvitee: () => void;
  onCancelEdit: () => void;
}

const sideOptions = ["חתן", "כלה"];

const InviteeForm: React.FC<InviteeFormProps> = ({
  draftInvitee,
  relationOptions,
  editingInviteeId,
  handleInputChange,
  handleSaveEdit,
  handleAddInvitee,
  onCancelEdit,
}) => {
  return (
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
                  onChange={(e) => handleInputChange(column.id, e.target.value)}
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
                  onChange={(e) => handleInputChange(column.id, e.target.value)}
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
        {!editingInviteeId && (
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
  );
};

export default InviteeForm;
