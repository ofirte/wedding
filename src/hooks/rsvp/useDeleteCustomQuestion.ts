import { useQueryClient } from "@tanstack/react-query";
import { deleteCustomQuestion } from "../../api/rsvp/rsvpQuestionsApi";
import { useWeddingMutation } from "../common/useWeddingMutation";

interface DeleteCustomQuestionVariables {
  questionId: string;
}

/**
 * Hook to delete custom question
 */
export const useDeleteCustomQuestion = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<void, DeleteCustomQuestionVariables>({
    mutationFn: (variables, weddingId) => {
      if (!weddingId) {
        throw new Error("Wedding ID is required");
      }
      return deleteCustomQuestion(weddingId, variables.questionId);
    },
    options: {
      onSuccess: () => {
        // Invalidate all RSVP queries
        queryClient.invalidateQueries({
          queryKey: ["rsvpConfig"],
        });
      },
    },
  });
};
