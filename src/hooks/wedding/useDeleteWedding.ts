import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import {  deleteWedding } from "../../api/wedding/weddingApi";

// @TODO: not ready, should be soft delete, and handle maybe removing wedding from users who are members
export const useDeleteWedding = (
  options?: UseMutationOptions<void, unknown, string, unknown>
) => {
  return useMutation({
    mutationFn: (weddingId: string) => deleteWedding(weddingId),
    onSuccess: async (_, variables,_onMutateResults, context) => {
      options?.onSuccess?.(undefined, variables, _onMutateResults , context);
    },
  });
};
