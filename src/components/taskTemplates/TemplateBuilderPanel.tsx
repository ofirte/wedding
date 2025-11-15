/**
 * TemplateBuilderPanel Component
 * Right panel for building the template
 * Shows the template form and selected tasks
 */

import { forwardRef } from "react";
import { Box, Paper } from "@mui/material";
import TaskTemplateForm, {
  TaskTemplateFormData,
  TaskTemplateFormHandle,
} from "./TaskTemplateForm";

interface TemplateBuilderPanelProps {
  initialData?: Partial<TaskTemplateFormData>;
  onSave: () => void;
  onSaveAndApply?: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const TemplateBuilderPanel = forwardRef<
  TaskTemplateFormHandle,
  TemplateBuilderPanelProps
>(({ initialData, onSave, onSaveAndApply, onCancel, isSubmitting }, ref) => {
  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 3,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <TaskTemplateForm
          ref={ref}
          initialData={initialData}
          onSave={onSave}
          onSaveAndApply={onSaveAndApply}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
        />
      </Box>
    </Paper>
  );
});

TemplateBuilderPanel.displayName = "TemplateBuilderPanel";

export default TemplateBuilderPanel;
