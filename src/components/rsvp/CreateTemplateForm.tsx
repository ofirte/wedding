import React, { useState, useRef, useCallback, useMemo } from "react";
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
  Stack,
  Alert,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import { formatTemplateName } from "../../utils/templatesUtils";
import {
  getPredefinedVariables,
  TemplateVariable,
  extractUsedVariables,
  populateVariables,
  replaceVariables,
} from "../../utils/messageVariables";
import { useInvitees } from "../../hooks/invitees";
import { useWeddingDetails } from "../../hooks/wedding/useWeddingDetails";
import { CreateMessageTemplateRequest } from "@wedding-plan/types";
import VariablesSelector from "../common/VariablesSelector";

interface CreateTemplateFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (templateData: CreateMessageTemplateRequest) => void;
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
  const { t, language: environmentLanguage } = useTranslation();
  const [templateName, setTemplateName] = useState("");
  const [language, setLanguage] = useState<"en" | "he">(environmentLanguage);
  const [category, setCategory] = useState<string>("");
  const predefinedVariables = getPredefinedVariables(language);

  const categoryOptions = [
    {
      value: "initialRsvp",
      label: t("userRsvp.messagesPlan.initialRsvp.title"),
    },
    { value: "secondRsvp", label: t("userRsvp.messagesPlan.secondRsvp.title") },
    { value: "finalRsvp", label: t("userRsvp.messagesPlan.finalRsvp.title") },
    { value: "dayBefore", label: t("userRsvp.messagesPlan.dayBefore.title") },
    {
      value: "dayAfterThankyou",
      label: t("userRsvp.messagesPlan.dayAfterThankyou.title"),
    },
  ];
  const [messageText, setMessageText] = useState("");
  const usedVariables = useMemo(() => {
    return extractUsedVariables(messageText);
  }, [messageText]);
  const { data: invitees } = useInvitees();
  const { data: wedding } = useWeddingDetails();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const previewText = useMemo(() => {
    let message = messageText;
    const guest = invitees?.[0]; // Use first guest for preview context
    if (guest && wedding) {
      const variables = populateVariables(guest, wedding, language);
      message = replaceVariables(message, variables);
    }

    return message;
  }, [messageText, invitees, wedding, language]);

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
      const variable = predefinedVariables.find((v) => v.key === varKey);
      if (variable) {
        variables[varKey] = variable.placeholder;
      }
    });

    // Create the friendly name with wedding ID suffix
    const friendlyName = formatTemplateName(templateName);

    const templateData: CreateMessageTemplateRequest = {
      friendly_name: friendlyName,
      language,
      variables,
      types: {
        "twilio/text": {
          body: messageText.trim(),
        },
      },
      category: category || undefined,
    };

    onSubmit(templateData);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form
      setTemplateName("");
      setLanguage("en");
      setMessageText("");
      setCategory("");
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

          <FormControl fullWidth disabled={isSubmitting}>
            <InputLabel>{t("templates.category")}</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label={t("templates.category")}
            >
              <MenuItem value="">
                <em>{t("common.select")}</em>
              </MenuItem>
              {categoryOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
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

          <VariablesSelector
            language={language}
            usedVariables={usedVariables}
            onVariableSelect={(variableKey) => {
              const variable = predefinedVariables.find(
                (v) => v.key === variableKey
              );
              if (variable) {
                insertVariable(variable);
              }
            }}
            disabled={isSubmitting}
          />

          {previewText && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t("templates.preview")}
              </Typography>
              <Alert severity="info" sx={{ whiteSpace: "pre-wrap" }}>
                {previewText}
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
