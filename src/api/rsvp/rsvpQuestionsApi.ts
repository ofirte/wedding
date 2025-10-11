import { createCollectionAPI } from "../weddingFirebaseHelpers";
import {
  WeddingRSVPConfig,
  RSVPQuestion,
  CreateCustomQuestionRequest,
  PREDEFINED_QUESTIONS,
  generateCustomQuestionId,
} from "./rsvpQuestionsTypes";

const RSVP_CONFIG_COLLECTION = "rsvpConfigs";

// Extended type for RSVP config with Firestore document ID
interface RSVPConfigDocument extends WeddingRSVPConfig {
  id?: string;
}

// Create collection API for RSVP configurations
const rsvpConfigAPI = createCollectionAPI<RSVPConfigDocument>(
  RSVP_CONFIG_COLLECTION
);

/**
 * Get RSVP configuration for a wedding
 */
export const getRSVPConfig = async (
  weddingId?: string
): Promise<WeddingRSVPConfig | null> => {
  try {
    if (!weddingId) {
      return null;
    }
    const config = await rsvpConfigAPI.fetchById(weddingId, weddingId);

    if (!config) {
      console.log(`No RSVP config found for wedding ${weddingId}`);
      return null;
    }

    return {
      enabledQuestionIds: config.enabledQuestionIds || [],
      customQuestions: config.customQuestions || [],
      createdAt: config.createdAt || new Date(),
      updatedAt: config.updatedAt || new Date(),
    };
  } catch (error) {
    console.error("Error getting RSVP config:", error);
    // Don't throw the error - return null instead to prevent default config creation during network issues
    return null;
  }
};

/**
 * Create default RSVP configuration
 */
export const createDefaultRSVPConfig = async (
  weddingId?: string
): Promise<WeddingRSVPConfig> => {
  if (!weddingId) {
    throw new Error(
      "Wedding ID is required to create default RSVP configuration"
    );
  }
  // Enable attendance and amount by default (the two required questions)
  const defaultConfig: WeddingRSVPConfig = {
    enabledQuestionIds: ["attendance", "amount"],
    customQuestions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await rsvpConfigAPI.createWithId(weddingId, defaultConfig, weddingId);
  return defaultConfig;
};

/**
 * Save RSVP configuration
 */
export const saveRSVPConfig = async (
  config: WeddingRSVPConfig,
  weddingId?: string
): Promise<void> => {
  if (!weddingId) {
    throw new Error("Wedding ID is required to save RSVP configuration");
  }
  try {
    const configData: RSVPConfigDocument = {
      enabledQuestionIds: config.enabledQuestionIds,
      customQuestions: config.customQuestions,
      createdAt: config.createdAt,
      updatedAt: new Date(), // Use Date instead of serverTimestamp for consistency
    };
    await rsvpConfigAPI.update(weddingId, configData, weddingId);
    // Use the wedding ID as the document ID
  } catch (error) {
    console.error("Error saving RSVP config:", error);
    throw error;
  }
};

/**
 * Update enabled questions
 */
export const updateEnabledQuestions = async (
  enabledQuestionIds: string[],
  weddingId?: string
): Promise<void> => {
  try {
    const config = await getRSVPConfig(weddingId);
    if (!config) {
      throw new Error("RSVP configuration not found");
    }

    config.enabledQuestionIds = enabledQuestionIds;
    config.updatedAt = new Date();

    await saveRSVPConfig(config, weddingId);
  } catch (error) {
    console.error("Error updating enabled questions:", error);
    throw error;
  }
};

/**
 * Add custom question
 */
export const addCustomQuestion = async (
  request: CreateCustomQuestionRequest,
  weddingId?: string
): Promise<RSVPQuestion> => {
  console.log("Adding custom question:", request);
  console.log("To wedding ID:", weddingId);
  try {
    const config = await getRSVPConfig(weddingId);
    if (!config) {
      throw new Error("RSVP configuration not found");
    }

    // Generate unique ID for custom question
    const questionId = generateCustomQuestionId(
      request.question.displayName ?? "custom_question"
    );

    // Ensure ID is unique
    let finalId = questionId;
    let counter = 1;

    const isIdTaken = (id: string) =>
      config.customQuestions.some((q) => q.id === id) ||
      PREDEFINED_QUESTIONS.some((q) => q.id === id);

    while (isIdTaken(finalId)) {
      finalId = `${questionId}_${counter}`;
      counter++;
    }

    const newQuestion: RSVPQuestion = {
      ...request.question,
      id: finalId,
      isCustom: true,
      order: config.customQuestions.length + PREDEFINED_QUESTIONS.length + 1,
    };

    config.customQuestions.push(newQuestion);
    config.updatedAt = new Date();

    await saveRSVPConfig(config, weddingId);
    return newQuestion;
  } catch (error) {
    console.error("Error adding custom question:", error);
    throw error;
  }
};

/**
 * Update custom question
 */
export const updateCustomQuestion = async (
  weddingId: string,
  questionId: string,
  updates: Partial<Omit<RSVPQuestion, "id" | "isCustom">>
): Promise<void> => {
  try {
    const config = await getRSVPConfig(weddingId);
    if (!config) {
      throw new Error("RSVP configuration not found");
    }

    const questionIndex = config.customQuestions.findIndex(
      (q) => q.id === questionId
    );
    if (questionIndex === -1) {
      throw new Error("Custom question not found");
    }

    config.customQuestions[questionIndex] = {
      ...config.customQuestions[questionIndex],
      ...updates,
    };
    config.updatedAt = new Date();

    await saveRSVPConfig(config, weddingId);
  } catch (error) {
    console.error("Error updating custom question:", error);
    throw error;
  }
};

/**
 * Delete custom question
 */
export const deleteCustomQuestion = async (
  weddingId: string,
  questionId: string
): Promise<void> => {
  try {
    const config = await getRSVPConfig(weddingId);
    if (!config) {
      throw new Error("RSVP configuration not found");
    }

    config.customQuestions = config.customQuestions.filter(
      (q) => q.id !== questionId
    );
    config.updatedAt = new Date();

    await saveRSVPConfig(config, weddingId);
  } catch (error) {
    console.error("Error deleting custom question:", error);
    throw error;
  }
};
