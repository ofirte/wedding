import { useQueryClient } from "@tanstack/react-query";
import { deleteTable } from "../../api/seating/seatingApi";
import { useWeddingMutation } from "../common";

/**
 * Hook to delete a table
 * @returns Mutation result object for deleting tables
 */
export const useDeleteTable = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<void, string, Error, unknown>({
    mutationFn: (id, weddingId) => deleteTable(id, weddingId),
    options: {
      onSuccess: () => {
        console.log("Table deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["tables"] });
      },
      onError: (error) => {
        console.error("Error deleting table:", error);
      },
    },
  });
};
