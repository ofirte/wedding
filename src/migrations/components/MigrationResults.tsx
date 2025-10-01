import React from "react";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  LinearProgress,
  Chip,
} from "@mui/material";
import { CheckCircle, Error, Warning, Info } from "@mui/icons-material";
import { MigrationStats } from "../framework/types";

interface MigrationResultsProps {
  stats: MigrationStats | null;
  isRunning: boolean;
  currentStep?: string;
  progress?: number;
}

/**
 * Component for displaying migration execution results and progress
 * Follows the pattern of focused, reusable components
 */
export const MigrationResults: React.FC<MigrationResultsProps> = ({
  stats,
  isRunning,
  currentStep,
  progress = 0,
}) => {
  if (!stats && !isRunning) {
    return null;
  }

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {isRunning ? "Migration Progress" : "Migration Results"}
        </Typography>

        {isRunning && (
          <Box mb={3}>
            {currentStep && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {currentStep}
              </Typography>
            )}
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              {progress.toFixed(1)}% complete
            </Typography>
          </Box>
        )}

        {stats && (
          <>
            <Box display="flex" gap={2} mb={3} flexWrap="wrap">
              <Chip
                icon={<Info />}
                label={`Total: ${stats.totalItems}`}
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<CheckCircle />}
                label={`Updated: ${stats.itemsUpdated}`}
                color="success"
                size="small"
              />
              <Chip
                icon={<Warning />}
                label={`Skipped: ${stats.itemsSkipped}`}
                color="warning"
                size="small"
              />
              {stats.errors.length > 0 && (
                <Chip
                  icon={<Error />}
                  label={`Errors: ${stats.errors.length}`}
                  color="error"
                  size="small"
                />
              )}
            </Box>

            {stats.duration && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Duration: {(stats.duration / 1000).toFixed(2)} seconds
              </Typography>
            )}

            {stats.errors.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="error" gutterBottom>
                  Errors ({stats.errors.length})
                </Typography>
                <List dense>
                  {stats.errors.slice(0, 10).map((error, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemText
                        primary={error.id}
                        secondary={error.error}
                        primaryTypographyProps={{ variant: "body2" }}
                        secondaryTypographyProps={{
                          variant: "caption",
                          color: "error",
                        }}
                      />
                    </ListItem>
                  ))}
                  {stats.errors.length > 10 && (
                    <Typography variant="caption" color="text.secondary">
                      ... and {stats.errors.length - 10} more errors
                    </Typography>
                  )}
                </List>
              </>
            )}

            {stats.warnings.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="subtitle2"
                  color="warning.main"
                  gutterBottom
                >
                  Warnings ({stats.warnings.length})
                </Typography>
                <List dense>
                  {stats.warnings.slice(0, 5).map((warning, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemText
                        primary={warning.id}
                        secondary={warning.warning}
                        primaryTypographyProps={{ variant: "body2" }}
                        secondaryTypographyProps={{
                          variant: "caption",
                          color: "warning.main",
                        }}
                      />
                    </ListItem>
                  ))}
                  {stats.warnings.length > 5 && (
                    <Typography variant="caption" color="text.secondary">
                      ... and {stats.warnings.length - 5} more warnings
                    </Typography>
                  )}
                </List>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
