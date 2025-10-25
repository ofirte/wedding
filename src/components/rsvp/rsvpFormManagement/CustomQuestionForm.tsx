import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon, Edit as EditIcon } from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import CustomQuestionFormFields, {
  CustomQuestionData,
} from "../RsvpFormManagementV2/CustomQuestionFormFields";

interface CustomQuestionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  newQuestion: CustomQuestionData;
  setNewQuestion: React.Dispatch<React.SetStateAction<CustomQuestionData>>;
  addOption: () => void;
  updateOption: (index: number, value: string) => void;
  removeOption: (index: number) => void;
  submitting?: boolean;
}

const CustomQuestionForm: React.FC<CustomQuestionFormProps> = ({
  open,
  onClose,
  onSubmit,
  newQuestion,
  setNewQuestion,
  addOption,
  updateOption,
  removeOption,
  submitting = false,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <EditIcon sx={{ color: "white" }} />
          <Typography variant="h6" fontWeight="700" color="white">
            ✨ {t("rsvpQuestionManager.createCustomQuestion")}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          pt: 4,
          background: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
          minHeight: "60vh",
        }}
      >
        <CustomQuestionFormFields
          question={newQuestion}
          setQuestion={setNewQuestion}
          addOption={addOption}
          updateOption={updateOption}
          removeOption={removeOption}
        />
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          backgroundColor: "grey.50",
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          {t("rsvpQuestionManager.cancel")}
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={submitting}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            minWidth: 120,
          }}
        >
          {submitting
            ? t("common.creating")
            : t("rsvpQuestionManager.createQuestion")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomQuestionForm;
