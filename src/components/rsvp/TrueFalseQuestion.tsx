import React from "react";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
} from "@mui/material";
import { RSVPQuestion } from "../../api/rsvp/rsvpQuestionsTypes";
import { useTranslation } from "../../localization/LocalizationContext";

interface TrueFalseQuestionProps {
  question: RSVPQuestion;
  value: boolean | undefined;
  onValueChange: (value: boolean) => void;
}

const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({
  question,
  value,
  onValueChange,
}) => {
  const { t } = useTranslation();

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
        {question.questionText}
      </FormLabel>
      <RadioGroup
        value={value === undefined ? "" : value?.toString()}
        onChange={(e) => onValueChange(e.target.value === "true")}
        sx={{ justifyContent: "center", gap: 2 }}
      >
        <FormControlLabel
          value="true"
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
              {question.booleanOptions?.trueOption || t("common.yes")}
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
          value="false"
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
              {question.booleanOptions?.falseOption || t("common.no")}
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

export default TrueFalseQuestion;
