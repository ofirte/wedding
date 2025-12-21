import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
} from "@mui/material";
import { Business, Celebration } from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";

interface Wedding {
  id: string;
  name: string;
}

export interface TaskTypePopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (taskType: "producer" | "wedding", weddingId?: string) => void;
  weddings: Wedding[];
}

type Step = "select-type" | "select-wedding";

const TaskTypePopover: React.FC<TaskTypePopoverProps> = ({
  open,
  onClose,
  onConfirm,
  weddings,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>("select-type");
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>("");

  const handleClose = () => {
    setStep("select-type");
    setSelectedWeddingId("");
    onClose();
  };

  const handleProducerClick = () => {
    onConfirm("producer");
    handleClose();
  };

  const handleWeddingClick = () => {
    if (weddings.length === 1) {
      // Only one wedding, skip selection step
      onConfirm("wedding", weddings[0].id);
      handleClose();
    } else {
      setStep("select-wedding");
    }
  };

  const handleWeddingConfirm = () => {
    if (selectedWeddingId) {
      onConfirm("wedding", selectedWeddingId);
      handleClose();
    }
  };

  const handleBack = () => {
    setStep("select-type");
    setSelectedWeddingId("");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          minWidth: 320,
          borderRadius: 2,
        },
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        {step === "select-type" ? (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2.5, fontWeight: 600, textAlign: "center" }}>
              {t("tasksManagement.selectTaskType")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<Business />}
                onClick={handleProducerClick}
                sx={{
                  justifyContent: "flex-start",
                  py: 1.5,
                  textTransform: "none",
                }}
              >
                {t("tasksManagement.producerTask")}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Celebration />}
                onClick={handleWeddingClick}
                disabled={weddings.length === 0}
                sx={{
                  justifyContent: "flex-start",
                  py: 1.5,
                  textTransform: "none",
                }}
              >
                {t("tasksManagement.weddingTask")}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 2.5, fontWeight: 600, textAlign: "center" }}>
              {t("tasksManagement.selectWedding")}
            </Typography>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>{t("common.wedding")}</InputLabel>
              <Select
                value={selectedWeddingId}
                label={t("common.wedding")}
                onChange={(e) => setSelectedWeddingId(e.target.value)}
              >
                {weddings.map((wedding) => (
                  <MenuItem key={wedding.id} value={wedding.id}>
                    {wedding.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button size="small" onClick={handleBack}>
                {t("common.back")}
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleWeddingConfirm}
                disabled={!selectedWeddingId}
              >
                {t("common.create")}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskTypePopover;
