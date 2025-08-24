import React from "react";
import {
  Card,
  CardContent,
  FormControl,
  FormLabel,
  Typography,
  Box,
  Chip,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { RSVPFormData } from "../guestRSVPTypes";

interface GuestCountQuestionProps {
  formData: RSVPFormData;
  onFormDataChange: (newFormData: Partial<RSVPFormData>) => void;
  currentStep: number;
  isClickable: boolean;
  onQuestionClick: () => void;
  onScroll: () => void;
}

const GuestCountQuestion: React.FC<GuestCountQuestionProps> = ({
  formData,
  onFormDataChange,
  currentStep,
  isClickable,
  onQuestionClick,
  onScroll,
}) => {
  const handleGuestCountChange = (event: any) => {
    const guestCount = event.target.value as number;
    onFormDataChange({
      guestCount,
    });
    // Auto-scroll to next question after selection
    setTimeout(() => onScroll(), 300);
  };

  const getAnswerSummary = () => {
    return `👥 ${formData.guestCount}`;
  };

  return (
    <Card
      elevation={formData.guestCount > 0 ? 6 : currentStep === 2 ? 4 : 1}
      sx={{
        mb: 3,
        borderRadius: 3,
        background:
          formData.guestCount > 0
            ? "linear-gradient(135deg, #D1E4C4, #B7D9BD)"
            : currentStep === 2
            ? "#FAFAFA"
            : "#F5F5F5",
        border:
          formData.guestCount > 0
            ? "2px solid #9BBB9B"
            : currentStep === 2
            ? "2px solid #E0E0E0"
            : "1px solid #E0E0E0",
        transition: "all 0.3s ease",
        transform: "scale(1)",
        opacity: formData.attending === "yes" ? 1 : 0.3,
        cursor: isClickable ? "pointer" : "default",
      }}
      onClick={() => isClickable && onQuestionClick()}
    >
      <CardContent
        sx={{ p: formData.guestCount > 0 && currentStep !== 2 ? 2 : 3 }}
      >
        {formData.guestCount > 0 && currentStep !== 2 ? (
          // Collapsed summary view
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: "1.1rem", fontWeight: "500", mr: 2 }}>
              👥 כמה אנשים יגיעו?
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
        ) : formData.attending === "yes" ? (
          // Full question view for attending guests
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
              👥 כמה אנשים יגיעו? 👥
            </FormLabel>
            <Box sx={{ textAlign: "center" }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="guest-count-label">בחר מספר אנשים</InputLabel>
                <Select
                  labelId="guest-count-label"
                  value={formData.guestCount}
                  onChange={handleGuestCountChange}
                  label="בחר מספר אנשים"
                  sx={{
                    "& .MuiSelect-select": {
                      textAlign: "center",
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                    },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      "&.Mui-focused fieldset": {
                        borderColor: "#9BBB9B",
                      },
                    },
                  }}
                >
                  {[...Array(10)].map((_, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                      {index + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </FormControl>
        ) : (
          // Disabled view for non-attending guests
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
              👥 כמה אנשים יגיעו?
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default GuestCountQuestion;
