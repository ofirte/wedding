import React, { useState } from "react";
import { Box, Paper } from "@mui/material";
import { AutomationDashboardCardProps } from "./types";
import { getStatusConfig } from "./utils/getStatusConfig";
import {
  AutomationCardHeader,
  CompletionStats,
  ScheduledTimeSection,
  MessagePreviewSection,
  EditActionsBar,
} from "./components";

export const AutomationDashboardCard: React.FC<AutomationDashboardCardProps> = ({
  automation,
  template,
  availableTemplates,
  effectiveTime,
  offsetText,
  isEditing,
  hasPendingChange,
  onStartEdit,
  onCancelEdit,
  onSaveChanges,
  onTimeChange,
  onTemplateChange,
  locale,
  t,
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const isPending = automation.status === "pending";
  const isCompleted = automation.status === "completed";
  const isFailed = automation.status === "failed";
  const canEdit = isPending;

  const statusConfig = getStatusConfig(automation, t);

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid",
        borderColor: hasPendingChange ? "primary.main" : statusConfig.borderColor,
        transition: "border-color 0.2s",
      }}
    >
      <AutomationCardHeader
        automation={automation}
        statusConfig={statusConfig}
        offsetText={offsetText}
        canEdit={canEdit}
        isEditing={isEditing}
        onStartEdit={onStartEdit}
      />

      <Box sx={{ p: 2 }}>
        {/* Completion Stats - Show for completed/failed */}
        {(isCompleted || isFailed) && automation.completionStats && (
          <CompletionStats automation={automation} locale={locale} t={t} />
        )}

        <ScheduledTimeSection
          isEditing={isEditing}
          effectiveTime={effectiveTime}
          isCompleted={isCompleted}
          onTimeChange={onTimeChange}
          locale={locale}
          t={t}
        />

        <MessagePreviewSection
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview(!showPreview)}
          template={template}
          availableTemplates={availableTemplates}
          effectiveTime={effectiveTime}
          isEditing={isEditing}
          onTemplateChange={onTemplateChange}
          t={t}
        />

        {isEditing && (
          <EditActionsBar
            hasPendingChange={hasPendingChange}
            onCancel={onCancelEdit}
            onSave={onSaveChanges}
            t={t}
          />
        )}
      </Box>
    </Paper>
  );
};
