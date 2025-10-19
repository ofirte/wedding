export type TargetAudienceFilter = {
  attendance?: boolean;
};

export type AutomationType = "rsvp" | "reminder";

export type AutomationStatus =
  | "pending"
  | "inProgress"
  | "completed"
  | "failed";

export interface SendMessagesAutomation {
  id: string;
  name: string;
  isActive: boolean;
  status: AutomationStatus;
  sentMessagesIds: string[];
  createdAt: Date;
  updatedAt: Date;
  messageTemplateId: string;
  scheduledTime: Date; // Always stored in UTC
  scheduledTimeZone: string; // IANA timezone (e.g., 'America/New_York', 'Europe/London')
  automationType: AutomationType;
  targetAudienceFilter: TargetAudienceFilter;
  completionStats?: {
    successfulMessages: number;
    failedMessages: number;
    completedAt: Date;
  };
  failureDetails?: Array<{
    messageSid: string;
    errorCode?: string;
    errorMessage?: string;
  }>;
}
