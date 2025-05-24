// Define global types for AIBeautyLens app

// Skincare recommendation interface
export interface SkincareRecommendation {
  productType: string;
  productName: string;
  recommendedIngredients: string;
  recommendedUsage: string;
  reason: string;
  targetConcerns: string[];
  precautions: string;
}

// Analysis result interface
export interface Feature {
  description: string;
  severity: number;
  location: string;
  causes: string[];
  status: 'active' | 'healing' | 'chronic';
  characteristics: string[];
  priority: number;
}

export interface TreatmentRecommendation {
  treatmentId: string;
  reason: string;
  priority: number;
  expectedOutcome: string;
  recommendedInterval: string;
}

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
}

// Treatment interface
export interface Treatment {
  id: string;
  name: string;
  category: string;
  area: string;
  description: string;
  price: number;
}

// Treatment category interface
export interface TreatmentCategory {
  id: string;
  name: string;
  description: string;
}

// Navigation parameters
declare global {
  namespace ReactNavigation {
    interface RootParamList {
      Camera: undefined;
      Analysis: { imageUri: string; base64Image: string };
      Treatment: { analysisResult: AnalysisResult; imageUri: string };
      Simulation: { selectedTreatments: string[]; imageUri: string; base64Image: string };
      Report: { treatmentIds: string[]; beforeImage: string; afterImage: string };
    }
  }
} 