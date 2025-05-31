import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ensureWeddingHasInvitationCode } from "../../api/wedding/weddingApi";

export const useEnsureInvitationCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (weddingId: string) =>
      ensureWeddingHasInvitationCode(weddingId),
    onSuccess: () => {
      // Invalidate wedding details to refresh the data
      queryClient.invalidateQueries({ queryKey: ["weddingDetails"] });
    },
  });
};
