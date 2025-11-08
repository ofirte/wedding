import { useQueryClient } from "@tanstack/react-query";
import { createLayoutElement } from "../../api/seating/seatingApi";
import { useWeddingMutation } from "../common";

/**
 * Hook to create a layout element
 * @returns Mutation result object for creating layout elements
 */
export const useCreateLayoutElement = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: createLayoutElement,
    options: {
      onSuccess: () => {
        console.log("Layout element created successfully");
        queryClient.invalidateQueries({ queryKey: ["layoutElements"] });
      },
      onError: (error) => {
        console.error("Error creating layout element:", error);
      },
    },
  });
};
