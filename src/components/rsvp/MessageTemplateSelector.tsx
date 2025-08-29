import React from "react";
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useTranslation } from "../../localization/LocalizationContext";

interface MessageTemplate {
  sid: string;
  friendlyName: string;
}

interface MessageTemplateSelectorProps {
  selectedTemplates: string[];
  onSelectionChange: (selected: string[]) => void;
  templates?: MessageTemplate[];
  disabled?: boolean;
}

/**
 * MessageTemplateSelector - A focused component for selecting message templates
 *
 * This component tells the story of template filtering:
 * 1. Shows available message templates in a clean dropdown
 * 2. Displays selected templates as chips (first + count for multiple)
 * 3. Provides clear visual feedback of current selections
 */
const MessageTemplateSelector: React.FC<MessageTemplateSelectorProps> = ({
  selectedTemplates,
  onSelectionChange,
  templates = [],
  disabled = false,
}) => {
  const { t } = useTranslation();

  const handleChange = (event: any) => {
    const value = event.target.value;
    onSelectionChange(typeof value === "string" ? value.split(",") : value);
  };

  const renderSelectedTemplates = (selected: string[]) => {
    if (selected.length === 0) return "";

    const firstTemplate = templates.find((t) => t.sid === selected[0]);

    if (selected.length === 1) {
      return (
        <Chip label={firstTemplate?.friendlyName || "Unknown"} size="small" />
      );
    }

    return (
      <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
        <Chip label={firstTemplate?.friendlyName || "Unknown"} size="small" />
        <Chip
          label={`+${selected.length - 1}`}
          size="small"
          variant="outlined"
          color="primary"
        />
      </Box>
    );
  };

  return (
    <FormControl
      sx={{ minWidth: 280, maxWidth: 400, flex: 1 }}
      size="small"
      disabled={disabled}
    >
      <InputLabel id="template-select-label">
        {t("rsvpStatusTab.filterByTemplate")}
      </InputLabel>
      <Select
        labelId="template-select-label"
        multiple
        value={selectedTemplates}
        label={t("rsvpStatusTab.filterByTemplate")}
        onChange={handleChange}
        renderValue={renderSelectedTemplates}
      >
        {templates && templates.length > 0 ? (
          templates.map((template) => (
            <MenuItem key={template.sid} value={template.sid}>
              {template.friendlyName}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No templates available</MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default MessageTemplateSelector;
