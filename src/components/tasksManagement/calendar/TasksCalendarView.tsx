import React, { useState, useMemo } from "react";
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Tooltip,
  Chip,
  Stack,
  Fade,
  alpha,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Circle,
  CheckCircle,
  Today,
} from "@mui/icons-material";
import { useTranslation } from "../../../localization/LocalizationContext";
import useAllWeddingsTasks from "src/hooks/tasks/useAllWeddingsTasks";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { he, enUS } from "date-fns/locale";
import { Task, Wedding } from "@wedding-plan/types";
import { useWeddingsDetails } from "src/hooks/wedding";
import { stringToColor } from "src/utils/ColorUtils";
import { useTasksManagement } from "../TasksManagementContext";

interface DayTasksProps {
  date: Date;
  tasks: (Task & { weddingId: string })[];
  isCurrentMonth: boolean;
  onDayClick: (date: Date) => void;
  weddingsDetails: Record<string, Wedding>;
}

const DayTasks: React.FC<DayTasksProps> = ({
  date,
  tasks,
  isCurrentMonth,
  onDayClick,
  weddingsDetails,
}) => {
  const { isRtl } = useTranslation();

  const dayTasks = tasks.filter(
    (task) => task.dueDate && isSameDay(new Date(task.dueDate), date)
  );

  const completedCount = dayTasks.filter((t) => t.completed).length;
  const isCurrentDay = isToday(date);

  return (
    <Paper
      elevation={0}
      onClick={() => onDayClick(date)}
      sx={{
        height: 120,
        p: 1.5,
        cursor: "pointer",
        position: "relative",
        bgcolor: isCurrentDay
          ? (theme) => alpha(theme.palette.primary.main, 0.08)
          : "background.paper",
        opacity: isCurrentMonth ? 1 : 0.4,
        border: 1,
        borderColor: isCurrentDay ? "primary.main" : "divider",
        borderWidth: isCurrentDay ? 2 : 1,
        transition: "all 0.2s ease-in-out",
        direction: isRtl ? "rtl" : "ltr",
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-2px)",
          boxShadow: 2,
          bgcolor: isCurrentDay
            ? (theme) => alpha(theme.palette.primary.main, 0.12)
            : (theme) => alpha(theme.palette.primary.main, 0.04),
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: isCurrentDay ? 700 : 500,
            color: isCurrentDay ? "primary.main" : "text.primary",
            fontSize: isCurrentDay ? "1rem" : "0.875rem",
          }}
        >
          {format(date, "d")}
        </Typography>
        {isCurrentDay && <Today sx={{ fontSize: 16, color: "primary.main" }} />}
      </Box>

      <Stack spacing={0.5} sx={{ maxHeight: 70, overflow: "hidden" }}>
        {dayTasks.slice(0, 2).map((task) => (
          <Tooltip
            key={task.id}
            title={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {task.title}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {weddingsDetails[task.weddingId]?.name || "Unknown Wedding"}
                </Typography>
              </Box>
            }
            placement="top"
            arrow
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                bgcolor: task.completed
                  ? (theme) => alpha(theme.palette.success.main, 0.1)
                  : (theme) => alpha(theme.palette.info.main, 0.1),
                border: 1,
                borderColor: task.completed ? "success.main" : "info.main",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  backgroundColor: stringToColor(task.weddingId),
                },
              }}
            >
              {task.completed ? (
                <CheckCircle
                  sx={{ fontSize: 10, color: "success.main", ml: 0.5 }}
                />
              ) : (
                <Circle sx={{ fontSize: 8, color: "info.main", ml: 0.5 }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.7rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textDecoration: task.completed ? "line-through" : "none",
                  opacity: task.completed ? 0.7 : 1,
                }}
              >
                {task.title}
              </Typography>
            </Box>
          </Tooltip>
        ))}
      </Stack>

      {dayTasks.length > 2 && (
        <Chip
          label={`+${dayTasks.length - 2}`}
          size="small"
          sx={{
            position: "absolute",
            bottom: 8,
            right: isRtl ? "auto" : 8,
            left: isRtl ? 8 : "auto",
            height: 20,
            fontSize: "0.65rem",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
            fontWeight: 600,
          }}
        />
      )}

      {dayTasks.length > 0 && completedCount === dayTasks.length && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: isRtl ? "auto" : 8,
            left: isRtl ? 8 : "auto",
          }}
        >
          <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />
        </Box>
      )}
    </Paper>
  );
};

const TasksCalendarView: React.FC = () => {
  const { t, language, isRtl } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { filterTasks } = useTasksManagement();

  const { data: notFilteredTasks = [], isLoading: isLoadingTasks } =
    useAllWeddingsTasks();
  const tasks = filterTasks(notFilteredTasks);
  const { data: weddingsDetails, isLoading: isLoadingWeddings } =
    useWeddingsDetails();
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const start = startOfWeek(monthStart, { weekStartsOn: isRtl ? 6 : 0 });
    const end = endOfWeek(monthEnd, { weekStartsOn: isRtl ? 6 : 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate, isRtl]);

  const dateLocale = useMemo(() => (language === "he" ? he : enUS), [language]);

  const weekDays = useMemo(() => {
    const days = [];
    const startDay = isRtl ? 6 : 0;
    for (let i = 0; i < 7; i++) {
      const dayIndex = (startDay + i) % 7;
      const date = new Date(2024, 0, dayIndex + 1);
      days.push(format(date, "EEE", { locale: dateLocale }));
    }
    return days;
  }, [dateLocale, isRtl]);

  const taskStats = useMemo(() => {
    const monthTasks = tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return isSameMonth(taskDate, currentDate);
    });

    return {
      total: monthTasks.length,
      completed: monthTasks.filter((t) => t.completed).length,
    };
  }, [tasks, currentDate]);

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
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: (theme) =>
            `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.05
            )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          border: 1,
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              sx={{
                bgcolor: "background.paper",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              {isRtl ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>

            <Typography variant="h5" sx={{ fontWeight: 600, minWidth: 200 }}>
              {format(currentDate, "MMMM yyyy", { locale: dateLocale })}
            </Typography>

            <IconButton
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              sx={{
                bgcolor: "background.paper",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              {isRtl ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>

            <IconButton
              onClick={() => setCurrentDate(new Date())}
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              <Today />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Chip
              label={`${taskStats.total} Tasks`}
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<CheckCircle sx={{ fontSize: 16 }} />}
              label={`${taskStats.completed} Completed`}
              color="success"
              variant="outlined"
            />
          </Box>
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ p: 2, border: 1, borderColor: "divider" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 1,
            mb: 1,
          }}
        >
          {weekDays.map((day) => (
            <Box
              key={day}
              sx={{
                textAlign: "center",
                py: 1,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                borderRadius: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "primary.main" }}
              >
                {day}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 1,
          }}
        >
          {calendarDays.map((date, index) => (
            <Fade key={index} in timeout={300 + index * 20}>
              <Box>
                <DayTasks
                  date={date}
                  tasks={tasks}
                  weddingsDetails={
                    weddingsDetails?.reduce((acc, wedding) => {
                      acc[wedding.id] = wedding;
                      return acc;
                    }, {} as Record<string, Wedding>) ?? {}
                  }
                  isCurrentMonth={isSameMonth(date, currentDate)}
                  onDayClick={setSelectedDate}
                />
              </Box>
            </Fade>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default TasksCalendarView;
