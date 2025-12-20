import React, { useMemo, useCallback, useState } from "react";
import { Lead } from "@wedding-plan/types";
import { useTranslation } from "../../localization/LocalizationContext";
import { useUpdateLead, useCreateLead, useDeleteLead } from "../../hooks/leads";
import { useLeadServices } from "../../hooks/leads/useLeadServices";
import DSInlineTable from "../common/DSInlineTable";
import { createLeadsInlineColumns } from "./LeadsInlineColumns";
import NotesEditorDrawer from "./NotesEditorDrawer";

interface LeadsTableProps {
  leads: Lead[];
  onOpenActivity: (lead: Lead) => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, onOpenActivity }) => {
  const { t } = useTranslation();
  const { mutateAsync: updateLead } = useUpdateLead();
  const { mutate: createLead } = useCreateLead();
  const { mutate: deleteLead } = useDeleteLead();
  const serviceOptions = useLeadServices(leads);

  // Notes drawer state
  const [notesLead, setNotesLead] = useState<Lead | null>(null);
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);

  // Handle opening notes editor
  const handleOpenNotes = useCallback((lead: Lead) => {
    setNotesLead(lead);
    setNotesDrawerOpen(true);
  }, []);

  // Handle closing notes editor
  const handleCloseNotes = useCallback(() => {
    setNotesDrawerOpen(false);
    setNotesLead(null);
  }, []);

  // Handle saving notes
  const handleSaveNotes = useCallback(
    async (content: string) => {
      if (!notesLead) return;
      await updateLead({
        id: notesLead.id,
        data: { notes: content },
        previousData: notesLead,
      });
    },
    [notesLead, updateLead]
  );

  // Handle cell updates - must return Promise for Tab navigation to work
  const handleCellUpdate = useCallback(
    async (rowId: string | number, field: string, value: any, row: Lead) => {
      await updateLead({
        id: rowId as string,
        data: { [field]: value },
        previousData: row,
      });
    },
    [updateLead]
  );

  // Handle adding new leads
  const handleAddRow = useCallback(
    (newRow: Omit<Lead, "id">, onSuccess?: (newRowId: string | number) => void) => {
      createLead(newRow as Omit<Lead, "id" | "producerId" | "createdAt">, {
        onSuccess: (data) => {
          if (onSuccess && data?.id) {
            onSuccess(data.id);
          }
        },
      });
    },
    [createLead]
  );

  // Column definitions
  const columns = useMemo(
    () => createLeadsInlineColumns(serviceOptions, onOpenActivity, handleOpenNotes, deleteLead, t),
    [serviceOptions, onOpenActivity, handleOpenNotes, deleteLead, t]
  );

  // Default values for new leads
  const defaultNewRow = useMemo(
    () => ({
      email: "",
      status: "new" as const,
      source: "website" as const,
      paymentStatus: "awaiting_payment" as const,
    }),
    []
  );

  return (
    <>
      <DSInlineTable
        columns={columns}
        data={leads}
        onCellUpdate={handleCellUpdate}
        showSearch
        searchFields={["name"]}
        defaultSortField="createdAt"
        enableInlineAdd
        addRowPlaceholder={t("leads.form.startTyping")}
        addRowField="name"
        defaultNewRow={defaultNewRow}
        onAddRow={handleAddRow}
        emptyMessage={t("leads.messages.noLeads")}
        mobileCardTitle={(lead) => lead.name}
      />
      <NotesEditorDrawer
        lead={notesLead}
        open={notesDrawerOpen}
        onClose={handleCloseNotes}
        onSave={handleSaveNotes}
      />
    </>
  );
};

export default LeadsTable;
