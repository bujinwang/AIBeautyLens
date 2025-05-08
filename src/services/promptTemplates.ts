/**
 * This file contains all prompt templates used for Gemini API calls
 * Centralizing prompts makes them easier to manage and update
 */

/**
 * Prompt template for eye area analysis
 * @param currentLanguage - The current UI language
 * @param treatmentsList - List of available treatments
 * @param visitPurpose - Optional purpose of the visit
 * @param appointmentLength - Optional appointment length
 * @returns The formatted prompt
 */
export const getEyeAreaAnalysisPrompt = (
  currentLanguage: string,
  treatmentsList: string,
  visitPurpose?: string,
  appointmentLength?: string
): string => {
  return `You are an expert aesthetic medical professional and licensed dermatologist specializing in eye area analysis and skincare recommendations. You also have basic knowledge to identify potential eye health concerns that warrant referral to an ophthalmologist. Provide comprehensive clinical assessments of eye area features, skin conditions, and personalized treatment recommendations. Your analysis should be thorough and detailed.

${currentLanguage === 'zh' ? 'Please respond in Simplified Chinese (简体中文). ' : ''}Analyze this image focusing specifically on the eye area, including under-eye region, eyelids, and surrounding skin. Also, briefly assess the visible parts of the eye itself for potential health concerns.

ANALYSIS REQUIREMENTS:

1. Overall Eye Area Assessment:
   Provide a concise summary of:
   - Primary eye area concerns
   - Current skin condition around the eyes
   - Any signs of inflammation or barrier issues
   - General eye area health status

2. Clinical Assessment:
   For EACH identified eye area condition, analyze:
   a) Condition Details:
      - Precise clinical description
      - Exact locations (e.g., under-eye, eyelid, crow's feet, etc.)
      - Severity rating (1-5) with clinical justification
      - Current status (active, healing, or chronic)

   b) Clinical Analysis:
      - Probable causes (list all relevant factors)
      - Observable characteristics
      - Associated symptoms
      - Impact on overall eye area health

   c) Treatment Priority:
      - Priority level (immediate attention, high, moderate, low, maintenance)
      - Clinical reasoning for priority assignment
      - Risk factors if left untreated

3. Key Conditions to Assess:
   Evaluate presence and severity of:
   - Dark circles
   - Puffiness/edema
   - Fine lines and wrinkles
   - Crow's feet
   - Drooping eyelids
   - Hollowness
   - Texture irregularities
   - Dehydration markers
   - Barrier compromise signs
   - Milia
   - Hyperpigmentation
   - Skin sensitivity markers

4. Eye Health Screening (Ophthalmologist Perspective - Preliminary):
   - Briefly examine the visible parts of the eye (sclera, iris, pupil, visible conjunctiva).
   - Identify any visually apparent potential concerns (e.g., significant redness/bloodshot appearance, yellowing of sclera, noticeable discharge, cloudiness in cornea/lens, pupil irregularities, growths).
   - List these potential concerns in the 'eyeHealthConcerns' field.
   - IMPORTANT: Do NOT provide a diagnosis. Only list visual observations that might suggest a need for professional eye examination. If no concerns are visually apparent, return an empty array for 'eyeHealthConcerns'.

Format your response as a JSON object with these exact fields:
{
  "overallCondition": string (detailed assessment),
  "eyeFeatures": [
    {
      "description": string (clinical name),
      "severity": number (1-5),
      "location": string (specific eye area),
      "causes": string[] (evidence-based factors),
      "status": "active" | "healing" | "chronic",
      "characteristics": string[] (observable traits),
      "priority": number (1-5, where 1 is highest)
    }
  ],
  "recommendations": [
    {
      "treatmentId": string (from catalog),
      "reason": string (clinical justification),
      "priority": number (1-5),
      "expectedOutcome": string,
      "recommendedInterval": string
    }
  ],
  "skincareRecommendations": [
    {
      "productType": string,
      "recommendedIngredients": string,
      "recommendedUsage": string,
      "reason": string,
      "targetConcerns": string[],
      "precautions": string
    }
  ],
  "eyeHealthConcerns": string[] // List potential eye health observations here (e.g., ["Significant scleral redness", "Possible eyelid inflammation"])
}

IMPORTANT: Keep your response concise but complete. Focus on the most relevant conditions and recommendations. If the response is too long, it may be truncated.

${treatmentsList}

${visitPurpose ? `PURPOSE OF VISIT: ${visitPurpose}` : ''}
${appointmentLength ? `APPOINTMENT LENGTH: ${appointmentLength}` : ''}

IMPORTANT CLINICAL GUIDELINES:
1. Base all assessments solely on visible evidence in the image
2. Provide specific locations and descriptions for each condition
3. Consider multiple factors for each condition's probable causes
4. Assess severity based on clinical presentation
5. Prioritize treatment based on condition severity and impact
6. Note any conditions requiring immediate medical attention
7. Consider potential condition interactions
8. Document any signs of skin barrier compromise
9. Assess both active and chronic conditions
10. Consider patient age in all recommendations

${treatmentsList}`; // Include the full treatments list in the prompt
};

