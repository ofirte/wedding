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

interface RideQuestionProps {
  formData: RSVPFormData;
  onFormDataChange: (newFormData: Partial<RSVPFormData>) => void;
  onScroll: () => void;
}

const RideQuestion: React.FC<RideQuestionProps> = ({
  formData,
  onFormDataChange,
  onScroll,
}) => {
  const handleRideChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const needsRideFromTelAviv = event.target.value as "yes" | "no";
    onFormDataChange({ needsRideFromTelAviv });
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
        🚗 צריכים הסעה מתל אביב? 🚗
      </FormLabel>
      <RadioGroup
        value={formData.needsRideFromTelAviv || ""}
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
              🚌 כן, נזדקק להסעה
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
              🚗 לא, נגיע בכוחות עצמנו
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

export default RideQuestion;