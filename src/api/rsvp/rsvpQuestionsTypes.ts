// RSVP Question System Types

import { RSVPQuestion, WeddingRSVPConfig } from "@wedding-plan/types";

// Re-export RSVPQuestion for consumers
export type { RSVPQuestion };

// For boolean questions, defines custom text and which option maps to true/false
export interface BooleanOptions {
  trueOption: string; // Text for the "true" choice
  falseOption: string; // Text for the "false" choice
}

// For number questions, defines custom text for zero option
export interface NumberOptions {
  zeroText: string; // Custom text for the "0" choice (e.g., "No vegetarian dishes")
}


// Helper function to generate translated predefined questions
export const getPredefinedQuestions = (
  t: (key: string) => string
): RSVPQuestion[] => [
  {
    id: "attendance",
    questionText: t("rsvpQuestions.attendance.question"),
    displayName: t("rsvpQuestions.attendance.displayName"),
    type: "boolean",
    booleanOptions: {
      trueOption: t("common.yes"),
      falseOption: t("common.no"),
    },
    required: true,
    isCustom: false,
    order: 1,
  },
  {
    id: "amount",
    questionText: t("rsvpQuestions.amount.question"),
    displayName: t("rsvpQuestions.amount.displayName"),
    type: "select",
    options: Array.from({ length: 10 }, (_, i) => (i + 1).toString()),
    required: true,
    isCustom: false,
    order: 2,
  },
  {
    id: "sleepover",
    questionText: t("rsvpQuestions.sleepover.question"),
    displayName: t("rsvpQuestions.sleepover.displayName"),
    type: "boolean",
    booleanOptions: {
      trueOption: t("common.yes"),
      falseOption: t("common.no"),
    },
    required: false,
    isCustom: false,
    order: 3,
  },
  {
    id: "meal_preference",
    questionText: t("rsvpQuestions.meal_preference.question"),
    displayName: t("rsvpQuestions.meal_preference.displayName"),
    type: "select",
    options: [
      t("rsvpQuestions.meal_preference.options.meat"),
      t("rsvpQuestions.meal_preference.options.fish"),
      t("rsvpQuestions.meal_preference.options.vegetarian"),
      t("rsvpQuestions.meal_preference.options.vegan"),
    ],
    required: true,
    isCustom: false,
    order: 4,
  },
  {
    id: "transportation",
    questionText: t("rsvpQuestions.transportation.question"),
    displayName: t("rsvpQuestions.transportation.displayName"),
    type: "select",
    options: [
      t("rsvpQuestions.transportation.options.telAviv"),
      t("rsvpQuestions.transportation.options.jerusalem"),
      t("rsvpQuestions.transportation.options.haifa"),
      t("rsvpQuestions.transportation.options.none"),
    ],
    required: false,
    isCustom: false,
    order: 5,
  },
  {
    id: "dietary_restrictions",
    questionText: t("rsvpQuestions.dietary_restrictions.question"),
    displayName: t("rsvpQuestions.dietary_restrictions.displayName"),
    type: "select",
    options: [
      t("rsvpQuestions.dietary_restrictions.options.none"),
      t("rsvpQuestions.dietary_restrictions.options.glutenFree"),
      t("rsvpQuestions.dietary_restrictions.options.dairyFree"),
      t("rsvpQuestions.dietary_restrictions.options.nutAllergy"),
      t("rsvpQuestions.dietary_restrictions.options.other"),
    ],
    required: false,
    isCustom: false,
    order: 6,
  },
];

// Fallback predefined questions (English) - simple fallback t function that returns the key as-is for fallback
export const PREDEFINED_QUESTIONS: RSVPQuestion[] = getPredefinedQuestions(
  (key: string) => key
);

// Dynamic RSVP data - any question can add its field
export interface InviteeRSVP {
  isSubmitted: boolean;
  submittedAt?: Date;
  [questionId: string]: boolean | string | Date | undefined;
}

// Request types for API
export interface CreateCustomQuestionRequest {
  question: Omit<RSVPQuestion, "id" | "isCustom">;
}

export interface UpdateRSVPConfigRequest {
  weddingId: string;
  enabledQuestionIds: string[];
  customQuestions: RSVPQuestion[];
}

// Helper functions
export const getPredefinedQuestionById = (
  id: string,
  predefinedQuestions?: RSVPQuestion[]
): RSVPQuestion | undefined => {
  const questions = predefinedQuestions || PREDEFINED_QUESTIONS;
  return questions.find((q) => q.id === id);
};

export const getAllAvailableQuestions = (
  config: WeddingRSVPConfig,
  predefinedQuestions?: RSVPQuestion[]
): RSVPQuestion[] => {
  const questions = predefinedQuestions || PREDEFINED_QUESTIONS;
  const predefined = questions.filter((q) =>
    config.enabledQuestionIds.includes(q.id)
  );
  const custom = config.customQuestions;
  return [...predefined, ...custom].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  );
};

export const generateCustomQuestionId = (questionText: string): string => {
  // Generate a safe field name from question text
  return "custom_" + questionText.toLowerCase();
};
