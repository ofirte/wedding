import { useQueryClient } from "@tanstack/react-query";
import { updateTable } from "../../api/seating/seatingApi";
import { useWeddingMutation } from "../common";
import { Table } from "@wedding-plan/types";

/**
 * Hook to update a table
 * @returns Mutation result object for updating tables
 */
export const useUpdateTable = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<
    void,
    { id: string; data: Partial<Table> },
    Error,
    unknown
  >({
    mutationFn: ({ id, data }, weddingId) => updateTable(id, data, weddingId),
    options: {
      onSuccess: () => {
        console.log("Table updated successfully");
        queryClient.invalidateQueries({ queryKey: ["tables"] });
      },
      onError: (error) => {
        console.error("Error updating table:", error);
      },
    },
  });
};
