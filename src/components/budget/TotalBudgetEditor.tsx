import React, { useState } from "react";
import { Box, Typography, TextField, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "../../localization/LocalizationContext";

interface TotalBudgetEditorProps {
  totalBudget: number;
  isLoading: boolean;
  onSaveTotalBudget: (value: number) => void;
}

const TotalBudgetEditor: React.FC<TotalBudgetEditorProps> = ({
  totalBudget,
  isLoading,
  onSaveTotalBudget,
}) => {
  const { t } = useTranslation();
  const [editingTotalBudget, setEditingTotalBudget] = useState(false);
  const [tempTotalBudget, setTempTotalBudget] = useState("");

  // Handlers for total budget editing
  const handleStartEditTotalBudget = () => {
    setTempTotalBudget(totalBudget.toString());
    setEditingTotalBudget(true);
  };

  const handleCancelEditTotalBudget = () => {
    setEditingTotalBudget(false);
  };

  const handleSaveTotalBudget = () => {
    const newBudget = parseFloat(tempTotalBudget);
    if (!isNaN(newBudget) && newBudget >= 0) {
      onSaveTotalBudget(newBudget);
      setEditingTotalBudget(false);
    }
  };

  const handleTotalBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setTempTotalBudget(value);
  };

  return (
    <Box
      sx={{
        display: "flex",

        alignItems: "center",

        borderRadius: 2,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          color: "info.dark",
          mr: 2,
        }}
      >
        {t("budget.totalBudget")}:
      </Typography>

      {editingTotalBudget ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            value={tempTotalBudget}
            onChange={handleTotalBudgetChange}
            variant="outlined"
            size="small"
            sx={{ width: "150px" }}
            autoFocus
          />
          <IconButton
            onClick={handleSaveTotalBudget}
            size="small"
            color="success"
            sx={{
              bgcolor: "success.light",
              "&:hover": {
                bgcolor: "success.main",
                color: "white",
              },
            }}
          >
            <CheckIcon />
          </IconButton>
          <IconButton
            onClick={handleCancelEditTotalBudget}
            size="small"
            color="error"
            sx={{
              bgcolor: "error.light",
              "&:hover": {
                bgcolor: "error.main",
                color: "white",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "primary.main",
            }}
          >{`₪${
            isLoading ? t("common.loading") : totalBudget.toLocaleString()
          }`}</Typography>
          <Tooltip title={t("common.editTotalBudget")}>
            <IconButton
              onClick={handleStartEditTotalBudget}
              size="small"
              color="info"
              sx={{
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "info.light",
                  color: "white",
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default TotalBudgetEditor;
