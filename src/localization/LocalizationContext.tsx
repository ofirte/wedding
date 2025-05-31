import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  Language,
  Direction,
  LANGUAGE_CONFIG,
  DEFAULT_LANGUAGE,
} from "./types";
import { englishTranslations } from "./translations/en";
import { hebrewTranslations } from "./translations/he";

const translations = {
  en: englishTranslations,
  he: hebrewTranslations,
};

interface LocalizationContextType {
  language: Language;
  direction: Direction;
  isRtl: boolean;
  translations: typeof englishTranslations;
  setLanguage: (language: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(
  undefined
);

const STORAGE_KEY = "wedding-planner-language";

const getNestedValue = (obj: any, path: string): string => {
  return path.split(".").reduce((current, key) => current?.[key], obj) || path;
};

interface LocalizationProviderProps {
  children: ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === "en" || stored === "he")) {
      return stored as Language;
    }
    return DEFAULT_LANGUAGE;
  });

  const config = LANGUAGE_CONFIG[language];
  const direction = config.direction;
  const isRtl = direction === "rtl";
  const currentTranslations = translations[language];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    if (isRtl) {
      document.documentElement.style.textAlign = "right";
    } else {
      document.documentElement.style.textAlign = "";
    }
  }, [language, direction, isRtl]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const t = (
    key: string,
    variables?: Record<string, string | number>
  ): string => {
    let translation = getNestedValue(currentTranslations, key);

    if (variables) {
      // Replace placeholders like {{variable}} with actual values
      Object.entries(variables).forEach(([varKey, value]) => {
        const placeholder = `{{${varKey}}}`;
        translation = translation.replace(
          new RegExp(placeholder, "g"),
          String(value)
        );
      });
    }

    return translation;
  };

  const value: LocalizationContextType = {
    language,
    direction,
    isRtl,
    translations: currentTranslations,
    setLanguage,
    t,
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error(
      "useLocalization must be used within a LocalizationProvider"
    );
  }
  return context;
};

export const useTranslation = () => {
  const { t, language, isRtl } = useLocalization();
  return { t, language, isRtl };
};
