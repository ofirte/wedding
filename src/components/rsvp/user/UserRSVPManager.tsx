import React, { useState } from "react";
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
} from "@mui/material";
import { Launch as LaunchIcon } from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import RSVPFormBuilder from "./RSVPFormBuilder";
// import MessageTemplateSelector from "./MessageTemplateSelector";
import AutomationScheduler from "./AutomationScheduler";
import RSVPSummaryReview from "./RSVPSummaryReview";
import SimpleRSVPDashboard from "./SimpleRSVPDashboard";
import LocalizedNavigationButtons from "../../common/LocalizedNavigationButtons";

/**
 * UserRSVPManager - Main user workflow for RSVP automation setup
 *
 * Provides a guided, step-by-step experience for setting up automated RSVP messaging.
 * Steps: 1. Create Form, 2. Choose Messages, 3. Schedule Timeline, 4. Review & Launch
 */
const UserRSVPManager: React.FC = () => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [isLaunched, setIsLaunched] = useState(false);

  // Step completion state
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);

  // Data state for each step
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [scheduledAutomations, setScheduledAutomations] = useState<any[]>([]);

  const steps = [
    {
      label: t("userRsvp.steps.createForm"),
      description: t("userRsvp.steps.createFormDesc"),
    },
    {
      label: t("userRsvp.steps.chooseMessages"),
      description: t("userRsvp.steps.chooseMessagesDesc"),
    },
    {
      label: t("userRsvp.steps.scheduleTimeline"),
      description: t("userRsvp.steps.scheduleTimelineDesc"),
    },
    {
      label: t("userRsvp.steps.reviewLaunch"),
      description: t("userRsvp.steps.reviewLaunchDesc"),
    },
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleStepComplete = (stepIndex: number, data?: any) => {
    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[stepIndex] = true;
    setCompletedSteps(newCompletedSteps);

    // Store step-specific data
    if (stepIndex === 1 && data) {
      setSelectedTemplates(data);
    } else if (stepIndex === 2 && data) {
      setScheduledAutomations(data);
    }

    // Auto-advance to next step
    if (stepIndex < steps.length - 1) {
      setActiveStep(stepIndex + 1);
    }
  };

  const handleLaunch = () => {
    setIsLaunched(true);
  };

  const handleBackToSetup = () => {
    setIsLaunched(false);
    setActiveStep(0);
  };

  const isStepComplete = (stepIndex: number) => completedSteps[stepIndex];
  const canProceedToNext = isStepComplete(activeStep);

  // If launched, show dashboard
  if (isLaunched) {
    return <SimpleRSVPDashboard onBackToSetup={handleBackToSetup} />;
  }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <RSVPFormBuilder
            onComplete={() => handleStepComplete(0)}
            isCompleted={isStepComplete(0)}
          />
        );
      case 1:
        return (
          // <MessageTemplateSelector
          //   onSelectionComplete={(templates) =>
          //     handleStepComplete(1, templates)
          //   }
          //   selectedTemplates={selectedTemplates}
          // />
          <></>
        );
      case 2:
        return (
          <AutomationScheduler
            selectedTemplates={selectedTemplates}
            onSchedulingComplete={(automations) =>
              handleStepComplete(2, automations)
            }
            scheduledAutomations={scheduledAutomations}
          />
        );
      case 3:
        return (
          <RSVPSummaryReview
            setupState={{
              formCompleted: isStepComplete(0),
              templatesSelected: selectedTemplates,
              automationsScheduled: scheduledAutomations,
              setupCompleted: completedSteps.slice(0, 3).every(Boolean),
            }}
            onLaunch={handleLaunch}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <Box sx={{ p: 3, pb: 12 }}>
      {/* Progress Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="horizontal">
            {steps.map((step, index) => (
              <Step key={step.label} completed={isStepComplete(index)}>
                <StepLabel>
                  <Box>
                    <Typography variant="subtitle2">{step.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Box>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Box sx={{ mb: 3 }}>{renderStepContent(activeStep)}</Box>
      <LocalizedNavigationButtons
        onBack={handleBack}
        onNext={activeStep === steps.length - 1 ? handleLaunch : handleNext}
        backDisabled={activeStep === 0}
        nextDisabled={!canProceedToNext}
        nextLabel={
          activeStep === steps.length - 1 ? t("userRsvp.launchRsvp") : undefined
        }
        nextIcon={activeStep === steps.length - 1 ? <LaunchIcon /> : undefined}
        nextColor="primary"
      />
    </Box>
  );
};

export default UserRSVPManager;
