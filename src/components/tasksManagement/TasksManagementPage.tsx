import React from "react";
import { Box, Container, Paper } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import TasksHeader from "./header/TasksHeader";
import TasksStatsBar from "./stats/TasksStatsBar";
import TasksFiltersBar from "./filters/TasksFiltersBar";
import TasksCalendarView from "./calendar/TasksCalendarView";
import TasksListView from "./list/TasksListView";
import {
  TasksManagementProvider,
  useTasksManagement,
} from "./TasksManagementContext";

const TasksManagementContent: React.FC = () => {
  const { viewType, setViewType, filters, setFilters } = useTasksManagement();

  return (
    <Box sx={{ py: 4 }}>
      <TasksHeader currentView={viewType} onViewChange={setViewType} />

      <Paper sx={{ mt: 3, p: 3 }}>
        <TasksStatsBar />
        <TasksFiltersBar filters={filters} onFiltersChange={setFilters} />

        <Box sx={{ mt: 3 }}>
          {viewType === "calendar" ? <TasksCalendarView /> : <TasksListView />}
        </Box>
      </Paper>
    </Box>
  );
};

const TasksManagementPage: React.FC = () => {
  return (
    <TasksManagementProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Container maxWidth="xl">
          <TasksManagementContent />
        </Container>
      </LocalizationProvider>
    </TasksManagementProvider>
  );
};

export default TasksManagementPage;
