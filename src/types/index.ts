export interface AnalysisResult {
  estimatedAge: number;
  gender: string;
  genderConfidence: number;
  skinType: string;
  skinUndertone: string;
  overallCondition: string;
  features: Feature[];
  recommendations: TreatmentRecommendation[];
  skincareRecommendations: SkincareRecommendation[];
  id?: string;
  userId?: string;
  timestamp?: any;
}

// Gemini API interfaces
export interface GeminiProductRequestData {
  skinType: string;
  concerns: string[];
  existingRecommendations: SkincareRecommendation[];
}

export interface GeminiProductResponseData {
  products: {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: string | number;
    skinTypes: string[];
    description: string;
    ingredients?: string;
  }[];
}

export interface Feature {
  description: string;
  severity: number;
  location: string;
  causes: string[];
  status: 'active' | 'healing' | 'chronic';
  characteristics: string[];
  priority: number;
}

export interface SkinIssue {
  name: string;
  severity: number;
  description: string;
  recommendations: string[];
  affectedAreas: string[];
}

export interface SkincareRecommendation {
  productType: string;
  recommendedIngredients: string;
  recommendedUsage: string;
  reason: string;
  targetConcerns: string[];
  precautions: string;
}

// Treatment interfaces
export interface Treatment {
  id: string;
  name: string;
  category: string;
  area: string;
  description: string;
  price: number;
}

export interface TreatmentCategory {
  id: string;
  name: string;
  description: string;
}

export interface TreatmentRecommendation {
  treatmentId: string;
  reason: string;
  priority: number;
  expectedOutcome: string;
  recommendedInterval: string;
} 