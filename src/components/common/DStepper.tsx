import React from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import { CheckCircle as CompleteIcon } from "@mui/icons-material";

export interface DStepConfig {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  isComplete: boolean;
}

interface DStepperProps {
  steps: DStepConfig[];
  activeStep: number;
  onStepClick?: (stepIndex: number) => void;
  compact?: boolean;
}

/**
 * Simple, clean stepper component
 */
export default function DStepper({
  steps,
  activeStep,
  onStepClick,
  compact = false,
}: DStepperProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.secondary.main}05)`,
        p: compact ? 0.75 : 3,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 2 : 0,
        }}
      >
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = step.isComplete;
          const circleSize = compact ? 32 : 48;

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <Box
                onClick={() => onStepClick?.(index)}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: onStepClick ? "pointer" : "default",
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": onStepClick
                    ? { transform: "translateY(-2px)" }
                    : {},
                  zIndex: 2,
                  position: "relative",
                }}
              >
                {/* Circle with number */}
                <Box
                  sx={{
                    width: circleSize,
                    height: circleSize,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isCompleted
                      ? theme.palette.success.main
                      : isActive
                      ? theme.palette.primary.main
                      : theme.palette.grey[300],
                    color:
                      isCompleted || isActive
                        ? theme.palette.common.white
                        : theme.palette.grey[600],
                    fontWeight: 600,
                    fontSize: compact ? "0.9rem" : "1.1rem",
                    border: `2px solid ${
                      isCompleted
                        ? theme.palette.success.main
                        : isActive
                        ? theme.palette.primary.main
                        : theme.palette.grey[300]
                    }`,
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  {isCompleted ? (
                    <CompleteIcon
                      sx={{ fontSize: compact ? "1rem" : "1.2rem" }}
                    />
                  ) : (
                    index + 1
                  )}
                </Box>

                {/* Step title and icon */}
                <Box
                  sx={{
                    mt: compact ? 0.5 : 1,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {step.icon && (
                    <Typography
                      component="span"
                      sx={{
                        fontSize: compact ? "1.2em" : "1.4em",
                      }}
                    >
                      {step.icon}
                    </Typography>
                  )}

                  <Typography
                    variant={compact ? "caption" : "subtitle2"}
                    sx={{
                      fontWeight: isActive ? 700 : 600,
                      color: isCompleted
                        ? theme.palette.success.dark
                        : isActive
                        ? theme.palette.primary.main
                        : theme.palette.text.primary,
                      fontSize: compact ? "0.75rem" : "0.875rem",
                    }}
                  >
                    {step.title}
                  </Typography>

                  {!compact && !isMobile && step.description && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: "0.7rem",
                        maxWidth: 80,
                        textAlign: "center",
                      }}
                    >
                      {step.description}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Connector line */}
              {!isMobile && index < steps.length - 1 && (
                <Box
                  sx={{
                    flex: 1,
                    height: compact ? 2 : 3,
                    backgroundColor:
                      steps[index + 1].isComplete || isCompleted
                        ? theme.palette.success.main
                        : theme.palette.grey[300],
                    mx: 2,
                    borderRadius: 1,
                    transition: "background-color 0.3s ease-in-out",
                    zIndex: 1,
                  }}
                />
              )}

              {/* Vertical connector for mobile */}
              {isMobile && index < steps.length - 1 && (
                <Box
                  sx={{
                    width: compact ? 2 : 3,
                    height: 24,
                    backgroundColor:
                      steps[index + 1].isComplete || isCompleted
                        ? theme.palette.success.main
                        : theme.palette.grey[300],
                    borderRadius: 1,
                    transition: "background-color 0.3s ease-in-out",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
}
