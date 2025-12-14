import React from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  InputAdornment,
} from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";

interface CustomQuantityInputProps {
  value: string;
  onChange: (value: string) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  minValue?: number;
  maxValue?: number;
}

const CustomQuantityInput: React.FC<CustomQuantityInputProps> = ({
  value,
  onChange,
  onIncrement,
  onDecrement,
  minValue = 50,
  maxValue = 999,
}) => {
  const { t } = useTranslation();
  const numericValue = parseInt(value) || 0;
  const isMinReached = numericValue <= minValue;
  const isMaxReached = numericValue >= maxValue;
  const isInvalid = numericValue < minValue || numericValue > maxValue;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/\D/g, "");
    onChange(newValue);
  };

  return (
    <Box
      sx={{
        textAlign: "center",
        minHeight: 140,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <IconButton
          onClick={onDecrement}
          disabled={isMinReached}
          sx={{
            bgcolor: "primary.light",
            "&:hover": { bgcolor: "primary.main", color: "white" },
            "&:disabled": { bgcolor: "grey.200" },
          }}
        >
          <RemoveIcon />
        </IconButton>

        <TextField
          value={value}
          onChange={handleInputChange}
          type="text"
          inputMode="numeric"
          error={isInvalid && value !== ""}
          slotProps={{
            input: {
              sx: {
                fontSize: "1.5rem",
                fontWeight: 600,
                textAlign: "center",
                width: 150,
              },
            },
            htmlInput: {
              style: { textAlign: "center" },
            },
          }}
        />

        <IconButton
          onClick={onIncrement}
          disabled={isMaxReached}
          sx={{
            bgcolor: "primary.light",
            "&:hover": { bgcolor: "primary.main", color: "white" },
            "&:disabled": { bgcolor: "grey.200" },
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      <Typography
        variant="caption"
        color={isInvalid ? "error" : "text.secondary"}
        sx={{ mt: 1, display: "block" }}
      >
        {isInvalid
          ? numericValue < minValue
            ? t("rsvp.premiumPricing.payment.minRecords")
            : t("rsvp.premiumPricing.payment.maxRecords")
          : `${minValue}-${maxValue} ${t("rsvp.premiumPricing.payment.records")}`}
      </Typography>
    </Box>
  );
};

export default CustomQuantityInput;
