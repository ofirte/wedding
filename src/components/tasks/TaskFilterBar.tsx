import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Popover,
  Button,
  Divider,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useTranslation } from "../../localization/LocalizationContext";
import TasksProgressBar from "./TasksProgressBar";
import useTasks from "src/hooks/tasks/useTasks";

export interface TaskFilters {
  searchText: string;
  status: string; // "all" | "open" | "unassigned" | "inProgress" | "completed" | "pastDue"
  priority: string; // "" | "High" | "Medium" | "Low"
}

interface TaskFilterBarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  filters,
  onFiltersChange,
}) => {
  const { t } = useTranslation();
    const { data: tasks, isLoading } = useTasks();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchText: event.target.value,
    });
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      status: event.target.value,
    });
  };

  const handlePriorityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      priority: event.target.value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      searchText: "",
      status: "all",
      priority: "",
    });
    handleFilterClose();
  };

  const hasActiveFilters =
    filters.status !== "all" || filters.priority !== "";

  const open = Boolean(anchorEl);

  return (
    <Box display='flex' justifyContent='space-between' gap={2} sx={{ mb: 2 }}>
      <TextField
        sx={{ width: '80%'}}
        placeholder={t("tasks.searchTasks")}
        value={filters.searchText}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleFilterClick}
                color={hasActiveFilters ? "primary" : "default"}
                sx={{
                  transition: "all 0.2s ease-in-out",
                  ...(hasActiveFilters && {
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  }),
                }}
              >
                <FilterIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TasksProgressBar tasks={tasks ?? []} />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            p: 2,
            mt: 1,
            minWidth: 250,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          },
        }}
      >
        {/* Status Filter */}
        <Box sx={{ mb: 2 }}>
          <TextField
            select
            fullWidth
            label={t("tasks.statusFilter")}
            value={filters.status}
            onChange={handleStatusChange}
            size="small"
          >
            <MenuItem value="all">{t("common.allTasks")}</MenuItem>
            <MenuItem value="open">{t("tasks.open")}</MenuItem>
            <MenuItem value="unassigned">{t("tasks.unassigned")}</MenuItem>
            <MenuItem value="inProgress">{t("tasks.inProgress")}</MenuItem>
            <MenuItem value="completed">{t("common.completed")}</MenuItem>
            <MenuItem value="pastDue">{t("tasks.pastDue")}</MenuItem>
          </TextField>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Priority Filter */}
        <Box sx={{ mb: 2 }}>
          <TextField
            select
            fullWidth
            label={t("tasks.priorityFilter")}
            value={filters.priority}
            onChange={handlePriorityChange}
            size="small"
          >
            <MenuItem value="">{t("common.all")}</MenuItem>
            <MenuItem value="High">{t("common.high")}</MenuItem>
            <MenuItem value="Medium">{t("common.medium")}</MenuItem>
            <MenuItem value="Low">{t("common.low")}</MenuItem>
          </TextField>
        </Box>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <>
            <Divider sx={{ my: 2 }} />
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={handleClearFilters}
            >
              {t("tasks.clearFilters")}
            </Button>
          </>
        )}
      </Popover>
    </Box>
  );
};

export default TaskFilterBar;
