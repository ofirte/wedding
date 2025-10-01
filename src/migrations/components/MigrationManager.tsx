import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useWeddingDetails } from "../../hooks/wedding/useWeddingDetails";
import {
  useMigrationRecords,
  useMigrationExecution,
} from "../../hooks/migrations";
import { MigrationControls } from "./MigrationControls";
import { MigrationList } from "./MigrationList";
import { MigrationResults } from "./MigrationResults";
import { migrationRegistry } from "../index";
import {
  Migration,
  MigrationStatus,
  MigrationRecord,
} from "../framework/types";

/**
 * Main migration management component
 * Refactored to use smaller components and follow user's coding patterns
 */
const MigrationManager: React.FC = () => {
  const { data: wedding } = useWeddingDetails();
  const [dryRun, setDryRun] = useState(true);

  // Use the new hooks following user's patterns
  const {
    data: migrationRecords = [],
    isLoading: recordsLoading,
    refetch: refetchRecords,
  } = useMigrationRecords();

  const {
    executeMigration,
    executeAllPending,
    isRunning,
    currentMigration,
    results,
  } = useMigrationExecution();

  // Get available migrations from registry
  const [availableMigrations, setAvailableMigrations] = useState<Migration[]>(
    []
  );

  useEffect(() => {
    const loadMigrations = () => {
      const migrations = migrationRegistry.getAll();
      setAvailableMigrations(migrations);
    };

    loadMigrations();
  }, []);

  // Create a lookup for migration records by migrationId
  const recordsLookup = migrationRecords.reduce((acc, record) => {
    acc[record.migrationId] = record;
    return acc;
  }, {} as Record<string, MigrationRecord>);

  // Count pending migrations
  const pendingCount = availableMigrations.filter((migration) => {
    const record = recordsLookup[migration.id];
    return !record || record.status === MigrationStatus.PENDING;
  }).length;

  // Event handlers using the new hooks
  const handleExecuteMigration = async (migrationId: string) => {
    await executeMigration(migrationId, {
      dryRun,
      validateAfter: !dryRun,
      continueOnError: false,
    });
    await refetchRecords();
  };

  const handleExecuteAllPending = async () => {
    await executeAllPending({
      dryRun,
      validateAfter: !dryRun,
      continueOnError: false,
    });
    await refetchRecords();
  };

  const handleRefresh = () => {
    refetchRecords();
  };

  if (!wedding?.id) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Migration Manager
        </Typography>
        <Alert severity="warning">
          No wedding selected. Please select a wedding to manage migrations.
        </Alert>
      </Container>
    );
  }

  if (recordsLoading) {
    return (
      <Container>
        <Typography variant="h4" gutterBottom>
          Migration Manager
        </Typography>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Migration Manager
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Manage and execute data migrations for your wedding database.
      </Typography>

      <MigrationControls
        dryRun={dryRun}
        onDryRunChange={setDryRun}
        onRunAllPending={handleExecuteAllPending}
        onRefresh={handleRefresh}
        isRunning={isRunning}
        pendingCount={pendingCount}
      />

      <MigrationList
        migrations={availableMigrations}
        records={recordsLookup}
        onExecuteMigration={handleExecuteMigration}
        isRunning={isRunning}
        executionProgress={
          currentMigration
            ? {
                migrationId: currentMigration,
                currentStep: "Executing migration...",
                progress: 50,
              }
            : undefined
        }
      />

      <MigrationResults
        stats={results.length > 0 ? results[0]?.stats : null}
        isRunning={isRunning}
        currentStep={isRunning ? "Executing migration..." : undefined}
        progress={isRunning ? 50 : 0}
      />
    </Container>
  );
};

export default MigrationManager;
