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

interface RideQuestionProps {
  formData: RSVPFormData;
  onFormDataChange: (newFormData: Partial<RSVPFormData>) => void;
  currentStep: number;
  isClickable: boolean;
  onQuestionClick: () => void;
  onScroll: () => void;
}

const RideQuestion: React.FC<RideQuestionProps> = ({
  formData,
  onFormDataChange,
  currentStep,
  isClickable,
  onQuestionClick,
  onScroll,
}) => {
  const handleRideChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange({
      needsRideFromTelAviv: event.target.value as "yes" | "no",
    });
    // Scroll to submit button after last question
    setTimeout(() => onScroll(), 300);
  };

  const getAnswerSummary = () => {
    return formData.needsRideFromTelAviv === "yes"
      ? "✅ כן, נצטרך הסעה"
      : "🚗 לא, נגיע בעצמנו";
  };

  const isEnabled =
    formData.attending === "yes" &&
    formData.guestCount > 0 &&
    formData.sleepover !== "";

  return (
    <Card
      elevation={
        formData.needsRideFromTelAviv !== "" ? 6 : currentStep === 4 ? 4 : 1
      }
      sx={{
        mb: 4,
        borderRadius: 3,
        background:
          formData.needsRideFromTelAviv !== ""
            ? "linear-gradient(135deg, #D1E4C4, #B7D9BD)"
            : currentStep === 4
            ? "#FAFAFA"
            : "#F5F5F5",
        border:
          formData.needsRideFromTelAviv !== ""
            ? "2px solid #9BBB9B"
            : currentStep === 4
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
          p: formData.needsRideFromTelAviv !== "" && currentStep !== 4 ? 2 : 3,
        }}
      >
        {formData.needsRideFromTelAviv !== "" && currentStep !== 4 ? (
          // Collapsed summary view
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: "1.1rem", fontWeight: "500", mr: 2 }}>
              🚌 האם תרצו הסעה מתל אביב?
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
              🚌 האם תרצו הסעה מתל אביב? 🚌
            </FormLabel>
            <RadioGroup
              value={formData.needsRideFromTelAviv}
              onChange={handleRideChange}
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
                    ✅ כן, נצטרך הסעה
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
                    🚗 לא, נגיע בעצמנו
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
              🚌 האם תרצו הסעה מתל אביב?
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RideQuestion;
