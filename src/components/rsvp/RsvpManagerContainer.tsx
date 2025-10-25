import { useRSVPConfig } from "src/hooks/rsvp";
import RSVPManager from "./RSVPManager";
import { LoadingState } from "../common";
import { RSVPSetupSteps } from "./rsvpSetup/RsvpSetupSteps";

export const RsvpManagerContainer: React.FC = () => {
    const { data: rsvpConfig, isLoading: isLoadingRsvpConfig } = useRSVPConfig();
    if (isLoadingRsvpConfig) {
        return <LoadingState />;
    }
    if (rsvpConfig?.isSetupComplete) {
        return <RSVPManager />;
    }
    return <RSVPSetupSteps />;
        
}