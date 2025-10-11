import { useQueryClient } from "@tanstack/react-query";
import { createDefaultRSVPConfig } from "../../api/rsvp/rsvpQuestionsApi";
import { useWeddingMutation } from "../common/useWeddingMutation";

/**
 * Hook to create default RSVP configuration
 */
export const useCreateDefaultRSVPConfig = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (_, weddingId) => createDefaultRSVPConfig(weddingId),
    options: {
      onSuccess: (config) => {
        console.log(config, "Default RSVP configuration created successfully");
        // Invalidate all queries that start with "rsvpConfig" prefix
        queryClient.invalidateQueries({ queryKey: ["rsvpConfig"] });
      },
    },
  });
};
