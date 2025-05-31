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
import { createColumns } from "./InviteListColumns";
import { useTranslation } from "../../localization/LocalizationContext";

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
const statusOptions = ["Pending", "Confirmed", "Declined"];

const InviteeForm: React.FC<InviteeFormProps> = ({
  draftInvitee,
  relationOptions,
  editingInviteeId,
  handleInputChange,
  handleAddInvitee,
}) => {
  const { t } = useTranslation();

  // Create columns with translations
  const columns = createColumns(t);

  return (
    <Paper variant="outlined" sx={{ p: 1.5, mb: 1 }}>
      <Box sx={{ mb: 1, fontWeight: "bold", fontSize: "0.9rem" }}>
        {editingInviteeId
          ? t("guests.editGuestDetails")
          : t("guests.newGuestDetails")}
      </Box>
      <Grid container spacing={1} sx={{ mb: 1 }}>
        {columns
          .filter((col) => col.id !== "actions")
          .map((column) => (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={column.id}>
              {column.id === "relation" ? (
                <Autocomplete
                  freeSolo
                  options={relationOptions}
                  value={draftInvitee.relation}
       
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={column.label}
                      onChange={(e) =>
                        handleInputChange(column.id, e.target.value)
                      }
                      margin="dense"
                      fullWidth
                      size="small"
                    />
                  )}
                />
              ) : column.id === "side" ? (
                <TextField
                  select
                  label={column.label}
                  value={draftInvitee.side}
                  onChange={(e) => handleInputChange(column.id, e.target.value)}
                  margin="dense"
                  fullWidth
                  size="small"
                >
                  {sideOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              ) : column.id === "rsvp" ? (
                <TextField
                  select
                  label={column.label}
                  value={draftInvitee.rsvp}
                  onChange={(e) => handleInputChange(column.id, e.target.value)}
                  margin="dense"
                  fullWidth
                  size="small"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {t(`guests.${option.toLowerCase()}`)}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  label={column.label}
                  value={draftInvitee[column.id as keyof Invitee] ?? ""}
                  onChange={(e) => handleInputChange(column.id, e.target.value)}
                  margin="dense"
                  fullWidth
                  size="small"
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
      <Box mt={1}>
        {!editingInviteeId && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddInvitee}
            size="small"
          >
            {t("guests.addGuest")}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default InviteeForm;