/**
 * Prompt template for facial analysis
 * @param currentLanguage - The current UI language
 * @param treatmentsList - List of available treatments
 * @param visitPurpose - Optional purpose of the visit
 * @param appointmentLength - Optional appointment length
 * @returns The formatted prompt
 */
export const getFacialAnalysisPrompt = (
  currentLanguage: string,
  treatmentsList: string,
  visitPurpose?: string,
  appointmentLength?: string
): string => {
  return `You are an expert aesthetic medical professional and licensed dermatologist specializing in facial analysis and skincare recommendations. Provide comprehensive clinical assessments of facial features, skin conditions, and personalized treatment recommendations. Your analysis should be thorough and detailed, similar to a professional dermatological consultation.

${currentLanguage === 'zh' ? 'Please respond in Simplified Chinese (简体中文). ' : ''}Analyze this image for facial features, skin conditions, and provide a detailed clinical assessment.

ANALYSIS REQUIREMENTS:

1. Basic Profile:
   - Estimated age based on visual indicators
   - Gender with confidence score
   - Overall skin type (oily, dry, combination, sensitive) based on visual cues
   - Skin undertone assessment (warm, cool, neutral)

2. Overall Skin Health:
   Provide a concise summary of:
   - Primary skin concerns
   - Current skin condition
   - Any signs of inflammation or barrier issues
   - General skin health status

3. Clinical Assessment:
   For EACH identified skin condition, analyze:
   a) Condition Details:
      - Precise clinical description
      - Exact locations on face (e.g., T-zone, perioral area, etc.)
      - Severity rating (1-5) with clinical justification
      - Current status (active, healing, or chronic)

   b) Clinical Analysis:
      - Primary probable cause (most likely factor)
      - Observable characteristics
      - Impact on overall skin health

   c) Treatment Priority:
      - Priority level (immediate attention, high, moderate, low, maintenance)
      - Brief clinical reasoning for priority assignment

4. Key Conditions to Assess:
   Evaluate presence and severity of:
   - Acne (comedonal, inflammatory, cystic)
   - Post-inflammatory hyperpigmentation
   - Texture irregularities
   - Dehydration markers
   - Barrier compromise signs
   - Sebum production patterns
   - Inflammatory responses
   - Sun damage indicators
   - Melasma/hyperpigmentation
   - Skin sensitivity markers

Format your response as a JSON object with these exact fields:
{
  "estimatedAge": number,
  "gender": "male" | "female" | "unknown",
  "genderConfidence": number (0.0 to 1.0),
  "skinType": string,
  "skinUndertone": string,
  "overallCondition": string (detailed assessment),
  "features": [
    {
      "description": string (clinical name),
      "severity": number (1-5),
      "location": string (specific facial areas),
      "causes": string[] (evidence-based factors),
      "status": "active" | "healing" | "chronic",
      "characteristics": string[] (observable traits),
      "priority": number (1-5, where 1 is highest)
    }
  ],
  "recommendations": [
    {
      "treatmentId": string (from catalog),
      "reason": string (BRIEF clinical justification),
      "priority": number (1-5)
    }
  ],
  "skincareRecommendations": [
    {
      "productType": string,
      "recommendedIngredients": string,
      "recommendedUsage": string,
      "targetConcerns": string[]
    }
  ]
}

VERY IMPORTANT: BE CONCISE. Prioritize the most critical information. Avoid lengthy descriptions. The response MUST be valid JSON and fit within token limits. Focus on the top 3-5 features/conditions unless more are highly severe. Keep all string values as brief as possible while still being informative.

${treatmentsList}

${visitPurpose ? `PURPOSE OF VISIT: ${visitPurpose}` : ''}
${appointmentLength ? `APPOINTMENT LENGTH: ${appointmentLength}` : ''}

IMPORTANT CLINICAL GUIDELINES:
1. Base all assessments solely on visible evidence in the image
2. Provide specific locations and descriptions for each condition
3. Consider multiple factors for each condition's probable causes
4. Assess severity based on clinical presentation
5. Prioritize treatment based on condition severity and impact
6. Note any conditions requiring immediate medical attention
7. Consider potential condition interactions
8. Document any signs of skin barrier compromise
9. Assess both active and chronic conditions
10. Consider patient age in all recommendations`;
};

