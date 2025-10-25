import React from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
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
  showTitle?: boolean;
  title?: string;
}

/**
 * Beautiful, reusable stepper component with consistent styling
 */
export default function DStepper({
  steps,
  activeStep,
  onStepClick,
  compact = false,
  showTitle = false,
  title,
}: DStepperProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.secondary.main}05)`,
        p: compact ? 2 : 3,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      {showTitle && title && (
        <Typography
          variant={compact ? "h5" : "h4"}
          gutterBottom
          sx={{
            fontWeight: 600,
            color: theme.palette.primary.main,
            textAlign: "center",
            mb: compact ? 2 : 3,
          }}
        >
          {title}
        </Typography>
      )}

      <Stepper
        activeStep={activeStep}
        orientation={isMobile ? "vertical" : "horizontal"}
        sx={{
          "& .MuiStepConnector-root": {
            top: compact ? 18 : 22,
            left: "calc(-50% + 16px)",
            right: "calc(50% + 16px)",
          },
          "& .MuiStepConnector-line": {
            height: compact ? 2 : 3,
            border: 0,
            backgroundColor: theme.palette.grey[300],
            borderRadius: 1,
          },
          "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": {
            backgroundColor: theme.palette.success.main,
          },
          "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": {
            backgroundColor: theme.palette.primary.main,
          },
        }}
      >
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const iconSize = compact ? 36 : 44;

          return (
            <Step key={step.id} completed={step.isComplete}>
              <StepLabel
                onClick={() => onStepClick?.(index)}
                sx={{
                  cursor: onStepClick ? "pointer" : "default",
                  "& .MuiStepLabel-root": {
                    padding: 0,
                  },
                  "& .MuiStepLabel-iconContainer": {
                    paddingRight: compact ? 1 : 2,
                  },
                  "& .MuiStepIcon-root": {
                    width: iconSize,
                    height: iconSize,
                    border: `${compact ? 2 : 3}px solid ${
                      step.isComplete
                        ? theme.palette.success.main
                        : isActive
                        ? theme.palette.primary.main
                        : theme.palette.grey[300]
                    }`,
                    borderRadius: "50%",
                    backgroundColor: step.isComplete
                      ? theme.palette.success.main
                      : isActive
                      ? theme.palette.primary.main
                      : theme.palette.background.paper,
                    color:
                      step.isComplete || isActive
                        ? theme.palette.common.white
                        : theme.palette.grey[500],
                    fontSize: compact ? "1rem" : "1.2rem",
                    fontWeight: 600,
                    transition: "all 0.3s ease-in-out",
                    "&:hover": onStepClick
                      ? {
                          transform: "scale(1.05)",
                          boxShadow: theme.shadows[2],
                        }
                      : {},
                  },
                  "& .MuiStepIcon-text": {
                    fill: "currentColor",
                    fontSize: compact ? "0.8rem" : "0.9rem",
                    fontWeight: 600,
                  },
                }}
              >
                <Box
                  display="flex"
                  flexDirection={isMobile ? "row" : "column"}
                  alignItems="center"
                  gap={isMobile ? 1.5 : compact ? 0.5 : 1}
                  sx={{
                    textAlign: "center",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": onStepClick
                      ? {
                          transform: "translateY(-1px)",
                        }
                      : {},
                  }}
                >
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {step.icon && (
                      <Typography
                        component="span"
                        sx={{
                          fontSize: compact ? "1.2em" : "1.4em",
                          filter: isActive
                            ? "drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
                            : "none",
                          transition: "filter 0.2s ease-in-out",
                        }}
                      >
                        {step.icon}
                      </Typography>
                    )}
                    {step.isComplete && (
                      <CompleteIcon
                        sx={{
                          color: theme.palette.success.main,
                          fontSize: compact ? "1rem" : "1.1rem",
                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
                        }}
                      />
                    )}
                  </Box>

                  <Box>
                    <Typography
                      variant={compact ? "body2" : "subtitle1"}
                      sx={{
                        fontWeight: isActive ? 700 : 600,
                        color: step.isComplete
                          ? theme.palette.success.dark
                          : isActive
                          ? theme.palette.primary.main
                          : theme.palette.text.primary,
                        transition: "color 0.2s ease-in-out",
                        mb: compact ? 0 : 0.5,
                        fontSize: compact ? "0.85rem" : undefined,
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
                          lineHeight: 1.2,
                          maxWidth: 100,
                          display: "block",
                        }}
                      >
                        {step.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}
