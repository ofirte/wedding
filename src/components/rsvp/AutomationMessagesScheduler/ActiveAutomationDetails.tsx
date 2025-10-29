import React from "react";
import { SendMessagesAutomation } from "@wedding-plan/types";
import PendingAutomationDetails from "./PendingAutomationDetails";
import CompletedAutomationDetails from "./CompletedAutomationDetails";
import FailedAutomationDetails from "./FailedAutomationDetails";

interface ActiveAutomationDetailsProps {
  automation: SendMessagesAutomation;
}

const ActiveAutomationDetails: React.FC<ActiveAutomationDetailsProps> = ({
  automation,
}) => {
  // Render different components based on automation status
  switch (automation.status) {
    case "pending":
      return <PendingAutomationDetails automation={automation} />;
    case "completed":
      return <CompletedAutomationDetails automation={automation} />;
    case "failed":
      return <FailedAutomationDetails automation={automation} />;
    case "inProgress":
      // For now, show pending details for inProgress - you can create a separate component later if needed
      return <PendingAutomationDetails automation={automation} />;
    default:
      return <PendingAutomationDetails automation={automation} />;
  }
};

export default ActiveAutomationDetails;
