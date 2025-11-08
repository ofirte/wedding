import { useQueryClient } from "@tanstack/react-query";
import { bulkUpdateTables } from "../../api/seating/seatingApi";
import { useWeddingMutation } from "../common";
import { Table } from "@wedding-plan/types";

/**
 * Hook to bulk update tables
 * @returns Mutation result object for bulk updating tables
 */
export const useBulkUpdateTables = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<
    void,
    Array<{ id: string; data: Partial<Table> }>,
    Error,
    unknown
  >({
    mutationFn: (updates, weddingId) => bulkUpdateTables(updates, weddingId),
    options: {
      onSuccess: () => {
        console.log("Tables bulk updated successfully");
        queryClient.invalidateQueries({ queryKey: ["tables"] });
      },
      onError: (error) => {
        console.error("Error bulk updating tables:", error);
      },
    },
  });
};
