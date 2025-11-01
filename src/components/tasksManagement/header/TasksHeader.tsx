import React from "react";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { ViewType } from "../types";
import { CalendarMonth, List, Insights } from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";

interface TasksHeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({
  currentView,
  onViewChange,
}) => {
  const { t } = useTranslation();

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: ViewType | null
  ) => {
    if (newView !== null) {
      onViewChange(newView);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" component="h1" fontWeight="bold">
        {t("tasksManagement.title")}
      </Typography>

      <ToggleButtonGroup
        value={currentView}
        exclusive
        onChange={handleViewChange}
        aria-label="view selector"
      >
        <ToggleButton value="calendar" aria-label="calendar view">
          <CalendarMonth />
        </ToggleButton>
        <ToggleButton value="list" aria-label="list view">
          <List />
        </ToggleButton>
        <ToggleButton value="stats" aria-label="stats view">
          <Insights />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default TasksHeader;
