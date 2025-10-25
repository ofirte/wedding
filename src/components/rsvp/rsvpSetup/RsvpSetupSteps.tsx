import React, { useState } from "react";
import { Box, Button, Paper, useMediaQuery, useTheme } from "@mui/material";
import { useTranslation } from "../../../localization/LocalizationContext";
import {
  LoadingState,
  LocalizedArrowIcon,
  DStepper,
  DStepConfig,
} from "../../common";
import { useRSVPConfig } from "../../../hooks/rsvp";
import {
  getRSVPSetupSteps,
  getNextStep,
  getPreviousStep,
  getCompletedStepsCount,
  isSetupComplete,
} from "./stepConfig";

export const RSVPSetupSteps: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);

  const { data: rsvpConfig, isLoading: isLoadingRsvpConfig } = useRSVPConfig();
  const steps = getRSVPSetupSteps(t);

  if (isLoadingRsvpConfig) {
    return <LoadingState message={t("rsvpSetup.loading")} />;
  }

  const completedSteps = getCompletedStepsCount(rsvpConfig, steps);
  const setupComplete = isSetupComplete(rsvpConfig, steps);
  const currentStep = steps[activeStep];
  const isCurrentStepComplete = currentStep?.isComplete(rsvpConfig) || false;

  const handleNext = () => {
    const nextStep = getNextStep(currentStep.id, steps);
    if (nextStep) {
      const nextIndex = steps.findIndex((step) => step.id === nextStep.id);
      setActiveStep(nextIndex);
    }
  };

  const handlePrevious = () => {
    const prevStep = getPreviousStep(currentStep.id, steps);
    if (prevStep) {
      const prevIndex = steps.findIndex((step) => step.id === prevStep.id);
      setActiveStep(prevIndex);
    }
  };

  const canGoNext = isCurrentStepComplete && activeStep < steps.length - 1;
  const canGoPrevious = activeStep > 0;

  // Convert steps to DStepper format
  const dSteps: DStepConfig[] = steps.map((step) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    icon: step.icon,
    isComplete: step.isComplete(rsvpConfig),
  }));

  return (
    <Paper sx={{ height: "95vh", display: "flex", flexDirection: "column" }}>
      {/* Compact Header with DStepper */}
      <DStepper
        steps={dSteps}
        activeStep={activeStep}
        onStepClick={setActiveStep}
        compact
        showTitle
        title={t("rsvpSetup.title")}
      />

      {/* Step Content Container - Constrained Height */}
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <currentStep.component rsvpConfig={rsvpConfig} />
      </Box>

      {/* Navigation - Bottom */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          p: 3,
          borderTop: 1,
          borderColor: "divider",
          backgroundColor: "grey.50",
        }}
      >
        <Button
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          startIcon={<LocalizedArrowIcon direction="previous" />}
          variant="outlined"
        >
          {t("common.previous")}
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canGoNext}
          endIcon={<LocalizedArrowIcon direction="next" />}
          variant="contained"
        >
          {activeStep === steps.length - 1
            ? t("common.finish")
            : t("common.next")}
        </Button>
      </Box>
    </Paper>
  );
};
