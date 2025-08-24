import React, { useRef, useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { RSVPFormData } from "./guestRSVPTypes";
import { Invitee } from "../invitees/InviteList";

interface RSVPQuestionsFormProps {
  guestInfo: Invitee;
  formData: RSVPFormData;
  onFormDataChange: (newFormData: Partial<RSVPFormData>) => void;
  onSubmit: (event: React.FormEvent) => void;
  submitting: boolean;
  error: string | null;
}

const RSVPQuestionsForm: React.FC<RSVPQuestionsFormProps> = ({
  guestInfo,
  formData,
  onFormDataChange,
  onSubmit,
  submitting,
  error,
}) => {
  const questionsRef = useRef<HTMLDivElement>(null);

  // Determine which step should be currently active (open)
  const getCurrentStep = () => {
    if (formData.attending === "") return 1; // First question
    if (formData.attending === "no") return 0; // All done if not attending

    // For attending users, show next unanswered question
    if (formData.attending === "yes") {
      if (formData.guestCount === 0) return 2; // Second question
      if (formData.sleepover === "") return 3; // Third question
      if (formData.needsRideFromTelAviv === "") return 4; // Fourth question
    }

    return 0; // All done
  };

  const currentStep = getCurrentStep();

  // Scroll to questions section when moving to next step
  const scrollToQuestions = () => {
    if (questionsRef.current) {
      questionsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

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
      setTimeout(() => scrollToQuestions(), 300);
    }
  };

  const handleSleepoverChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onFormDataChange({
      sleepover: event.target.value as "yes" | "no",
    });
    // Scroll to next question
    setTimeout(() => scrollToQuestions(), 300);
  };

  const handleRideChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFormDataChange({
      needsRideFromTelAviv: event.target.value as "yes" | "no",
    });
    // Scroll to submit button after last question
    setTimeout(() => scrollToQuestions(), 300);
  };

  const handleGuestCountChange = (event: any) => {
    const guestCount = event.target.value as number;
    onFormDataChange({
      guestCount,
    });
    // Auto-scroll to next question after selection
    setTimeout(() => scrollToQuestions(), 300);
  };

  // Handle clicking on collapsed questions to reopen them
  const handleQuestionClick = (questionNumber: number) => {
    // Only allow reopening if not the current step
    if (questionNumber !== currentStep && completedSteps >= questionNumber) {
      // Only reset the specific answer being edited - preserve other answers
      switch (questionNumber) {
        case 1:
          // For attendance question, only reset attendance itself
          // Other answers will be handled by the handleAttendingChange logic if needed
          onFormDataChange({
            attending: "",
          });
          break;
        case 2:
          // Reset only guest count, preserve sleepover and ride answers
          onFormDataChange({
            guestCount: 0,
          });
          break;
        case 3:
          // Reset only sleepover, preserve ride answer
          onFormDataChange({
            sleepover: "",
          });
          break;
        case 4:
          // Reset only ride question
          onFormDataChange({
            needsRideFromTelAviv: "",
          });
          break;
      }
      // Scroll to the question after a brief delay
      setTimeout(() => scrollToQuestions(), 100);
    }
  };

  // Helper function to determine if a question should be clickable
  const isQuestionClickable = (questionNumber: number) => {
    // Allow clicking on completed questions to reopen them
    return completedSteps >= questionNumber && questionNumber !== currentStep;
  };

  const getAnswerSummary = (step: number) => {
    switch (step) {
      case 1:
        return formData.attending === "yes"
          ? "🎊 כן, נגיע!"
          : "😔 לא נוכל להגיע";
      case 2:
        return `👥 ${formData.guestCount} אנשים`;
      case 3:
        return formData.sleepover === "yes" ? "🌙 כן, נלון" : "🏠 לא נלון";
      case 4:
        return formData.needsRideFromTelAviv === "yes"
          ? "✅ כן, נצטרך הסעה"
          : "🚗 לא, נגיע בעצמנו";
      default:
        return "";
    }
  };

  const isAttending = formData.attending === "yes";

  const completedSteps = [
    formData.attending !== "",
    isAttending ? formData.guestCount > 0 : formData.attending === "no",
    isAttending ? formData.sleepover !== "" : formData.attending === "no",
    isAttending
      ? formData.needsRideFromTelAviv !== ""
      : formData.attending === "no",
  ].filter(Boolean).length;

  return (
    <Paper
      elevation={8}
      sx={{
        p: 4,
        borderRadius: 4,
        background: "linear-gradient(135deg, #FFFFFF, #FFF8E7)",
        direction: "rtl",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          width: "100%",
          height: "4px",
          background: `linear-gradient(90deg, #9BBB9B ${
            (completedSteps / 4) * 100
          }%, #E8E0CC ${(completedSteps / 4) * 100}%)`,
          transition: "all 0.3s ease",
        },
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: "#333333",
          mb: 1,
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        🎉 אישור הגעה 🎉
      </Typography>
      <Typography
        variant="h6"
        sx={{ color: "#666666", mb: 4, textAlign: "center" }}
      >
        {guestInfo.name} יקר/ה
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="body2"
          sx={{ color: "#888888", textAlign: "center", mb: 2 }}
        >
          {completedSteps}/4 שלבים הושלמו
        </Typography>
        <Box
          sx={{
            width: "100%",
            height: 8,
            backgroundColor: "#E8E0CC",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: `${(completedSteps / 4) * 100}%`,
              height: "100%",
              backgroundColor: "#9BBB9B",
              transition: "width 0.5s ease",
              borderRadius: 4,
            }}
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, direction: "rtl" }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={onSubmit} ref={questionsRef}>
        {/* Question 1: Attending */}
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
            cursor: isQuestionClickable(1) ? "pointer" : "default",
          }}
          onClick={() => isQuestionClickable(1) && handleQuestionClick(1)}
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
                <Typography
                  sx={{ fontSize: "1.1rem", fontWeight: "500", mr: 2 }}
                >
                  💒 האם תגיעו לחתונה?
                </Typography>
                <Chip
                  label={getAnswerSummary(1)}
                  sx={{
                    bgcolor: "#9BBB9B",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
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
                      <Typography
                        sx={{ fontSize: "1.1rem", fontWeight: "500" }}
                      >
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
                      <Typography
                        sx={{ fontSize: "1.1rem", fontWeight: "500" }}
                      >
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

        {/* Question 2: Guest Count */}
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
            cursor: isQuestionClickable(2) ? "pointer" : "default",
          }}
          onClick={() => isQuestionClickable(2) && handleQuestionClick(2)}
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
                <Typography
                  sx={{ fontSize: "1.1rem", fontWeight: "500", mr: 2 }}
                >
                  👥 כמה אנשים יגיעו?
                </Typography>
                <Chip
                  label={getAnswerSummary(2)}
                  sx={{
                    bgcolor: "#9BBB9B",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
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
                    <InputLabel id="guest-count-label">
                      בחר מספר אנשים
                    </InputLabel>
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

        {/* Question 3: Sleepover */}
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
            opacity:
              formData.attending === "yes" && formData.guestCount > 0 ? 1 : 0.3,
            cursor: isQuestionClickable(3) ? "pointer" : "default",
          }}
          onClick={() => isQuestionClickable(3) && handleQuestionClick(3)}
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
                <Typography
                  sx={{ fontSize: "1.1rem", fontWeight: "500", mr: 2 }}
                >
                  🛏️ האם תרצו ללון במקום?
                </Typography>
                <Chip
                  label={getAnswerSummary(3)}
                  sx={{
                    bgcolor: "#9BBB9B",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                  }}
                />
              </Box>
            ) : formData.attending === "yes" && formData.guestCount > 0 ? (
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
                      <Typography
                        sx={{ fontSize: "1.1rem", fontWeight: "500" }}
                      >
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
                      <Typography
                        sx={{ fontSize: "1.1rem", fontWeight: "500" }}
                      >
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

        {/* Question 4: Ride from Tel Aviv */}
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
            opacity:
              formData.attending === "yes" &&
              formData.guestCount > 0 &&
              formData.sleepover !== ""
                ? 1
                : 0.3,
            cursor: isQuestionClickable(4) ? "pointer" : "default",
          }}
          onClick={() => isQuestionClickable(4) && handleQuestionClick(4)}
        >
          <CardContent
            sx={{
              p:
                formData.needsRideFromTelAviv !== "" && currentStep !== 4
                  ? 2
                  : 3,
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
                <Typography
                  sx={{ fontSize: "1.1rem", fontWeight: "500", mr: 2 }}
                >
                  🚌 האם תרצו הסעה מתל אביב?
                </Typography>
                <Chip
                  label={getAnswerSummary(4)}
                  sx={{
                    bgcolor: "#9BBB9B",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                  }}
                />
              </Box>
            ) : formData.attending === "yes" &&
              formData.guestCount > 0 &&
              formData.sleepover !== "" ? (
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
                      <Typography
                        sx={{ fontSize: "1.1rem", fontWeight: "500" }}
                      >
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
                      <Typography
                        sx={{ fontSize: "1.1rem", fontWeight: "500" }}
                      >
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

        {/* Submit Button */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting || completedSteps < 4}
            sx={{
              bgcolor: completedSteps === 4 ? "#4A6741" : "#CCCCCC",
              color: "white",
              px: 8,
              py: 2,
              borderRadius: 4,
              fontSize: "1.3rem",
              fontWeight: "bold",
              boxShadow:
                completedSteps === 4
                  ? "0 8px 20px rgba(74, 103, 65, 0.4)"
                  : "none",
              transform: completedSteps === 4 ? "scale(1.05)" : "scale(1)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: completedSteps === 4 ? "#3A5232" : "#CCCCCC",
                transform: completedSteps === 4 ? "scale(1.08)" : "scale(1)",
              },
              "&:disabled": {
                color: "#999999",
              },
            }}
          >
            {submitting ? (
              <>
                <CircularProgress size={24} sx={{ mr: 2, color: "white" }} />
                שולח...
              </>
            ) : completedSteps === 4 ? (
              "🎉 שלח אישור הגעה! 🎉"
            ) : (
              `מלא את כל השאלות (${completedSteps}/4)`
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default RSVPQuestionsForm;
