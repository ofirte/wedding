import React, { useState } from "react";
import { Box, Table, TableBody, TableRow, TableCell, TableContainer, Typography } from "@mui/material";
import { Lead, LeadStatus, LeadSource } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { useUpdateLead, useDeleteLead } from "../../hooks/leads";
import { useLeadServices } from "../../hooks/leads/useLeadServices";
import { useLeadCellEditing } from "./hooks/useLeadCellEditing";
import { useNewLeadInput } from "./hooks/useNewLeadInput";
import { LeadsTableHeader } from "./components/LeadsTableHeader";
import { LeadsTableRow } from "./components/LeadsTableRow";
import { AddLeadRow } from "./components/AddLeadRow";

interface LeadsTableProps {
  leads: Lead[];
  onRowClick: (lead: Lead) => void;
}

const LeadsTableNew: React.FC<LeadsTableProps> = ({ leads, onRowClick }) => {
  const { t } = useTranslation();
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const { mutate: updateLead } = useUpdateLead();
  const { mutate: deleteLead } = useDeleteLead();
  const serviceOptions = useLeadServices(leads);

  const {
    editingCell,
    editValue,
    inputRef,
    setEditValue,
    handleCellClick,
    handleCellBlur,
    handleKeyDown,
  } = useLeadCellEditing();

  const { newLeadName, newLeadInputRef, setNewLeadName, handleNewLeadKeyDown } = useNewLeadInput();

  const handleStatusChange = (lead: Lead, newStatus: LeadStatus) => {
    updateLead({
      id: lead.id,
      data: { status: newStatus },
      previousData: lead,
    });
  };

  const handleSourceChange = (lead: Lead, newSource: LeadSource) => {
    updateLead({
      id: lead.id,
      data: { source: newSource },
      previousData: lead,
    });
  };

  const handleDelete = (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t("leads.messages.confirmDelete"))) {
      deleteLead(leadId);
    }
  };

  const isOverdue = (followUpDate?: string) => {
    if (!followUpDate) return false;
    return new Date(followUpDate) < new Date();
  };

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <TableContainer
        sx={{
          maxHeight: "calc(100vh - 350px)",
          "& .MuiTable-root": {
            borderCollapse: "separate",
            borderSpacing: 0,
          },
        }}
      >
        <Table stickyHeader>
          <LeadsTableHeader t={t} />
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} sx={{ py: 12, textAlign: "center", border: "none" }}>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                    {t("leads.messages.noLeads")}
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ fontSize: "0.813rem" }}>
                    Start by adding your first lead in the row below
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <LeadsTableRow
                  key={lead.id}
                  lead={lead}
                  isHovered={hoveredRow === lead.id}
                  editingCell={editingCell}
                  editValue={editValue}
                  serviceOptions={serviceOptions}
                  inputRef={inputRef}
                  onRowClick={onRowClick}
                  onRowHover={setHoveredRow}
                  onCellClick={handleCellClick}
                  onEditValueChange={setEditValue}
                  onCellBlur={handleCellBlur}
                  onKeyDown={handleKeyDown}
                  onStatusChange={handleStatusChange}
                  onSourceChange={handleSourceChange}
                  onDelete={handleDelete}
                  isOverdue={isOverdue}
                  activityTooltip={t("leads.activityPanel.title")}
                  deleteTooltip={t("common.delete")}
                  followUpOverdueTooltip={t("leads.messages.followUpOverdue")}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddLeadRow
        newLeadName={newLeadName}
        newLeadInputRef={newLeadInputRef}
        placeholder={t("leads.form.startTyping") || "Type couple name and press Enter..."}
        onNewLeadNameChange={setNewLeadName}
        onKeyDown={handleNewLeadKeyDown}
      />
    </Box>
  );
};

export default LeadsTableNew;
