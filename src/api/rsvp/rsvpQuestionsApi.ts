import { serverTimestamp } from "firebase/firestore";
import { weddingFirebase } from "../weddingFirebaseHelpers";
import {
  WeddingRSVPConfig,
  RSVPQuestion,
  CreateCustomQuestionRequest,
  PREDEFINED_QUESTIONS,
  generateCustomQuestionId,
} from "./rsvpQuestionsTypes";

const RSVP_CONFIG_COLLECTION = "rsvpConfigs";

/**
 * Get RSVP configuration for a wedding
 */
export const getRSVPConfig = async (
  weddingId?: string
): Promise<WeddingRSVPConfig | null> => {
  try {
    const resolvedWeddingId = await weddingFirebase.getWeddingId(weddingId);
    const config = await weddingFirebase.getDocument<any>(
      RSVP_CONFIG_COLLECTION,
      resolvedWeddingId,
      resolvedWeddingId
    );

    if (!config) return null;

    return {
      weddingId: resolvedWeddingId,
      enabledQuestionIds: config.enabledQuestionIds || [],
      customQuestions: config.customQuestions || [],
      createdAt: config.createdAt?.toDate() || new Date(),
      updatedAt: config.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error("Error getting RSVP config:", error);
    throw error;
  }
};

/**
 * Create default RSVP configuration
 */
export const createDefaultRSVPConfig = async (
  weddingId?: string
): Promise<WeddingRSVPConfig> => {
  const resolvedWeddingId = await weddingFirebase.getWeddingId(weddingId);

  // Enable attendance by default
  const defaultConfig: WeddingRSVPConfig = {
    weddingId: resolvedWeddingId,
    enabledQuestionIds: ["attendance"],
    customQuestions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await saveRSVPConfig(defaultConfig);
  return defaultConfig;
};

/**
 * Save RSVP configuration
 */
export const saveRSVPConfig = async (
  config: WeddingRSVPConfig
): Promise<void> => {
  try {
    const configData = {
      weddingId: config.weddingId,
      enabledQuestionIds: config.enabledQuestionIds,
      customQuestions: config.customQuestions,
      createdAt: config.createdAt,
      updatedAt: serverTimestamp(),
    };

    await weddingFirebase.setDocument(
      RSVP_CONFIG_COLLECTION,
      config.weddingId,
      configData,
      config.weddingId
    );
  } catch (error) {
    console.error("Error saving RSVP config:", error);
    throw error;
  }
};

/**
 * Update enabled questions
 */
export const updateEnabledQuestions = async (
  weddingId: string,
  enabledQuestionIds: string[]
): Promise<void> => {
  try {
    const config = await getRSVPConfig(weddingId);
    if (!config) {
      throw new Error("RSVP configuration not found");
    }

    config.enabledQuestionIds = enabledQuestionIds;
    config.updatedAt = new Date();

    await saveRSVPConfig(config);
  } catch (error) {
    console.error("Error updating enabled questions:", error);
    throw error;
  }
};

/**
 * Add custom question
 */
export const addCustomQuestion = async (
  request: CreateCustomQuestionRequest
): Promise<RSVPQuestion> => {
  try {
    const config = await getRSVPConfig(request.weddingId);
    if (!config) {
      throw new Error("RSVP configuration not found");
    }

    // Generate unique ID for custom question
    const questionId = generateCustomQuestionId(request.question.questionText);

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

    await saveRSVPConfig(config);
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

    await saveRSVPConfig(config);
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

    await saveRSVPConfig(config);
  } catch (error) {
    console.error("Error deleting custom question:", error);
    throw error;
  }
};
