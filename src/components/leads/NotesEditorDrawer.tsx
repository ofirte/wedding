import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Lead } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { RichTextEditor } from "../common/RichTextEditor";

interface NotesEditorDrawerProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onSave: (content: string) => Promise<void>;
}

const NotesEditorDrawer: React.FC<NotesEditorDrawerProps> = ({
  lead,
  open,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  // Reset content when lead changes or drawer opens
  useEffect(() => {
    if (lead && open) {
      setContent(lead.notes || "");
      setHasChanges(false);
    }
  }, [lead, open]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasChanges(newContent !== (lead?.notes || ""));
  };

  const handleSave = async () => {
    if (!lead) return;

    setIsSaving(true);
    try {
      await onSave(content);
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowUnsavedDialog(true);
      return;
    }
    onClose();
  };

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    setHasChanges(false);
    onClose();
  };

  const handleContinueEditing = () => {
    setShowUnsavedDialog(false);
  };

  if (!lead) return null;

  return (
    <>
      <Drawer
        anchor="left"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 450 } },
        }}
      >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h6">{t("leads.columns.notes")}</Typography>
            <Typography variant="body2" color="text.secondary">
              {lead.name}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* Editor */}
        <Box sx={{ flex: 1, p: 2, overflow: "auto" }}>
          <RichTextEditor
            content={content}
            onChange={handleContentChange}
            placeholder={t("leads.notesDrawer.placeholder")}
            minHeight={300}
          />
        </Box>

        <Divider />

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          <Button variant="outlined" onClick={handleClose} disabled={isSaving}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            startIcon={isSaving ? <CircularProgress size={16} /> : null}
          >
            {isSaving ? t("common.saving") : t("common.save")}
          </Button>
        </Box>
      </Box>
    </Drawer>

    {/* Unsaved Changes Dialog */}
    <Dialog open={showUnsavedDialog} onClose={handleContinueEditing}>
      <DialogTitle>{t("common.unsavedChanges")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t("common.unsavedChangesMessage")}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleContinueEditing}>
          {t("common.continueEditing")}
        </Button>
        <Button onClick={handleDiscardChanges} color="error">
          {t("common.discardChanges")}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default NotesEditorDrawer;
