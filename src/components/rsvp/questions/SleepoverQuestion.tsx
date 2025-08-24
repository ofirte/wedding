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

interface SleepoverQuestionProps {
  formData: RSVPFormData;
  onFormDataChange: (newFormData: Partial<RSVPFormData>) => void;
  currentStep: number;
  isClickable: boolean;
  onQuestionClick: () => void;
  onScroll: () => void;
}

const SleepoverQuestion: React.FC<SleepoverQuestionProps> = ({
  formData,
  onFormDataChange,
  currentStep,
  isClickable,
  onQuestionClick,
  onScroll,
}) => {
  const handleSleepoverChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFormDataChange({
      sleepover: event.target.value as "yes" | "no",
    });
    // Scroll to next question
    setTimeout(() => onScroll(), 300);
  };

  const getAnswerSummary = () => {
    return formData.sleepover === "yes" ? "🌙 כן, נלון" : "🏠 לא נלון";
  };

  const isEnabled = formData.attending === "yes" && formData.guestCount > 0;

  return (
    <Card
      elevation={formData.sleepover !== "" ? 6 : currentStep === 3 ? 4 : 1}
      sx={{
        mb: 3,
        borderRadius: 3,
        background:
          formData.sleepover !== ""
            ? "linear-gradient(135deg, #D1E4C4, #B7D9BD)"
            : currentStep === 3
            ? "#FAFAFA"
            : "#F5F5F5",
        border:
          formData.sleepover !== ""
            ? "2px solid #9BBB9B"
            : currentStep === 3
            ? "2px solid #E0E0E0"
            : "1px solid #E0E0E0",
        transition: "all 0.3s ease",
        transform: "scale(1)",
        opacity: isEnabled ? 1 : 0.3,
        cursor: isClickable ? "pointer" : "default",
      }}
      onClick={() => isClickable && onQuestionClick()}
    >
      <CardContent
        sx={{
          p: formData.sleepover !== "" && currentStep !== 3 ? 2 : 3,
        }}
      >
        {formData.sleepover !== "" && currentStep !== 3 ? (
          // Collapsed summary view
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: "1.1rem", fontWeight: "500", mr: 2 }}>
              🛏️ האם תרצו ללון במקום?
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
        ) : isEnabled ? (
          // Full question view for eligible guests
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
              🛏️ האם תרצו ללון במקום? 🛏️
            </FormLabel>
            <RadioGroup
              value={formData.sleepover}
              onChange={handleSleepoverChange}
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
                    🌙 כן, נשמח ללון
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
                    🏠 לא, נחזור הביתה
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
        ) : (
          // Disabled view for non-eligible guests
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.6,
            }}
          >
            <Typography
              sx={{ fontSize: "1.1rem", fontWeight: "500", color: "#999" }}
            >
              🛏️ האם תרצו ללון במקום?
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SleepoverQuestion;
