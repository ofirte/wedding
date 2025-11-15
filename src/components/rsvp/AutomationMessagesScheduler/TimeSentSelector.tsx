import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Chip,
  Alert,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { useWeddingDetails } from "../../../hooks/wedding/useWeddingDetails";
import {
  getWeddingDayOffset,
  getWeddingDateOffset,
} from "../../../utils/weddingDateUtils";
import { format } from "date-fns";
import { enUS, he } from "date-fns/locale";

interface TimeSentSelectorProps {
  onSelectTime: (scheduledTime: Date) => void;
  initialValue?: Date;
}

const TimeSentSelector: React.FC<TimeSentSelectorProps> = ({
  onSelectTime,
  initialValue,
}) => {
  const { t, language } = useTranslation();
  const locale = language === "he" ? he : enUS;

  const [selectedTime, setSelectedTime] = useState<Date | null>(
    initialValue || null
  );

  const { data: wedding } = useWeddingDetails();

  const handleTimeChange = (newValue: Date | null) => {
    
    setSelectedTime(newValue);
  };

  const handleConfirmTime = () => {
    if (!selectedTime) return;
    onSelectTime(selectedTime);
  };

  const getOffsetInfo = () => {
    if (!selectedTime || !wedding?.date) return null;

    const offset = getWeddingDateOffset(selectedTime, wedding.date);
    const offsetText = getWeddingDayOffset(selectedTime, wedding.date, t);

    return {
      ...offset,
      text: offsetText,
    };
  };

  const offsetInfo = getOffsetInfo();

  if (!wedding?.date) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2">
          {t("rsvp.weddingDateRequired") ||
            "Wedding date is required to schedule messages"}
        </Typography>
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
      <Stack spacing={3}>
        {/* Wedding Date Reference */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
          }}
        >
          {/* Date Time Picker */}
          <Paper elevation={0} sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle2" fontWeight="medium" sx={{ mb: 2 }}>
              {t("rsvp.scheduledSendTime") || "Scheduled Send Time"}
            </Typography>
            <DateTimePicker
              value={selectedTime}
              defaultValue={selectedTime}
              onChange={handleTimeChange}
              minDateTime={new Date()}
              sx={{
                width: "100%",
                "& .MuiInputBase-root": {
                  borderRadius: 2,
                },
              }}
              slotProps={{
                textField: {
                  placeholder:
                    t("rsvp.selectDateTime") || "Select date and time",
                  variant: "outlined",
                  fullWidth: true,
                },
              }}
            />
          </Paper>
        </Box>
        {/* Offset Display */}
        {selectedTime && offsetInfo && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: offsetInfo.isWeddingDay ? "success.50" : "grey.50",
              border: "1px solid",
              borderColor: offsetInfo.isWeddingDay ? "success.200" : "grey.200",
              borderRadius: 2,
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {t("rsvp.messageWillBeSent") || "Message will be sent"}
              </Typography>
              <Chip
                label={offsetInfo.text}
                color={offsetInfo.isWeddingDay ? "success" : "default"}
                variant={offsetInfo.isWeddingDay ? "filled" : "outlined"}
                sx={{
                  fontWeight: "medium",
                  fontSize: "0.875rem",
                  px: 2,
                  py: 0.5,
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}
              >
                {format(selectedTime, "PPPP 'at' p", { locale })}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Confirm Button */}
        <Box sx={{ textAlign: "center", pt: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleConfirmTime}
            disabled={!selectedTime}
            startIcon={<CheckCircleIcon />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
              },
              "&:disabled": {
                background: "grey.300",
                color: "grey.500",
              },
            }}
          >
            {t("rsvp.confirmScheduledTime") || "Confirm Scheduled Time"}
          </Button>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, fontStyle: "italic" }}
          >
            {t("rsvp.confirmScheduledTimeHint") ||
              "This will set when the message is automatically sent"}
          </Typography>
        </Box>
      </Stack>
    </LocalizationProvider>
  );
};

export default TimeSentSelector;
