import React from "react";
import { SendMessagesAutomation } from "@wedding-plan/types";
import ActiveAutomationDetails from "./ActiveAutomationDetails";
import SetupAutomation from "./SetupAutomation";
import { useAutomation } from "src/hooks/rsvp";
import { LoadingState } from "src/components/common";

interface AutomationDetailsProps {
  automationId: string;
  onClose?: () => void;
  onApproveAutomation?: () => void;
}

/**
 * Wrapper component that renders the appropriate automation details view
 * based on whether the automation is active or inactive
 */
const AutomationDetails: React.FC<AutomationDetailsProps> = ({
  automationId,
  onClose,
  onApproveAutomation,
}) => {
  // Render different components based on automation status

  const { data: automation, isLoading: isLoadingAutomation } =
    useAutomation(automationId);
    
  if (isLoadingAutomation) {
    return <LoadingState />;
  }
  if (!automation) {
    return <div>Automation not found</div>;
  }
  if (automation.isActive) {
    return <ActiveAutomationDetails automation={automation} />;
  }

  return (
    <SetupAutomation
      key={automation.id}
      automation={automation}
      onApproveAutomation={onApproveAutomation}
    />
  );
};

export default AutomationDetails;
