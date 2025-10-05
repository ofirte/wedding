import { useQueryClient } from "@tanstack/react-query";
import { addCustomQuestion } from "../../api/rsvp/rsvpQuestionsApi";
import {
  CreateCustomQuestionRequest,
  RSVPQuestion,
} from "../../api/rsvp/rsvpQuestionsTypes";
import { useWeddingMutation } from "../common/useWeddingMutation";
import { rsvpKeys } from "./useRSVPConfig";

/**
 * Hook to add custom question
 */
export const useAddCustomQuestion = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<RSVPQuestion, CreateCustomQuestionRequest>({
    mutationFn: (variables, weddingId) => {
      // Override the weddingId in variables with the one from useWeddingMutation
      const requestWithWeddingId = {
        ...variables,
        weddingId: weddingId || variables.weddingId,
      };
      return addCustomQuestion(requestWithWeddingId);
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
