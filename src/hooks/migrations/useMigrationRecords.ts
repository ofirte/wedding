import { useWeddingQuery, useWeddingMutation } from "../common";
import {
  fetchMigrationRecords,
  createMigrationRecord,
} from "../../api/migrations/migrationsApi";
import { MigrationRecord } from "../../migrations/framework/types";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to fetch all migration records for a wedding
 * Follows the pattern of useInvitees, useTasks, etc.
 */
export const useMigrationRecords = () => {
  const result = useWeddingQuery<MigrationRecord[]>({
    queryKey: ["migrationRecords"],
    queryFn: fetchMigrationRecords,
  });

  return result;
};

/**
 * Hook to create a new migration record
 * Follows the pattern of useCreateInvitee, useCreateTask, etc.
 */
export const useCreateMigrationRecord = () => {
  const queryClient = useQueryClient();

  return useWeddingMutation<void, Omit<MigrationRecord, "id">>({
    mutationFn: createMigrationRecord,
    options: {
      onSuccess: () => {
        // Invalidate and refetch migration records
        queryClient.invalidateQueries({ queryKey: ["migrationRecords"] });
      },
    },
  });
};
