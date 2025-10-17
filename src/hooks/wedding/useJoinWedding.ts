import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { joinWedding } from "../../api/wedding/weddingApi";
import { Wedding } from "@wedding-plan/types";

export const useJoinWedding = (
  options?: UseMutationOptions<Wedding, unknown, unknown, unknown>
) => {
  return useMutation({
    mutationFn: (params: {
      userId: string;
      weddingIdentifier: string;
      isInvitationCode?: boolean;
    }) =>
      joinWedding(
        params.userId,
        params.weddingIdentifier,
        params.isInvitationCode
      ),
    ...options,
  });
};
