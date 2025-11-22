import { useState, useEffect, useRef } from "react";
import { Lead } from "@wedding-plan/types";
import { useUpdateLead } from "../../../hooks/leads";

export interface EditingCell {
  leadId: string;
  field: string;
}

export const useLeadCellEditing = () => {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null) as React.RefObject<HTMLInputElement>;
  const { mutate: updateLead } = useUpdateLead();

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
        updates[field as keyof Lead] = editValue ? Number(editValue) : (undefined as any);
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

  const handleKeyDown = (e: React.KeyboardEvent, lead: Lead, field: string) => {
    if (e.key === "Enter") {
      handleCellBlur(lead, field);
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  return {
    editingCell,
    editValue,
    inputRef,
    setEditValue,
    handleCellClick,
    handleCellBlur,
    handleKeyDown,
  };
};
