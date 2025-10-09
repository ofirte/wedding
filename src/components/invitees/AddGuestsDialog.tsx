import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import { createColumns } from "./InviteListColumns";
import { Invitee } from "./InviteList";
import InviteeForm from "./InviteeForm";
import InviteeTable from "./InviteeTable";
import { useTranslation } from "../../localization/LocalizationContext";

const defaultInvitee: Invitee = {
  id: "",
  name: "",
  rsvp: "Pending",
  percentage: 0,
  side: "חתן",
  relation: "",
  amount: 1,
  amountConfirm: 0,
  cellphone: "",
};

interface AddGuestsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (invitee: Invitee) => void;
  relationOptions: string[];
  editInvitee?: Invitee | null;
}

const AddGuestsDialog: React.FC<AddGuestsDialogProps> = ({
  open,
  onClose,
  onSave,
  relationOptions,
  editInvitee = null,
}) => {
  const { t } = useTranslation();
  const [newInvitees, setNewInvitees] = useState<Invitee[]>([]);
  const [editingInviteeId, setEditingInviteeId] = useState<string | null>(null);
  const [draftInvitee, setDraftInvitee] = useState<Invitee>(defaultInvitee);

  // Create columns with translations
  const columns = createColumns(t);

  useEffect(() => {
    if (editInvitee) {
      setDraftInvitee(editInvitee);
      if (open && !newInvitees.some((inv) => inv.id === editInvitee.id)) {
        setNewInvitees([editInvitee]);
        setEditingInviteeId(editInvitee.id);
      }
    } else if (open) {
      setDraftInvitee(defaultInvitee);
      setNewInvitees([]);
      setEditingInviteeId(null);
    }
  }, [editInvitee, open]);

  const handleInputChange = (field: string, value: any) => {
    setDraftInvitee({
      ...draftInvitee,
      [field]: value,
    });
  };

  const handleAddInvitee = () => {
    const newId =
      newInvitees.length > 0
        ? (parseInt(newInvitees[newInvitees.length - 1].id) + 1).toString()
        : "1";
    const inviteeToAdd = { ...draftInvitee, id: newId };
    setNewInvitees([...newInvitees, inviteeToAdd]);
    setDraftInvitee(defaultInvitee);
  };

  const handleSaveEdit = () => {
    const updatedInvitees = newInvitees.map((invitee) =>
      invitee.id === editingInviteeId ? draftInvitee : invitee
    );
    setNewInvitees(updatedInvitees);
    setEditingInviteeId(null);
    setDraftInvitee(defaultInvitee);
  };

  const handleSaveAll = () => {
    if (
      editInvitee &&
      newInvitees.length === 1 &&
      newInvitees[0].id === editInvitee.id
    ) {
      onSave(draftInvitee);
    } else {
      newInvitees.forEach((invitee) => onSave(invitee));
    }
    onClose();
  };

  const handleCancelEdit = () => {
    setEditingInviteeId(null);
    setDraftInvitee(defaultInvitee);
  };

  const handleDeleteInvitee = (invitee: Invitee) => {
    setNewInvitees(newInvitees.filter((inv) => inv.id !== invitee.id));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: "info.light", color: "info.contrastText" }}>
        {editInvitee
          ? t("guests.editGuestDetails")
          : t("guests.newGuestDetails")}
      </DialogTitle>
      <DialogContent>
        {/* Form Section for Adding / Editing a Guest */}
        <Box mb={3}>
          <InviteeForm
            draftInvitee={draftInvitee}
            relationOptions={relationOptions}
            editingInviteeId={editingInviteeId}
            handleInputChange={handleInputChange}
            handleSaveEdit={handleSaveEdit}
            handleAddInvitee={handleAddInvitee}
            onCancelEdit={handleCancelEdit}
          />
        </Box>
        {/* Only show table when not editing an existing invitee */}
        {!editInvitee && (
          <InviteeTable
            columns={columns}
            invitees={newInvitees}
            showExport={false}
            onDeleteInvitee={handleDeleteInvitee}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button onClick={handleSaveAll} variant="contained" color="primary">
          {t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddGuestsDialog;
