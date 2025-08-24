import React from "react";
import {
  Card,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { RSVPFormData } from "../guestRSVPTypes";

interface AttendanceQuestionProps {
  formData: RSVPFormData;
  onFormDataChange: (newFormData: Partial<RSVPFormData>) => void;
  currentStep: number;
  isClickable: boolean;
  onQuestionClick: () => void;
  onScroll: () => void;
}

const AttendanceQuestion: React.FC<AttendanceQuestionProps> = ({
  formData,
  onFormDataChange,
  currentStep,
  isClickable,
  onQuestionClick,
  onScroll,
}) => {
  const handleAttendingChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const attending = event.target.value as "yes" | "no";

    if (attending === "no") {
      // When selecting "no", reset other fields to "no" or 0
      onFormDataChange({
        attending,
        guestCount: 0,
        sleepover: "no",
        needsRideFromTelAviv: "no",
      });
    } else {
      // When selecting "yes", reset other fields to empty/unanswered state
      onFormDataChange({
        attending,
        guestCount: 0, // Reset to 0 (unselected)
        sleepover: "", // Reset to empty so user must answer again
        needsRideFromTelAviv: "", // Reset to empty so user must answer again
      });
      // Scroll to questions when user selects "yes"
      setTimeout(() => onScroll(), 300);
    }
  };

  const getAnswerSummary = () => {
    return formData.attending === "yes" ? "🎊 כן, נגיע!" : "😔 לא נוכל להגיע";
  };

  return (
    <Card
      elevation={formData.attending !== "" ? 6 : currentStep === 1 ? 4 : 1}
      sx={{
        mb: 3,
        borderRadius: 3,
        background:
          formData.attending !== ""
            ? "linear-gradient(135deg, #D1E4C4, #B7D9BD)"
            : currentStep === 1
            ? "#FAFAFA"
            : "#F5F5F5",
        border:
          formData.attending !== ""
            ? "2px solid #9BBB9B"
            : currentStep === 1
            ? "2px solid #E0E0E0"
            : "1px solid #E0E0E0",
        transition: "all 0.3s ease",
        transform: "scale(1)",
        opacity: 1,
        cursor: isClickable ? "pointer" : "default",
      }}
      onClick={() => isClickable && onQuestionClick()}
    >
      <CardContent
        sx={{ p: formData.attending !== "" && currentStep !== 1 ? 2 : 3 }}
      >
        {formData.attending !== "" && currentStep !== 1 ? (
          // Collapsed summary view
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: "1.1rem", fontWeight: "500", mr: 2 }}>
              💒 האם תגיעו לחתונה?
            </Typography>
            <Chip
              label={getAnswerSummary()}
              sx={{
                bgcolor: "#9BBB9B",
                color: "white",
                fontWeight: "bold",
                fontSize: "0.9rem",
                mr: 1,
              }}
            />
          </Box>
        ) : (
          // Full question view
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
              value={formData.attending}
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
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceQuestion;
