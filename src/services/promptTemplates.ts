/**
 * This file contains all prompt templates used for Gemini API calls
 * Centralizing prompts makes them easier to manage and update
 */

import { SKINCARE_PRODUCTS, SkincareProduct } from '../constants/skincareProducts';
import { HAIRCARE_PRODUCTS, HaircareProduct } from '../constants/haircareProducts';

/**
 * Generate a formatted list of available skincare products for inclusion in Gemini prompts
 * @param skinType - The skin type to filter products for (optional)
 * @returns A formatted string with product information
 */
export const generateProductsList = (skinType?: string): string => {
  // Filter products by skin type if provided
  let filteredProducts = SKINCARE_PRODUCTS;
  if (skinType) {
    const skinTypes = skinType.toLowerCase().split('/').map(type => type.trim());
    filteredProducts = SKINCARE_PRODUCTS.filter(product =>
      product.skinType.some(type =>
        skinTypes.includes(type.toLowerCase()) || type.toLowerCase() === 'all'
      )
    );
  }

  // Limit to a reasonable number of products to avoid token limits
  const limitedProducts = filteredProducts.slice(0, 30);

  // Format as a string
  const productsText = `
AVAILABLE SKINCARE PRODUCTS:
The following products are available for recommendation. You should only recommend products from this list.
${limitedProducts.map((product, index) => `
[Product ${index + 1}]
ID: ${product.id}
Brand: ${product.brand}
Name: ${product.name}
Category: ${product.category}
Size: ${product.size || 'N/A'}
Price: $${product.price}
Skin Type: ${product.skinType.join(', ')}
Ingredients: ${product.ingredients || 'Not specified'}
`).join('')}
`;

  return productsText;
};

/**
 * Generate a formatted list of available haircare products for inclusion in Gemini prompts
 * @param hairType - The hair type to filter products for (optional)
 * @returns A formatted string with product information
 */
