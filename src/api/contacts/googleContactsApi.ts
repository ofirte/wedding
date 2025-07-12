// Google API types
export interface GoogleContact {
  resourceName?: string;
  names?: Array<{
    displayName?: string;
    givenName?: string;
    familyName?: string;
  }>;
  phoneNumbers?: Array<{
    value?: string;
    type?: string;
    formattedType?: string;
  }>;
}

export interface GoogleContactsResponse {
  connections?: GoogleContact[];
  nextPageToken?: string;
  totalItems?: number;
}

const CONTACTS_SCOPE = "https://www.googleapis.com/auth/contacts.readonly";

let gapiInitialized = false;
let gapiInitPromise: Promise<void> | null = null;
let currentAccessToken: string | null = null;

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

/**
 * Initialize Google API client (for API calls only)
 */
export const initializeGoogleApi = (): Promise<void> => {
  if (gapiInitialized) {
    return Promise.resolve();
  }

  if (gapiInitPromise) {
    return gapiInitPromise;
  }

  gapiInitPromise = new Promise((resolve, reject) => {
    // Load the Google API script if not already loaded
    if (!window.gapi) {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = () => {
        initGapi();
      };
      script.onerror = () => {
        reject(new Error("Failed to load Google API script"));
      };
      document.head.appendChild(script);
    } else {
      initGapi();
    }

    function initGapi() {
      window.gapi.load("client", {
        callback: async () => {
          try {
            await window.gapi.client.init({
              discoveryDocs: [
                "https://people.googleapis.com/$discovery/rest?version=v1",
              ],
            });

            gapiInitialized = true;
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        onerror: () => {
          reject(new Error("Failed to initialize Google API"));
        },
      });
    }
  });

  return gapiInitPromise;
};

/**
 * Initialize Google Identity Services
 */
const initializeGoogleIdentity = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = () => {
      // Give it a moment to initialize
      setTimeout(resolve, 100);
    };
    script.onerror = () => {
      reject(new Error("Failed to load Google Identity Services"));
    };
    document.head.appendChild(script);
  });
};

/**
 * Request access to Google Contacts using modern Google Identity Services
 */
export const requestContactsAccess = async (): Promise<boolean> => {
  try {
    if (!isGoogleContactsConfigured()) {
      throw new Error(
        "Google Contacts integration is not configured. Please see GOOGLE_CONTACTS_SETUP.md for setup instructions."
      );
    }

    // Initialize both Google API client and Google Identity Services
    await Promise.all([initializeGoogleApi(), initializeGoogleIdentity()]);

    return new Promise((resolve) => {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: getGoogleClientId(),
        scope: CONTACTS_SCOPE,
        callback: (response: any) => {
          if (response.error) {
            console.error("OAuth error:", response.error);
            resolve(false);
          } else {
            currentAccessToken = response.access_token;
            // Set the access token for gapi client
            window.gapi.client.setToken({
              access_token: response.access_token,
            });
            resolve(true);
          }
        },
      });

      tokenClient.requestAccessToken({
        prompt: "consent",
      });
    });
  } catch (error) {
    console.error("Error requesting contacts access:", error);
    return false;
  }
};

/**
 * Get Google Client ID from environment or Firebase config
 */
const getGoogleClientId = (): string => {
  // You'll need to set this in your environment variables
  // This should be the OAuth 2.0 client ID from Google Cloud Console
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  if (!clientId) {
    // For development/demo purposes, we'll use a placeholder
    // In production, this should throw an error
    console.warn(
      "Google Client ID not configured. Contact matching will not work. Please see GOOGLE_CONTACTS_SETUP.md for setup instructions."
    );
    return "not-configured";
  }

  return clientId;
};

/**
 * Check if Google Contacts integration is properly configured
 */
export const isGoogleContactsConfigured = (): boolean => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  return !!(clientId && clientId !== "not-configured");
};

/**
 * Fetch Google Contacts with pagination to get all contacts
 */
export const fetchGoogleContacts = async (): Promise<GoogleContact[]> => {
  try {
    await initializeGoogleApi();

    if (!currentAccessToken) {
      throw new Error("Not authenticated with Google Contacts");
    }

    let allContacts: GoogleContact[] = [];
    let nextPageToken: string | undefined = undefined;
    let pageCount = 0;
    const maxPages = 50; // Safety limit - with 200 per page, this allows 10,000 contacts
    const pageSize = 200; // Use a reasonable page size

    do {
      const requestParams: any = {
        resourceName: "people/me",
        personFields: "names,phoneNumbers",
        pageSize: pageSize,
      };

      if (nextPageToken) {
        requestParams.pageToken = nextPageToken;
      }

      const response = await window.gapi.client.people.people.connections.list(
        requestParams
      );

      const contacts = response.result.connections || [];
      allContacts = allContacts.concat(contacts);

      nextPageToken = response.result.nextPageToken;
      pageCount++;
      if (pageCount >= maxPages) {
        break;
      }
    } while (nextPageToken);
    return allContacts;
  } catch (error) {
    console.error("Error fetching Google contacts:", error);
    throw error;
  }
};

/**
 * Check if user has granted contacts access
 */
export const checkContactsAccess = (): boolean => {
  return !!currentAccessToken;
};


