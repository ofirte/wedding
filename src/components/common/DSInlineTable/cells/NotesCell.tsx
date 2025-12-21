import { memo } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { NoteAdd as NoteAddIcon, Description as DescriptionIcon } from "@mui/icons-material";
import { getHtmlPreview } from "../../../../utils/htmlUtils";

interface NotesCellProps {
  value: string | undefined;
  onOpenEditor: () => void;
  addTooltip?: string;
  editTooltip?: string;
}

export const MemoizedNotesCell = memo(
  ({ value, onOpenEditor, addTooltip = "Add notes", editTooltip = "Edit notes" }: NotesCellProps) => {
    const hasContent = value && value.trim().length > 0;
    const preview = hasContent ? getHtmlPreview(value, 40) : null;
    const fullPreview = hasContent ? getHtmlPreview(value, 200) : null;

    // Show full content as tooltip if truncated, otherwise show action hint
    const isTruncated = hasContent && fullPreview && preview !== fullPreview;
    const tooltipContent = isTruncated ? fullPreview : (hasContent ? editTooltip : addTooltip);

    return (
      <Tooltip title={tooltipContent}>
        <Box
          onClick={onOpenEditor}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            height: 32,
            width: "100%",
            "&:hover": {
              backgroundColor: "action.hover",
            },
            borderRadius: 1,
            px: 1,
          }}
        >
          {hasContent ? (
            <DescriptionIcon
              fontSize="small"
              sx={{ color: "text.secondary", flexShrink: 0 }}
            />
          ) : (
            <NoteAddIcon
              fontSize="small"
              sx={{ color: "text.disabled", flexShrink: 0 }}
            />
          )}
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: hasContent ? "text.primary" : "text.disabled",
              flex: 1,
            }}
          >
            {hasContent ? preview : addTooltip}
          </Typography>
        </Box>
      </Tooltip>
    );
  }
);

MemoizedNotesCell.displayName = "MemoizedNotesCell";
