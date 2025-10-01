import React from "react";
import { Box, Typography } from "@mui/material";
import { Migration, MigrationRecord } from "../framework/types";
import { MigrationCard } from "./MigrationCard";

interface MigrationListProps {
  migrations: Migration[];
  records: Record<string, MigrationRecord>;
  onExecuteMigration: (migrationId: string) => void;
  isRunning: boolean;
  executionProgress?: {
    migrationId: string;
    currentStep: string;
    progress: number;
  };
}

/**
 * List component for displaying all available migrations
 * Follows the pattern of focused, reusable components
 */
export const MigrationList: React.FC<MigrationListProps> = ({
  migrations,
  records,
  onExecuteMigration,
  isRunning,
  executionProgress,
}) => {
  if (migrations.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="text.secondary">No migrations found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Available Migrations ({migrations.length})
      </Typography>

      {migrations.map((migration) => {
        const record = records[migration.id];
        const isCurrentlyRunning =
          isRunning && executionProgress?.migrationId === migration.id;

        return (
          <MigrationCard
            key={migration.id}
            migration={migration}
            record={record}
            onExecute={onExecuteMigration}
            isRunning={isRunning}
            executionProgress={
              isCurrentlyRunning ? executionProgress : undefined
            }
          />
        );
      })}
    </Box>
  );
};
