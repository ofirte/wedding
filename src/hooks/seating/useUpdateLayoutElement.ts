import { useQueryClient } from "@tanstack/react-query";
import { updateLayoutElement } from "../../api/seating/seatingApi";
import { useWeddingMutation } from "../common";

/**
 * Hook to update a layout element
 * @returns Mutation result object for updating layout elements
 */
export const useUpdateLayoutElement = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateLayoutElement(id, data),
    options: {
      onSuccess: () => {
        console.log("Layout element updated successfully");
        queryClient.invalidateQueries({ queryKey: ["layoutElements"] });
      },
      onError: (error) => {
        console.error("Error updating layout element:", error);
      },
    },
  });
};
