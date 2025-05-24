export interface HairScalpAnalysisResult {
  assessmentDate: string;
  imageSources: string[];
  overallCondition: string;
  hairLossPattern: string;
  hairQuality: string;
  scalpCondition: string;
  preliminaryDiagnosis: string;
  rationale: string;
  recommendations: HairScalpRecommendation[];
  haircareRecommendations?: HaircareRecommendation[];
  careRoutine?: string;
  overallHaircareRecommendation?: string;
  notes: string;
}

export interface HairScalpRecommendation {
  type: 'consultation' | 'history' | 'trichoscopy' | 'labTests' | 'treatment' | 'lifestyle';
  description: string;
  details?: string;
}

export interface HaircareRecommendation {
  productType: string;
  brandRecommendation?: string;
  recommendedIngredients: string;
  recommendedUsage: string;
  reason: string;
  targetConcerns: string[];
  precautions?: string;
}

export interface HaircareRecommendationsResult {
  recommendations: HaircareRecommendation[];
  overallRecommendation: string;
  careRoutine: string;
  notes: string;
} 