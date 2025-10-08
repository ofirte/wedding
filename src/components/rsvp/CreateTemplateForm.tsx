import React, { useState, useRef, useCallback, use, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  Stack,
  Alert,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { CreateTemplateRequest } from "../../api/rsvp/templateApi";
import { formatTemplateName } from "../../utils/templatesUtils";
import {
  PREDEFINED_VARIABLES,
  TemplateVariable,
  extractUsedVariables,
} from "../../utils/messageVariables";

interface CreateTemplateFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (templateData: CreateTemplateRequest) => void;
  isSubmitting: boolean;
  weddingId?: string;
}

const CreateTemplateForm: React.FC<CreateTemplateFormProps> = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  weddingId,
}) => {
  const { t } = useTranslation();
  const [templateName, setTemplateName] = useState("");
  const [language, setLanguage] = useState<"en" | "he">("en");
  const [messageText, setMessageText] = useState("");
  const usedVariables = useMemo(() => {
    return extractUsedVariables(messageText);
  }, [messageText]);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const insertVariable = useCallback(
    (variable: TemplateVariable) => {
      if (!textAreaRef.current) return;

      const textArea = textAreaRef.current;
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const variableText = `{{${variable.key}}}`;

      const newText =
        messageText.substring(0, start) +
        variableText +
        messageText.substring(end);

      setMessageText(newText);

      // Set cursor position after the inserted variable
      setTimeout(() => {
        const newCursorPos = start + variableText.length;
        textArea.setSelectionRange(newCursorPos, newCursorPos);
        textArea.focus();
      }, 0);
    },
    [messageText]
  );

  const handleSubmit = () => {
    if (!templateName.trim() || !messageText.trim()) {
      return;
    }

    // Create variables object from used variables
    const variables: Record<string, string> = {};
    usedVariables.forEach((varKey) => {
      const variable = PREDEFINED_VARIABLES.find((v) => v.key === varKey);
      if (variable) {
        variables[varKey] = variable.placeholder;
      }
    });

    // Create the friendly name with wedding ID suffix
    const friendlyName = formatTemplateName(templateName);

    const templateData: CreateTemplateRequest = {
      friendly_name: friendlyName,
      language,
      variables,
      types: {
        "twilio/text": {
          body: messageText.trim(),
        },
      },
    };

    onSubmit(templateData);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form
      setTemplateName("");
      setLanguage("en");
      setMessageText("");
      onClose();
    }
  };

  const isFormValid = templateName.trim() && messageText.trim();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("templates.createNewTemplate")}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label={t("templates.templateName")}
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            fullWidth
            required
            placeholder={t("templates.templateNamePlaceholder")}
            disabled={isSubmitting}
          />

          <FormControl fullWidth required disabled={isSubmitting}>
            <InputLabel>{t("templates.language")}</InputLabel>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "he")}
              label={t("templates.language")}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="he">עברית</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {t("templates.messageText")}
            </Typography>
            <TextField
              inputRef={textAreaRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              multiline
              rows={6}
              fullWidth
              required
              placeholder={t("templates.messageTextPlaceholder")}
              disabled={isSubmitting}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {t("templates.availableVariables")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t("templates.clickToInsert")}
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {PREDEFINED_VARIABLES.map((variable) => (
                <Chip
                  key={variable.key}
                  label={variable.label}
                  onClick={() => insertVariable(variable)}
                  color={
                    usedVariables.includes(variable.key) ? "primary" : "default"
                  }
                  variant={
                    usedVariables.includes(variable.key) ? "filled" : "outlined"
                  }
                  clickable={!usedVariables.includes(variable.key)}
                  disabled={
                    isSubmitting || usedVariables.includes(variable.key)
                  }
                />
              ))}
            </Stack>
          </Box>

          {messageText && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t("templates.preview")}
              </Typography>
              <Alert severity="info" sx={{ whiteSpace: "pre-wrap" }}>
                {messageText}
              </Alert>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid || isSubmitting}
          startIcon={isSubmitting ? undefined : <AddIcon />}
        >
          {isSubmitting
            ? t("templates.creating")
            : t("templates.createTemplate")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTemplateForm;