/**
 * Prompt template for product recommendations
 * @param currentLanguage - The current UI language
 * @param skinType - The user's skin type
 * @param concerns - Array of skin concerns
 * @param existingRecommendations - Array of existing skincare recommendations
 * @returns The formatted prompt
 */
export const getProductRecommendationsPrompt = (
  currentLanguage: string,
  skinType: string,
  concerns: string[],
  existingRecommendations: any[]
): string => {
  return `As a skincare expert, ${currentLanguage === 'zh' ? 'please respond in Simplified Chinese (简体中文). ' : ''}recommend specific skincare products for a user with ${skinType} skin
and the following concerns: ${concerns.join(', ')}.

For each of these product types:
${existingRecommendations.map(rec => `
  - ${rec.productType}
    Recommended ingredients: ${rec.recommendedIngredients}
    Usage: ${rec.recommendedUsage}
    Target concerns: ${rec.targetConcerns.join(', ')}
`).join('\n')}

For each product type, recommend ONE specific product with:
- Real brand name
- Specific product name
- Actual retail price (USD)
- Key ingredients that match the recommended ingredients
- Brief description of benefits
- Usage instructions

Format your response as a JSON array of products with these exact fields:
{
  "id": string (unique identifier),
  "name": string (specific product name),
  "brand": string (brand name),
  "category": string (matching the product type exactly),
  "price": number (retail price in USD),
  "skinType": string[] (array of compatible skin types),
  "description": string (benefits and features),
  "ingredients": string (key ingredients),
  "usage": string (how to use)
}`;
};

/**
 * Function to generate a treatments list from the TREATMENTS array
 * @param treatments - Array of treatment objects
 * @returns Formatted string of treatments
 */
export const generateTreatmentsList = (treatments: any[]): string => {
  let treatmentsCatalog = `
  Available treatments for recommendation:

  `;

  // Group treatments by category
  const categorizedTreatments: Record<string, any[]> = {};
  treatments.forEach(treatment => {
    if (!categorizedTreatments[treatment.category]) {
      categorizedTreatments[treatment.category] = [];
    }
    categorizedTreatments[treatment.category].push(treatment);
  });

  // Build the treatments list by category
  Object.entries(categorizedTreatments).forEach(([category, treatments]) => {
    treatmentsCatalog += `${category.toUpperCase()} TREATMENTS:\n`;

    treatments.forEach(treatment => {
      treatmentsCatalog += `- ${treatment.id}: ${treatment.name} (${treatment.area}) - ${treatment.description}\n`;

      if (treatment.contraindications && treatment.contraindications.length > 0) {
        treatmentsCatalog += `  CONTRAINDICATIONS: ${treatment.contraindications.join(', ')}\n`;
      }

      if (treatment.restrictions) {
        treatmentsCatalog += `  RESTRICTIONS: ${treatment.restrictions}\n`;
      }

      treatmentsCatalog += `\n`;
    });
  });

  // Add treatment selection guidelines
  treatmentsCatalog += `
  IMPORTANT TREATMENT SELECTION GUIDELINES:
  1. Always check contraindications before recommending any treatment
  2. For clients with active acne or inflammation, avoid laser and radiofrequency treatments
  3. Consider HydraFacial as a safer alternative for acne-prone skin
  4. For severe acne cases, recommend medical consultation before any aesthetic treatments
  5. Consider skin type and sensitivity when recommending treatments
  6. Always prioritize skin barrier repair before aggressive treatments
  7. Factor in recent procedures or medications that might affect treatment safety
  8. Consider alternative treatments when contraindications are present
  9. Always ensure the treatment addresses the client's specific concerns
  10. Consider the client's skin tone for treatments with pigmentation risks
  `;

  return treatmentsCatalog;
};
