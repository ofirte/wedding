import { createGeneralCollectionAPI } from "../generalFirebaseHelpers";
import {
  getMessageTemplates,
  createMessageTemplate,
  deleteMessageTemplate,
  submitTemplateApproval,
  getTemplateApprovalStatus,
} from "../firebaseFunctions";
import {
  TemplateApprovalResponse,
  CreateMessageTemplateRequest,
  SubmitTemplateApprovalRequest,
  GetTemplateApprovalStatusResponse,
} from "@wedding-plan/types";
import { Template, TemplateDocument } from "@wedding-plan/types";

export const createGlobalTemplate = async (
  templateData: CreateMessageTemplateRequest,
  userId?: string
): Promise<Template> => {
  try {
    // Call Firebase callable function
    const result = await createMessageTemplate({
      friendly_name: templateData.friendly_name,
      language: templateData.language,
      variables: templateData.variables,
      types: templateData.types,
    });

    const createdTemplate = result.data.template;

    // Save the template information to Firebase
    await saveGlobalTemplateToFirebase(createdTemplate, userId);

    return createdTemplate;
  } catch (error) {
    console.error("Error creating global template:", error);
    throw error;
  }
};

/**
 * Save global template information to Firebase for tracking and management
 * @param template The created template from Twilio
 * @param userId Optional user ID of the creator
 * @returns Promise resolving to the Firebase document ID
 */
export const saveGlobalTemplateToFirebase = async (
  template: Template,
  userId?: string
): Promise<string> => {
  try {
    const templateDocument: Omit<TemplateDocument, "id"> = {
      ...template,
      createdBy: userId,
      approvalStatus: "pending", // Default approval status when created
    };

    const docRef = await globalTemplatesAPI.create(templateDocument);
    return docRef.id;
  } catch (error) {
    console.error("Error saving global template to Firebase:", error);
    throw error;
  }
};

/**
 * Get all global template documents from Firebase
 * @returns Promise resolving to an array of template documents
 */
export const getGlobalTemplatesFromFirebase = async (): Promise<
  TemplateDocument[]
> => {
  try {
    return await globalTemplatesAPI.fetchAll();
  } catch (error) {
    console.error("Error getting global templates from Firebase:", error);
    throw error;
  }
};

/**
 * Get global templates that exist in both Twilio and Firebase (intersection)
 * @returns Promise resolving to combined template data with Firebase metadata
 */
export interface GlobalTemplateData {
  templates: Array<TemplateDocument>;
  length: number;
}

export const getGlobalTemplates = async (): Promise<GlobalTemplateData> => {
  try {
    // Fetch from both sources in parallel
    const [twilioResult, firebaseTemplates] = await Promise.all([
      getMessageTemplates(),
      getGlobalTemplatesFromFirebase(),
    ]);
    const twilioResponse = twilioResult.data as any;
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

    return {
      templates: combinedTemplates,
      length: combinedTemplates.length,
    };
  } catch (error) {
    console.error("Error getting combined global templates:", error);
    throw error;
  }
};

/**
 * Delete a global template from both Twilio and Firebase
 * First calls Firebase Functions to delete from Twilio, then removes from Firebase
 * @param templateSid The Twilio template SID to delete
 * @param firebaseId The Firebase document ID
 * @returns Promise that resolves when deletion is complete
 */
export const deleteGlobalTemplate = async (
  templateSid: string,
  firebaseId: string
): Promise<void> => {
  try {
    // Step 1: Delete from Twilio via Firebase Functions
    const result = await deleteMessageTemplate({
      templateSid: templateSid,
    });

    // Validate the deletion result
    const deleteResult = result.data as any;
    if (!deleteResult || deleteResult.error) {
      throw new Error(
        `Failed to delete global template from Twilio: ${
          deleteResult?.error || "Unknown error"
        }`
      );
    }
    await globalTemplatesAPI.delete(firebaseId);
  } catch (error) {
    console.error("Error deleting global template:", error);
    throw error;
  }
};

/**
 * Submit a global template for WhatsApp approval
 * @param templateSid The Twilio template SID
 * @param approvalRequest The approval request data (name and category)
 * @returns Promise resolving to the approval response
 */
export const submitGlobalTemplateForApproval = async (
  templateSid: string,
  approvalRequest: SubmitTemplateApprovalRequest
): Promise<TemplateApprovalResponse> => {
  try {
    const result = await submitTemplateApproval({
      templateSid: templateSid,
      name: approvalRequest.name,
      category: approvalRequest.category,
    });

    const approvalResponse = result.data.approvalRequest;

    // Update the approval status in Firebase
    await updateGlobalTemplateApprovalStatus(
      templateSid,
      approvalResponse.status
    );

    return approvalResponse;
  } catch (error) {
    console.error("Error submitting global template for approval:", error);
    throw error;
  }
};

/**
 * Get the approval status of a global template
 * @param templateSid The Twilio template SID
 * @returns Promise resolving to the approval status response
 */
export const getGlobalApprovalStatus = async (
  templateSid: string
): Promise<GetTemplateApprovalStatusResponse> => {
  try {
    const result = await getTemplateApprovalStatus({
      templateSid: templateSid,
    });

    const approvalStatusResponse =
      result.data as GetTemplateApprovalStatusResponse;

    // Update the approval status in Firebase if WhatsApp data exists
    if (approvalStatusResponse.approvalData.whatsapp) {
      await updateGlobalTemplateApprovalStatus(
        templateSid,
        approvalStatusResponse.approvalData.whatsapp.status
      );
    }

    return approvalStatusResponse;
  } catch (error) {
    console.error("Error getting global approval status:", error);
    throw error;
  }
};

/**
 * Update the approval status of a global template in Firebase
 * @param templateSid The Twilio template SID
 * @param status The new approval status
 * @returns Promise that resolves when the update is complete
 */
export const updateGlobalTemplateApprovalStatus = async (
  templateSid: string,
  status: "received" | "pending" | "approved" | "rejected" | "submitted"
): Promise<void> => {
  try {
    // Find the template document in Firebase
    const firebaseTemplates = await getGlobalTemplatesFromFirebase();
    const template = firebaseTemplates.find((t) => t.sid === templateSid);
    console.log(
      firebaseTemplates.map((t) => {
        return {
          sid: t.sid,
          approvalStatus: t.approvalStatus,
          name: t.friendlyName,
        };
      })
    );
    console.log(
      `Updating global template ${firebaseTemplates} approval status to ${status}`
    );
    if (template) {
      await globalTemplatesAPI.update(template.id, { approvalStatus: status });
    } else {
      console.warn(
        `Global template ${templateSid} not found in Firebase, cannot update approval status`
      );
    }
  } catch (error) {
    console.error("Error updating global template approval status:", error);
    throw error;
  }
};

/**
 * Check if a global template should have its approval status synced
 * Only templates that have been submitted need regular syncing
 * @param approvalStatus The current Firebase approval status
 * @returns Whether this template should be synced
 */
export const shouldSyncGlobalApprovalStatus = (
  approvalStatus?: string
): boolean => {
  // Only sync templates that might have status updates from WhatsApp
  return !!(
    approvalStatus &&
    ["submitted", "received", "pending", "unsubmitted"].includes(approvalStatus)
  );
};

// Create collection API for global templates
const globalTemplatesAPI =
  createGeneralCollectionAPI<TemplateDocument>("globalTemplates");
