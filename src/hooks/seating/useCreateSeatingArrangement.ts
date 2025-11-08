import { useQueryClient } from "@tanstack/react-query";
import { createSeatingArrangement } from "../../api/seating/seatingApi";
import { useWeddingMutation } from "../common";

/**
 * Hook to create a seating arrangement
 * @returns Mutation result object for creating seating arrangements
 */
export const useCreateSeatingArrangement = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: createSeatingArrangement,
    options: {
      onSuccess: () => {
        console.log("Seating arrangement created successfully");
        queryClient.invalidateQueries({ queryKey: ["seating"] });
      },
      onError: (error) => {
        console.error("Error creating seating arrangement:", error);
      },
    },
  });
};
