/**
 * TaskLibraryPanel Component
 * Left panel showing available tasks from previous templates
 * Users can search and add tasks to their template
 */

import React, { useState, useMemo } from "react";
import {
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  InputAdornment,
  Paper,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { TaskLibraryItem } from "../../utils/taskTemplateUtils";
import { useTranslation } from "../../localization/LocalizationContext";

interface TaskLibraryPanelProps {
  library: TaskLibraryItem[];
  onAddTask: (task: TaskLibraryItem) => void;
}

const TaskLibraryPanel: React.FC<TaskLibraryPanelProps> = ({
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

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: 1,
        borderColor: "divider",
        borderRadius: 0,
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="h6" gutterBottom>
          {t("taskTemplates.tasks")} {t("common.template")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("taskTemplates.selectFromPreviousTemplates")}
        </Typography>
      </Box>

      {/* Search */}
      <Box sx={{ px: 2, pb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t("common.search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Divider />

      {/* Task List */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        {filteredLibrary.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {searchQuery
                ? t("common.noResultsFound")
                : t("taskTemplates.noTasksInLibrary")}
            </Typography>
          </Box>
        ) : (
          <List dense>
            {filteredLibrary.map((task, index) => (
              <ListItem
                key={`${task.title}-${index}`}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onAddTask(task)}
                    color="primary"
                    title={t("common.add")}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                }
                sx={{
                  px: 2,
                  py: 1,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        pr: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {task.title}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box component="span" sx={{ fontSize: "0.75rem" }}>
                      {task.category && (
                        <Chip
                          label={task.category}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 18,
                            fontSize: "0.65rem",
                            mr: 0.5,
                          }}
                        />
                      )}
                      <Chip
                        label={t(`common.${task.priority.toLowerCase()}`)}
                        size="small"
                        color={
                          task.priority === "High"
                            ? "error"
                            : task.priority === "Medium"
                            ? "warning"
                            : "default"
                        }
                        variant="outlined"
                        sx={{ height: 18, fontSize: "0.65rem" }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default TaskLibraryPanel;
