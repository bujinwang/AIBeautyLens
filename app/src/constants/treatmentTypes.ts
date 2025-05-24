// Define the base treatment interface with language-independent properties
export interface BaseTreatment {
  id: string;
  category: string;
  area: string;
  price: number;
  contraindications: string[];
  restrictions?: string;
}

// Define the treatment translation interface
export interface TreatmentTranslation {
  name: string;
  description: string;
}

// Define the category translation interface
export interface CategoryTranslation {
  name: string;
  description: string;
  generalRestrictions: string;
}

// Define the complete treatment interface with translations
export interface Treatment extends BaseTreatment {
  name: string;
  description: string;
}

// Define the complete category interface with translations
export interface TreatmentCategory {
  id: string;
  name: string;
  description: string;
  generalRestrictions: string;
}

// Define the supported languages
export type SupportedLanguage = 'en' | 'zh';

// Define the treatment translations map
export interface TreatmentTranslationsMap {
  [treatmentId: string]: {
    [language in SupportedLanguage]: TreatmentTranslation;
  };
}

// Define the category translations map
export interface CategoryTranslationsMap {
  [categoryId: string]: {
    [language in SupportedLanguage]: CategoryTranslation;
  };
}
