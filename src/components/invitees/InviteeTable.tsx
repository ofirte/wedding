import React, { useState } from "react";
import { Invitee } from "./InviteList";
import DSTable from "../common/DSTable";
import { Column } from "../common/DSTable";
import InviteeListActionCell from "./InviteeListActionCell";
import InviteeBulkActions from "./InviteeBulkActions";
import InviteeBulkUpdateDialog from "./InviteeBulkUpdateDialog";
import InviteeBulkDeleteDialog from "./InviteeBulkDeleteDialog";

interface InviteeTableProps {
  columns: Column<Invitee>[];
  invitees: Invitee[];
  onEditInvitee?: (invitee: Invitee) => void;
  onDeleteInvitee?: (invitee: Invitee) => void;
  onDisplayDataChange?: (invitees: Invitee[]) => void;
  onBulkUpdate?: (invitees: Invitee[], updates: Partial<Invitee>) => void;
  onBulkDelete?: (invitees: Invitee[]) => void;
  showExport: boolean;
}

const InviteeTable: React.FC<InviteeTableProps> = ({
  columns,
  invitees,
  onEditInvitee,
  onDeleteInvitee,
  onDisplayDataChange,
  onBulkUpdate,
  onBulkDelete,
  showExport,
}) => {
  const [selectedRows, setSelectedRows] = useState<Invitee[]>([]);
  const [bulkActionDialog, setBulkActionDialog] = useState<string | null>(null);

  const handleSelectionChange = (selected: Invitee[]) => {
    setSelectedRows(selected);
  };

  const handleBulkAction = (action: string) => {
    setBulkActionDialog(action);
  };

  const handleBulkActionClose = () => {
    setBulkActionDialog(null);
  };

  const handleBulkUpdateConfirm = (updates: Partial<Invitee>) => {
    onBulkUpdate?.(selectedRows, updates);
    handleBulkActionClose();
  };

  const handleBulkDeleteConfirm = () => {
    onBulkDelete?.(selectedRows);
    handleBulkActionClose();
  };

  return (
    <>
      <DSTable
        columns={columns.map((col) =>
          col.id === "actions"
            ? {
                ...col,
                render: (invitee: Invitee) => (
                  <InviteeListActionCell
                    invitee={invitee}
                    onEditInvitee={onEditInvitee}
                    onDeleteInvitee={onDeleteInvitee}
                  />
                ),
              }
            : col
        )}
        data={invitees}
        onDisplayedDataChange={onDisplayDataChange}
        showExport={showExport}
        showSelectColumn={true}
        onSelectionChange={handleSelectionChange}
        BulkActions={
          <InviteeBulkActions
            selectedRows={selectedRows}
            onBulkUpdate={() => handleBulkAction("update")}
            onBulkDelete={() => handleBulkAction("delete")}
          />
        }
      />

      <InviteeBulkUpdateDialog
        open={bulkActionDialog === "update"}
        selectedRows={selectedRows}
        onClose={handleBulkActionClose}
        onConfirm={handleBulkUpdateConfirm}
      />

      <InviteeBulkDeleteDialog
        open={bulkActionDialog === "delete"}
        selectedRows={selectedRows}
        onClose={handleBulkActionClose}
        onConfirm={handleBulkDeleteConfirm}
      />
    </>
  );
};

export default InviteeTable;
