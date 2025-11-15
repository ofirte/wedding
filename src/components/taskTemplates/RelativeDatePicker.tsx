/**
 * RelativeDatePicker Component
 * Allows users to specify a relative due date (e.g., "30 days before wedding")
 */

import React from "react";
import {
  Box,
  TextField,
  MenuItem,
  Grid,
  FormHelperText,
} from "@mui/material";
import { useTranslation } from "../../localization/LocalizationContext";

interface RelativeDatePickerProps {
  amount?: number;
  unit?: 'days' | 'weeks' | 'months';
  direction?: 'before' | 'after';
  onAmountChange: (amount: number | undefined) => void;
  onUnitChange: (unit: 'days' | 'weeks' | 'months' | undefined) => void;
  onDirectionChange: (direction: 'before' | 'after' | undefined) => void;
  error?: boolean;
  helperText?: string;
}

const RelativeDatePicker: React.FC<RelativeDatePickerProps> = ({
  amount,
  unit,
  direction,
  onAmountChange,
  onUnitChange,
  onDirectionChange,
  error,
  helperText,
}) => {
  const { t } = useTranslation();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onAmountChange(undefined);
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        onAmountChange(numValue);
      }
    }
  };

  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as 'days' | 'weeks' | 'months' | '';
    onUnitChange(value === '' ? undefined : value);
  };

  const handleDirectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as 'before' | 'after' | '';
    onDirectionChange(value === '' ? undefined : value);
  };

  // Helper to clear all fields
  const clearAll = () => {
    onAmountChange(undefined);
    onUnitChange(undefined);
    onDirectionChange(undefined);
  };

  return (
    <Box>
      <Grid container spacing={1}>
        <Grid size={{
          xs: 4,
        }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={t("taskTemplates.amount")}
            value={amount ?? ''}
            onChange={handleAmountChange}
            inputProps={{ min: 0 }}
            error={error}
          />
        </Grid>
        <Grid size={{
          xs: 4,
        }}>
          <TextField
            fullWidth
            size="small"
            select
            label={t("taskTemplates.unit")}
            value={unit ?? ''}
            onChange={handleUnitChange}
            error={error}
          >
            <MenuItem value="">{t("common.none")}</MenuItem>
            <MenuItem value="days">{t("taskTemplates.days")}</MenuItem>
            <MenuItem value="weeks">{t("taskTemplates.weeks")}</MenuItem>
            <MenuItem value="months">{t("taskTemplates.months")}</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{
          xs: 4,
        }}>
          <TextField
            fullWidth
            size="small"
            select
            label={t("taskTemplates.direction")}
            value={direction ?? ''}
            onChange={handleDirectionChange}
            error={error}
          >
            <MenuItem value="">{t("common.none")}</MenuItem>
            <MenuItem value="before">{t("taskTemplates.before")}</MenuItem>
            <MenuItem value="after">{t("taskTemplates.after")}</MenuItem>
          </TextField>
        </Grid>
      </Grid>
      {helperText && (
        <FormHelperText error={error} sx={{ mt: 0.5 }}>
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

export default RelativeDatePicker;
