import React, { useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { useAddCustomQuestion } from "../../../hooks/rsvp/useAddCustomQuestion";
import { useUpdateEnabledQuestions } from "../../../hooks/rsvp/useUpdateEnabledQuestions";
import { useRSVPConfig } from "../../../hooks/rsvp/useRSVPConfig";
import QuestionsList from "./QuestionsList";
import CustomQuestionFormFields, {
  CustomQuestionData,
} from "./CustomQuestionFormFields";

interface QuestionSelectorProps {}

const QuestionSelector: React.FC<QuestionSelectorProps> = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("preset");
  
  // Hooks for API operations
  const { mutate: addCustomQuestion } = useAddCustomQuestion();
  const { mutate: updateEnabledQuestions } = useUpdateEnabledQuestions();
  const { data: rsvpConfig } = useRSVPConfig();

  // Custom question form state
  const [customQuestion, setCustomQuestion] = useState<CustomQuestionData>({
    text: "",
    displayName: "",
    type: "boolean",
    options: ["", ""],
    booleanOptions: {
      trueOption: "",
      falseOption: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTabChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string
  ) => {
    if (newValue !== null) {
      setSelectedTab(newValue);
    }
  };

  // Custom question form handlers
  const addOption = () => {
    setCustomQuestion((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const updateOption = (index: number, value: string) => {
    setCustomQuestion((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => (i === index ? value : option)),
    }));
  };

  const removeOption = (index: number) => {
    setCustomQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitCustomQuestion = () => {
    setIsSubmitting(true);

    // Convert CustomQuestionData to the API format
    const questionToCreate = {
      questionText: customQuestion.text.trim(),
      displayName: customQuestion.displayName.trim(),
      type: customQuestion.type,
      required: false, // Custom questions are not required by default
      ...(customQuestion.type === "boolean" 
        ? {
            booleanOptions: {
              trueOption: customQuestion.booleanOptions.trueOption.trim(),
              falseOption: customQuestion.booleanOptions.falseOption.trim(),
            }
          }
        : {
            options: customQuestion.options.filter(option => option.trim() !== "")
          }
      )
    };

    // Create the custom question
    addCustomQuestion(
      { question: questionToCreate },
      {
        onSuccess: (createdQuestion) => {
          // On successful creation, add the question to enabled questions
          const currentEnabledQuestionIds = rsvpConfig?.enabledQuestionIds || [];
          const updatedQuestionIds = [...currentEnabledQuestionIds, createdQuestion.id];
          
          updateEnabledQuestions(updatedQuestionIds, {
            onSuccess: () => {
                setSelectedTab("preset");
                setIsSubmitting(false);
                // Reset custom question form
                setCustomQuestion({
                  text: "",
                  displayName: "",
                  type: "boolean",
                  options: ["", ""],
                  booleanOptions: {
                    trueOption: "",
                    falseOption: "",
                  },
                });
            },
            onError: (error) => {
              setIsSubmitting(false);
              console.error("Failed to add question to form:", error);
            }
          });
        },
        onError: (error) => {
          setIsSubmitting(false);
          console.error("Failed to create custom question:", error);
        }
      }
    );
  };

  const handleCancelCustomQuestion = () => {
    setCustomQuestion({
      text: "",
      displayName: "",
      type: "boolean",
      options: ["", ""],
      booleanOptions: {
        trueOption: "",
        falseOption: "",
      },
    });
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      {/* Toggle Button Tabs */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <ToggleButtonGroup
          value={selectedTab}
          exclusive
          onChange={handleTabChange}
          fullWidth
          sx={{
            gap: 1,
            "& .MuiToggleButtonGroup-grouped": {
              "&:not(:first-of-type)": {
                borderLeft: "1px solid",
                borderColor: "grey.300",
                marginLeft: 0,
              },
            },
            "& .MuiToggleButton-root": {
              border: "1px solid",
              borderColor: "grey.300",
              borderRadius: "20px !important",
              textTransform: "none",
              fontWeight: "medium",
              py: 1,
              px: 2,
              fontSize: "0.875rem",
              "&.Mui-selected": {
                backgroundColor: "grey.100",
                borderColor: "grey.400",
                "&:hover": {
                  backgroundColor: "grey.200",
                },
              },
              "&:not(.Mui-selected)": {
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "grey.50",
                },
              },
            },
          }}
        >
          <ToggleButton value="preset">
            {t("rsvp.presetQuestions")}
          </ToggleButton>
          <ToggleButton value="custom">{t("rsvp.custom")}</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Tab Content */}
      <Box sx={{ height: "calc(100% - 100px)", overflow: "auto" }}>
        {selectedTab === "preset" && <QuestionsList />}
        {selectedTab === "custom" && (
          <Box sx={{ p: 3, height: "100%" }}>
            <CustomQuestionFormFields
              question={customQuestion}
              setQuestion={setCustomQuestion}
              addOption={addOption}
              updateOption={updateOption}
              removeOption={removeOption}
              onSubmit={handleSubmitCustomQuestion}
              onCancel={handleCancelCustomQuestion}
              submitting={isSubmitting}
              showActions={true}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default QuestionSelector;
