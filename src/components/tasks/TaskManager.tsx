import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import TaskSummary from "./TaskSummary";
import useTasks from "../../hooks/tasks/useTasks";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

const TaskManager: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const {
    tasks = [],
    isUpdating,
    addTask,
    deleteTask,
    updateTask,
    assignTask,
    completeTask,
  } = useTasks();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Wedding Tasks
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Manage all your wedding preparation tasks in one place
        </Typography>

        <Box sx={{ mt: 4, mb: 2 }}>
          <StyledPaper>
            <TaskSummary tasks={tasks} />
          </StyledPaper>
        </Box>

        <StyledPaper>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              aria-label="task tabs"
            >
              <Tab label="All Tasks" />
              <Tab label="To Do" />
              <Tab label="In Progress" />
              <Tab label="Completed" />
            </Tabs>
          </Box>

          <Divider />

          <Box sx={{ mt: 2 }}>
            <TaskForm onAddTask={addTask} isSubmitting={isUpdating} />
          </Box>

          <Box sx={{ mt: 3 }}>
            {isUpdating && (
              <Box display="flex" justifyContent="center" my={2}>
                <CircularProgress size={24} />
              </Box>
            )}
            <TaskList
              tasks={tasks.filter((task) => {
                if (tabValue === 0) return true;
                if (tabValue === 1) return !task.assignedTo && !task.completed;
                if (tabValue === 2) return task.assignedTo && !task.completed;
                if (tabValue === 3) return task.completed;
                return true;
              })}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onAssignTask={assignTask}
              onCompleteTask={completeTask}
            />
          </Box>
        </StyledPaper>
      </Box>
    </Container>
  );
};

export default TaskManager;
