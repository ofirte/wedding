import { useState, useCallback, useMemo } from "react";
import { GoogleContact } from "../../api/contacts/googleContactsApi";
import { Invitee } from "../../components/invitees/InviteList";
import { useUpdateInvitee } from "../invitees/useUpdateInvitee";
import { formatPhoneNumber } from "../../utils/PhoneUtils";
import { getContactPhoneNumber } from "../../api/contacts/googleContactUtils";

export interface ContactMatch {
  invitee: Invitee;
  selectedContact: GoogleContact | null;
  phoneNumber: string | null;
}

export interface UseContactMatcherReturn {
  currentInviteeIndex: number;
  currentMatch: ContactMatch | null;
  matches: Map<string, ContactMatch>;
  isCompleted: boolean;
  progress: { current: number; total: number };
  startMatching: (invitees: Invitee[]) => void;
  selectContact: (contact: GoogleContact | null) => void;
  confirmMatch: () => Promise<void>;
  skipInvitee: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
  saveAllMatches: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for managing the contact matching flow
 */
export const useContactMatcher = (): UseContactMatcherReturn => {
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [currentInviteeIndex, setCurrentInviteeIndex] = useState(0);
  const [matches, setMatches] = useState<Map<string, ContactMatch>>(new Map());
  const [isCompleted, setIsCompleted] = useState(false);

  const { mutateAsync: updateInvitee } = useUpdateInvitee();

  // Filter out invitees that already have phone numbers
  const inviteesNeedingPhones = invitees.filter(
    (invitee) => !invitee.cellphone || invitee.cellphone.trim() === ""
  );

  const currentMatch = useMemo(() => {
    return inviteesNeedingPhones.length > 0 &&
      currentInviteeIndex < inviteesNeedingPhones.length
      ? matches.get(inviteesNeedingPhones[currentInviteeIndex].id) || {
          invitee: inviteesNeedingPhones[currentInviteeIndex],
          selectedContact: null,
          phoneNumber: null,
        }
      : null;
  }, [inviteesNeedingPhones, currentInviteeIndex, matches]);

  const progress = {
    current: currentInviteeIndex + 1,
    total: inviteesNeedingPhones.length,
  };

  const startMatching = useCallback((allInvitees: Invitee[]) => {
    setInvitees(allInvitees);
    setCurrentInviteeIndex(0);
    setMatches(new Map());
    setIsCompleted(false);
  }, []);

  const selectContact = useCallback(
    (contact: GoogleContact | null) => {
      if (!currentMatch) return;

      const phoneNumber = contact ? getContactPhoneNumber(contact) : null;
      const formattedPhoneNumber = phoneNumber
        ? formatPhoneNumber(phoneNumber)
        : null;

      const updatedMatch: ContactMatch = {
        ...currentMatch,
        selectedContact: contact,
        phoneNumber: formattedPhoneNumber,
      };

      setMatches(
        (prev) => new Map(prev.set(currentMatch.invitee.id, updatedMatch))
      );
    },
    [currentMatch]
  );

  const goToNext = useCallback(() => {
    if (currentInviteeIndex < inviteesNeedingPhones.length - 1) {
      setCurrentInviteeIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  }, [currentInviteeIndex, inviteesNeedingPhones.length]);

  const goToPrevious = useCallback(() => {
    if (currentInviteeIndex > 0) {
      setCurrentInviteeIndex((prev) => prev - 1);
      setIsCompleted(false);
    }
  }, [currentInviteeIndex]);

  const confirmMatch = useCallback(async () => {
    if (
      !currentMatch ||
      !currentMatch.selectedContact ||
      !currentMatch.phoneNumber
    ) {
      return;
    }

    try {
      // Update the invitee in Firestore with the phone number
      await updateInvitee({
        id: currentMatch.invitee.id,
        data: {
          cellphone: currentMatch.phoneNumber,
        },
      });

      // Move to next invitee automatically
      goToNext();
    } catch (error) {
      console.error("Error updating invitee with phone number:", error);
      throw error;
    }
  }, [currentMatch, updateInvitee, goToNext]);

  const skipInvitee = useCallback(() => {
    if (!currentMatch) return;

    // Remove any existing match for this invitee
    setMatches((prev) => {
      const newMatches = new Map(prev);
      newMatches.delete(currentMatch.invitee.id);
      return newMatches;
    });

    goToNext();
  }, [currentMatch, goToNext]);

  const saveAllMatches = useCallback(async () => {
    const updatePromises = Array.from(matches.values())
      .filter((match) => match.selectedContact && match.phoneNumber)
      .map((match) =>
        updateInvitee({
          id: match.invitee.id,
          data: {
            cellphone: match.phoneNumber!,
          },
        })
      );

    await Promise.all(updatePromises);
  }, [matches, updateInvitee]);

  const reset = useCallback(() => {
    setInvitees([]);
    setCurrentInviteeIndex(0);
    setMatches(new Map());
    setIsCompleted(false);
  }, []);

  return {
    currentInviteeIndex,
    currentMatch,
    matches,
    isCompleted,
    progress,
    startMatching,
    selectContact,
    confirmMatch,
    skipInvitee,
    goToNext,
    goToPrevious,
    saveAllMatches,
    reset,
  };
};
