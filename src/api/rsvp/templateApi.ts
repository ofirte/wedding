import { weddingFirebase } from "../weddingFirebaseHelpers";
import { getBaseUrl } from "../../utils/firebaseFunctionsUtil";

export interface CreateTemplateRequest {
  friendly_name: string;
  language: string;
  variables?: Record<string, string>;
  types: {
    "twilio/text"?: {
      body: string;
    };
    "twilio/media"?: {
      body: string;
      media?: string[];
    };
  };
}

export interface CreateTemplateResponse {
  sid: string;
  friendlyName: string;
  language: string;
  variables?: Record<string, string>;
  types: Record<string, any>;
  accountSid: string;
  dateCreated: string;
  dateUpdated: string;
  url: string;
}

export interface TemplateDocument {
  id: string;
  sid: string; // Twilio template SID
  friendlyName: string;
  language: string;
  variables?: Record<string, string>;
  types: Record<string, any>;
  dateCreated: string;
  dateUpdated: string;
  weddingId: string;
  createdBy?: string; // Optional user ID who created the template
  approvalStatus?: "pending" | "approved" | "rejected" | "submitted"; // Template approval status
}

const BASE_URL = getBaseUrl();

export const createTemplate = async (
  templateData: CreateTemplateRequest,
  weddingId?: string,
  userId?: string
): Promise<CreateTemplateResponse> => {
  try {
    // Call the Firebase Function to create the template
    const response = await fetch(`${BASE_URL}/messages/create-template`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${
          errorData.error || "Unknown error"
        }`
      );
    }

    const createdTemplate = (await response.json()) as CreateTemplateResponse;

    // Save the template information to Firebase
    await saveTemplateToFirebase(createdTemplate, weddingId, userId);

    return createdTemplate;
  } catch (error) {
    console.error("Error creating template:", error);
    throw error;
  }
};

/**
 * Save template information to Firebase for tracking and management
 * @param template The created template from Twilio
 * @param weddingId Optional wedding ID
 * @param userId Optional user ID of the creator
 * @returns Promise resolving to the Firebase document ID
 */
export const saveTemplateToFirebase = async (
  template: CreateTemplateResponse,
  weddingId?: string,
  userId?: string
): Promise<string> => {
  try {
    const resolvedWeddingId =
      weddingId || (await weddingFirebase.getWeddingId());

    const templateDocument: Omit<TemplateDocument, "id"> = {
      sid: template.sid,
      friendlyName: template.friendlyName,
      language: template.language,
      variables: template.variables,
      types: template.types,
      dateCreated: template.dateCreated,
      dateUpdated: template.dateUpdated,
      weddingId: resolvedWeddingId,
      createdBy: userId,
      approvalStatus: "pending", // Default approval status when created
    };

    const docRef = await weddingFirebase.addDocument(
      "templates",
      templateDocument,
      resolvedWeddingId
    );

    console.log(
      `Template ${template.sid} saved to Firebase with ID: ${docRef.id}`
    );
    return docRef.id;
  } catch (error) {
    console.error("Error saving template to Firebase:", error);
    throw error;
  }
};
