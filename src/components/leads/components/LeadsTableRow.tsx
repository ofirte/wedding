import React from "react";
import { TableRow, TableCell } from "@mui/material";
import { Lead, LeadStatus, LeadSource } from "@wedding-plan/types";
import { EditingCell } from "../hooks/useLeadCellEditing";
import { StatusCell } from "../cells/StatusCell";
import { SourceCell } from "../cells/SourceCell";
import { ServiceCell } from "../cells/ServiceCell";
import { EditableTextCell } from "../cells/EditableTextCell";
import { ActionsCell } from "../cells/ActionsCell";
import { LEADS_TABLE_COLUMNS } from "../config/leadsTableColumns";

interface LeadsTableRowProps {
  lead: Lead;
  isHovered: boolean;
  editingCell: EditingCell | null;
  editValue: string;
  serviceOptions: string[];
  inputRef: React.RefObject<HTMLInputElement>;
  onRowClick: (lead: Lead) => void;
  onRowHover: (leadId: string | null) => void;
  onCellClick: (lead: Lead, field: keyof Lead) => void;
  onEditValueChange: (value: string) => void;
  onCellBlur: (lead: Lead, field: string) => void;
  onKeyDown: (e: React.KeyboardEvent, lead: Lead, field: string) => void;
  onStatusChange: (lead: Lead, newStatus: LeadStatus) => void;
  onSourceChange: (lead: Lead, newSource: LeadSource) => void;
  onDelete: (leadId: string, e: React.MouseEvent) => void;
  isOverdue: (followUpDate?: string) => boolean;
  activityTooltip: string;
  deleteTooltip: string;
  followUpOverdueTooltip: string;
}

export const LeadsTableRow: React.FC<LeadsTableRowProps> = ({
  lead,
  isHovered,
  editingCell,
  editValue,
  serviceOptions,
  inputRef,
  onRowClick,
  onRowHover,
  onCellClick,
  onEditValueChange,
  onCellBlur,
  onKeyDown,
  onStatusChange,
  onSourceChange,
  onDelete,
  isOverdue,
  activityTooltip,
  deleteTooltip,
  followUpOverdueTooltip,
}) => {
  const renderCell = (field: keyof Lead) => {
    const isEditing = editingCell?.leadId === lead.id && editingCell?.field === field;

    switch (field) {
      case "status":
        return <StatusCell lead={lead} onStatusChange={onStatusChange} />;

      case "source":
        return <SourceCell lead={lead} onSourceChange={onSourceChange} />;

      case "service":
        return (
          <ServiceCell
            lead={lead}
            isEditing={isEditing}
            editValue={editValue}
            serviceOptions={serviceOptions}
            inputRef={inputRef}
            onCellClick={onCellClick}
            onEditValueChange={onEditValueChange}
            onBlur={onCellBlur}
            onKeyDown={onKeyDown}
          />
        );

      case "followUpDate":
        return (
          <EditableTextCell
            lead={lead}
            field={field}
            isEditing={isEditing}
            editValue={editValue}
            inputRef={inputRef}
            showWarning={isOverdue(lead.followUpDate)}
            warningTooltip={followUpOverdueTooltip}
            onCellClick={onCellClick}
            onEditValueChange={onEditValueChange}
            onBlur={onCellBlur}
            onKeyDown={onKeyDown}
          />
        );

      default:
        return (
          <EditableTextCell
            lead={lead}
            field={field}
            isEditing={isEditing}
            editValue={editValue}
            inputRef={inputRef}
            onCellClick={onCellClick}
            onEditValueChange={onEditValueChange}
            onBlur={onCellBlur}
            onKeyDown={onKeyDown}
          />
        );
    }
  };

  return (
    <TableRow
      onMouseEnter={() => onRowHover(lead.id)}
      onMouseLeave={() => onRowHover(null)}
      onClick={() => onRowClick(lead)}
      sx={{
        backgroundColor: isHovered ? "#FAFBFC" : "transparent",
        transition: "all 0.15s ease",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#FAFBFC",
          boxShadow: "inset 3px 0 0 #4285F4",
        },
        "& .MuiTableCell-root": {
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 1.5,
        },
      }}
    >
      {LEADS_TABLE_COLUMNS.map((column) => (
        <TableCell
          key={column.field}
          onClick={(e) => e.stopPropagation()}
          sx={{
            ...(column.sticky && {
              position: "sticky",
              left: 0,
              backgroundColor: isHovered ? "#FAFBFC" : "background.paper",
              zIndex: 1,
              transition: "background-color 0.15s ease",
              borderRight: "2px solid",
              borderRightColor: "divider",
              boxShadow: "2px 0 4px rgba(0, 0, 0, 0.05)",
            }),
          }}
        >
          {renderCell(column.field)}
        </TableCell>
      ))}
      <TableCell>
        <ActionsCell
          lead={lead}
          isHovered={isHovered}
          onViewActivity={onRowClick}
          onDelete={onDelete}
          activityTooltip={activityTooltip}
          deleteTooltip={deleteTooltip}
        />
      </TableCell>
    </TableRow>
  );
};
