import { useQueryClient } from "@tanstack/react-query";
import { updateEnabledQuestions } from "../../api/rsvp/rsvpQuestionsApi";
import { useWeddingMutation } from "../common/useWeddingMutation";

export const useUpdateEnabledQuestions = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<void, string[]>({
    mutationFn: updateEnabledQuestions,
    options: {
      onSuccess: () => {
        // Invalidate all RSVP queries since we don't have direct access to weddingId here
        queryClient.invalidateQueries({
          queryKey: ["rsvpConfig"],
        });
      },
    },
  });
};
