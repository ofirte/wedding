import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Invitee } from "@wedding-plan/types";
import DSInlineTable from "../common/DSInlineTable";
import { createInviteeInlineColumns } from "./InviteeInlineColumns";
import { useTranslation } from "../../localization/LocalizationContext";
import InviteeBulkActions from "./InviteeBulkActions";
import InviteeBulkUpdateDialog from "./InviteeBulkUpdateDialog";
import InviteeBulkDeleteDialog from "./InviteeBulkDeleteDialog";

interface InviteeTableProps {
  invitees: Invitee[];
  onCellUpdate: (
    rowId: string | number,
    field: string,
    value: any,
    row: Invitee
  ) => void;
  onDeleteInvitee: (id: string) => void;
  onAddInvitee?: (newRow: Omit<Invitee, "id">, onSuccess?: (newRowId: string | number) => void) => void;
  onBulkUpdate?: (invitees: Invitee[], updates: Partial<Invitee>) => void;
  onBulkDelete?: (invitees: Invitee[]) => void;
}

const InviteeTable: React.FC<InviteeTableProps> = ({
  invitees,
  onCellUpdate,
  onDeleteInvitee,
  onAddInvitee,
  onBulkUpdate,
  onBulkDelete,
}) => {
  const { t } = useTranslation();
  const [selectedRows, setSelectedRows] = useState<Invitee[]>([]);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Relation options state - only updates when new relations are added
  const [relationOptions, setRelationOptions] = useState<string[]>([]);

  // Update relation options only when new relations appear (not on every data change)
  useEffect(() => {
    const newRelations = Array.from(
      new Set(invitees.map((inv) => inv.relation))
    ).filter(Boolean) as string[];

    // Only update if the relations actually changed
    setRelationOptions((prev) => {
      const hasNewRelations = newRelations.some((r) => !prev.includes(r));
      const hasRemovedRelations = prev.some((r) => !newRelations.includes(r));
      if (hasNewRelations || hasRemovedRelations || (prev.length === 0 && newRelations.length > 0)) {
        return newRelations;
      }
      return prev; // Return same reference to avoid re-render
    });
  }, [invitees]);

  // Create columns - re-creates when relationOptions change
  const columns = useMemo(() => {
    return createInviteeInlineColumns(onDeleteInvitee, t, relationOptions);
  }, [onDeleteInvitee, t, relationOptions]);

  // Selection change handler
  const handleSelectionChange = useCallback((rows: Invitee[]) => {
    setSelectedRows(rows);
  }, []);

  // Bulk action handlers
  const handleBulkUpdateOpen = useCallback(() => {
    setIsBulkUpdateOpen(true);
  }, []);

  const handleBulkUpdateClose = useCallback(() => {
    setIsBulkUpdateOpen(false);
  }, []);

  const handleBulkUpdateConfirm = useCallback(
    (updates: Partial<Invitee>) => {
      if (onBulkUpdate) {
        onBulkUpdate(selectedRows, updates);
      }
      setSelectedRows([]);
      setIsBulkUpdateOpen(false);
    },
    [onBulkUpdate, selectedRows]
  );

  const handleBulkDeleteOpen = useCallback(() => {
    setIsBulkDeleteOpen(true);
  }, []);

  const handleBulkDeleteClose = useCallback(() => {
    setIsBulkDeleteOpen(false);
  }, []);

  const handleBulkDeleteConfirm = useCallback(() => {
    if (onBulkDelete) {
      onBulkDelete(selectedRows);
    }
    setSelectedRows([]);
    setIsBulkDeleteOpen(false);
  }, [onBulkDelete, selectedRows]);

  // Bulk actions component
  const bulkActionsComponent = useMemo(
    () => (
      <InviteeBulkActions
        selectedRows={selectedRows}
        onBulkUpdate={handleBulkUpdateOpen}
        onBulkDelete={handleBulkDeleteOpen}
      />
    ),
    [selectedRows, handleBulkUpdateOpen, handleBulkDeleteOpen]
  );

  return (
    <>
      <DSInlineTable
        columns={columns}
        data={invitees}
        onCellUpdate={onCellUpdate}
        showSearch
        searchFields={["name", "cellphone", "relation"]}
        defaultSortField="createdAt"
        showSelectColumn={!!onBulkUpdate || !!onBulkDelete}
        selectedRows={selectedRows}
        onSelectionChange={handleSelectionChange}
        BulkActions={bulkActionsComponent}
        emptyMessage={t("guests.noGuests")}
        enableInlineAdd={!!onAddInvitee}
        addRowPlaceholder={t("guests.addGuestPlaceholder")}
        addRowField="name"
        defaultNewRow={{  amount: 1 }}
        onAddRow={onAddInvitee}
      />

      {/* Bulk Update Dialog */}
      <InviteeBulkUpdateDialog
        open={isBulkUpdateOpen}
        onClose={handleBulkUpdateClose}
        onConfirm={handleBulkUpdateConfirm}
        selectedRows={selectedRows}
        relationOptions={relationOptions}
      />

      {/* Bulk Delete Dialog */}
      <InviteeBulkDeleteDialog
        open={isBulkDeleteOpen}
        onClose={handleBulkDeleteClose}
        onConfirm={handleBulkDeleteConfirm}
        selectedRows={selectedRows}
      />
    </>
  );
};

export default InviteeTable;
