/**
 * Local storage key for invitation token
 */
const INVITATION_TOKEN_KEY = "producer_invitation_token";

/**
 * Save invitation token to localStorage
 */
export const saveInvitationToken = (token: string): void => {
  try {
    localStorage.setItem(INVITATION_TOKEN_KEY, token);
  } catch (error) {
    console.error("Failed to save invitation token:", error);
  }
};

/**
 * Get invitation token from localStorage
 */
export const getInvitationToken = (): string | null => {
  try {
    return localStorage.getItem(INVITATION_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to get invitation token:", error);
    return null;
  }
};

/**
 * Clear invitation token from localStorage
 */
export const clearInvitationToken = (): void => {
  try {
    localStorage.removeItem(INVITATION_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to clear invitation token:", error);
  }
};
