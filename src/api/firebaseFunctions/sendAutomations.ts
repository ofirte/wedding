import { httpsCallable } from "firebase/functions";
import { functions } from "../firebaseConfig";
import { SendAutomationsFunctions } from "./types";
import { ManualRunAutomationsRequest } from "@wedding-plan/types";
import { ManualRunAutomationsResponse } from "@wedding-plan/types";

/**
 * Send Automations-related Firebase Functions
 */
export const sendAutomationsFunctions = {
  [SendAutomationsFunctions.MANUAL_RUN_MESSAGES_AUTOMATION]: httpsCallable<
    ManualRunAutomationsRequest,
    ManualRunAutomationsResponse
  >(functions, SendAutomationsFunctions.MANUAL_RUN_MESSAGES_AUTOMATION),
  [SendAutomationsFunctions.MANUAL_UPDATE_AUTOMATION_STATUSES]: httpsCallable<
    {},
    { success: boolean }
  >(functions, SendAutomationsFunctions.MANUAL_UPDATE_AUTOMATION_STATUSES),
} as const;

// Export individual functions for convenience
export const manualRunMessagesAutomation =
  sendAutomationsFunctions[
    SendAutomationsFunctions.MANUAL_RUN_MESSAGES_AUTOMATION
  ];

export const manualUpdateAutomationStatuses =
  sendAutomationsFunctions[
    SendAutomationsFunctions.MANUAL_UPDATE_AUTOMATION_STATUSES
  ];

// Export the enum for external use
export { SendAutomationsFunctions };
