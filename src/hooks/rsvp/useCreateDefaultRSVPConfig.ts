import { useQueryClient } from "@tanstack/react-query";
import { createDefaultRSVPConfig } from "../../api/rsvp/rsvpQuestionsApi";
import { useWeddingMutation } from "../common/useWeddingMutation";
import { rsvpKeys } from "./useRSVPConfig";

/**
 * Hook to create default RSVP configuration
 */
export const useCreateDefaultRSVPConfig = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: (variables: void, weddingId?: string) =>
      createDefaultRSVPConfig(weddingId),
    options: {
      onSuccess: (config) => {
        queryClient.setQueryData(rsvpKeys.config(config.weddingId), config);
      },
    },
  });
};
