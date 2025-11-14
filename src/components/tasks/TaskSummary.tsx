import React, { useMemo } from "react";
import { Box, Typography, LinearProgress, Grid, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Assignment as TaskIcon,
  Flag as PriorityIcon,
  CalendarToday as DateIcon,
  CheckCircle as CompletedIcon,
} from "@mui/icons-material";
import { Task } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { useTasksStats } from "src/hooks/tasks/useTasksStats";

interface TaskSummaryProps {
  tasks: Task[];
  onFilterChange?: (filterType: string) => void;
}


const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  elevation: 0,
  position: "relative",
  overflow: "hidden",
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
  transition: "all 0.3s ease-in-out",
  textAlign: "center",
  cursor: "pointer",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  },
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main,
  },
}));

const IconWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== "bgcolor",
})<{ bgcolor: string }>(({ bgcolor }) => ({
  width: 48,
  height: 48,
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: bgcolor,
  marginBottom: 8,
}));

const TaskSummary: React.FC<TaskSummaryProps> = ({ tasks, onFilterChange }) => {
  const { t } = useTranslation();
  const stats = useTasksStats(tasks);

  const handleCardClick = (filterType: string) => {
    if (onFilterChange) {
      onFilterChange(filterType);
    }
  };

  return (
    <Box>


      {/* Icon Stat Cards */}
      <Grid container spacing={2}>
        {/* Open Tasks Card */}
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard onClick={() => handleCardClick("open")}>
            <IconWrapper bgcolor="rgba(155, 187, 155, 0.15)">
              <TaskIcon sx={{ fontSize: 28, color: "primary.main" }} />
            </IconWrapper>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              {stats.open}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {t("tasks.openTasks")}
            </Typography>
          </StatCard>
        </Grid>

        {/* Completed Tasks Card */}
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard onClick={() => handleCardClick("completed")}>
            <IconWrapper bgcolor="rgba(109, 169, 122, 0.15)">
              <CompletedIcon sx={{ fontSize: 28, color: "success.main" }} />
            </IconWrapper>
            <Typography variant="h5" fontWeight={700} color="success.main">
              {stats.completed}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {t("common.completed")}
            </Typography>
          </StatCard>
        </Grid>

        {/* High Priority Card */}
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard onClick={() => handleCardClick("highPriority")}>
            <IconWrapper bgcolor="rgba(212, 185, 87, 0.15)">
              <PriorityIcon sx={{ fontSize: 28, color: "warning.main" }} />
            </IconWrapper>
            <Typography variant="h5" fontWeight={700} color="warning.dark">
              {stats.highPriority}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {t("common.highPriority")}
            </Typography>
          </StatCard>
        </Grid>

        {/* Past Due Card */}
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard onClick={() => handleCardClick("pastDue")}>
            <IconWrapper bgcolor="rgba(211, 47, 47, 0.15)">
              <DateIcon sx={{ fontSize: 28, color: "error.main" }} />
            </IconWrapper>
            <Typography variant="h5" fontWeight={700} color="error.main">
              {stats.pastDue}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {t("tasks.pastDue")}
            </Typography>
          </StatCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaskSummary;
