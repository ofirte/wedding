import {
  useMutation,
  UseMutationOptions,
} from "@tanstack/react-query";
import { createWedding } from "../../api/auth/authApi";

export const useCreateWedding = (
  options?: UseMutationOptions<string, unknown, unknown, unknown>
) => {

  return useMutation({
    mutationFn: (weddingData: {
      userId: string;
      weddingName: string;
      brideName?: string;
      groomName?: string;
      weddingDate?: Date;
    }) =>
      createWedding(
        weddingData.userId,
        weddingData.weddingName,
        weddingData.brideName,
        weddingData.groomName,
        weddingData.weddingDate
      ),
    onSuccess: async (weddingId, variables, context) => {
      options?.onSuccess?.(weddingId, variables, context);
    },
  });
};
