import { createCollectionAPI } from "../weddingFirebaseHelpers";
import { SendMessagesAutomation } from "@wedding-plan/types";

// Create collection API for send automations
const sendAutomationsAPI = createCollectionAPI<SendMessagesAutomation>(
  "sendMessagesAutomation"
); // Wedding-scoped collection

// Export the standard CRUD operations for send automations
export const createSendAutomation = sendAutomationsAPI.create;
export const fetchSendAutomations = sendAutomationsAPI.fetchAll;
export const subscribeToSendAutomations = sendAutomationsAPI.subscribe;
export const fetchSendAutomation = sendAutomationsAPI.fetchById;
export const updateSendAutomation = sendAutomationsAPI.update;
export const deleteSendAutomation = sendAutomationsAPI.delete;
export const bulkUpdateSendAutomations = sendAutomationsAPI.bulkUpdate;
export const bulkDeleteSendAutomations = sendAutomationsAPI.bulkDelete;
export const fetchSendAutomationsByFilter = sendAutomationsAPI.fetchByFilter;
