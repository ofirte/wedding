import React from "react";
import { Box, ToggleButtonGroup, ToggleButton, Tooltip } from "@mui/material";
import TableRowsIcon from "@mui/icons-material/TableRows";
import ListIcon from "@mui/icons-material/List";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InsightsIcon from "@mui/icons-material/Insights";
import { useTranslation } from "../../../localization/LocalizationContext";

export type TaskViewType = "table" | "list" | "calendar" | "stats";

interface TaskViewSwitcherProps {
  currentView: TaskViewType;
  onViewChange: (view: TaskViewType) => void;
  availableViews?: TaskViewType[];
}

const TaskViewSwitcher: React.FC<TaskViewSwitcherProps> = ({
  currentView,
  onViewChange,
  availableViews = ["table", "list", "calendar", "stats"],
}) => {
  const { t } = useTranslation();

  const viewConfig: Record<
    TaskViewType,
    { icon: React.ReactNode; label: string }
  > = {
    table: {
      icon: <TableRowsIcon fontSize="small" />,
      label: t("tasks.views.table"),
    },
    list: {
      icon: <ListIcon fontSize="small" />,
      label: t("tasks.views.grouped"),
    },
    calendar: {
      icon: <CalendarMonthIcon fontSize="small" />,
      label: t("tasks.views.calendar"),
    },
    stats: {
      icon: <InsightsIcon fontSize="small" />,
      label: t("tasks.views.stats"),
    },
  };

  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: TaskViewType | null
  ) => {
    if (newView !== null) {
      onViewChange(newView);
    }
  };

  return (
    <Box>
      <ToggleButtonGroup
        value={currentView}
        exclusive
        onChange={handleChange}
        size="small"
        aria-label={t("tasks.views.label")}
      >
        {availableViews.map((view) => (
          <Tooltip key={view} title={viewConfig[view].label}>
            <ToggleButton value={view} aria-label={viewConfig[view].label}>
              {viewConfig[view].icon}
            </ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

export default TaskViewSwitcher;
