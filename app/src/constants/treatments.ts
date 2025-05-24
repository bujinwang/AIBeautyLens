import { BASE_TREATMENTS, BASE_CATEGORIES } from './treatmentData';
import { TREATMENT_TRANSLATIONS_EN, CATEGORY_TRANSLATIONS_EN } from './translations/treatmentTranslations_en';
import { Treatment, TreatmentCategory, SupportedLanguage } from './treatmentTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to get the current language from AsyncStorage
const getCurrentLanguage = async (): Promise<SupportedLanguage> => {
  try {
    const savedLanguage = await AsyncStorage.getItem('language');
    return (savedLanguage as SupportedLanguage) || 'en';
  } catch (error) {
    console.error('Error loading language preference:', error);
    return 'en';
  }
};

// Function to get localized treatments
export const getLocalizedTreatments = async (): Promise<Treatment[]> => {
  const currentLanguage = await getCurrentLanguage();
  
  return BASE_TREATMENTS.map(baseTreatment => {
    const translations = TREATMENT_TRANSLATIONS_EN[baseTreatment.id];
    const translation = translations[currentLanguage] || translations.en;
    
    return {
      ...baseTreatment,
      name: translation.name,
      description: translation.description
    };
  });
};

// Function to get localized categories
export const getLocalizedCategories = async (): Promise<TreatmentCategory[]> => {
  const currentLanguage = await getCurrentLanguage();
  
  return BASE_CATEGORIES.map(baseCategory => {
    const translations = CATEGORY_TRANSLATIONS_EN[baseCategory.id];
    const translation = translations[currentLanguage] || translations.en;
    
    return {
      ...baseCategory,
      name: translation.name,
      description: translation.description,
      generalRestrictions: translation.generalRestrictions
    };
  });
};

// For backward compatibility, export the English treatments directly
export const TREATMENTS: Treatment[] = BASE_TREATMENTS.map(baseTreatment => {
  const translation = TREATMENT_TRANSLATIONS_EN[baseTreatment.id].en;
  
  return {
    ...baseTreatment,
    name: translation.name,
    description: translation.description
  };
});

// For backward compatibility, export the English categories directly
export const TREATMENT_CATEGORIES: TreatmentCategory[] = BASE_CATEGORIES.map(baseCategory => {
  const translation = CATEGORY_TRANSLATIONS_EN[baseCategory.id].en;
  
  return {
    ...baseCategory,
    name: translation.name,
    description: translation.description,
    generalRestrictions: translation.generalRestrictions
  };
});
