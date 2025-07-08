import { useState, useCallback } from "react";
import {
  GoogleContact,
  requestContactsAccess,
  fetchGoogleContacts,
  checkContactsAccess,
} from "../../api/contacts/googleContactsApi";
import { searchContactsByName } from "../../api/contacts/googleContactUtils";

export interface UseGoogleContactsReturn {
  contacts: GoogleContact[];
  isLoading: boolean;
  error: string | null;
  hasAccess: boolean;
  requestAccess: () => Promise<boolean>;
  loadContacts: () => Promise<void>;
  searchContacts: (searchTerm: string) => GoogleContact[];
  clearError: () => void;
}

/**
 * Hook for managing Google Contacts integration
 */
export const useGoogleContacts = (): UseGoogleContactsReturn => {
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const requestAccess = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await requestContactsAccess();
      setHasAccess(success);
      return success;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to request contacts access";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadContacts = useCallback(async (): Promise<void> => {
    // Check if we have current access
    if (!checkContactsAccess()) {
      setError("No access to contacts. Please grant permission first.");
      setHasAccess(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasAccess(true);

    try {
      const googleContacts = await fetchGoogleContacts();
      setContacts(googleContacts);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load contacts";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchContacts = useCallback(
    (searchTerm: string): GoogleContact[] => {
      return searchContactsByName(contacts, searchTerm);
    },
    [contacts]
  );

  return {
    contacts,
    isLoading,
    error,
    hasAccess,
    requestAccess,
    loadContacts,
    searchContacts,
    clearError,
  };
};
