import React, { useMemo, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  GridReadyEvent,
  CellValueChangedEvent,
  RowClickedEvent,
  ICellRendererParams,
  ModuleRegistry,
  AllCommunityModule,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import "../../styles/ag-grid-sage-theme.css";
import {
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Box,
  SelectChangeEvent,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Event as EventIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Lead,
  LeadStatus,
  LeadSource,
  LeadStatusColors,
} from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { useUpdateLead, useDeleteLead } from "../../hooks/leads";

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface LeadsTableAGProps {
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

const LeadsTableAG: React.FC<LeadsTableAGProps> = ({ leads, onRowClick }) => {
  const { t, isRtl } = useTranslation();
  const gridRef = useRef<AgGridReact<Lead>>(null);

  const { mutate: updateLead } = useUpdateLead();
  const { mutate: deleteLead } = useDeleteLead();

  // Status Cell Renderer
  const StatusCellRenderer = (props: ICellRendererParams<Lead>) => {
    const handleChange = (event: SelectChangeEvent) => {
      const newStatus = event.target.value as LeadStatus;
      if (props.data) {
        updateLead({
          id: props.data.id,
          data: { status: newStatus },
          previousData: props.data,
        });
      }
    };

    if (!props.data) return null;

    return (
      <Select
        value={props.data.status}
        onChange={handleChange}
        size="small"
        variant="standard"
        disableUnderline
        fullWidth
        sx={{
          "& .MuiSelect-select": {
            py: 0.5,
            px: 1,
            backgroundColor: LeadStatusColors[props.data.status],
            color: "white",
            borderRadius: 1,
            fontWeight: "bold",
            fontSize: "0.875rem",
          },
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {(["new", "initial_contact", "qualified", "proposal_sent", "contract_offered", "signed", "deposit_paid", "active_client", "lost"] as LeadStatus[]).map((status) => (
          <MenuItem
            key={status}
            value={status}
            sx={{
              backgroundColor: LeadStatusColors[status],
              color: "white",
              fontWeight: "bold",
              fontSize: "0.875rem",
              "&:hover": {
                backgroundColor: LeadStatusColors[status],
                opacity: 0.9,
              },
              "&.Mui-selected": {
                backgroundColor: LeadStatusColors[status],
                "&:hover": {
                  backgroundColor: LeadStatusColors[status],
                  opacity: 0.9,
                },
              },
            }}
          >
            {t(`leads.statuses.${status}`)}
          </MenuItem>
        ))}
      </Select>
    );
  };

  // Source Cell Renderer
  const SourceCellRenderer = (props: ICellRendererParams<Lead>) => {
    const handleChange = (event: SelectChangeEvent) => {
      const newSource = event.target.value as LeadSource;
      if (props.data) {
        updateLead({
          id: props.data.id,
          data: { source: newSource },
          previousData: props.data,
        });
      }
    };

    if (!props.data) return null;
    const sourceValue = props.data.source || "website";

    return (
      <Select
        value={sourceValue}
        onChange={handleChange}
        size="small"
        variant="standard"
        disableUnderline
        fullWidth
        sx={{
          "& .MuiSelect-select": {
            py: 0.5,
            px: 1,
            backgroundColor: LeadSourceColors[sourceValue],
            color: "white",
            borderRadius: 1,
            fontWeight: "bold",
            fontSize: "0.875rem",
          },
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {(["website", "referral", "instagram", "facebook", "google", "wedding_fair", "direct", "other"] as LeadSource[]).map((source) => (
          <MenuItem
            key={source}
            value={source}
            sx={{
              backgroundColor: LeadSourceColors[source],
              color: "white",
              fontWeight: "bold",
              fontSize: "0.875rem",
              "&:hover": {
                backgroundColor: LeadSourceColors[source],
                opacity: 0.9,
              },
              "&.Mui-selected": {
                backgroundColor: LeadSourceColors[source],
                "&:hover": {
                  backgroundColor: LeadSourceColors[source],
                  opacity: 0.9,
                },
              },
            }}
          >
            {t(`leads.sources.${source}`)}
          </MenuItem>
        ))}
      </Select>
    );
  };

  // Actions Cell Renderer
  const ActionsCellRenderer = (props: ICellRendererParams<Lead>) => {
    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (props.data && window.confirm(t("leads.messages.confirmDelete"))) {
        deleteLead(props.data.id);
      }
    };

    const handleView = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (props.data) {
        onRowClick(props.data);
      }
    };

    if (!props.data) return null;

    return (
      <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", justifyContent: "center", height: "100%" }}>
        <Tooltip title={t("leads.activityPanel.title")}>
          <IconButton size="small" onClick={handleView}>
            <EventIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t("common.delete")}>
          <IconButton size="small" color="error" onClick={handleDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  };

  // Follow Up Cell Renderer (with overdue warning)
  const FollowUpCellRenderer = (props: ICellRendererParams<Lead>) => {
    if (!props.data || !props.data.followUpDate) return null;

    const isOverdue = new Date(props.data.followUpDate) < new Date();
    const formattedDate = new Date(props.data.followUpDate).toLocaleDateString();

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {isOverdue && (
          <Tooltip title={t("leads.messages.followUpOverdue")}>
            <WarningIcon color="error" fontSize="small" />
          </Tooltip>
        )}
        {formattedDate}
      </Box>
    );
  };

  // Budget Value Formatter
  const budgetValueFormatter = (params: any) => {
    if (params.value == null) return "";
    return `₪${Number(params.value).toLocaleString()}`;
  };

  // Date Value Formatter
  const dateValueFormatter = (params: any) => {
    if (!params.value) return "";
    return new Date(params.value).toLocaleDateString();
  };

  // Column Definitions
  const columnDefs = useMemo<ColDef<Lead>[]>(
    () => [
      {
        field: "name",
        headerName: t("leads.columns.name"),
        editable: true,
        pinned: isRtl ? "right" : "left",
        width: 200,
        cellStyle: { fontWeight: "500" },
      },
      {
        field: "email",
        headerName: t("leads.columns.email"),
        editable: true,
        width: 220,
      },
      {
        field: "phone",
        headerName: t("leads.columns.phone"),
        editable: true,
        width: 150,
      },
      {
        field: "weddingDate",
        headerName: t("leads.columns.weddingDate"),
        editable: true,
        width: 180,
        valueFormatter: dateValueFormatter,
        cellEditor: "agDateStringCellEditor",
      },
      {
        field: "budget",
        headerName: t("leads.columns.budget"),
        editable: true,
        width: 150,
        valueFormatter: budgetValueFormatter,
        cellEditor: "agNumberCellEditor",
      },
      {
        field: "estimatedGuests",
        headerName: t("leads.columns.estimatedGuests"),
        editable: true,
        width: 150,
        cellEditor: "agNumberCellEditor",
      },
      {
        field: "status",
        headerName: t("leads.columns.status"),
        width: 180,
        cellRenderer: StatusCellRenderer,
        editable: false,
      },
      {
        field: "source",
        headerName: t("leads.columns.source"),
        width: 180,
        cellRenderer: SourceCellRenderer,
        editable: false,
      },
      {
        field: "followUpDate",
        headerName: t("leads.columns.followUp"),
        editable: true,
        width: 180,
        cellRenderer: FollowUpCellRenderer,
        cellEditor: "agDateStringCellEditor",
      },
      {
        field: "notes",
        headerName: t("leads.columns.notes"),
        editable: true,
        width: 250,
      },
      {
        headerName: t("leads.columns.actions"),
        width: 120,
        cellRenderer: ActionsCellRenderer,
        editable: false,
        sortable: false,
        filter: false,
        pinned: isRtl ? "left" : "right",
      },
    ],
    [t, isRtl]
  );

  // Handle cell value changes
  const onCellValueChanged = useCallback(
    (event: CellValueChangedEvent<Lead>) => {
      if (!event.data) return;

      const field = event.colDef.field as keyof Lead;
      const newValue = event.newValue;

      // Prepare update data
      const updates: Partial<Lead> = {
        [field]: newValue,
      };

      updateLead({
        id: event.data.id,
        data: updates,
        previousData: event.data,
      });
    },
    [updateLead]
  );

  // Handle row click
  const onRowClicked = useCallback(
    (event: RowClickedEvent<Lead>) => {
      if (event.data) {
        onRowClick(event.data);
      }
    },
    [onRowClick]
  );

  // Default column properties
  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      editable: true,
    }),
    []
  );

  return (
    <Box sx={{ width: "100%", height: "600px" }} className="ag-theme-sage">
      <AgGridReact<Lead>
        ref={gridRef}
        rowData={leads}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onCellValueChanged={onCellValueChanged}
        onRowClicked={onRowClicked}
        getRowId={(params) => params.data.id}
        enableRtl={isRtl}
        animateRows={true}
        rowSelection="single"
        stopEditingWhenCellsLoseFocus={true}
        overlayNoRowsTemplate='<span style="padding: 40px; color: #666; font-size: 14px;">No leads yet. Click the button above to add your first lead.</span>'
      />
    </Box>
  );
};

export default LeadsTableAG;
