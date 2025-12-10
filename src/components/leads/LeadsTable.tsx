import React, { useMemo, useCallback } from "react";
import { Lead, LeadStatus, LeadSource, LeadPaymentStatus } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { useUpdateLead } from "../../hooks/leads";
import { useLeadServices } from "../../hooks/leads/useLeadServices";
import { useNewLeadInput } from "./hooks/useNewLeadInput";
import { useLeadsTableColumns } from "./hooks/useLeadsTableColumns";
import DSTable, { SearchConfig } from "../common/DSTable";
import { DSAddRow } from "../common/DSAddRow";
import { useTableCellEditing, TypeConverter } from "../common/hooks/useTableCellEditing";

interface LeadsTableProps {
  leads: Lead[];
  onOpenActivity: (lead: Lead) => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, onOpenActivity }) => {
  const { t } = useTranslation();
  const { mutate: updateLead } = useUpdateLead();
  const serviceOptions = useLeadServices(leads);

  // Type converters for numeric fields
  const typeConverters: TypeConverter<Lead>[] = useMemo(() => [
    { field: "budget", convert: (val) => (val ? Number(val) : undefined) },
    { field: "quotation", convert: (val) => (val ? Number(val) : undefined) },
    { field: "advanceAmount", convert: (val) => (val ? Number(val) : undefined) },
    { field: "estimatedGuests", convert: (val) => (val ? Number(val) : undefined) },
  ], []);

  // Generic update handler for the editing hook
  const handleUpdate = useCallback(
    (id: string | number, field: keyof Lead, value: any, row: Lead) => {
      updateLead({
        id: id as string,
        data: { [field]: value },
        previousData: row,
      });
    },
    [updateLead]
  );

  const {
    editValue,
    inputRef,
    setEditValue,
    handleCellClick,
    handleCellBlur,
    handleKeyDown,
    isEditing,
  } = useTableCellEditing<Lead>({
    excludeFields: ["id", "producerId", "createdAt"],
    typeConverters,
    onUpdate: handleUpdate,
  });

  const { newLeadName, newLeadInputRef, setNewLeadName, handleNewLeadKeyDown, handleAddLead } = useNewLeadInput();

  // Select change handlers
  const handleStatusChange = useCallback(
    (lead: Lead, newStatus: LeadStatus) => {
      updateLead({
        id: lead.id,
        data: { status: newStatus },
        previousData: lead,
      });
    },
    [updateLead]
  );

  const handleSourceChange = useCallback(
    (lead: Lead, newSource: LeadSource) => {
      updateLead({
        id: lead.id,
        data: { source: newSource },
        previousData: lead,
      });
    },
    [updateLead]
  );

  const handlePaymentStatusChange = useCallback(
    (lead: Lead, newStatus: LeadPaymentStatus) => {
      updateLead({
        id: lead.id,
        data: { paymentStatus: newStatus },
        previousData: lead,
      });
    },
    [updateLead]
  );

  // Column definitions from hook
  const columns = useLeadsTableColumns({
    t,
    editValue,
    inputRef,
    isEditing,
    handleCellClick,
    handleCellBlur,
    handleKeyDown,
    setEditValue,
    serviceOptions,
    onStatusChange: handleStatusChange,
    onPaymentStatusChange: handlePaymentStatusChange,
    onSourceChange: handleSourceChange,
    onOpenActivity,
  });

  const renderAddRow = useCallback(
    () => (
      <DSAddRow
        value={newLeadName}
        placeholder={t("leads.form.startTyping") || "Type couple name and press Enter..."}
        inputRef={newLeadInputRef}
        onChange={setNewLeadName}
        onAdd={handleAddLead}
        onKeyDown={handleNewLeadKeyDown}
      />
    ),
    [newLeadName, newLeadInputRef, setNewLeadName, handleAddLead, handleNewLeadKeyDown, t]
  );

  const searchConfig: SearchConfig = useMemo(
    () => ({ columnIds: ["name"] }),
    []
  );

  return (
    <DSTable
      columns={columns}
      data={leads}
      variant="compact"
      renderAddRow={renderAddRow}
      searchConfig={searchConfig}
    />
  );
};

export default LeadsTable;
