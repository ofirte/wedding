import React from "react";
import { WeddingRSVPConfig } from "@wedding-plan/types";
import RsvpFormManagementContainer from "../RsvpFormManagementV2/rsvpFormManagementContainer";
import AutomationMessagesSchedulerContainer from "../AutomationMessagesScheduler/AutomationMessagesSchedulerContainer";
import { useAllAutomationsApproved } from "../../../hooks/rsvp";

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
      // This will be dynamically checked by the stepper component
      // using useAllAutomationsApproved hook
      return !!rsvpConfig?.isAutomationSetupComplete; // Default to false, will be overridden by stepper
    },
    component: AutomationMessagesSchedulerContainer,
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
