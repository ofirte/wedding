import { useQueryClient } from "@tanstack/react-query";
import { createTable } from "../../api/seating/seatingApi";
import { useWeddingMutation } from "../common";

/**
 * Hook to create a table
 * @returns Mutation result object for creating tables
 */
export const useCreateTable = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation({
    mutationFn: createTable,
    options: {
      onSuccess: () => {
        console.log("Table created successfully");
        queryClient.invalidateQueries({ queryKey: ["tables"] });
      },
      onError: (error) => {
        console.error("Error creating table:", error);
      },
    },
  });
};
