import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  Popover,
  FormGroup,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Typography,
  Button,
  Divider,
  InputAdornment,
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
  status: string; // "all" | "unassigned" | "inProgress" | "completed"
  priority: string[]; // ["High", "Medium", "Low"]
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

  const handlePriorityChange = (priority: string) => {
    const newPriorities = filters.priority.includes(priority)
      ? filters.priority.filter((p) => p !== priority)
      : [...filters.priority, priority];

    onFiltersChange({
      ...filters,
      priority: newPriorities,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      searchText: "",
      status: "all",
      priority: [],
    });
    handleFilterClose();
  };

  const hasActiveFilters =
    filters.status !== "all" || filters.priority.length > 0;

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
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {t("tasks.statusFilter")}
          </Typography>
          <RadioGroup value={filters.status} onChange={handleStatusChange}>
            <FormControlLabel
              value="all"
              control={<Radio size="small" />}
              label={t("common.allTasks")}
            />
            <FormControlLabel
              value="unassigned"
              control={<Radio size="small" />}
              label={t("tasks.unassigned")}
            />
            <FormControlLabel
              value="inProgress"
              control={<Radio size="small" />}
              label={t("tasks.inProgress")}
            />
            <FormControlLabel
              value="completed"
              control={<Radio size="small" />}
              label={t("common.completed")}
            />
          </RadioGroup>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Priority Filter */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {t("tasks.priorityFilter")}
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={filters.priority.includes("High")}
                  onChange={() => handlePriorityChange("High")}
                />
              }
              label={t("common.high")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={filters.priority.includes("Medium")}
                  onChange={() => handlePriorityChange("Medium")}
                />
              }
              label={t("common.medium")}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={filters.priority.includes("Low")}
                  onChange={() => handlePriorityChange("Low")}
                />
              }
              label={t("common.low")}
            />
          </FormGroup>
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
