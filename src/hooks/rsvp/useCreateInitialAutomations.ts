import { useWeddingMutation } from "../common";
import { useWeddingDetails } from "../wedding/useWeddingDetails";
import { useTranslation } from "../../localization/LocalizationContext";
import { createSendAutomation } from "../../api/rsvp/sendAutomationsApi";
import {
  SendMessagesAutomation,
  TemplatesCategories,
} from "@wedding-plan/types";

/**
 * Hook to create initial automations with predefined schedule
 * Creates 5 default automations based on wedding date:
 * - initialRsvp: 21 days before wedding
 * - secondRsvp: 16 days before wedding
 * - finalRsvp: 12 days before wedding
 * - dayBefore: 1 day before wedding (reminder for attending guests)
 * - dayAfterThankyou: 1 day after wedding (thank you for attending guests)
 */
export const useCreateInitialAutomations = () => {
  const { t } = useTranslation();
  const { data: wedding } = useWeddingDetails();

  return useWeddingMutation({
    mutationFn: async (_, weddingId?: string) => {
      if (!wedding?.date) {
        throw new Error("Wedding date is required to create automations");
      }

      const weddingDate = new Date(wedding.date);
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Define automation configurations
      const automationConfigs: Array<{
        category: TemplatesCategories;
        dayOffset: number;
        automationType: "rsvp" | "reminder";
        targetAudience: { attendance?: boolean };
      }> = [
        {
          category: "initialRsvp",
          dayOffset: -21, // 21 days before
          automationType: "rsvp",
          targetAudience: {}, // All guests
        },
        {
          category: "secondRsvp",
          dayOffset: -16, // 16 days before
          automationType: "rsvp",
          targetAudience: {}, // All guests
        },
        {
          category: "finalRsvp",
          dayOffset: -12, // 12 days before
          automationType: "rsvp",
          targetAudience: {}, // All guests
        },
        {
          category: "dayBefore",
          dayOffset: -1, // 1 day before
          automationType: "reminder",
          targetAudience: { attendance: true }, // Only attending guests
        },
        {
          category: "dayAfterThankyou",
          dayOffset: 1, // 1 day after
          automationType: "reminder",
          targetAudience: { attendance: true }, // Only attending guests
        },
      ];

      // Create all automations
      const createdAutomationRefs = [];

      for (const config of automationConfigs) {
        // Calculate scheduled time
        const scheduledTime = new Date(weddingDate);
        scheduledTime.setDate(scheduledTime.getDate() + config.dayOffset);
        scheduledTime.setHours(10, 0, 0, 0); // Set to 10:00 AM
        // Get translated name based on category
        const automationName = getAutomationName(config.category, t);

        const automationData: Omit<SendMessagesAutomation, "id"> & {
          scheduledTimeZone: string;
        } = {
          name: automationName,
          isActive: false, // Start as inactive as requested
          status: "pending" as const,
          sentMessagesIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          messageTemplateId: "", // Empty string as requested
          scheduledTime,
          scheduledTimeZone: userTimeZone,
          automationType: config.automationType,
          targetAudienceFilter: config.targetAudience,
        };

        const createdAutomationRef = await createSendAutomation(
          automationData,
          weddingId
        );
        createdAutomationRefs.push({
          id: createdAutomationRef.id,
          category: config.category,
          name: automationName,
        });
      }

      return createdAutomationRefs;
    },
    options: {
      onSuccess: (automationRefs) => {
        console.log(
          `Successfully created ${automationRefs.length} initial automations:`,
          automationRefs.map((ref) => `${ref.name} (${ref.id})`).join(", ")
        );
      },
      onError: (error) => {
        console.error("Failed to create initial automations:", error);
      },
    },
  });
};

/**
 * Get the translated automation name based on category
 */
function getAutomationName(
  category: TemplatesCategories,
  t: (key: string) => string
): string {
  const categoryTranslationMap: Record<TemplatesCategories, string> = {
    initialRsvp: t("globalTemplates.categories.initialRsvp"),
    secondRsvp: t("globalTemplates.categories.secondRsvp"),
    finalRsvp: t("globalTemplates.categories.finalRsvp"),
    dayBefore: t("globalTemplates.categories.dayBefore"),
    dayAfterThankyou: t("globalTemplates.categories.dayAfterThankyou"),
  };

  return categoryTranslationMap[category] || category;
}
