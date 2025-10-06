import React, { FC } from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useTranslation } from "../../localization/LocalizationContext";

interface Template {
  sid: string;
  friendlyName?: string;
}

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplateId: string;
  onChange: (templateId: string) => void;
  disabled?: boolean;
  label?: string;
}

/**
 * TemplateSelector - Reusable component for selecting message templates
 *
 * Tells the story: "Which message template do you want to use?"
 */
const TemplateSelector: FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplateId,
  onChange,
  disabled = false,
  label,
}) => {
  const { t } = useTranslation();

  const displayLabel = label || t("rsvp.selectTemplate");

  return (
    <FormControl fullWidth>
      <InputLabel>{displayLabel}</InputLabel>
      <Select
        value={selectedTemplateId}
        label={displayLabel}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {templates.map((template) => (
          <MenuItem key={template.sid} value={template.sid}>
            {template.friendlyName || template.sid}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default TemplateSelector;
