// Types for localization system
export type Language = "en" | "he";

export type Direction = "ltr" | "rtl";

export interface LocalizationConfig {
  language: Language;
  direction: Direction;
  isRtl: boolean;
}

export const LANGUAGE_CONFIG: Record<
  Language,
  { direction: Direction; name: string; nativeName: string }
> = {
  en: {
    direction: "ltr",
    name: "English",
    nativeName: "English",
  },
  he: {
    direction: "rtl",
    name: "Hebrew",
    nativeName: "עברית",
  },
};

export const DEFAULT_LANGUAGE: Language = "en";

// Translation key structure - expandable for different sections
export interface Translations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    loading: string;
    error: string;
    success: string;
    confirm: string;
    yes: string;
    no: string;
    changeLanguage: string;
    signOut: string;
  };
  nav: {
    home: string;
    budget: string;
    guests: string;
    tasks: string;
    wedding: string;
  };
  home: {
    title: string;
    welcome: string;
    countdown: string;
    daysUntil: string;
  };
  budget: {
    title: string;
    totalBudget: string;
    spent: string;
    remaining: string;
    addItem: string;
  };
  guests: {
    title: string;
    totalGuests: string;
    confirmed: string;
    pending: string;
    declined: string;
    addGuest: string;
  };
  tasks: {
    title: string;
    completed: string;
    pending: string;
    overdue: string;
    addTask: string;
  };
  wedding: {
    title: string;
    date: string;
    venue: string;
    details: string;
  };
}
