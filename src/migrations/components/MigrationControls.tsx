import React from "react";
import {
  Card,
  CardContent,
  Grid,
  Button,
  FormControlLabel,
  Switch,
  Alert,
} from "@mui/material";
import { PlayArrow, Refresh } from "@mui/icons-material";

interface MigrationControlsProps {
  dryRun: boolean;
  onDryRunChange: (dryRun: boolean) => void;
  onRunAllPending: () => void;
  onRefresh: () => void;
  isRunning: boolean;
  pendingCount: number;
}

/**
 * Controls for migration execution (dry run toggle, run all button, etc.)
 * Follows the pattern of breaking complex UI into smaller, focused components
 */
export const MigrationControls: React.FC<MigrationControlsProps> = ({
  dryRun,
  onDryRunChange,
  onRunAllPending,
  onRefresh,
  isRunning,
  pendingCount,
}) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: "auto" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={dryRun}
                  onChange={(e) => onDryRunChange(e.target.checked)}
                  color="primary"
                />
              }
              label="Dry Run Mode"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: "auto" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={onRunAllPending}
              disabled={isRunning || pendingCount === 0}
              startIcon={<PlayArrow />}
            >
              Run All Pending ({pendingCount})
            </Button>
          </Grid>

          <Grid size={{ xs: 12, sm: "auto" }}>
            <Button
              variant="outlined"
              onClick={onRefresh}
              disabled={isRunning}
              startIcon={<Refresh />}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>

        {dryRun && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Dry run mode is enabled. No data will be modified.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
