import React, { useState } from "react";
import { Box, Button, Paper } from "@mui/material";
import { useTranslation } from "../../../localization/LocalizationContext";
import {
  LoadingState,
  LocalizedArrowIcon,
  DStepper,
  DStepConfig,
} from "../../common";
import {
  useRSVPConfig,
  useUpdateRSVPSetupComplete,
} from "../../../hooks/rsvp";
import {
  getRSVPSetupSteps,
  getNextStep,
  getPreviousStep,
  StepConfig,
} from "./stepConfig";

export const RSVPSetupSteps: React.FC = () => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);

  const { data: rsvpConfig, isLoading: isLoadingRsvpConfig } = useRSVPConfig();
  const { mutate: updateRsvpConfigCompleted } = useUpdateRSVPSetupComplete();
  const steps = getRSVPSetupSteps(t);

  if (isLoadingRsvpConfig) {
    return <LoadingState message={t("rsvpSetup.loading")} />;
  }

  // Custom completion check that includes automation approval
  const isStepComplete = (step: StepConfig) => {
    return step.isComplete(rsvpConfig);
  };

  const currentStep = steps[activeStep];
  const isCurrentStepComplete = isStepComplete(currentStep);
  const handleNext = () => {
    const isFinalStep = activeStep === steps.length - 1;
    if (isFinalStep) {
      // Optionally handle finish action here
      updateRsvpConfigCompleted(true);
    }
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

  const canGoNext = isCurrentStepComplete && activeStep <= steps.length - 1;
  const canGoPrevious = activeStep > 0;

  // Convert steps to DStepper format with custom completion check
  const dSteps: DStepConfig[] = steps.map((step) => ({
    id: step.id,
    title: step.title,
    description: step.description,
    icon: step.icon,
    isComplete: isStepComplete(step),
  }));

  return (
    <Paper sx={{ height: "95vh", display: "flex", flexDirection: "column" }}>
      {/* Compact Header with DStepper */}

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
          p: 1.5,
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
          sx={{
            height: 40,
            alignSelf: "center",
          }}
        >
          {t("common.previous")}
        </Button>
        <DStepper
          steps={dSteps}
          activeStep={activeStep}
          onStepClick={setActiveStep}
          compact
        />
        <Button
          onClick={handleNext}
          disabled={!canGoNext}
          endIcon={<LocalizedArrowIcon direction="next" />}
          variant="contained"
          sx={{ height: 40, alignSelf: "center" }}
        >
          {activeStep === steps.length - 1
            ? t("common.finish")
            : t("common.next")}
        </Button>
      </Box>
    </Paper>
  );
};
