import { WeddingRSVPConfig } from "@wedding-plan/types";
import { rsvpConfigAPI } from "../../api/rsvp/rsvpQuestionsApi";
import { useWeddingMutation } from "../common/useWeddingMutation";
import { useQueryClient } from "@tanstack/react-query";

export interface UpdateRsvpConfig {
  id: string;
  data: Partial<Omit<WeddingRSVPConfig, "id">>;
}

export const useUpdateRsvpConfig = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<void, UpdateRsvpConfig>({
    mutationFn: ({ id, data }, weddingId?: string) =>
      rsvpConfigAPI.update(id, data, weddingId),

    options: {
      onSuccess: () => {
        // Invalidate RSVP config queries to refresh the data
        queryClient.invalidateQueries({
          queryKey: ["rsvpConfig"],
        });
      },
    },
  });
};