export const generateHaircareProductsList = (hairType?: string): string => {
  // Filter products by hair type if provided (or use all)
  const products = HAIRCARE_PRODUCTS || [];
  
  // Format product list for prompt
  return `
AVAILABLE HAIRCARE PRODUCTS FOR RECOMMENDATION:
Please select from these specific products when making recommendations. For each recommendation, 
include the exact product ID in your response JSON:

${products.map(product => `
ID: ${product.id}
Brand: ${product.brand}
Product: ${product.name}
Category: ${product.category}
For: ${product.hairType.join(', ')}
Key Ingredients: ${product.ingredients}
Benefits: ${product.description}
Price: $${product.price}
`).join('---')}
`;
};

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
  appointmentLength?: string,
  skinType?: string
): string => {
  // Generate list of suitable products for the prompt
  const productsList = generateProductsList(skinType);
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
      "productID": string,  // The exact product ID from the provided list
      "productName": string, // The product's full name (brand + name)
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

GUIDELINES FOR PRODUCT RECOMMENDATIONS:
1. ONLY recommend products from the provided list
2. For each skincare recommendation, include the exact product ID from the list
3. Match products to specific skin conditions identified in the analysis
4. Consider skin type compatibility for all recommendations
5. Ensure ingredient compatibility across recommended products

${productsList}

${treatmentsList}`; // Include the products and treatments lists in the prompt
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
  appointmentLength?: string,
  skinType?: string
): string => {
  // Generate list of suitable products for the prompt
  const productsList = generateProductsList(skinType);
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
      "productID": string,  // The exact product ID from the provided list
      "productName": string, // The product's full name (brand + name)
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
10. Consider patient age in all recommendations

GUIDELINES FOR PRODUCT RECOMMENDATIONS:
1. ONLY recommend products from the provided product list below
2. For each skincare recommendation, include the exact product ID from the list
3. Match products to specific skin conditions identified in the analysis
4. Consider skin type compatibility for all recommendations
5. Ensure ingredient compatibility across recommended products
6. Provide a complete regimen of products that work well together

${productsList}`;
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

/**
 * Prompt template for hair and scalp analysis
 * @param currentLanguage - The current UI language
 * @param visitPurpose - Optional purpose of the visit
 * @returns The formatted prompt
 */
export const getHairScalpAnalysisPrompt = (
  currentLanguage: string,
  visitPurpose?: string
): string => {
  // Generate list of haircare products
  const productsList = generateHaircareProductsList();

  return `You are an expert dermatologist and trichologist specializing in hair and scalp disorders. Provide a comprehensive, evidence-based clinical analysis of the uploaded multi-angle scalp and hair images, including personalized haircare product recommendations. Your report should be detailed, objective, and formatted for medical review.

${currentLanguage === 'zh' ? 'Please respond in Simplified Chinese (简体中文). ' : ''}Analyze the provided images for hair loss patterns, hair quality, and scalp health. Reference the Norwood and Ludwig classifications where appropriate.

${productsList}

ANALYSIS REQUIREMENTS:

1. Clinical Observations:
   - Area and pattern of hair loss (describe location, extent, and pattern; reference Norwood/Ludwig if possible)
   - Hair quality (thickness, color, texture, miniaturization, etc.)
   - Scalp condition (erythema, scaling, pustules, scarring, inflammation, etc.)

2. Preliminary Diagnostic Impression:
   - Most probable diagnosis (e.g., Androgenetic Alopecia, Telogen Effluvium, etc.)
   - Rationale for diagnosis (summarize key findings supporting the impression)

3. Recommendations for Further Examination:
   - Professional consultation (dermatologist/hair specialist)
   - History taking (onset, family history, medications, lifestyle)
   - Trichoscopy/dermoscopy (what to look for)
   - Laboratory tests (iron, thyroid, hormones, vitamin D, etc.)

4. Principles and Direction of Treatment Management:
   - Topical/oral medications (e.g., minoxidil, finasteride, spironolactone)
   - Physical/interventional therapies (LLLT, PRP, hair transplant)
   - Lifestyle and adjunctive care (diet, stress, hair care)

5. Personalized Haircare Product Recommendations:
   - 3-5 different product types most beneficial for this specific condition
   - For each recommended product category (shampoo, conditioner, treatment, etc.), provide:
     * Product type
     * Recommended ingredients to look for
     * How to use the product
     * Why this is recommended for the specific condition
     * Which specific hair/scalp concerns it targets
     * Any precautions or contraindications
   - A suggested haircare routine
   - Overall summary of recommendations

6. Important Notes:
   - This is a preliminary analysis based on images only. Final diagnosis and treatment require in-person evaluation.
   - AGA is chronic and progressive; treatment requires long-term commitment.
   - Advise prompt professional consultation.
   - Product recommendations are general guidelines. Individual sensitivities may vary.

Format your response as a JSON object with these exact fields:
{
  "assessmentDate": string,
  "imageSources": string[],
  "overallCondition": string,
  "hairLossPattern": string,
  "hairQuality": string,
  "scalpCondition": string,
  "preliminaryDiagnosis": string,
  "rationale": string,
  "recommendations": [
    {
      "type": "consultation" | "history" | "trichoscopy" | "labTests" | "treatment" | "lifestyle",
      "description": string,
      "details"?: string
    }
  ],
  "haircareRecommendations": [
    {
      "productType": string, // e.g., "Medicated Shampoo", "Scalp Treatment"
      "brandRecommendation": string, // Recommended brand and product name
      "recommendedIngredients": string, // Key ingredients to look for
      "recommendedUsage": string, // How to use
      "reason": string, // Why it's recommended
      "targetConcerns": string[], // Array of concerns it addresses
      "precautions"?: string // Optional warnings or contraindications
    }
  ],
  "overallHaircareRecommendation": string, // Overall summary of product recommendations
  "careRoutine": string, // Suggested hair care routine
  "notes": string
}

${visitPurpose ? `PURPOSE OF VISIT: ${visitPurpose}` : ''}

IMPORTANT CLINICAL GUIDELINES:
1. Base all assessments solely on visible evidence in the images
2. Reference clinical classification systems where possible
3. Do not provide a final diagnosis; recommend further evaluation
4. Be concise but thorough

ONLY return the JSON object. Do NOT include any explanation, commentary, or extra text before or after the JSON.`;
};
