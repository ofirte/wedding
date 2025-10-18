export type TargetAudienceFilter = {
  attendance?: boolean;
};

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
  scheduledTime: Date;
  targetAudienceFilter: TargetAudienceFilter;
}
