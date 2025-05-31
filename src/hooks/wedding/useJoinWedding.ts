import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { getCurrentUserData } from "../../api/auth/authApi";
import { joinWedding, Wedding } from "../../api/wedding/weddingApi";

export const useJoinWedding = (
  options?: UseMutationOptions<Wedding, unknown, unknown, unknown>
) => {
  return useMutation({
    mutationFn: (params: {
      userId: string;
      weddingId: string;
      isInvitationCode?: boolean;
    }) => joinWedding(params.userId, params.weddingId, params.isInvitationCode),
    ...options,
  });
};
