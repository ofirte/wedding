import React, { useState, useMemo } from "react";
import { Box, Typography, Paper, alpha, useTheme, Tooltip, Chip } from "@mui/material";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { he, enUS } from "date-fns/locale";
import { useTranslation } from "../../../localization/LocalizationContext";
import useAllWeddingsTasks from "src/hooks/tasks/useAllWeddingsTasks";
import { Task, Wedding } from "@wedding-plan/types";
import { useWeddingsDetails } from "src/hooks/wedding";
import { stringToColor } from "src/utils/ColorUtils";
import { useTasksManagement } from "../TasksManagementContext";
import { PRIORITY_COLORS } from "../../tasks/TaskInlineTable/TaskInlineColumns";
import { getTaskStatus } from "../../tasks/taskUtils";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Helper to strip HTML and truncate text for description preview
const truncateText = (text: string, maxLength: number): string => {
  const plainText = text.replace(/<[^>]*>/g, "");
  return plainText.length > maxLength
    ? plainText.slice(0, maxLength) + "..."
    : plainText;
};

// Custom event interface extending Task with wedding info
interface TaskEvent extends Event {
  task: Task & { weddingId?: string };
  weddingId?: string;
  weddingName: string;
}

const TasksCalendarView: React.FC = () => {
  const theme = useTheme();
  const { language, isRtl, t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const { filterTasks } = useTasksManagement();

  const { data: notFilteredTasks = [], isLoading: isLoadingTasks } =
    useAllWeddingsTasks();
  const tasks = filterTasks(notFilteredTasks);
  const { data: weddingsDetails, isLoading: isLoadingWeddings } =
    useWeddingsDetails();

  // Configure date-fns localizer
  const localizer = useMemo(
    () =>
      dateFnsLocalizer({
        format,
        parse,
        startOfWeek: () =>
          startOfWeek(new Date(), { weekStartsOn: isRtl ? 6 : 0 }),
        getDay,
        locales: { he, "en-US": enUS },
      }),
    [isRtl]
  );

  // Create weddings lookup map
  const weddingsMap = useMemo(() => {
    return (
      weddingsDetails?.reduce((acc, wedding) => {
        acc[wedding.id] = wedding;
        return acc;
      }, {} as Record<string, Wedding>) ?? {}
    );
  }, [weddingsDetails]);

  // Transform tasks into calendar events (status filter handles completed)
  const events: TaskEvent[] = useMemo(() => {
    return tasks
      .filter((task) => task.dueDate)
      .map((task) => ({
        title: task.title,
        start: new Date(task.dueDate!),
        end: new Date(task.dueDate!),
        task,
        weddingId: task.weddingId,
        weddingName: task.weddingId
          ? weddingsMap[task.weddingId]?.name || "Unknown Wedding"
          : "Producer Task",
      }));
  }, [tasks, weddingsMap]);

  // Custom event style getter
  const eventStyleGetter = (event: TaskEvent) => {
    const weddingColor = stringToColor(event.weddingId || "producer-task");
    return {
      style: {
        backgroundColor: alpha(weddingColor, 0.15),
        borderLeft: `3px solid ${weddingColor}`,
        color: theme.palette.text.primary,
        fontSize: "0.75rem",
        padding: "2px 4px",
        borderRadius: "4px",
      },
    };
  };

  // Helper to get translated status label
  const getStatusLabel = (task: Task): string => {
    const status = getTaskStatus(task);
    if (status === "completed") return t("tasks.status.completed");
    if (status === "in_progress") return t("tasks.status.inProgress");
    return t("tasks.status.notStarted");
  };

  // Helper to get translated priority label
  const getPriorityLabel = (priority: string): string => {
    if (priority === "High") return t("tasks.priority.high");
    if (priority === "Medium") return t("tasks.priority.medium");
    if (priority === "Low") return t("tasks.priority.low");
    return priority;
  };

  // Custom event component with priority indicator and tooltip
  const EventComponent = ({ event }: { event: TaskEvent }) => (
    <Tooltip
      title={
        <Box sx={{ p: 0.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {event.task.title}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 0.5, alignItems: "center" }}>
            <Chip
              size="small"
              label={getPriorityLabel(event.task.priority)}
              sx={{
                bgcolor: PRIORITY_COLORS[event.task.priority] || "#9e9e9e",
                color: "white",
                height: 20,
                fontSize: "0.65rem",
              }}
            />
            <Typography variant="caption">{getStatusLabel(event.task)}</Typography>
          </Box>
          {event.task.description && (
            <Typography
              variant="caption"
              sx={{ mt: 0.5, display: "block", color: "grey.300" }}
            >
              {truncateText(event.task.description, 100)}
            </Typography>
          )}
          <Typography
            variant="caption"
            sx={{ mt: 0.5, display: "block", fontStyle: "italic" }}
          >
            {event.weddingName}
          </Typography>
        </Box>
      }
      arrow
      placement="top"
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            flexShrink: 0,
            bgcolor: PRIORITY_COLORS[event.task.priority] || "#9e9e9e",
          }}
        />
        <Typography
          noWrap
          sx={{ fontSize: "0.7rem", fontWeight: 500, lineHeight: 1.2 }}
        >
          {event.task.title}
        </Typography>
      </Box>
    </Tooltip>
  );

  if (isLoadingTasks || isLoadingWeddings) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <Typography color="text.secondary">Loading calendar...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto" }}>
      <Paper elevation={1} sx={{ p: 2, border: 1, borderColor: "divider" }}>
        <Box
          sx={{
            height: 700,
            "& .rbc-calendar": {
              fontFamily: theme.typography.fontFamily,
            },
            "& .rbc-header": {
              padding: "12px 4px",
              fontWeight: 700,
              fontSize: "0.875rem",
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: "4px",
              borderBottom: `2px solid ${theme.palette.divider}`,
            },
            "& .rbc-today": {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
            "& .rbc-off-range-bg": {
              backgroundColor: alpha(theme.palette.action.disabled, 0.05),
            },
            "& .rbc-date-cell": {
              padding: "8px",
              fontSize: "0.875rem",
              fontWeight: 500,
            },
            "& .rbc-event": {
              padding: "2px 4px",
              marginBottom: "2px",
            },
            "& .rbc-event-content": {
              fontSize: "0.7rem",
            },
            "& .rbc-month-view": {
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "8px",
              overflow: "hidden",
            },
            "& .rbc-day-bg": {
              borderColor: theme.palette.divider,
            },
            "& .rbc-toolbar": {
              marginBottom: "16px",
              padding: "8px",
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
              borderRadius: "8px",
            },
            "& .rbc-toolbar button": {
              color: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              fontWeight: 500,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
              "&.rbc-active": {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              },
            },
          }}
        >
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            date={currentDate}
            onNavigate={(newDate) => setCurrentDate(newDate)}
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventComponent,
            }}
            culture={language}
            rtl={isRtl}
            views={["month"]}
            defaultView="month"
            popup
            popupOffset={{ x: 10, y: 10 }}
            messages={{
              today: t("tasksManagement.calendar.today"),
              previous: t("tasksManagement.calendar.back"),
              next: t("tasksManagement.calendar.next"),
              month: t("tasksManagement.calendar.month"),
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default TasksCalendarView;
