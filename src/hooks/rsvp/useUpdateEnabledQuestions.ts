import { useQueryClient } from "@tanstack/react-query";
import { updateEnabledQuestions } from "../../api/rsvp/rsvpQuestionsApi";
import { useWeddingMutation } from "../common/useWeddingMutation";
import { rsvpKeys } from "./useRSVPConfig";

interface UpdateEnabledQuestionsVariables {
  enabledQuestionIds: string[];
}

/**
 * Hook to update enabled questions
 */
export const useUpdateEnabledQuestions = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<void, UpdateEnabledQuestionsVariables>({
    mutationFn: (variables, weddingId) => {
      if (!weddingId) {
        throw new Error("Wedding ID is required");
      }
      return updateEnabledQuestions(weddingId, variables.enabledQuestionIds);
    },
    options: {
      onSuccess: () => {
        // Invalidate all RSVP queries since we don't have direct access to weddingId here
        queryClient.invalidateQueries({
          queryKey: rsvpKeys.all,
        });
      },
    },
  });
};
