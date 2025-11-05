import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useTranslation } from "../../localization/LocalizationContext";
import { stripWeddingIdFromTemplateName } from "../../utils/templatesUtils";

interface MessageTemplate {
  sid: string;
  friendlyName: string;
}

interface MessageTemplateSelectorProps {
  selectedTemplate: string;
  onSelectionChange: (selected: string) => void;
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
  selectedTemplate,
  onSelectionChange,
  templates = [],
  disabled = false,
}) => {
  const { t } = useTranslation();

  const handleChange = (event: any) => {
    const value = event.target.value;
    onSelectionChange(value);
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
        value={selectedTemplate}
        label={t("rsvpStatusTab.filterByTemplate")}
        onChange={handleChange}
      >
        {templates && templates.length > 0 ? (
          templates.map((template) => (
            <MenuItem key={template.sid} value={template.sid}>
               {stripWeddingIdFromTemplateName(template.friendlyName)}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            {t("rsvpStatusTab.noTemplatesAvailable")}
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default MessageTemplateSelector;
