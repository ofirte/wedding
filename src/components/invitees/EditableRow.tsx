import React, { useState } from "react";
import {
  TableCell,
  TableRow,
  Button,
  TextField,
  Select,
  MenuItem,
} from "@mui/material";
import { Invitee } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";

const EditableRow = ({
  invitee,
  onSave,
  onCancel,
  existingRelations,
}: {
  invitee: Invitee;
  onSave: (invitee: Invitee) => void;
  onCancel: () => void;
  existingRelations: string[];
}) => {
  const { t } = useTranslation();
  const [editedInvitee, setEditedInvitee] = useState(invitee);
  const [customRelation, setCustomRelation] = useState("");

  const handleSave = () => {
    if (!editedInvitee.name) return;
    onSave(editedInvitee);
  };

  return (
    <TableRow>
      <TableCell align="center">
        <TextField
          value={editedInvitee.name}
          onChange={(e) =>
            setEditedInvitee({ ...editedInvitee, name: e.target.value })
          }
          size="small"
        />
      </TableCell>
      <TableCell align="center">
        <Select
          value={editedInvitee.rsvp}
          onChange={(e) =>
            setEditedInvitee({ ...editedInvitee, rsvp: e.target.value })
          }
          size="small"
        >
          <MenuItem value="Pending">{t("common.pending")}</MenuItem>
          <MenuItem value="Accepted">{t("common.accepted")}</MenuItem>
          <MenuItem value="Declined">{t("guests.declined")}</MenuItem>
        </Select>
      </TableCell>
      <TableCell align="center">
        <TextField
          type="number"
          value={editedInvitee.percentage}
          onChange={(e) =>
            setEditedInvitee({
              ...editedInvitee,
              percentage: parseInt(e.target.value),
            })
          }
          size="small"
        />
      </TableCell>
      <TableCell align="center">
        <Select
          value={editedInvitee.side}
          onChange={(e) =>
            setEditedInvitee({ ...editedInvitee, side: e.target.value })
          }
          size="small"
        >
          <MenuItem value="חתן">חתן</MenuItem>
          <MenuItem value="כלה">כלה</MenuItem>
        </Select>
      </TableCell>
      <TableCell align="center">
        <Select
          value={editedInvitee.relation}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "custom") {
              setCustomRelation("");
            } else {
              setEditedInvitee({ ...editedInvitee, relation: value });
            }
          }}
          size="small"
        >
          {existingRelations.map((relation) => (
            <MenuItem key={relation} value={relation}>
              {relation}
            </MenuItem>
          ))}
          <MenuItem value="custom">{t("common.custom")}</MenuItem>
        </Select>
        {editedInvitee.relation === "custom" && (
          <TextField
            value={customRelation}
            onChange={(e) => {
              setCustomRelation(e.target.value);
              setEditedInvitee({ ...editedInvitee, relation: e.target.value });
            }}
            size="small"
          />
        )}
      </TableCell>
      <TableCell align="center">
        <TextField
          type="number"
          value={editedInvitee.amount}
          onChange={(e) =>
            setEditedInvitee({
              ...editedInvitee,
              amount: parseInt(e.target.value),
            })
          }
          size="small"
        />
      </TableCell>
      <TableCell align="center">
        <TextField
          type="number"
          value={editedInvitee.amountConfirm}
          onChange={(e) =>
            setEditedInvitee({
              ...editedInvitee,
              amountConfirm: parseInt(e.target.value),
            })
          }
          size="small"
        />
      </TableCell>
      <TableCell align="center">
        <TextField
          value={editedInvitee.cellphone}
          onChange={(e) =>
            setEditedInvitee({
              ...editedInvitee,
              cellphone: e.target.value,
            })
          }
          size="small"
          inputProps={{ maxLength: 10 }}
        />
      </TableCell>
      <TableCell align="center">
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          size="small"
        >
          {t("common.save")}
        </Button>
        <Button onClick={onCancel} size="small">
          {t("common.cancel")}
        </Button>
      </TableCell>
    </TableRow>
  );
};
export default EditableRow;
