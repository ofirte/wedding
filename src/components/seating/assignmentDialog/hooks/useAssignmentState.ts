import { useState, useMemo, useEffect } from "react";

interface UseAssignmentStateProps {
  open: boolean;
  initialAssignments?: Map<string, string[]>;
}

interface UseAssignmentStateReturn {
  assignments: Map<string, string[]>;
  setAssignments: React.Dispatch<React.SetStateAction<Map<string, string[]>>>;
  assignedGuestIds: Set<string>;
  resetAssignments: () => void;
}

/**
 * Custom hook to manage assignment state and sync with props
 * Fixes the bug where dialog doesn't update when reopened with new data
 */
export const useAssignmentState = ({
  open,
  initialAssignments,
}: UseAssignmentStateProps): UseAssignmentStateReturn => {
  const [assignments, setAssignments] = useState<Map<string, string[]>>(
    initialAssignments || new Map()
  );

  // FIX: Sync assignments state with initialAssignments prop when dialog opens
  // This ensures the dialog always shows current data after page refresh or reopening
  useEffect(() => {
    if (open && initialAssignments) {
      setAssignments(new Map(initialAssignments));
    }
  }, [open, initialAssignments]);

  // Calculate all assigned guest IDs
  const assignedGuestIds = useMemo(() => {
    const ids = new Set<string>();
    assignments.forEach((guestIds) => {
      guestIds.forEach((id) => ids.add(id));
    });
    return ids;
  }, [assignments]);

  // Helper to reset all assignments
  const resetAssignments = () => {
    setAssignments(new Map());
  };

  return {
    assignments,
    setAssignments,
    assignedGuestIds,
    resetAssignments,
  };
};
