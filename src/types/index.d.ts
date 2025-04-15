// Define global types for AIBeautyLens app

// Analysis result interface
export interface AnalysisResult {
  estimatedAge: number;
  skinType: string;
  features: {
    description: string;
    severity: number;
  }[];
  recommendations: {
    treatmentId: string;
    reason: string;
  }[];
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