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

interface SleepoverQuestionProps {
  formData: RSVPFormData;
  onFormDataChange: (newFormData: Partial<RSVPFormData>) => void;
  onScroll: () => void;
}

const SleepoverQuestion: React.FC<SleepoverQuestionProps> = ({
  formData,
  onFormDataChange,
  onScroll,
}) => {
  const handleSleepoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sleepover = event.target.value as "yes" | "no";
    onFormDataChange({ sleepover });
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
        🛏️ האם תרצו ללון במקום? 🛏️
      </FormLabel>
      <RadioGroup
        value={formData.sleepover || ""}
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
              🛌 כן, נישאר ללון במקום
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
  );
};

export default SleepoverQuestion;