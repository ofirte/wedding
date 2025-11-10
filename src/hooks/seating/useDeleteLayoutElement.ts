import { useQueryClient } from "@tanstack/react-query";
import { deleteLayoutElement } from "../../api/seating/seatingApi";
import { useWeddingMutation } from "../common";

/**
 * Hook to delete a layout element
 * @returns Mutation result object for deleting layout elements
 */
export const useDeleteLayoutElement = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: deleteLayoutElement,
    options: {
      onSuccess: () => {
        console.log("Layout element deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["layoutElements"] });
      },
      onError: (error) => {
        console.error("Error deleting layout element:", error);
      },
    },
  });
};
