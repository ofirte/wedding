import React from "react";
import { WeddingRSVPConfig } from "@wedding-plan/types";
import RsvpFormManagementContainer from "../RsvpFormManagementV2/rsvpFormManagementContainer";

export interface StepConfig {
  id: string;
  title: string;
  description: string;
  icon?: string;
  isComplete: (rsvpConfig: WeddingRSVPConfig | null | undefined) => boolean;
  component: React.ComponentType<{
    rsvpConfig: WeddingRSVPConfig | null | undefined;
  }>;
}

// Placeholder components for each step
const WelcomeStep: React.FC<{
  rsvpConfig: WeddingRSVPConfig | null | undefined;
}> = () => <div>Welcome step component - to be implemented</div>;

const FormQuestionsStep: React.FC<{
  rsvpConfig: WeddingRSVPConfig | null | undefined;
}> = () => <div>Form questions step component - to be implemented</div>;

const AutomationsStep: React.FC<{
  rsvpConfig: WeddingRSVPConfig | null | undefined;
}> = () => <div>Automations step component - to be implemented</div>;

export const getRSVPSetupSteps = (t: (key: string) => string): StepConfig[] => [

  {
    id: "form",
    title: t("rsvpSetup.steps.form.title"),
    description: t("rsvpSetup.steps.form.description"),
    icon: "📝",
    isComplete: (rsvpConfig) => {
      if (!rsvpConfig) return false;
      return (
        rsvpConfig.enabledQuestionIds &&
        rsvpConfig.enabledQuestionIds.length > 0
      );
    },
    component: RsvpFormManagementContainer,
  },
  {
    id: "automations",
    title: t("rsvpSetup.steps.automations.title"),
    description: t("rsvpSetup.steps.automations.description"),
    icon: "🤖",
    isComplete: (rsvpConfig) => {
      if (!rsvpConfig) return false;
      // Check if isAutomationsCreated exists and is true
      return (rsvpConfig as any).isAutomationsCreated === true;
    },
    component: AutomationsStep,
  },
];

export const getStepById = (
  stepId: string,
  steps: StepConfig[]
): StepConfig | undefined => {
  return steps.find((step) => step.id === stepId);
};

export const getNextStep = (
  currentStepId: string,
  steps: StepConfig[]
): StepConfig | null => {
  const currentIndex = steps.findIndex((step) => step.id === currentStepId);
  if (currentIndex === -1 || currentIndex === steps.length - 1) {
    return null;
  }
  return steps[currentIndex + 1];
};

export const getPreviousStep = (
  currentStepId: string,
  steps: StepConfig[]
): StepConfig | null => {
  const currentIndex = steps.findIndex((step) => step.id === currentStepId);
  if (currentIndex <= 0) {
    return null;
  }
  return steps[currentIndex - 1];
};

export const getCompletedStepsCount = (
  rsvpConfig: WeddingRSVPConfig | null | undefined,
  steps: StepConfig[]
): number => {
  return steps.filter((step) => step.isComplete(rsvpConfig)).length;
};

export const isSetupComplete = (
  rsvpConfig: WeddingRSVPConfig | null | undefined,
  steps: StepConfig[]
): boolean => {
  return steps.every((step) => step.isComplete(rsvpConfig));
};
