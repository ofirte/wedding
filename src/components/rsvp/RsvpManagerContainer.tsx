import React from "react";
import { useRSVPConfig } from "src/hooks/rsvp";
import RSVPManager from "./RSVPManager";
import { LoadingState } from "../common";
import { RSVPSetupSteps } from "./rsvpSetup/RsvpSetupSteps";
import RSVPWelcomePage from "./RSVPWelcomePage";
import RSVPPricingPage from "./RSVPPricingPage";
import { useCurrentUserWeddingPlan } from "../../hooks/wedding/useCurrentUserWeddingPlan";
import { WeddingPlans } from "@wedding-plan/types";

export const RsvpManagerContainer: React.FC = () => {
  const { data: rsvpConfig, isLoading: isLoadingRsvpConfig } = useRSVPConfig();
  const currentUserPlan = useCurrentUserWeddingPlan();

  if (isLoadingRsvpConfig) {
    return <LoadingState />;
  }

  // Show pricing page for free users
  if (currentUserPlan === WeddingPlans.FREE) {
    return <RSVPPricingPage />;
  }

  // Show welcome page if no RSVP config exists
  if (!rsvpConfig) {
    return <RSVPWelcomePage />;
  }

  if (rsvpConfig.isSetupComplete) {
    return <RSVPManager />;
  }

  return <RSVPSetupSteps />;
};
