import React from "react";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
} from "@mui/material";
import { RSVPFormData } from "../guestRSVPTypes";

interface AttendanceQuestionProps {
  formData: RSVPFormData;
  onFormDataChange: (newFormData: Partial<RSVPFormData>) => void;
  onScroll: () => void;
}

const AttendanceQuestion: React.FC<AttendanceQuestionProps> = ({
  formData,
  onFormDataChange,
  onScroll,
}) => {
  const handleAttendingChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const attending = event.target.value as "yes" | "no";

    if (attending === "no") {
      // When selecting "no", reset other fields to undefined
      onFormDataChange({
        attending,
        guestCount: undefined,
        sleepover: undefined,
        needsRideFromTelAviv: undefined,
      });
    } else {
      // When selecting "yes", reset other fields to empty/unanswered state
      onFormDataChange({
        attending,
      });
      // Scroll to questions when user selects "yes"
      setTimeout(() => onScroll(), 300);
    }
  };

  return (
    <FormControl component="fieldset" sx={{ width: "100%" }}>
      <FormLabel
        component="legend"
        sx={{
          mb: 3,
          fontSize: "1.3rem",
          color: "#333333",
          textAlign: "center",
          fontWeight: "bold",
          display: "block",
        }}
      >
        💒 האם תגיעו לחתונה שלנו? 💒
      </FormLabel>
      <RadioGroup
        value={formData.attending || ""}
        onChange={handleAttendingChange}
        sx={{ justifyContent: "center", gap: 2 }}
      >
        <FormControlLabel
          value="yes"
          control={
            <Radio
              sx={{
                color: "#9BBB9B",
                transform: "scale(1.3)",
                "&.Mui-checked": {
                  color: "#7D9D6E",
                },
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: "1.1rem", fontWeight: "500" }}>
              🎊 כן, בהחלט נגיע! 🎊
            </Typography>
          }
          sx={{
            marginLeft: 3,
            p: 2,
            borderRadius: 2,
            "&:hover": {
              backgroundColor: "rgba(155, 187, 155, 0.1)",
            },
          }}
        />
        <FormControlLabel
          value="no"
          control={
            <Radio
              sx={{
                color: "#9BBB9B",
                transform: "scale(1.3)",
                "&.Mui-checked": {
                  color: "#7D9D6E",
                },
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: "1.1rem", fontWeight: "500" }}>
              😔 לא נוכל להגיע
            </Typography>
          }
          sx={{
            marginLeft: 3,
            p: 2,
            borderRadius: 2,
            "&:hover": {
              backgroundColor: "rgba(155, 187, 155, 0.1)",
            },
          }}
        />
      </RadioGroup>
    </FormControl>
  );
};

export default AttendanceQuestion;
