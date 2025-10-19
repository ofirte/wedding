/**
 * API types for Send Automations Firebase Functions
 */

/**
 * Request to manually trigger message automations
 */
export interface ManualRunAutomationsRequest {
  // Optional wedding ID - if provided, will process only this wedding's automations
  weddingId: string;
}

export interface ManualUpdateAutomationStatusesRequest {
  weddingId: string;
}

/**
 * Response from manually triggering message automations
 */
export interface ManualRunAutomationsResponse {
  success: boolean;
  processedCount?: number;
  message?: string;
}

export interface ManualUpdateAutomationStatusesResponse {
  success: boolean;
  updatedCount?: number;
  message?: string;
}
