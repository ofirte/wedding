import { useQueryClient } from "@tanstack/react-query";
import { addCustomQuestion } from "../../api/rsvp/rsvpQuestionsApi";
import {
  CreateCustomQuestionRequest,
  RSVPQuestion,
} from "../../api/rsvp/rsvpQuestionsTypes";
import { useWeddingMutation } from "../common/useWeddingMutation";

/**
 * Hook to add custom question
 */
export const useAddCustomQuestion = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<RSVPQuestion, CreateCustomQuestionRequest>({
    mutationFn: addCustomQuestion,
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
