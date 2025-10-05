import React from "react";
import {
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import { RSVPQuestion } from "../../api/rsvp/rsvpQuestionsTypes";

interface SelectQuestionProps {
  question: RSVPQuestion;
  value: string | undefined;
  onValueChange: (value: string) => void;
}

const SelectQuestion: React.FC<SelectQuestionProps> = ({
  question,
  value,
  onValueChange,
}) => {
  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
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
        {question.questionText}
      </FormLabel>
      <Select
        value={value || ""}
        onChange={(e) => onValueChange(e.target.value)}
        sx={{
          textAlign: "center",
          direction: "rtl",
          ".MuiSelect-select": {
            fontSize: "1.1rem",
            fontWeight: "500",
          },
        }}
        MenuProps={{
          sx: {
            "& .MuiPaper-root": {
              direction: "rtl",
            },
          },
        }}
      >
        <MenuItem value="" disabled>
          <Typography sx={{ color: "#999", fontStyle: "italic" }}>
            בחר אפשרות
          </Typography>
        </MenuItem>
        {question.options?.map((option, index) => (
          <MenuItem key={index} value={option}>
            <Typography
              sx={{
                fontSize: "1.1rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {/* Add emojis for guest count question */}
              {question.id === "guest_count" &&
                (parseInt(option) === 1 ? "👤" : "👥")}{" "}
              {option}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SelectQuestion;
