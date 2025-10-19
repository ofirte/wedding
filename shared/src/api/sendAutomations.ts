/**
 * API types for Send Automations Firebase Functions
 */

/**
 * Request to manually trigger message automations
 */
export interface ManualRunAutomationsRequest {
  // No parameters needed - will process all pending automations
}

/**
 * Response from manually triggering message automations
 */
export interface ManualRunAutomationsResponse {
  success: boolean;
  processedCount?: number;
  message?: string;
}