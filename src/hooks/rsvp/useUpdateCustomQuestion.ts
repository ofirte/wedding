import { useQueryClient } from "@tanstack/react-query";
import { updateCustomQuestion } from "../../api/rsvp/rsvpQuestionsApi";
import { RSVPQuestion } from "../../api/rsvp/rsvpQuestionsTypes";
import { useWeddingMutation } from "../common/useWeddingMutation";
import { rsvpKeys } from "./useRSVPConfig";

interface UpdateCustomQuestionVariables {
  questionId: string;
  updates: Partial<Omit<RSVPQuestion, "id" | "isCustom">>;
}

/**
 * Hook to update custom question
 */
export const useUpdateCustomQuestion = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<void, UpdateCustomQuestionVariables>({
    mutationFn: (variables, weddingId) => {
      if (!weddingId) {
        throw new Error("Wedding ID is required");
      }
      return updateCustomQuestion(
        weddingId,
        variables.questionId,
        variables.updates
      );
    },
    options: {
      onSuccess: () => {
        // Invalidate all RSVP queries
        queryClient.invalidateQueries({
          queryKey: rsvpKeys.all,
        });
      },
    },
  });
};
