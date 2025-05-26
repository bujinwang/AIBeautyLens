export interface AnalysisResult {
    id: string;
    timestamp: Date;
    imageUrl: string;
    analysisData: any;
}
export interface User {
    id: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface SkinAnalysis {
    acne: number;
    wrinkles: number;
    darkSpots: number;
    skinTone: string;
    recommendations: string[];
}
export interface HairAnalysis {
    hairType: string;
    scalpCondition: string;
    recommendations: string[];
}
export interface EyeAnalysis {
    eyeShape: string;
    eyeCondition: string;
    recommendations: string[];
}
//# sourceMappingURL=index.d.ts.map