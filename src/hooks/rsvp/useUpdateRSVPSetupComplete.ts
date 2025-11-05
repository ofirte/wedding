import { useQueryClient } from "@tanstack/react-query";
import { updateRSVPSetupComplete } from "../../api/rsvp/rsvpQuestionsApi";
import { useWeddingMutation } from "../common/useWeddingMutation";

/**
 * Hook to update RSVP setup completion status
 */
export const useUpdateRSVPSetupComplete = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<void, boolean>({
    mutationFn: updateRSVPSetupComplete,
    options: {
      onSuccess: () => {
        // Invalidate RSVP config queries to refetch updated data
        queryClient.invalidateQueries({
          queryKey: ["rsvpConfig"],
        });
      },
    },
  });
};
