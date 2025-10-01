import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  LinearProgress,
  Box,
} from "@mui/material";
import { PlayArrow, CheckCircle, Error, Schedule } from "@mui/icons-material";
import {
  Migration,
  MigrationRecord,
  MigrationStatus,
} from "../framework/types";

interface MigrationCardProps {
  migration: Migration;
  record?: MigrationRecord;
  onExecute: (migrationId: string) => void;
  isRunning: boolean;
  executionProgress?: {
    currentStep: string;
    progress: number;
  };
}

/**
 * Individual migration card component displaying status, details, and controls
 * Follows the pattern of separating complex UI into focused components
 */
export const MigrationCard: React.FC<MigrationCardProps> = ({
  migration,
  record,
  onExecute,
  isRunning,
  executionProgress,
}) => {
  const getStatusColor = (status: MigrationStatus) => {
    switch (status) {
      case MigrationStatus.PENDING:
        return "warning";
      case MigrationStatus.RUNNING:
        return "info";
      case MigrationStatus.COMPLETED:
        return "success";
      case MigrationStatus.FAILED:
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: MigrationStatus) => {
    switch (status) {
      case MigrationStatus.PENDING:
        return <Schedule />;
      case MigrationStatus.RUNNING:
        return undefined; // LinearProgress can't be used as icon
      case MigrationStatus.COMPLETED:
        return <CheckCircle />;
      case MigrationStatus.FAILED:
        return <Error />;
      default:
        return undefined;
    }
  };

  const status = record?.status || MigrationStatus.PENDING;
  const canExecute = status === MigrationStatus.PENDING && !isRunning;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Typography variant="h6" component="h3">
            {migration.name}
          </Typography>
          <Chip
            label={status}
            color={getStatusColor(status)}
            icon={getStatusIcon(status)}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {migration.description}
        </Typography>

        <Typography variant="caption" display="block" gutterBottom>
          Version: {migration.version}
        </Typography>

        {status === MigrationStatus.RUNNING && executionProgress && (
          <Box mt={2}>
            <Typography variant="body2" gutterBottom>
              {executionProgress.currentStep}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={executionProgress.progress}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {record?.executedAt && (
          <Typography variant="caption" color="text.secondary">
            Executed: {record.executedAt.toLocaleString()}
          </Typography>
        )}

        {record?.error && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Error: {record.error}
          </Typography>
        )}
      </CardContent>

      <CardActions>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={() => onExecute(migration.id)}
          disabled={!canExecute}
          startIcon={<PlayArrow />}
        >
          Execute
        </Button>
      </CardActions>
    </Card>
  );
};
