export interface EyeAreaAnalysisResult {
  overallCondition: string;
  eyeFeatures: EyeFeature[]; // Skin features around the eye
  recommendations: EyeTreatmentRecommendation[]; // Treatment recommendations for skin
  skincareRecommendations: EyeSkincareRecommendation[]; // Skincare for skin
  eyeHealthConcerns?: string[]; // NEW: Potential eye health observations (e.g., "Scleral redness", "Corneal opacity noted")
}

export interface EyeFeature {
  description: string;
  severity: number;
  location: string; // e.g., "under eye", "eyelid", "crow's feet"
  causes: string[];
  status: 'active' | 'healing' | 'chronic';
  characteristics: string[];
  priority: number;
}

export interface EyeTreatmentRecommendation {
  treatmentId: string;
  reason: string;
  priority: number;
  expectedOutcome: string;
  recommendedInterval: string;
}

export interface EyeSkincareRecommendation {
  productType: string;
  recommendedIngredients: string;
  recommendedUsage: string;
  reason: string;
  targetConcerns: string[];
  precautions: string;
}