import React, { useState } from "react";
import {
  Popover,
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { LayoutElement } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";

interface LayoutElementPropertiesPopoverProps {
  element: LayoutElement | null;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onUpdate: (elementId: string, updates: Partial<LayoutElement>) => void;
  onDelete: (elementId: string) => void;
}

const LayoutElementPropertiesPopover: React.FC<LayoutElementPropertiesPopoverProps> = ({
  element,
  anchorEl,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const { t } = useTranslation();

  const [editedName, setEditedName] = useState<string>(element?.name || "");

  // Update local state when element changes
  React.useEffect(() => {
    if (element) {
      setEditedName(element.name || "");
    }
  }, [element]);

  if (!element) return null;

  const handleUpdate = (updates: Partial<LayoutElement>) => {
    onUpdate(element.id, updates);
  };

  const handleNameChange = (value: string) => {
    setEditedName(value);
    handleUpdate({ name: value });
  };

  const handleDeleteClick = () => {
    if (window.confirm(t("seating.setup.deleteConfirm"))) {
      onDelete(element.id);
      onClose();
    }
  };

  const getElementTypeLabel = () => {
    switch (element.type) {
      case "stage":
        return "Stage";
      case "bar":
        return "Bar";
      case "food-court":
        return "Food Court";
      case "dance-floor":
        return "Dance Floor";
      case "entrance":
        return "Entrance";
      case "bathroom":
        return "Restroom";
      default:
        return "Element";
    }
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      sx={{ ml: 2 }}
    >
      <Box sx={{ width: 320, p: 2 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Typography variant="h6">{getElementTypeLabel()}</Typography>

          <Divider />

          {/* Element Info */}
          <Box>
            <Typography variant="body2" color="text.secondary">
              Type: {getElementTypeLabel()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Size: {Math.round(element.size.width)} × {Math.round(element.size.height)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Position: ({Math.round(element.position.x)}, {Math.round(element.position.y)})
            </Typography>
          </Box>

          <Divider />

          {/* Quick Edit Fields */}
          <TextField
            label="Custom Name"
            value={editedName}
            onChange={(e) => handleNameChange(e.target.value)}
            size="small"
            fullWidth
            placeholder={getElementTypeLabel()}
            helperText="Optional custom name for this element"
          />

          <Divider />

          {/* Delete Button */}
          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
          >
            Delete Element
          </Button>
        </Stack>
      </Box>
    </Popover>
  );
};

export default LayoutElementPropertiesPopover;
