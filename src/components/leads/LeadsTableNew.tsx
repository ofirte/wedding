import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Event as EventIcon,
  Warning as WarningIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import {
  Lead,
  LeadStatus,
  LeadSource,
  LeadStatusColors,
} from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { useCreateLead, useUpdateLead, useDeleteLead } from "../../hooks/leads";

interface LeadsTableProps {
  leads: Lead[];
  onRowClick: (lead: Lead) => void;
}

const LeadSourceColors: Record<LeadSource, string> = {
  website: "#2196F3",
  referral: "#4CAF50",
  instagram: "#E91E63",
  facebook: "#1976D2",
  google: "#FF9800",
  wedding_fair: "#9C27B0",
  direct: "#00BCD4",
  other: "#9E9E9E",
};

const LeadsTableNew: React.FC<LeadsTableProps> = ({ leads, onRowClick }) => {
  const { t } = useTranslation();
  const [editingCell, setEditingCell] = useState<{
    leadId: string;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [newLeadName, setNewLeadName] = useState("");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const newLeadInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createLead } = useCreateLead();
  const { mutate: updateLead } = useUpdateLead();
  const { mutate: deleteLead } = useDeleteLead();

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const handleCellClick = (lead: Lead, field: keyof Lead) => {
    if (field === "id" || field === "producerId" || field === "createdAt") return;
    setEditingCell({ leadId: lead.id, field });
    setEditValue(String((lead as any)[field] || ""));
  };

  const handleCellBlur = (lead: Lead, field: string) => {
    if (editValue !== String((lead as any)[field] || "")) {
      const updates: Partial<Lead> = {};

      if (field === "budget" || field === "estimatedGuests") {
        updates[field as keyof Lead] = editValue ? Number(editValue) : undefined as any;
      } else {
        updates[field as keyof Lead] = editValue as any;
      }

      updateLead({
        id: lead.id,
        data: updates,
        previousData: lead,
      });
    }
    setEditingCell(null);
  };

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

  const handleNewLeadKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newLeadName.trim()) {
      e.preventDefault();

      createLead({
        name: newLeadName.trim(),
        email: "",
        status: "new",
        source: "website",
      });

      setNewLeadName("");
    } else if (e.key === "Escape") {
      setNewLeadName("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, lead: Lead, field: string) => {
    if (e.key === "Enter") {
      handleCellBlur(lead, field);
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  const isOverdue = (followUpDate?: string) => {
    if (!followUpDate) return false;
    return new Date(followUpDate) < new Date();
  };

  const renderCell = (lead: Lead, field: keyof Lead, showWarning: boolean = false) => {
    const value = lead[field];
    const isEditing = editingCell?.leadId === lead.id && editingCell?.field === field;

    if (field === "status") {
      return (
        <Select
          value={lead.status}
          onChange={(e) => handleStatusChange(lead, e.target.value as LeadStatus)}
          size="small"
          variant="standard"
          disableUnderline
          fullWidth
          sx={{
            "& .MuiSelect-select": {
              py: 0.5,
              px: 1.5,
              backgroundColor: LeadStatusColors[lead.status],
              color: "white",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.813rem",
              transition: "all 0.2s ease",
              "&:hover": {
                opacity: 0.9,
              },
            },
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {(["new", "initial_contact", "qualified", "proposal_sent", "contract_offered", "signed", "deposit_paid", "active_client", "lost"] as LeadStatus[]).map((status) => (
            <MenuItem
              key={status}
              value={status}
              sx={{
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              <Chip
                label={t(`leads.statuses.${status}`)}
                size="small"
                sx={{
                  backgroundColor: LeadStatusColors[status],
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  height: 24,
                }}
              />
            </MenuItem>
          ))}
        </Select>
      );
    }

    if (field === "source") {
      const sourceValue = lead.source || "website";
      return (
        <Select
          value={sourceValue}
          onChange={(e) => handleSourceChange(lead, e.target.value as LeadSource)}
          size="small"
          variant="standard"
          disableUnderline
          fullWidth
          sx={{
            "& .MuiSelect-select": {
              py: 0.5,
              px: 1.5,
              backgroundColor: LeadSourceColors[sourceValue],
              color: "white",
              borderRadius: "6px",
              fontWeight: 600,
              fontSize: "0.813rem",
              transition: "all 0.2s ease",
              "&:hover": {
                opacity: 0.9,
              },
            },
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {(["website", "referral", "instagram", "facebook", "google", "wedding_fair", "direct", "other"] as LeadSource[]).map((source) => (
            <MenuItem
              key={source}
              value={source}
              sx={{
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              <Chip
                label={t(`leads.sources.${source}`)}
                size="small"
                sx={{
                  backgroundColor: LeadSourceColors[source],
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  height: 24,
                }}
              />
            </MenuItem>
          ))}
        </Select>
      );
    }

    if (isEditing) {
      return (
        <TextField
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleCellBlur(lead, field)}
          onKeyDown={(e) => handleKeyDown(e, lead, field)}
          size="small"
          variant="standard"
          type={field === "budget" || field === "estimatedGuests" ? "number" : field === "weddingDate" || field === "followUpDate" ? "date" : "text"}
          fullWidth
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: "0.875rem",
              backgroundColor: "rgba(66, 133, 244, 0.08)",
              borderRadius: "6px",
              px: 1.5,
              py: 0.5,
            },
          }}
        />
      );
    }

    let displayValue = value;
    if (field === "weddingDate" || field === "followUpDate") {
      displayValue = value ? new Date(value as string).toLocaleDateString() : "";
    } else if (field === "budget") {
      displayValue = value ? `₪${(value as number).toLocaleString()}` : "";
    }

    return (
      <Box
        onClick={() => handleCellClick(lead, field)}
        sx={{
          cursor: "text",
          borderRadius: "6px",
          transition: "background-color 0.15s ease",
          px: 0.5,
          py: 0.5,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          width: "100%",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.02)",
          },
        }}
      >
        {showWarning && (
          <Tooltip title={t("leads.messages.followUpOverdue")}>
            <WarningIcon color="error" fontSize="small" />
          </Tooltip>
        )}
        <Typography
          variant="body2"
          noWrap
          sx={{
            fontSize: "0.875rem",
            color: displayValue ? "text.primary" : "text.disabled",
            fontWeight: field === "name" ? 600 : 400,
          }}
        >
          {displayValue || "-"}
        </Typography>
      </Box>
    );
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
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                backgroundColor: "#F8F9FA",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                color: "text.secondary",
                letterSpacing: "0.5px",
                borderBottom: "2px solid",
                borderColor: "divider",
                minWidth: 200,
                position: "sticky",
                left: 0,
                zIndex: 3,
              }}
            >
              {t("leads.columns.name")}
            </TableCell>
            <TableCell
              sx={{
                backgroundColor: "#F8F9FA",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                color: "text.secondary",
                letterSpacing: "0.5px",
                borderBottom: "2px solid",
                borderColor: "divider",
                minWidth: 200,
              }}
            >
              {t("leads.columns.email")}
            </TableCell>
            <TableCell
              sx={{
                backgroundColor: "#F8F9FA",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                color: "text.secondary",
                letterSpacing: "0.5px",
                borderBottom: "2px solid",
                borderColor: "divider",
                minWidth: 150,
              }}
            >
              {t("leads.columns.phone")}
            </TableCell>
            <TableCell
              sx={{
                backgroundColor: "#F8F9FA",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                color: "text.secondary",
                letterSpacing: "0.5px",
                borderBottom: "2px solid",
                borderColor: "divider",
                minWidth: 150,
              }}
            >
              {t("leads.columns.weddingDate")}
            </TableCell>
            <TableCell
              sx={{
                backgroundColor: "#F8F9FA",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                color: "text.secondary",
                letterSpacing: "0.5px",
                borderBottom: "2px solid",
                borderColor: "divider",
                minWidth: 130,
              }}
            >
              {t("leads.columns.budget")}
            </TableCell>
            <TableCell
              sx={{
                backgroundColor: "#F8F9FA",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                color: "text.secondary",
                letterSpacing: "0.5px",
                borderBottom: "2px solid",
                borderColor: "divider",
                minWidth: 160,
              }}
            >
              {t("leads.columns.status")}
            </TableCell>
            <TableCell
              sx={{
                backgroundColor: "#F8F9FA",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                color: "text.secondary",
                letterSpacing: "0.5px",
                borderBottom: "2px solid",
                borderColor: "divider",
                minWidth: 150,
              }}
            >
              {t("leads.columns.source")}
            </TableCell>
            <TableCell
              sx={{
                backgroundColor: "#F8F9FA",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                color: "text.secondary",
                letterSpacing: "0.5px",
                borderBottom: "2px solid",
                borderColor: "divider",
                minWidth: 150,
              }}
            >
              {t("leads.columns.followUp")}
            </TableCell>
            <TableCell
              sx={{
                backgroundColor: "#F8F9FA",
                fontWeight: 700,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                color: "text.secondary",
                letterSpacing: "0.5px",
                borderBottom: "2px solid",
                borderColor: "divider",
                width: 100,
              }}
            >
              {t("leads.columns.actions")}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} sx={{ py: 12, textAlign: "center", border: "none" }}>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 1, fontWeight: 500 }}
                >
                  {t("leads.messages.noLeads")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.disabled"
                  sx={{ fontSize: "0.813rem" }}
                >
                  Start by adding your first lead in the row below
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow
                key={lead.id}
                onMouseEnter={() => setHoveredRow(lead.id)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => onRowClick(lead)}
                sx={{
                  backgroundColor: hoveredRow === lead.id ? "#FAFBFC" : "transparent",
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
                <TableCell
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    position: "sticky",
                    left: 0,
                    backgroundColor: hoveredRow === lead.id ? "#FAFBFC" : "background.paper",
                    zIndex: 1,
                    transition: "background-color 0.15s ease",
                  }}
                >
                  {renderCell(lead, "name")}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {renderCell(lead, "email")}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {renderCell(lead, "phone")}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {renderCell(lead, "weddingDate")}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {renderCell(lead, "budget")}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {renderCell(lead, "status")}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {renderCell(lead, "source")}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {renderCell(lead, "followUpDate", isOverdue(lead.followUpDate))}
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                      opacity: hoveredRow === lead.id ? 1 : 0.3,
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    <Tooltip title={t("leads.activityPanel.title")}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowClick(lead);
                        }}
                        sx={{
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "primary.main",
                            color: "white",
                          },
                        }}
                      >
                        <EventIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("common.delete")}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleDelete(lead.id, e)}
                        sx={{
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "error.main",
                            color: "white",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>

    {/* Always-present Add Row - Fixed at bottom */}
    <Box
      sx={{
        borderTop: "2px dashed",
        borderColor: "divider",
        backgroundColor: "#F0F7FF",
        transition: "all 0.2s ease",
        px: 2,
        py: 1.5,
        "&:hover": {
          backgroundColor: "#E3F2FD",
          boxShadow: "inset 3px 0 0 #4285F4",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AddIcon sx={{ fontSize: "1.25rem", color: "primary.main" }} />
        <TextField
          ref={newLeadInputRef}
          placeholder={t("leads.form.startTyping") || "Type couple name and press Enter..."}
          value={newLeadName}
          onChange={(e) => setNewLeadName(e.target.value)}
          onKeyDown={handleNewLeadKeyDown}
          size="small"
          variant="standard"
          fullWidth
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "primary.main",
              "& ::placeholder": {
                color: "primary.main",
                opacity: 0.7,
              },
            },
          }}
        />
      </Box>
    </Box>
  </Box>
  );
};

export default LeadsTableNew;
