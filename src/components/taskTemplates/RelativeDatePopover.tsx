/**
 * RelativeDatePopover Component
 * Dialog for editing relative due dates (e.g., "30 days before wedding")
 * Used in the template task inline table
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Divider,
  Grid,
} from "@mui/material";
import { useTranslation } from "../../localization/LocalizationContext";

export interface RelativeDateValue {
  amount?: number;
  unit?: "days" | "weeks" | "months";
  direction?: "before" | "after";
}

export interface RelativeDatePopoverProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (value: RelativeDateValue) => void;
  initialValue?: RelativeDateValue;
}

const RelativeDatePopover: React.FC<RelativeDatePopoverProps> = ({
  open,
  onClose,
  onConfirm,
  initialValue,
}) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<number | undefined>(initialValue?.amount);
  const [unit, setUnit] = useState<"days" | "weeks" | "months" | undefined>(
    initialValue?.unit
  );
  const [direction, setDirection] = useState<"before" | "after" | undefined>(
    initialValue?.direction
  );

  // Reset state when dialog opens with new initial value
  useEffect(() => {
    if (open) {
      setAmount(initialValue?.amount);
      setUnit(initialValue?.unit);
      setDirection(initialValue?.direction);
    }
  }, [open, initialValue]);

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = () => {
    onConfirm({ amount, unit, direction });
    handleClose();
  };

  const handleClear = () => {
    onConfirm({ amount: undefined, unit: undefined, direction: undefined });
    handleClose();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setAmount(undefined);
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        setAmount(numValue);
      }
    }
  };

  // Check if we have a complete value
  const isComplete = amount !== undefined && unit !== undefined && direction !== undefined;
  const hasAnyValue = amount !== undefined || unit !== undefined || direction !== undefined;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          minWidth: 340,
          borderRadius: 2,
        },
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        <Typography
          variant="subtitle1"
          sx={{ mb: 2.5, fontWeight: 600, textAlign: "center" }}
        >
          {t("taskTemplates.relativeDueDate")}
        </Typography>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label={t("taskTemplates.amount")}
              value={amount ?? ""}
              onChange={handleAmountChange}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              size="small"
              select
              label={t("taskTemplates.unit")}
              value={unit ?? ""}
              onChange={(e) =>
                setUnit(
                  e.target.value === ""
                    ? undefined
                    : (e.target.value as "days" | "weeks" | "months")
                )
              }
            >
              <MenuItem value="">{t("common.none")}</MenuItem>
              <MenuItem value="days">{t("taskTemplates.days")}</MenuItem>
              <MenuItem value="weeks">{t("taskTemplates.weeks")}</MenuItem>
              <MenuItem value="months">{t("taskTemplates.months")}</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              size="small"
              select
              label={t("taskTemplates.direction")}
              value={direction ?? ""}
              onChange={(e) =>
                setDirection(
                  e.target.value === ""
                    ? undefined
                    : (e.target.value as "before" | "after")
                )
              }
            >
              <MenuItem value="">{t("common.none")}</MenuItem>
              <MenuItem value="before">{t("taskTemplates.before")}</MenuItem>
              <MenuItem value="after">{t("taskTemplates.after")}</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Preview */}
        {isComplete && (
          <Typography
            variant="body2"
            sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}
          >
            {amount} {t(`taskTemplates.${unit}`)} {t(`taskTemplates.${direction}`)} {t("taskTemplates.weddingDate")}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
          <Button size="small" onClick={handleClear} disabled={!hasAnyValue} color="error">
            {t("common.clear")}
          </Button>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" onClick={handleClose}>
              {t("common.cancel")}
            </Button>
            <Button size="small" variant="contained" onClick={handleConfirm}>
              {t("common.confirm")}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default RelativeDatePopover;
