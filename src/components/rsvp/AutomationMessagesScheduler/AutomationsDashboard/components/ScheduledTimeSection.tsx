import React from "react";
import { Box, Typography } from "@mui/material";
import { Schedule as ScheduleIcon } from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { format } from "date-fns";
import { enUS, he } from "date-fns/locale";

interface ScheduledTimeSectionProps {
  isEditing: boolean;
  effectiveTime: Date;
  isCompleted: boolean;
  onTimeChange: (newTime: Date | null) => void;
  locale: typeof enUS | typeof he;
  t: (key: string) => string;
}

export const ScheduledTimeSection: React.FC<ScheduledTimeSectionProps> = ({
  isEditing,
  effectiveTime,
  isCompleted,
  onTimeChange,
  locale,
  t,
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {isCompleted
          ? t("rsvp.sentAt") || "Sent At"
          : t("rsvp.scheduledSendTime") || "Scheduled Send Time"}
      </Typography>

      {isEditing ? (
        <DateTimePicker
          value={effectiveTime}
          onChange={onTimeChange}
          minDateTime={new Date()}
          sx={{
            width: "100%",
            "& .MuiInputBase-root": {
              borderRadius: 2,
            },
          }}
          slotProps={{
            textField: {
              variant: "outlined",
              size: "small",
              fullWidth: true,
            },
          }}
        />
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ScheduleIcon color="action" fontSize="small" />
          <Typography variant="body1">
            {format(effectiveTime, "PPPp", { locale })}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
