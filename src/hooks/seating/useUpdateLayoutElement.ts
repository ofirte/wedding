import { UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { updateLayoutElement } from "../../api/seating/seatingApi";
import { useWeddingMutation } from "../common";
import { LayoutElement } from "@shared/src/models/seating";

/**
 * Hook to update a layout element
 * @param options - Optional mutation options to merge with default behavior
 * @returns Mutation result object for updating layout elements
 */
export const useUpdateLayoutElement = (
  options?: Omit<
    UseMutationOptions<
      void,
      Error,
      { id: string; data: Partial<LayoutElement> },
      unknown
    >,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useWeddingMutation<
    void,
    { id: string; data: Partial<LayoutElement> },
    Error,
    unknown
  >({
    mutationFn: ({ id, data }, weddingId) =>
      updateLayoutElement(id, data, weddingId),
    options: {
      onSuccess: (_, variables, context) => {
        queryClient.invalidateQueries({ queryKey: ["layoutElements"] });
        options?.onSuccess?.(_, variables, context);
      },
      onError: (error, variables, context) => {
        options?.onError?.(error, variables, context);
      },
      ...options,
    },
  });
};
