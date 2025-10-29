import React from "react";
import { SendMessagesAutomation } from "@wedding-plan/types";
import ActiveAutomationDetails from "./ActiveAutomationDetails";
import SetupAutomation from "./SetupAutomation";

interface AutomationDetailsProps {
  automation: SendMessagesAutomation;
  onClose?: () => void;
  onApproveAutomation?: () => void;
}

/**
 * Wrapper component that renders the appropriate automation details view
 * based on whether the automation is active or inactive
 */
const AutomationDetails: React.FC<AutomationDetailsProps> = ({
  automation,
  onClose,
  onApproveAutomation,
}) => {
  // Render different components based on automation status
  console.log("Rendering AutomationDetails for automation:", automation);
  if (automation.isActive) {
    return (
      <ActiveAutomationDetails automation={automation} onClose={onClose} />
    );
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
