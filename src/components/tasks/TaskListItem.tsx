import React, { useMemo } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Checkbox,
  Collapse,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  MoreVert as MoreIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { Task } from "@wedding-plan/types";
import { format } from "date-fns";
import { he, enUS } from "date-fns/locale";
import { useTranslation } from "../../localization/LocalizationContext";
import { TaskBadge } from "./TaskBadge";
import { TaskAssignedAvatar } from "./TaskAssignedAvatar";
import {
  getPriorityBorderColor,
  getTaskBackgroundTint,
  getPriorityBadgeColor,
} from "./taskUtils";
import { useWeddingsDetails } from "../../hooks/wedding/useWeddingsDetails";
import { stringToColor } from "../../utils/ColorUtils";
import { useParams } from "react-router";

interface TaskListItemProps {
  task: Task & { weddingId?: string };
  isExpanded: boolean;
  onToggleExpand: (taskId: string, hasDescription: boolean) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onEdit: (task: Task) => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>, taskId: string) => void;
}

/**
 * A single task item in the task list
 */
export const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  isExpanded,
  onToggleExpand,
  onToggleComplete,
  onEdit,
  onMenuClick,
}) => {
  const { t, language } = useTranslation();
  const {weddingId } = useParams();
  const weddingIds = useMemo(() => (task.weddingId ? [task.weddingId] : [weddingId || ""]), [task.weddingId, weddingId]);
  const hasDescription = Boolean(task.description);
  const { data: weddingsDetails } = useWeddingsDetails(
   weddingIds
  );
  const dateLocale = useMemo(() => (language === "he" ? he : enUS), [language]);

  const taskWedding = useMemo(
    () => weddingsDetails?.find((wedding) => wedding.id === task.weddingId),
    [weddingsDetails, task.weddingId]
  );
  return (
    <Box
      sx={{
        mb: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        borderLeft: "4px solid",
        borderLeftColor: getPriorityBorderColor(task.priority),
        bgcolor: getTaskBackgroundTint(task),
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          borderColor: getPriorityBorderColor(task.priority),
        },
      }}
    >
      {/* Main task row */}
      <Box
        onClick={() => onToggleExpand(task.id, hasDescription)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.5,
          cursor: hasDescription ? "pointer" : "default",
        }}
      >
        {/* Checkbox */}
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Checkbox
            checked={task.completed}
            onChange={() => onToggleComplete(task.id, task.completed)}
            size="small"
            sx={{
              "&.Mui-checked": {
                color: "success.main",
              },
            }}
          />
        </Box>

        {/* Title */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: "14px",
              textDecoration: task.completed ? "line-through" : "none",
              color: task.completed ? "text.secondary" : "text.primary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {task.title}
          </Typography>
        </Box>

        {/* Badges */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            flexShrink: 0,
            flexWrap: "wrap",
          }}
        >
          {/* Wedding Badge (if multi-wedding context) */}
          {task.weddingId && taskWedding && (
            <Chip
              label={taskWedding.name}
              size="small"
              variant="outlined"
              sx={{
                height: 22,
                fontSize: "0.7rem",
                borderColor: stringToColor(task.weddingId),
                borderWidth: 2,
                color: stringToColor(task.weddingId),
                fontWeight: 600,
              }}
            />
          )}
          <TaskBadge
            label={t(`common.${task.priority.toLowerCase()}`)}
            color={getPriorityBadgeColor(task.priority)}
          />
          {task.dueDate && (
            <TaskBadge
              label={format(new Date(task.dueDate), "PPP", {
                locale: dateLocale,
              })}
              color="#7A9CB3"
            />
          )}
          {task.category && (
            <TaskBadge label={task.category} color="#9BBB9B" />
          )}
          {task.assignedTo && <TaskAssignedAvatar userId={task.assignedTo} />}
        </Box>

        {/* Actions */}
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          {hasDescription && (
            <IconButton size="small" sx={{ p: 0.5 }}>
              {isExpanded ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </IconButton>
          )}
          <Tooltip title={t("tasks.editTask")}>
            <IconButton
              size="small"
              onClick={() => onEdit(task)}
              sx={{ p: 0.5 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton
            size="small"
            onClick={(e) => onMenuClick(e, task.id)}
            sx={{ p: 0.5 }}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Expandable description */}
      {hasDescription && (
        <Collapse in={isExpanded}>
          <Box
            sx={{
              px: 2,
              pb: 2,
              pt: 0,
              ml: 5,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: "13px",
                lineHeight: 1.6,
                mt: 1.5,
              }}
            >
              {task.description}
            </Typography>
          </Box>
        </Collapse>
      )}
    </Box>
  );
};
