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
        justifyContent: "center",
        mb: 2,
        bgcolor: "sage.main",
        padding: 2,
        borderRadius: 1,
      }}
    >
      <Typography variant="h6" sx={{ mr: 2 }}>
        {t("budget.totalBudget")}:
      </Typography>
      {editingTotalBudget ? (
        <>
          <TextField
            value={tempTotalBudget}
            onChange={handleTotalBudgetChange}
            variant="outlined"
            size="small"
            sx={{ width: "150px", mr: 1 }}
            autoFocus
          />
          <IconButton
            onClick={handleSaveTotalBudget}
            color="primary"
            size="small"
          >
            <CheckIcon />
          </IconButton>
          <IconButton onClick={handleCancelEditTotalBudget} size="small">
            <CloseIcon />
          </IconButton>
        </>
      ) : (
        <>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>{`₪${
            isLoading ? t("common.loading") : totalBudget.toLocaleString()
          }`}</Typography>
          <Tooltip title={t("common.editTotalBudget")}>
            <IconButton
              onClick={handleStartEditTotalBudget}
              size="small"
              sx={{ ml: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Box>
  );
};

export default TotalBudgetEditor;
