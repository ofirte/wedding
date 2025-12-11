import React from "react";
import { useRSVPConfig } from "src/hooks/rsvp";
import RSVPManager from "./RSVPManager";
import { LoadingState } from "../common";
import { RSVPSetupSteps } from "./rsvpSetup/RsvpSetupSteps";
import RSVPWelcomePage from "./RSVPWelcomePage";
import RSVPPricingPage from "./RSVPPricingPage";
import { useCurrentUserWeddingPlan } from "../../hooks/wedding/useCurrentUserWeddingPlan";

export const RsvpManagerContainer: React.FC = () => {
  const { data: rsvpConfig, isLoading: isLoadingRsvpConfig } = useRSVPConfig();
  const { isPaid } = useCurrentUserWeddingPlan();

  if (isLoadingRsvpConfig) {
    return <LoadingState />;
  }

  // Show pricing page for free users
  if (!isPaid) {
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
