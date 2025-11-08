import { useQueryClient } from "@tanstack/react-query";
import { updateSeatingArrangement } from "../../api/seating/seatingApi";
import { useWeddingMutation } from "../common";
import { SeatingArrangement } from "@wedding-plan/types";

/**
 * Hook to update a seating arrangement
 * @returns Mutation result object for updating seating arrangements
 */
export const useUpdateSeatingArrangement = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<
    void,
    { id: string; data: Partial<SeatingArrangement> },
    Error,
    unknown
  >({
    mutationFn: ({ id, data }, weddingId) =>
      updateSeatingArrangement(id, data, weddingId),
    options: {
      onSuccess: () => {
        console.log("Seating arrangement updated successfully");
        queryClient.invalidateQueries({ queryKey: ["seating"] });
      },
      onError: (error) => {
        console.error("Error updating seating arrangement:", error);
      },
    },
  });
};
