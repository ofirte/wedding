import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
} from "@mui/material";
import { Table } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";

interface BulkAddTablesDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (tables: Omit<Table, "id">[]) => void;
  existingTables: Table[];
  arrangementId: string;
}

const BulkAddTablesDialog: React.FC<BulkAddTablesDialogProps> = ({
  open,
  onClose,
  onCreate,
  existingTables,
  arrangementId,
}) => {
  const { t } = useTranslation();

  // Find the highest table number to suggest starting number
  const getNextTableNumber = () => {
    if (existingTables.length === 0) return 1;
    const maxNumber = Math.max(
      ...existingTables.map((t) =>
        typeof t.number === "number" ? t.number : parseInt(String(t.number)) || 0
      )
    );
    return maxNumber + 1;
  };

  const [shape, setShape] = useState<"round" | "rectangular" | "square">("round");
  const [capacity, setCapacity] = useState(8);
  const [quantity, setQuantity] = useState(10);
  const [startingNumber, setStartingNumber] = useState(getNextTableNumber());

  const handleCreate = () => {
    const newTables: Omit<Table, "id">[] = [];
    const gridCols = Math.ceil(Math.sqrt(quantity));
    const spacing = 180;
    const startX = 100;
    const startY = 100;

    for (let i = 0; i < quantity; i++) {
      newTables.push({
        arrangementId,
        number: startingNumber + i,
        shape,
        capacity,
        assignedGuests: [],
        position: {
          x: startX + (i % gridCols) * spacing,
          y: startY + Math.floor(i / gridCols) * spacing,
        },
      });
    }

    onCreate(newTables);
    onClose();

    // Reset form
    setShape("round");
    setCapacity(8);
    setQuantity(10);
    setStartingNumber(getNextTableNumber());
  };

  const handleClose = () => {
    onClose();
    // Reset form on close
    setShape("round");
    setCapacity(8);
    setQuantity(10);
    setStartingNumber(getNextTableNumber());
  };

  const endNumber = startingNumber + quantity - 1;
  const shapeLabel = t(`seating.setup.shapes.${shape}`).toLowerCase();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ bgcolor: "info.light", color: "info.contrastText" }}
      >
        {t("seating.bulkAdd.title")}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={3}>
          {/* Table Shape */}
          <FormControl fullWidth required>
            <InputLabel>{t("seating.setup.shape")}</InputLabel>
            <Select
              value={shape}
              onChange={(e) => setShape(e.target.value as typeof shape)}
              label={t("seating.setup.shape")}
            >
              <MenuItem value="round">
                {t("seating.setup.shapes.round")}
              </MenuItem>
              <MenuItem value="rectangular">
                {t("seating.setup.shapes.rectangular")}
              </MenuItem>
              <MenuItem value="square">
                {t("seating.setup.shapes.square")}
              </MenuItem>
            </Select>
          </FormControl>

          {/* Capacity */}
          <TextField
            label={t("seating.setup.capacity")}
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(Math.max(1, Number(e.target.value)))}
            required
            inputProps={{ min: 1, max: 20 }}
            helperText={t("seating.bulkAdd.capacityHelper")}
          />

          {/* Quantity */}
          <TextField
            label={t("seating.bulkAdd.quantity")}
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(50, Number(e.target.value))))}
            required
            inputProps={{ min: 1, max: 50 }}
            helperText={t("seating.bulkAdd.quantityHelper")}
          />

          {/* Starting Number */}
          <TextField
            label={t("seating.bulkAdd.startingNumber")}
            type="number"
            value={startingNumber}
            onChange={(e) => setStartingNumber(Math.max(1, Number(e.target.value)))}
            helperText={t("seating.bulkAdd.startingNumberHelper")}
            inputProps={{ min: 1 }}
          />

          {/* Preview Alert */}
          <Alert severity="info">
            {t("seating.bulkAdd.preview", {
              quantity,
              shape: shapeLabel,
              capacity,
              start: startingNumber,
              end: endNumber,
            })}
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("common.cancel")}</Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          color="primary"
          disabled={!shape || capacity < 1 || quantity < 1}
        >
          {t("seating.bulkAdd.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkAddTablesDialog;
