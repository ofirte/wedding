import { useState, useCallback } from "react";
import { Invitee } from "../../../../../shared/src/models/invitee";

interface UseGuestSelectionProps {
  filteredUnassignedGuests: Invitee[];
}

interface UseGuestSelectionReturn {
  selectedGuests: Set<string>;
  handleToggleGuest: (guestId: string) => void;
  handleSelectAll: () => void;
  clearSelection: () => void;
}

/**
 * Custom hook to manage guest selection state and operations
 */
export const useGuestSelection = ({
  filteredUnassignedGuests,
}: UseGuestSelectionProps): UseGuestSelectionReturn => {
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());

  // Toggle individual guest selection
  const handleToggleGuest = useCallback((guestId: string) => {
    setSelectedGuests((prev) => {
      const next = new Set(prev);
      if (next.has(guestId)) {
        next.delete(guestId);
      } else {
        next.add(guestId);
      }
      return next;
    });
  }, []);

  // Toggle select all filtered guests
  const handleSelectAll = useCallback(() => {
    if (selectedGuests.size === filteredUnassignedGuests.length) {
      setSelectedGuests(new Set());
    } else {
      setSelectedGuests(new Set(filteredUnassignedGuests.map((g) => g.id)));
    }
  }, [filteredUnassignedGuests, selectedGuests]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedGuests(new Set());
  }, []);

  return {
    selectedGuests,
    handleToggleGuest,
    handleSelectAll,
    clearSelection,
  };
};
