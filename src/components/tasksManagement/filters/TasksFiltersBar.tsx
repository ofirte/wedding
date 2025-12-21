import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { useTranslation } from "../../../localization/LocalizationContext";
import { TaskFilter } from "../types";
import { useWeddingsDetails } from "src/hooks/wedding";

interface TasksFiltersBarProps {
  filters: TaskFilter;
  onFiltersChange: (newFilters: TaskFilter) => void;
  hideWeddingFilter?: boolean;
}

const STATUS_OPTIONS = [
  { value: "not_started", labelKey: "tasks.status.notStarted" },
  { value: "in_progress", labelKey: "tasks.status.inProgress" },
  { value: "completed", labelKey: "tasks.status.completed" },
] as const;

const PRIORITY_OPTIONS = [
  { value: "High", labelKey: "tasks.priority.high" },
  { value: "Medium", labelKey: "tasks.priority.medium" },
  { value: "Low", labelKey: "tasks.priority.low" },
] as const;

const TasksFiltersBar: React.FC<TasksFiltersBarProps> = ({
  filters,
  onFiltersChange,
  hideWeddingFilter = false,
}) => {
  const { t } = useTranslation();
  const { data: weddings = [] } = useWeddingsDetails();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      searchText: event.target.value,
    });
  };

  const handleWeddingChange = (event: SelectChangeEvent<string>) => {
    onFiltersChange({
      ...filters,
      wedding: event.target.value || null,
    });
  };

  const handleStatusChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const statusArray = typeof value === "string" ? value.split(",") : value;
    onFiltersChange({
      ...filters,
      status: statusArray.length > 0
        ? statusArray as ("not_started" | "in_progress" | "completed")[]
        : null,
    });
  };

  const handlePriorityChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const priorityArray = typeof value === "string" ? value.split(",") : value;
    onFiltersChange({
      ...filters,
      priority: priorityArray.length > 0
        ? priorityArray as ("High" | "Medium" | "Low")[]
        : null,
    });
  };

  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
      {/* Search Field */}
      <TextField
        label={t("tasksManagement.filters.search")}
        value={filters.searchText}
        onChange={handleSearchChange}
        size="small"
        sx={{ minWidth: 200, flexGrow: 1 }}
      />

      {/* Wedding Select */}
      {!hideWeddingFilter && (
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>{t("tasksManagement.filters.wedding")}</InputLabel>
          <Select
            value={filters.wedding || ""}
            onChange={handleWeddingChange}
            label={t("tasksManagement.filters.wedding")}
          >
            <MenuItem value="">
              {t("tasksManagement.filters.allWeddings")}
            </MenuItem>
            {weddings.map((wedding) => (
              <MenuItem key={wedding.id} value={wedding.id}>
                {wedding.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Status Multiselect */}
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>{t("common.status")}</InputLabel>
        <Select
          multiple
          value={filters.status || []}
          onChange={handleStatusChange}
          input={<OutlinedInput label={t("common.status")} />}
          renderValue={(selected) =>
            selected
              .map((val) => {
                const option = STATUS_OPTIONS.find((o) => o.value === val);
                return option ? t(option.labelKey) : val;
              })
              .join(", ")
          }
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Checkbox checked={(filters.status || []).includes(option.value)} />
              <ListItemText primary={t(option.labelKey)} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Priority Multiselect */}
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>{t("common.priority")}</InputLabel>
        <Select
          multiple
          value={filters.priority || []}
          onChange={handlePriorityChange}
          input={<OutlinedInput label={t("common.priority")} />}
          renderValue={(selected) =>
            selected
              .map((val) => {
                const option = PRIORITY_OPTIONS.find((o) => o.value === val);
                return option ? t(option.labelKey) : val;
              })
              .join(", ")
          }
        >
          {PRIORITY_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Checkbox checked={(filters.priority || []).includes(option.value)} />
              <ListItemText primary={t(option.labelKey)} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default TasksFiltersBar;
