import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Box, IconButton, Divider, Tooltip } from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
} from "@mui/icons-material";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  editable?: boolean;
  autoFocus?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive: boolean;
  icon: React.ReactNode;
  tooltip: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  isActive,
  icon,
  tooltip,
}) => (
  <Tooltip title={tooltip}>
    <IconButton
      onClick={onClick}
      size="small"
      sx={{
        color: isActive ? "primary.main" : "text.secondary",
        backgroundColor: isActive ? "action.selected" : "transparent",
        "&:hover": {
          backgroundColor: "action.hover",
        },
      }}
    >
      {icon}
    </IconButton>
  </Tooltip>
);

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Start typing...",
  minHeight = 200,
  editable = true,
  autoFocus = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
    ],
    content,
    editable,
    autofocus: autoFocus ? "end" : false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "rich-text-editor-content",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
        backgroundColor: "background.paper",
      }}
    >
      {editable && (
        <>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.5,
              p: 1,
              backgroundColor: "grey.50",
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              icon={<FormatBold fontSize="small" />}
              tooltip="Bold (Ctrl+B)"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              icon={<FormatItalic fontSize="small" />}
              tooltip="Italic (Ctrl+I)"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              icon={<FormatUnderlined fontSize="small" />}
              tooltip="Underline (Ctrl+U)"
            />
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              icon={<FormatListBulleted fontSize="small" />}
              tooltip="Bullet List"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              icon={<FormatListNumbered fontSize="small" />}
              tooltip="Numbered List"
            />
          </Box>
        </>
      )}
      <Box
        sx={{
          p: 2,
          minHeight,
          "& .rich-text-editor-content": {
            outline: "none",
            minHeight: "inherit",
            "& p": {
              margin: 0,
              marginBottom: 1,
            },
            "& ul, & ol": {
              paddingLeft: 3,
              margin: 0,
              marginBottom: 1,
            },
            "& li": {
              marginBottom: 0.5,
            },
            "&:empty::before": {
              content: `"${placeholder}"`,
              color: "text.disabled",
              pointerEvents: "none",
            },
            "& p.is-editor-empty:first-child::before": {
              content: `"${placeholder}"`,
              color: "text.disabled",
              pointerEvents: "none",
              float: "left",
              height: 0,
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
};

export default RichTextEditor;
