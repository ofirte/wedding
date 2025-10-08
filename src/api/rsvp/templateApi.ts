import { weddingFirebase } from "../weddingFirebaseHelpers";
import {
  callFirebaseFunction,
  getMessageTemplates,
  createMessageTemplate,
  deleteMessageTemplate,
  submitTemplateApproval,
  getTemplateApprovalStatus,
} from "../firebaseFunctions";

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
  approvalStatus?:
    | "pending"
    | "approved"
    | "rejected"
    | "submitted"
    | "received"; // Template approval status
}

export interface ApprovalRequest {
  name: string;
  category: string;
}

export interface ApprovalResponse {
  category: string;
  status: "received" | "pending" | "approved" | "rejected";
  rejection_reason?: string;
  name: string;
  content_type: string;
}

export interface ApprovalStatusResponse {
  templateSid: string;
  approvalData: {
    url: string;
    whatsapp?: ApprovalResponse;
    account_sid: string;
    sid: string;
  };
}

export const createTemplate = async (
  templateData: CreateTemplateRequest,
  weddingId?: string,
  userId?: string
): Promise<CreateTemplateResponse> => {
  try {
    // Call Firebase callable function
    const result = await callFirebaseFunction("createMessageTemplate", {
      friendly_name: templateData.friendly_name,
      language: templateData.language,
      variables: templateData.variables,
      types: templateData.types,
    });

    const createdTemplate = result.template as CreateTemplateResponse;

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

/**
 * Get all template documents from Firebase for a specific wedding
 * @param weddingId Optional wedding ID
 * @returns Promise resolving to an array of template documents
 */
export const getTemplatesFromFirebase = async (
  weddingId?: string
): Promise<TemplateDocument[]> => {
  try {
    // Use listenToCollection with Promise pattern to get data once
    return new Promise((resolve, reject) => {
      weddingFirebase.listenToCollection<TemplateDocument>(
        "templates",
        (templates) => {
          console.log(`Retrieved ${templates.length} templates from Firebase`);
          resolve(templates);
        },
        (error) => reject(error),
        weddingId
      );
    });
  } catch (error) {
    console.error("Error getting templates from Firebase:", error);
    throw error;
  }
};

/**
 * Get templates that exist in both Twilio and Firebase (intersection)
 * @param weddingId Optional wedding ID
 * @returns Promise resolving to combined template data with Firebase metadata
 */
export interface WeddingTemplateData {
  templates: Array<TemplateDocument & CreateTemplateResponse>;
  length: number;
}

export const getWeddingTemplates = async (
  weddingId?: string
): Promise<WeddingTemplateData> => {
  try {
    // Fetch from both sources in parallel
    const [twilioResponse, firebaseTemplates] = await Promise.all([
      callFirebaseFunction("getMessageTemplates"),
      getTemplatesFromFirebase(weddingId),
    ]);
    console.log(twilioResponse);
    const twilioTemplates = twilioResponse.templates || [];

    // Create a map of Firebase templates by SID for quick lookup
    const firebaseTemplateMap = new Map(
      firebaseTemplates.map((template) => [template.sid, template])
    );

    // Find intersection: templates that exist in both Twilio and Firebase
    const combinedTemplates = twilioTemplates
      .filter((twilioTemplate: any) =>
        firebaseTemplateMap.has(twilioTemplate.sid)
      )
      .map((twilioTemplate: any) => {
        const firebaseTemplate = firebaseTemplateMap.get(twilioTemplate.sid)!;

        // Merge Twilio and Firebase data, prioritizing Firebase metadata
        return {
          ...twilioTemplate,
          approvalStatus: firebaseTemplate.approvalStatus,
          createdBy: firebaseTemplate.createdBy,
          firebaseId: firebaseTemplate.id,
          // Keep Twilio as source of truth for template content and metadata
          // But add Firebase-specific fields
        };
      });

    console.log(
      `Found ${combinedTemplates.length} templates in both Twilio and Firebase out of ${twilioTemplates.length} Twilio templates and ${firebaseTemplates.length} Firebase templates`
    );

    return {
      templates: combinedTemplates,
      length: combinedTemplates.length,
    };
  } catch (error) {
    console.error("Error getting combined templates:", error);
    throw error;
  }
};

/**
 * Delete a template from both Twilio and Firebase
 * First calls Firebase Functions to delete from Twilio, then removes from Firebase
 * @param templateSid The Twilio template SID to delete
 * @param firebaseId Optional Firebase document ID (will be looked up if not provided)
 * @param weddingId Optional wedding ID
 * @returns Promise that resolves when deletion is complete
 */
export const deleteTemplate = async (
  templateSid: string,
  firebaseId?: string,
  weddingId?: string
): Promise<void> => {
  try {
    // Step 1: Delete from Twilio via Firebase Functions
    const result = await callFirebaseFunction("deleteMessageTemplate", {
      templateSid: templateSid,
    });

    console.log(`Template ${templateSid} deleted from Twilio successfully`);

    // Step 2: Delete from Firebase
    // If firebaseId is not provided, find it by looking up the template
    let documentIdToDelete = firebaseId;

    if (!documentIdToDelete) {
      const firebaseTemplates = await getTemplatesFromFirebase(weddingId);
      const template = firebaseTemplates.find((t) => t.sid === templateSid);
      if (template) {
        documentIdToDelete = template.id;
      }
    }

    if (documentIdToDelete) {
      const resolvedWeddingId =
        weddingId || (await weddingFirebase.getWeddingId());
      await weddingFirebase.deleteDocument(
        "templates",
        documentIdToDelete,
        resolvedWeddingId
      );
      console.log(`Template ${templateSid} deleted from Firebase successfully`);
    } else {
      console.warn(
        `No Firebase document found for template ${templateSid}, but Twilio deletion succeeded`
      );
    }
  } catch (error) {
    console.error("Error deleting template:", error);
    throw error;
  }
};

/**
 * Submit a template for WhatsApp approval
 * @param templateSid The Twilio template SID
 * @param approvalRequest The approval request data (name and category)
 * @returns Promise resolving to the approval response
 */
export const submitTemplateForApproval = async (
  templateSid: string,
  approvalRequest: ApprovalRequest
): Promise<ApprovalResponse> => {
  try {
    const result = await callFirebaseFunction("submitTemplateApproval", {
      templateSid: templateSid,
      name: approvalRequest.name,
      category: approvalRequest.category,
    });

    const approvalResponse = result.approvalRequest as ApprovalResponse;

    // Update the approval status in Firebase
    await updateTemplateApprovalStatus(templateSid, approvalResponse.status);

    return approvalResponse;
  } catch (error) {
    console.error("Error submitting template for approval:", error);
    throw error;
  }
};

/**
 * Get the approval status of a template
 * @param templateSid The Twilio template SID
 * @returns Promise resolving to the approval status response
 */
export const getApprovalStatus = async (
  templateSid: string
): Promise<ApprovalStatusResponse> => {
  try {
    const result = await callFirebaseFunction("getTemplateApprovalStatus", {
      templateSid: templateSid,
    });

    const approvalStatusResponse = result as ApprovalStatusResponse;

    // Update the approval status in Firebase if WhatsApp data exists
    if (approvalStatusResponse.approvalData.whatsapp) {
      await updateTemplateApprovalStatus(
        templateSid,
        approvalStatusResponse.approvalData.whatsapp.status
      );
    }

    return approvalStatusResponse;
  } catch (error) {
    console.error("Error getting approval status:", error);
    throw error;
  }
};

/**
 * Update the approval status of a template in Firebase
 * @param templateSid The Twilio template SID
 * @param status The new approval status
 * @param weddingId Optional wedding ID
 * @returns Promise that resolves when the update is complete
 */
export const updateTemplateApprovalStatus = async (
  templateSid: string,
  status: "received" | "pending" | "approved" | "rejected" | "submitted",
  weddingId?: string
): Promise<void> => {
  try {
    // Find the template document in Firebase
    const firebaseTemplates = await getTemplatesFromFirebase(weddingId);
    const template = firebaseTemplates.find((t) => t.sid === templateSid);

    if (template) {
      const resolvedWeddingId =
        weddingId || (await weddingFirebase.getWeddingId());
      await weddingFirebase.updateDocument(
        "templates",
        template.id,
        { approvalStatus: status },
        resolvedWeddingId
      );
      console.log(
        `Template ${templateSid} approval status updated to: ${status}`
      );
    } else {
      console.warn(
        `Template ${templateSid} not found in Firebase, cannot update approval status`
      );
    }
  } catch (error) {
    console.error("Error updating template approval status:", error);
    throw error;
  }
};

/**
 * Check if a template should have its approval status synced
 * Only templates that have been submitted need regular syncing
 * @param approvalStatus The current Firebase approval status
 * @returns Whether this template should be synced
 */
export const shouldSyncApprovalStatus = (approvalStatus?: string): boolean => {
  // Only sync templates that might have status updates from WhatsApp
  return !!(
    approvalStatus &&
    ["submitted", "received", "pending"].includes(approvalStatus)
  );
};
