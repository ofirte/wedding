import {
  getAllAvailableQuestions,
  getPredefinedQuestions,
} from "../../api/rsvp/rsvpQuestionsTypes";
import { useLocalization } from "../../localization/LocalizationContext";
import { useRSVPConfig } from "./useRSVPConfig";

/**
 * Hook to get all available questions (enabled predefined + custom)
 */
export const useAvailableQuestions = (weddingId?: string) => {
  const { t } = useLocalization();
  const { data: config, isLoading, error } = useRSVPConfig(weddingId);

  const translatedPredefinedQuestions = getPredefinedQuestions(t);
  const questions = config
    ? getAllAvailableQuestions(config, translatedPredefinedQuestions)
    : [];

  return {
    questions,
    isLoading,
    error,
  };
};
