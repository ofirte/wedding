import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { createWedding } from "../../api/wedding/weddingApi";

export const useCreateWedding = (
  options?: UseMutationOptions<string, unknown, unknown, unknown>
) => {
  return useMutation({
    mutationFn: (weddingData: {
      userId: string;
      weddingName: string;
      brideName: string;
      groomName: string;
      weddingDate: Date;
    }) =>
      createWedding(
        weddingData.userId,
        weddingData.weddingName,
        weddingData.weddingDate,
        weddingData.brideName,
        weddingData.groomName
      ),
    onSuccess: async (weddingId, variables, context) => {
      options?.onSuccess?.(weddingId, variables, context);
    },
  });
};
