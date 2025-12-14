import { ReactNode } from "react";
import { SendMessagesAutomation, TemplateDocument } from "@wedding-plan/types";
import { enUS, he } from "date-fns/locale";

// Types for pending changes
export interface PendingChange {
  scheduledTime?: Date;
  messageTemplateId?: string;
}

export type PendingChanges = Record<string, PendingChange>;

// Status configuration for card styling
export interface StatusConfig {
  headerBg: string;
  headerColor: string;
  icon: ReactNode;
  chipLabel: string;
  chipColor: "success" | "error" | "warning" | "default";
  borderColor: string;
}

// Props for AutomationDashboardCard
export interface AutomationDashboardCardProps {
  automation: SendMessagesAutomation;
  template: TemplateDocument | undefined;
  availableTemplates: TemplateDocument[];
  effectiveTime: Date;
  offsetText: string;
  isEditing: boolean;
  hasPendingChange: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveChanges: () => void;
  onTimeChange: (newTime: Date | null) => void;
  onTemplateChange: (templateId: string) => void;
  locale: typeof enUS | typeof he;
  t: (key: string) => string;
}
