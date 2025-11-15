import React, { useState, useMemo } from "react";
import { Box, Typography, Paper, alpha, useTheme } from "@mui/material";
import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { he, enUS } from "date-fns/locale";
import { useTranslation } from "../../../localization/LocalizationContext";
import useAllWeddingsTasks from "src/hooks/tasks/useAllWeddingsTasks";
import { Task, Wedding } from "@wedding-plan/types";
import { useWeddingsDetails } from "src/hooks/wedding";
import { stringToColor } from "src/utils/ColorUtils";
import { useTasksManagement } from "../TasksManagementContext";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Custom event interface extending Task with wedding info
interface TaskEvent extends Event {
  task: Task;
  weddingId: string;
  weddingName: string;
}

const TasksCalendarView: React.FC = () => {
  const theme = useTheme();
  const { language, isRtl } = useTranslation();
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

  // Transform tasks into calendar events, excluding completed tasks
  const events: TaskEvent[] = useMemo(() => {
    return tasks
      .filter((task) => task.dueDate && !task.completed)
      .map((task) => ({
        title: task.title,
        start: new Date(task.dueDate!),
        end: new Date(task.dueDate!),
        task,
        weddingId: task.weddingId,
        weddingName: weddingsMap[task.weddingId]?.name || "Unknown Wedding",
      }));
  }, [tasks, weddingsMap]);

  // Custom event style getter
  const eventStyleGetter = (event: TaskEvent) => {
    const weddingColor = stringToColor(event.weddingId);
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

  // Custom event component
  const EventComponent = ({ event }: { event: TaskEvent }) => (
    <Box
      sx={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontSize: "0.7rem",
        fontWeight: 500,
      }}
    >
      {event.task.title}
    </Box>
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
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default TasksCalendarView;
