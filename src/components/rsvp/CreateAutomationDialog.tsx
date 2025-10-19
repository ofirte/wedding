import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Checkbox,
  FormGroup,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useTranslation } from "../../localization/LocalizationContext";
import { useTemplates, useCreateSendAutomation } from "../../hooks/rsvp";
import TemplateSelector from "./TemplateSelector";
import {
  SendMessagesAutomation,
  TargetAudienceFilter,
  AutomationType,
} from "@wedding-plan/types";

interface CreateAutomationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * CreateAutomationDialog - Dialog form for creating new automated message campaigns
 *
 * Tells the story: "Schedule a message to be sent automatically"
 */
const CreateAutomationDialog: React.FC<CreateAutomationDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { data: templatesData, isLoading: isLoadingTemplates } = useTemplates();
  const createSendAutomation = useCreateSendAutomation();

  const [formData, setFormData] = useState({
    name: "",
    messageTemplateId: "",
    scheduledTime: new Date(),
    automationType: "rsvp" as AutomationType,
    targetAudienceFilter: {} as TargetAudienceFilter,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.messageTemplateId) {
      return;
    }

    const automationData: Omit<SendMessagesAutomation, "id"> = {
      name: formData.name,
      isActive: true,
      status: "pending",
      sentMessagesIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      messageTemplateId: formData.messageTemplateId,
      scheduledTime: formData.scheduledTime,
      automationType: formData.automationType,
      targetAudienceFilter: formData.targetAudienceFilter,
    };

    try {
      await createSendAutomation.mutateAsync(automationData);
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating automation:", error);
    }
  };

  const handleClose = () => {
    // Reset form on close
    setFormData({
      name: "",
      messageTemplateId: "",
      scheduledTime: new Date(),
      automationType: "rsvp",
      targetAudienceFilter: {},
    });
    onClose();
  };

  const handleAttendanceFilterChange = (value: boolean | undefined) => {
    setFormData((prev) => ({
      ...prev,
      targetAudienceFilter: {
        ...prev.targetAudienceFilter,
        attendance: value,
      },
    }));
  };

  const templates = templatesData?.templates || [];
  const showTargetAudience = formData.automationType === "reminder";

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t("rsvp.createAutomation")}</DialogTitle>

        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label={t("rsvp.automationName")}
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">
                  {t("rsvp.automationType")}
                </FormLabel>
                <RadioGroup
                  value={formData.automationType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      automationType: e.target.value as AutomationType,
                      targetAudienceFilter: {}, // Reset filter when type changes
                    }))
                  }
                >
                  <FormControlLabel
                    value="rsvp"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {t("rsvp.rsvpAutomation")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t("rsvp.rsvpAutomationDescription")}
                        </Typography>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="reminder"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {t("rsvp.reminderAutomation")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t("rsvp.reminderAutomationDescription")}
                        </Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>
            </Box>

            <Box sx={{ mb: 3 }}>
              <TemplateSelector
                templates={templates}
                selectedTemplateId={formData.messageTemplateId}
                onChange={(templateId) =>
                  setFormData((prev) => ({
                    ...prev,
                    messageTemplateId: templateId,
                  }))
                }
                label={t("rsvp.selectTemplate")}
                disabled={isLoadingTemplates}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <DateTimePicker
                label={t("rsvp.scheduledTime")}
                value={formData.scheduledTime}
                onChange={(newValue) =>
                  newValue &&
                  setFormData((prev) => ({ ...prev, scheduledTime: newValue }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Box>

            {showTargetAudience && (
              <Box sx={{ mb: 3 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    {t("rsvp.targetAudience")}
                  </FormLabel>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.targetAudienceFilter.attendance === true
                          }
                          onChange={(e) =>
                            handleAttendanceFilterChange(
                              e.target.checked ? true : undefined
                            )
                          }
                        />
                      }
                      label={t("rsvp.attendingGuests")}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={
                            formData.targetAudienceFilter.attendance === false
                          }
                          onChange={(e) =>
                            handleAttendanceFilterChange(
                              e.target.checked ? false : undefined
                            )
                          }
                        />
                      }
                      label={t("rsvp.notAttendingGuests")}
                    />
                  </FormGroup>
                </FormControl>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>{t("common.cancel")}</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              createSendAutomation.isPending ||
              !formData.name ||
              !formData.messageTemplateId
            }
          >
            {createSendAutomation.isPending
              ? t("common.creating")
              : t("rsvp.createAutomation")}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CreateAutomationDialog;
