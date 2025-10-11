import { useMemo } from "react";
import { getPredefinedQuestions } from "../../api/rsvp/rsvpQuestionsTypes";
import { useLocalization } from "../../localization/LocalizationContext";
import { useRSVPConfig } from "./useRSVPConfig";

/**
 * Hook to get only the enabled RSVP form questions (filtered by enabledQuestionIds)
 * This ensures consistent question filtering across components
 */
export const useRSVPFormQuestions = () => {
  const { t } = useLocalization();
  const { data: config, isLoading, error } = useRSVPConfig();

  const questions = useMemo(() => {
    if (!config) return [];

    const translatedPredefinedQuestions = getPredefinedQuestions(t);
    const allQuestions = [
      ...translatedPredefinedQuestions,
      ...(config.customQuestions || []),
    ];

    // Filter to only include questions that are in enabledQuestionIds
    const enabledQuestions = allQuestions.filter((question) =>
      config.enabledQuestionIds?.includes(question.id)
    );

    // Sort by order if specified, otherwise maintain the order from enabledQuestionIds
    return enabledQuestions.sort((a, b) => {
      const aOrder = a.order ?? 999;
      const bOrder = b.order ?? 999;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      // If order is the same, use the order from enabledQuestionIds
      const aIndex = config.enabledQuestionIds.indexOf(a.id);
      const bIndex = config.enabledQuestionIds.indexOf(b.id);
      return aIndex - bIndex;
    });
  }, [config, t]);

  return {
    questions,
    isLoading,
    error,
  };
};
