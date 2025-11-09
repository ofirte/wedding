import { useState, useMemo } from "react";
import { Invitee } from "../../../../../shared/src/models/invitee";

interface UseFilteredGuestsProps {
  invitees: Invitee[];
  assignedGuestIds: Set<string>;
}

interface UseFilteredGuestsReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  relationFilter: string;
  setRelationFilter: (filter: string) => void;
  sideFilter: string;
  setSideFilter: (filter: string) => void;
  unassignedGuests: Invitee[];
  filteredUnassignedGuests: Invitee[];
  relations: string[];
  sides: string[];
}

/**
 * Custom hook to manage guest filtering and search
 */
export const useFilteredGuests = ({
  invitees,
  assignedGuestIds,
}: UseFilteredGuestsProps): UseFilteredGuestsReturn => {
  const [searchQuery, setSearchQuery] = useState("");
  const [relationFilter, setRelationFilter] = useState<string>("all");
  const [sideFilter, setSideFilter] = useState<string>("all");

  // Get unassigned guests - only include confirmed attending guests
  const unassignedGuests = useMemo(() => {
    return invitees.filter((invitee) => {
      // Filter out already assigned guests
      if (assignedGuestIds.has(invitee.id)) return false;

      // Only include guests who have confirmed attendance
      if (!invitee.rsvpStatus?.attendance) return false;

      return true;
    });
  }, [invitees, assignedGuestIds]);

  // Apply filters to unassigned guests
  const filteredUnassignedGuests = useMemo(() => {
    return unassignedGuests.filter((guest) => {
      const matchesSearch = guest.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesRelation =
        relationFilter === "all" || guest.relation === relationFilter;
      const matchesSide = sideFilter === "all" || guest.side === sideFilter;
      return matchesSearch && matchesRelation && matchesSide;
    });
  }, [unassignedGuests, searchQuery, relationFilter, sideFilter]);

  // Get unique relations and sides for filters
  const { relations, sides } = useMemo(() => {
    const relationsSet = new Set<string>();
    const sidesSet = new Set<string>();
    invitees.forEach((invitee) => {
      if (invitee.relation) relationsSet.add(invitee.relation);
      if (invitee.side) sidesSet.add(invitee.side);
    });
    return {
      relations: Array.from(relationsSet).sort(),
      sides: Array.from(sidesSet).sort(),
    };
  }, [invitees]);

  return {
    searchQuery,
    setSearchQuery,
    relationFilter,
    setRelationFilter,
    sideFilter,
    setSideFilter,
    unassignedGuests,
    filteredUnassignedGuests,
    relations,
    sides,
  };
};
