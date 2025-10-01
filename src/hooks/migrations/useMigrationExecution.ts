import { useState } from "react";
import { useWeddingDetails } from "../wedding/useWeddingDetails";
import { migrationRegistry, MigrationRunner } from "../../migrations";
import {
  MigrationOptions,
  MigrationResult,
  MigrationStatus,
} from "../../migrations/framework/types";
import { useCreateMigrationRecord } from "./useMigrationRecords";

interface MigrationExecutionState {
  isRunning: boolean;
  currentMigration: string | null;
  results: MigrationResult[];
}

/**
 * Hook for executing migrations with proper state management
 * Follows the pattern of other mutation hooks but handles complex migration logic
 */
export const useMigrationExecution = () => {
  const { data: wedding } = useWeddingDetails();
  const { mutate: createMigrationRecord } = useCreateMigrationRecord();
  const [state, setState] = useState<MigrationExecutionState>({
    isRunning: false,
    currentMigration: null,
    results: [],
  });

  const runner = new MigrationRunner(migrationRegistry);

  const executeMigration = async (
    migrationId: string,
    options: Omit<MigrationOptions, "weddingId">
  ) => {
    if (!wedding?.id) {
      throw new Error("Wedding ID is required for migration execution");
    }

    setState((prev) => ({
      ...prev,
      isRunning: true,
      currentMigration: migrationId,
    }));

    try {
      const result = await runner.runSingle(migrationId, {
        ...options,
        weddingId: wedding.id,
      });

      // Record the execution in Firebase if it's not a dry run
      if (!options.dryRun && result.success) {
        createMigrationRecord({
          migrationId,
          status: MigrationStatus.COMPLETED,
          executedAt: new Date(),
          executionTime: result.stats.duration || 0,
          stats: result.stats,
          weddingId: wedding.id,
        });
      }

      setState((prev) => ({
        ...prev,
        results: [result],
        isRunning: false,
        currentMigration: null,
      }));

      return result;
    } catch (error) {
      // Record failure if not a dry run
      if (!options.dryRun) {
        createMigrationRecord({
          migrationId,
          status: MigrationStatus.FAILED,
          executedAt: new Date(),
          executionTime: 0,
          error: String(error),
          stats: {
            totalItems: 0,
            itemsProcessed: 0,
            itemsSkipped: 0,
            itemsUpdated: 0,
            errors: [{ id: migrationId, error: String(error) }],
            warnings: [],
            startTime: new Date(),
            endTime: new Date(),
            duration: 0,
          },
          weddingId: wedding.id,
        });
      }

      setState((prev) => ({
        ...prev,
        isRunning: false,
        currentMigration: null,
      }));

      throw error;
    }
  };

  const executeAllPending = async (
    options: Omit<MigrationOptions, "weddingId">
  ) => {
    if (!wedding?.id) {
      throw new Error("Wedding ID is required for migration execution");
    }

    setState((prev) => ({
      ...prev,
      isRunning: true,
      currentMigration: "pending-migrations",
    }));

    try {
      const results = await runner.runPending({
        ...options,
        weddingId: wedding.id,
      });

      setState((prev) => ({
        ...prev,
        results,
        isRunning: false,
        currentMigration: null,
      }));

      return results;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isRunning: false,
        currentMigration: null,
      }));

      throw error;
    }
  };

  const clearResults = () => {
    setState((prev) => ({
      ...prev,
      results: [],
    }));
  };

  return {
    ...state,
    executeMigration,
    executeAllPending,
    clearResults,
  };
};
