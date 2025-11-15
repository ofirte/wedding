/**
 * TaskTemplateListItem Component
 * Individual task item in the template builder
 * Displays task with enhanced summary showing priority, category, and relative date
 */

import React from "react";
import {
  Box,
  TextField,
  Typography,
  IconButton,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { Controller, Control, UseFormRegister, FieldErrors } from "react-hook-form";
import { TaskBadge } from "../tasks/TaskBadge";
import { getPriorityBadgeColor } from "../tasks/taskUtils";
import { formatRelativeDueDate } from "../../utils/taskTemplateUtils";
import { useTranslation } from "../../localization/LocalizationContext";
import RelativeDatePicker from "./RelativeDatePicker";
import { TaskTemplateFormData } from "./TaskTemplateForm";

interface TaskTemplateListItemProps {
  index: number;
  fieldId: string;
  isExpanded: boolean;
  onAccordionChange: (event: React.SyntheticEvent, isExpanded: boolean) => void;
  onDelete: () => void;
  control: Control<TaskTemplateFormData>;
  register: UseFormRegister<TaskTemplateFormData>;
  errors: FieldErrors<TaskTemplateFormData>;
}

const TaskTemplateListItem: React.FC<TaskTemplateListItemProps> = ({
  index,
  fieldId,
  isExpanded,
  onAccordionChange,
  onDelete,
  control,
  register,
  errors,
}) => {
  const { t } = useTranslation();

  return (
    <Accordion key={fieldId} expanded={isExpanded} onChange={onAccordionChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: "100%",
          }}
        >
          <DragIcon color="disabled" />

          {/* Task Title */}
          <Controller
            name={`tasks.${index}.title`}
            control={control}
            render={({ field }) => (
              <Typography sx={{ flexShrink: 0 }}>
                {field.value || t("taskTemplates.untitledTask")}
              </Typography>
            )}
          />

          {/* Badges Container */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              flexWrap: "wrap",
              flexGrow: 1,
              ml: 1,
            }}
          >
            {/* Priority Badge */}
            <Controller
              name={`tasks.${index}.priority`}
              control={control}
              render={({ field }) =>
                field.value ? (
                  <TaskBadge
                    label={t(`common.${field.value.toLowerCase()}`)}
                    color={getPriorityBadgeColor(field.value)}
                  />
                ) : <></>
              }
            />

            {/* Category Badge */}
            <Controller
              name={`tasks.${index}.category`}
              control={control}
              render={({ field }) =>
                field.value ? (
                  <TaskBadge label={field.value} color="#9BBB9B" />
                ) : <></>
              }
            />

            {/* Relative Date Badge */}
            <Controller
              name={`tasks.${index}.relativeDueDate`}
              control={control}
              render={({ field: amountField }) => (
                <Controller
                  name={`tasks.${index}.relativeDueDateUnit`}
                  control={control}
                  render={({ field: unitField }) => (
                    <Controller
                      name={`tasks.${index}.relativeDueDateDirection`}
                      control={control}
                      render={({ field: directionField }) => {
                        // Only show badge if all three fields have values
                        if (
                          amountField.value &&
                          unitField.value &&
                          directionField.value
                        ) {
                          return (
                            <TaskBadge
                              label={formatRelativeDueDate(
                                amountField.value,
                                unitField.value,
                                directionField.value,
                                t
                              )}
                              color="#7A9CB3"
                            />
                          );
                        }
                        return <></>;
                      }}
                    />
                  )}
                />
              )}
            />
          </Box>

          {/* Delete Button */}
          <Box sx={{ ml: "auto", flexShrink: 0 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              color="error"
              type="button"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Task Title */}
          <TextField
            fullWidth
            size="small"
            label={t("common.title")}
            {...register(`tasks.${index}.title`, {
              required: t("taskTemplates.allTasksMustHaveTitles"),
              validate: (value) =>
                value.trim().length > 0 ||
                t("taskTemplates.allTasksMustHaveTitles"),
            })}
            error={!!errors.tasks?.[index]?.title}
            helperText={errors.tasks?.[index]?.title?.message}
            required
          />

          {/* Task Description */}
          <TextField
            fullWidth
            size="small"
            label={t("common.description")}
            {...register(`tasks.${index}.description`)}
            multiline
            rows={2}
          />

          {/* Priority */}
          <TextField
            fullWidth
            size="small"
            select
            label={t("common.priority")}
            {...register(`tasks.${index}.priority`)}
          >
            <MenuItem value="Low">{t("common.low")}</MenuItem>
            <MenuItem value="Medium">{t("common.medium")}</MenuItem>
            <MenuItem value="High">{t("common.high")}</MenuItem>
          </TextField>

          {/* Category */}
          <TextField
            fullWidth
            size="small"
            label={t("common.category")}
            {...register(`tasks.${index}.category`)}
          />

          {/* Relative Due Date */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t("taskTemplates.relativeDueDate")}
            </Typography>
            <Controller
              name={`tasks.${index}.relativeDueDate`}
              control={control}
              render={({ field: amountField }) => (
                <Controller
                  name={`tasks.${index}.relativeDueDateUnit`}
                  control={control}
                  render={({ field: unitField }) => (
                    <Controller
                      name={`tasks.${index}.relativeDueDateDirection`}
                      control={control}
                      render={({ field: directionField }) => (
                        <RelativeDatePicker
                          amount={amountField.value}
                          unit={unitField.value}
                          direction={directionField.value}
                          onAmountChange={amountField.onChange}
                          onUnitChange={unitField.onChange}
                          onDirectionChange={directionField.onChange}
                        />
                      )}
                    />
                  )}
                />
              )}
            />
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default TaskTemplateListItem;
