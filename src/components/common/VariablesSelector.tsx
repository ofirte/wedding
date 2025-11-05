import React from "react";
import { Box, Typography, Chip, Stack } from "@mui/material";
import { useTranslation } from "../../localization/LocalizationContext";
import {
  getPredefinedVariables,
  TemplateVariable,
} from "../../utils/messageVariables";

interface VariablesSelectorProps {
  language: "en" | "he";
  usedVariables: string[];
  onVariableSelect: (variableKey: string) => void;
  disabled?: boolean;
}

const VariablesSelector: React.FC<VariablesSelectorProps> = ({
  language,
  usedVariables,
  onVariableSelect,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const predefinedVariables = getPredefinedVariables(language);

  const handleVariableClick = (variable: TemplateVariable) => {
    if (!usedVariables.includes(variable.key)) {
      onVariableSelect(variable.key);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {t("templates.availableVariables")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("templates.clickToInsert")}
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {predefinedVariables.map((variable) => {
          const isUsed = usedVariables.includes(variable.key);
          return (
            <Chip
              key={variable.key}
              label={variable.label}
              onClick={() => handleVariableClick(variable)}
              color={isUsed ? "primary" : "default"}
              variant={isUsed ? "filled" : "outlined"}
              clickable={!isUsed && !disabled}
              disabled={disabled || isUsed}
              title={variable.description}
            />
          );
        })}
      </Stack>
    </Box>
  );
};

export default VariablesSelector;
