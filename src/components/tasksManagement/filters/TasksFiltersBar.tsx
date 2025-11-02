import React from "react";
import { Box, TextField, MenuItem, Stack } from "@mui/material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { TaskFilter } from "../types";
import { useWeddingsDetails } from "src/hooks/wedding";

interface TasksFiltersBarProps {
  filters: TaskFilter;
  onFiltersChange: (newFilters: TaskFilter) => void;
}

const TasksFiltersBar: React.FC<TasksFiltersBarProps> = ({
  filters,
  onFiltersChange,
}) => {
  const { t } = useTranslation();
  const { data: weddings = [] } = useWeddingsDetails();
  const handleWeddingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      wedding: event.target.value,
    });
  };

  const handlePriorityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      priority: value ? [value as "High" | "Medium" | "Low"] : null,
    });
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value) {
      onFiltersChange({
        ...filters,
        status: value as "unassigned" | "inProgress" | "completed" | "all",
      });
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchText: event.target.value,
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Stack spacing={2}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label={t("tasksManagement.filters.search")}
            value={filters.searchText}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1 }}
            size="small"
          />

          <TextField
            select
            label={t("tasksManagement.filters.wedding")}
            value={filters.wedding || ""}
            onChange={handleWeddingChange}
            sx={{ minWidth: 200 }}
            size="small"
          >
            <MenuItem value="">
              {t("tasksManagement.filters.allWeddings")}
            </MenuItem>
            {weddings.map((wedding) => (
              <MenuItem key={wedding.id} value={wedding.id}>
                {wedding.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label={t("tasksManagement.filters.priority")}
            value={filters.priority?.[0] || ""}
            onChange={handlePriorityChange}
            sx={{ minWidth: 120 }}
            size="small"
          >
            <MenuItem value="">
              {t("tasksManagement.filters.allPriorities")}
            </MenuItem>
            <MenuItem value="High">
              {t("tasksManagement.filters.priorities.high")}
            </MenuItem>
            <MenuItem value="Medium">
              {t("tasksManagement.filters.priorities.medium")}
            </MenuItem>
            <MenuItem value="Low">
              {t("tasksManagement.filters.priorities.low")}
            </MenuItem>
          </TextField>

          <TextField
            select
            label={t("tasksManagement.filters.status")}
            value={filters.status}
            onChange={handleStatusChange}
            sx={{ minWidth: 120 }}
            size="small"
          >
            <MenuItem value="all">
              {t("tasksManagement.filters.statuses.all")}
            </MenuItem>
            <MenuItem value="unassigned">
              {t("tasksManagement.filters.statuses.unassigned")}
            </MenuItem>
            <MenuItem value="inProgress">
              {t("tasksManagement.filters.statuses.inProgress")}
            </MenuItem>
            <MenuItem value="completed">
              {t("tasksManagement.filters.statuses.completed")}
            </MenuItem>
          </TextField>
        </Box>
      </Stack>
    </Box>
  );
};

export default TasksFiltersBar;
