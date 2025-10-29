import { useRSVPConfig } from "src/hooks/rsvp";
import RSVPManager from "./RSVPManager";
import { LoadingState } from "../common";
import { RSVPSetupSteps } from "./rsvpSetup/RsvpSetupSteps";
import RSVPWelcomePage from "./RSVPWelcomePage";

export const RsvpManagerContainer: React.FC = () => {
  const { data: rsvpConfig, isLoading: isLoadingRsvpConfig } = useRSVPConfig();

  if (isLoadingRsvpConfig) {
    return <LoadingState />;
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
