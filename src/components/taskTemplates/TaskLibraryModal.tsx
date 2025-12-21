/**
 * TaskLibraryModal Component
 * Modal dialog for browsing and adding tasks from the task library
 */

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { TaskLibraryItem, formatRelativeDueDate } from "../../utils/taskTemplateUtils";
import { useTranslation } from "../../localization/LocalizationContext";

interface TaskLibraryModalProps {
  open: boolean;
  onClose: () => void;
  library: TaskLibraryItem[];
  onAddTask: (task: TaskLibraryItem) => void;
}

const TaskLibraryModal: React.FC<TaskLibraryModalProps> = ({
  open,
  onClose,
  library,
  onAddTask,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter library based on search query
  const filteredLibrary = useMemo(() => {
    if (!searchQuery.trim()) return library;

    const query = searchQuery.toLowerCase();
    return library.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.category?.toLowerCase().includes(query)
    );
  }, [library, searchQuery]);

  // Reset search when modal closes
  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  // Handle adding a task
  const handleAddTask = (task: TaskLibraryItem) => {
    onAddTask(task);
    // Don't close the modal - allow adding multiple tasks
  };

  // Format relative due date for display
  const getRelativeDateDisplay = (task: TaskLibraryItem): string => {
    if (
      task.relativeDueDate === undefined ||
      !task.relativeDueDateUnit ||
      !task.relativeDueDateDirection
    ) {
      return "";
    }
    return formatRelativeDueDate(
      task.relativeDueDate,
      task.relativeDueDateUnit,
      task.relativeDueDateDirection,
      t
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: "80vh",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">
            {t("taskTemplates.selectFromPreviousTemplates")}
          </Typography>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0 }}>
        {/* Search */}
        <Box sx={{ p: 2, pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t("common.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Task List */}
        <Box sx={{ maxHeight: 400, overflow: "auto" }}>
          {filteredLibrary.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {searchQuery
                  ? t("common.noResultsFound")
                  : t("taskTemplates.noTasksInLibrary")}
              </Typography>
            </Box>
          ) : (
            <List dense disablePadding>
              {filteredLibrary.map((task, index) => (
                <ListItem
                  key={`${task.title}-${index}`}
                  divider={index < filteredLibrary.length - 1}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => handleAddTask(task)}
                      color="primary"
                      title={t("common.add")}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{
                    px: 2,
                    py: 1.5,
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500}>
                        {task.title}
                      </Typography>
                    }
                    secondary={
                      <Box
                        component="span"
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <Chip
                          label={t(`tasks.priority.${task.priority.toLowerCase()}`)}
                          size="small"
                          color={
                            task.priority === "High"
                              ? "error"
                              : task.priority === "Medium"
                              ? "warning"
                              : "default"
                          }
                          variant="outlined"
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                        {task.category && (
                          <Chip
                            label={task.category}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: "0.7rem" }}
                          />
                        )}
                        {getRelativeDateDisplay(task) && (
                          <Chip
                            label={getRelativeDateDisplay(task)}
                            size="small"
                            variant="outlined"
                            color="info"
                            sx={{ height: 20, fontSize: "0.7rem" }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Footer info */}
        {library.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1.5, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">
                {filteredLibrary.length} {t("taskTemplates.tasks").toLowerCase()}
                {searchQuery && ` (${t("common.search").toLowerCase()}: "${searchQuery}")`}
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskLibraryModal;
