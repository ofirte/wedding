import React from "react";
import {
  FormControl,
  FormLabel,
  Typography,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { RSVPFormData } from "../guestRSVPTypes";

interface GuestCountQuestionProps {
  formData: RSVPFormData;
  onFormDataChange: (newFormData: Partial<RSVPFormData>) => void;
  onScroll: () => void;
}

const GuestCountQuestion: React.FC<GuestCountQuestionProps> = ({
  formData,
  onFormDataChange,
  onScroll,
}) => {
  const handleGuestCountChange = (event: any) => {
    const guestCount = parseInt(event.target.value);
    onFormDataChange({ guestCount });
  };

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
        כמה תגיעו? 👥
      </FormLabel>
      <InputLabel
        sx={{
          fontSize: "1.1rem",
          color: "#333333",
          textAlign: "center",
          fontWeight: "bold",
          right: 0,
          transformOrigin: "top right",
        }}
      ></InputLabel>
      <Select
        value={formData.guestCount || ""}
        onChange={handleGuestCountChange}
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
            בחרו מספר אנשים
          </Typography>
        </MenuItem>
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <MenuItem key={num} value={num}>
            <Typography
              sx={{
                fontSize: "1.1rem",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {num === 1 ? "👤" : "👥"} {num}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default GuestCountQuestion;
