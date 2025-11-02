import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { createWedding } from "../../api/wedding/weddingApi";
import { Wedding } from "@shared/dist";
type CreateWeddingData = {
  weddingData: Omit<Wedding, "id" | "createdAt" | "userIds" | "members">;
  userId: string;
};
export const useCreateWedding = (
  options?: UseMutationOptions<string, unknown, CreateWeddingData, unknown>
) => {
  return useMutation({
    mutationFn: (data: CreateWeddingData) =>
      createWedding(data.weddingData, data.userId),
    onSuccess: async (weddingId, variables, context) => {
      options?.onSuccess?.(weddingId, variables, context);
    },
  });
};
