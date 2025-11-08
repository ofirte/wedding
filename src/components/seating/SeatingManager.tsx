import React, { useState, useMemo } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { Table, LayoutElement } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { useResponsive } from "../../utils/ResponsiveUtils";
import { useTables, useCreateTable, useUpdateTable, useDeleteTable, useBulkUpdateTables, useLayoutElements, useCreateLayoutElement, useUpdateLayoutElement } from "../../hooks/seating";
import { useInvitees } from "../../hooks/invitees";
import SeatingToolbar from "./SeatingToolbar";
import SeatingToolsSidebar from "./SeatingToolsSidebar";
import SeatingCanvas from "./SeatingCanvas";
import BulkAddTablesDialog from "./BulkAddTablesDialog";
import TablePropertiesPopover from "./TablePropertiesPopover";

const SeatingManager: React.FC = () => {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();

  // Data queries
  const { data: tables = [], isLoading: isLoadingTables, isError } = useTables();
  const { data: layoutElements = [] } = useLayoutElements();
  const { data: invitees = [] } = useInvitees();

  // Mutations
  const { mutate: createTable } = useCreateTable();
  const { mutate: updateTable } = useUpdateTable();
  const { mutate: deleteTable } = useDeleteTable();
  const { mutate: bulkUpdateTables } = useBulkUpdateTables();
  const { mutate: createLayoutElement } = useCreateLayoutElement();
  const { mutate: updateLayoutElement } = useUpdateLayoutElement();

  // Dialog states
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false);

  // Canvas states
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<HTMLElement | null>(null);

  // For now, use a single default arrangement ID
  // In the future, you can allow multiple arrangements
  const arrangementId = "default";

  // Get selected table
  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedTableId) || null,
    [tables, selectedTableId]
  );

  // Handle bulk table creation
  const handleBulkCreate = (newTables: Omit<Table, "id">[]) => {
    newTables.forEach((table) => {
      createTable(table);
    });
  };

  // Handle table selection
  const handleTableSelect = (tableId: string | null) => {
    setSelectedTableId(tableId);
    if (tableId) {
      // Set a dummy anchor element for the popover
      // In a real implementation, you'd get the actual element position
      const dummyAnchor = document.createElement("div");
      dummyAnchor.style.position = "fixed";
      dummyAnchor.style.top = "50%";
      dummyAnchor.style.left = "400px";
      document.body.appendChild(dummyAnchor);
      setPopoverAnchorEl(dummyAnchor);
    } else {
      if (popoverAnchorEl && document.body.contains(popoverAnchorEl)) {
        document.body.removeChild(popoverAnchorEl);
      }
      setPopoverAnchorEl(null);
    }
  };

  // Handle table movement
  const handleTableMove = (tableId: string, position: { x: number; y: number }) => {
    updateTable({
      id: tableId,
      data: { position },
    });
  };

  // Handle table property update
  const handleTableUpdate = (tableId: string, updates: Partial<Table>) => {
    updateTable({
      id: tableId,
      data: updates,
    });
  };

  // Handle table deletion
  const handleTableDelete = (tableId: string) => {
    deleteTable(tableId);
    handleTableSelect(null);
  };

  // Handle guest assignment
  const handleAssignGuest = (guestId: string, tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    // Check capacity
    if (table.assignedGuests.length >= table.capacity) {
      alert(t("seating.assignment.tableCapacityReached"));
      return;
    }

    // Remove from old table if exists
    const oldTable = tables.find((t) => t.assignedGuests.includes(guestId));
    if (oldTable) {
      updateTable({
        id: oldTable.id,
        data: {
          assignedGuests: oldTable.assignedGuests.filter((id) => id !== guestId),
        },
      });
    }

    // Add to new table
    updateTable({
      id: tableId,
      data: {
        assignedGuests: [...table.assignedGuests, guestId],
      },
    });
  };

  // Handle guest removal
  const handleRemoveGuest = (guestId: string, tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    updateTable({
      id: tableId,
      data: {
        assignedGuests: table.assignedGuests.filter((id) => id !== guestId),
      },
    });
  };

  // Handle auto-arrange
  const handleAutoArrange = () => {
    const gridCols = Math.ceil(Math.sqrt(tables.length));
    const spacing = 180;
    const startX = 100;
    const startY = 100;

    const updates = tables.map((table, index) => ({
      id: table.id,
      data: {
        position: {
          x: startX + (index % gridCols) * spacing,
          y: startY + Math.floor(index / gridCols) * spacing,
        },
      },
    }));

    bulkUpdateTables(updates);
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    // Template presets
    const templates: Record<string, Omit<Table, "id">[]> = {
      "standard-150": Array.from({ length: 15 }, (_, i) => ({
        arrangementId,
        number: i + 1,
        shape: "round" as const,
        capacity: 10,
        assignedGuests: [],
        position: {
          x: 100 + (i % 5) * 180,
          y: 100 + Math.floor(i / 5) * 180,
        },
      })),
      "intimate-50": Array.from({ length: 5 }, (_, i) => ({
        arrangementId,
        number: i + 1,
        shape: "round" as const,
        capacity: 10,
        assignedGuests: [],
        position: {
          x: 100 + (i % 3) * 180,
          y: 100 + Math.floor(i / 3) * 180,
        },
      })),
    };

    const selectedTemplate = templates[templateId];
    if (selectedTemplate) {
      handleBulkCreate(selectedTemplate);
    }
  };

  // Handle layout element creation
  const handleAddLayoutElement = (type: LayoutElement["type"]) => {
    const defaultSizes: Record<LayoutElement["type"], { width: number; height: number }> = {
      "stage": { width: 200, height: 100 },
      "bar": { width: 150, height: 80 },
      "food-court": { width: 180, height: 120 },
      "dance-floor": { width: 200, height: 200 },
      "entrance": { width: 100, height: 60 },
      "bathroom": { width: 80, height: 80 },
    };

    const newElement: Omit<LayoutElement, "id"> = {
      arrangementId,
      type,
      position: { x: 300, y: 300 }, // Center-ish starting position
      size: defaultSizes[type],
    };

    createLayoutElement(newElement);
  };

  // Handle layout element movement
  const handleElementMove = (elementId: string, position: { x: number; y: number }) => {
    updateLayoutElement({
      id: elementId,
      data: { position },
    });
  };

  // Handle layout element resize
  const handleElementResize = (elementId: string, size: { width: number; height: number }) => {
    updateLayoutElement({
      id: elementId,
      data: { size },
    });
  };

  // Handle popover close
  const handlePopoverClose = () => {
    handleTableSelect(null);
  };

  // Drag-drop backend - memoized to prevent recreation
  const backend = useMemo(() => isMobile ? TouchBackend : HTML5Backend, [isMobile]);

  if (isLoadingTables) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error" align="center">
          {t("seating.errors.loadingTables")}
        </Typography>
      </Box>
    );
  }

  return (
    <DndProvider backend={backend} key={isMobile ? "mobile" : "desktop"}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 120px)",
          bgcolor: "background.default",
        }}
      >
        {/* Top Toolbar */}
        <SeatingToolbar
          tables={tables}
          invitees={invitees}
          onAutoArrange={handleAutoArrange}
        />

        {/* Main Content: Sidebar + Canvas */}
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left Sidebar */}
          <SeatingToolsSidebar
            tables={tables}
            invitees={invitees}
            onBulkAddClick={() => setIsBulkAddDialogOpen(true)}
            onTemplateSelect={handleTemplateSelect}
            onAddLayoutElement={handleAddLayoutElement}
          />

          {/* Canvas Area */}
          <Box sx={{ flex: 1, position: "relative" }}>
            <SeatingCanvas
              tables={tables}
              layoutElements={layoutElements}
              selectedTableId={selectedTableId}
              selectedElementId={selectedElementId}
              onTableSelect={handleTableSelect}
              onElementSelect={setSelectedElementId}
              onTableMove={handleTableMove}
              onElementMove={handleElementMove}
              onElementResize={handleElementResize}
              onGuestDrop={handleAssignGuest}
            />
          </Box>
        </Box>

        {/* Dialogs */}
        <BulkAddTablesDialog
          open={isBulkAddDialogOpen}
          onClose={() => setIsBulkAddDialogOpen(false)}
          onCreate={handleBulkCreate}
          existingTables={tables}
          arrangementId={arrangementId}
        />

        <TablePropertiesPopover
          table={selectedTable}
          anchorEl={popoverAnchorEl}
          onClose={handlePopoverClose}
          onUpdate={handleTableUpdate}
          onDelete={handleTableDelete}
          onAssignGuest={handleAssignGuest}
          onRemoveGuest={handleRemoveGuest}
          allTables={tables}
          allInvitees={invitees}
        />
      </Box>
    </DndProvider>
  );
};

export default SeatingManager;
