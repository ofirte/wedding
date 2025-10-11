import {
  getAllAvailableQuestions,
  getPredefinedQuestions,
} from "../../api/rsvp/rsvpQuestionsTypes";
import { useLocalization } from "../../localization/LocalizationContext";
import { useRSVPConfig } from "./useRSVPConfig";

/**
 * Hook to get all available questions (enabled predefined + custom)
 */
export const useAvailableQuestions = () => {
  const { t } = useLocalization();
  const { data: config, isLoading, error } = useRSVPConfig();
  console.log("RSVP Config:", config, ' Loading:', isLoading, ' Error:', error);
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
