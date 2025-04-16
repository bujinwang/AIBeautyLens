import { generateTreatmentSimulation } from './geminiService';
import { isUsingOAuth } from '../config/api';

export interface SimulationResult {
  simulatedImageBase64: string;
  effects: string[];
}

/**
 * Generates a simulation image based on multiple treatments.
 * @param base64Image - Base64 encoded original image
 * @param treatmentNames - Array of treatment names to simulate
 * @param signal - Optional AbortSignal for cancellation
 * @returns An object containing the simulated image and treatment effects
 */
export const generateSimulation = async (
  base64Image: string,
  treatmentNames: string[],
  signal?: AbortSignal
): Promise<SimulationResult | null> => {
  try {
    // Check if the request is already aborted
    if (signal?.aborted) {
      throw new Error('Request was cancelled');
    }

    // Check if OAuth is configured before proceeding
    const usingOAuth = await isUsingOAuth();
    if (!usingOAuth) {
      throw new Error('Vertex AI requires OAuth authentication. Please go to Settings and set up OAuth credentials.');
    }

    // Combine treatment names into a description string
    const treatmentDescription = treatmentNames.join(', ');

    // Generate the simulation image, passing through the abort signal
    const simulatedImage = await generateTreatmentSimulation(base64Image, treatmentDescription, signal);

    // Remove data URL prefix if present
    let simulatedImageBase64 = simulatedImage;
    if (simulatedImage.startsWith('data:')) {
      simulatedImageBase64 = simulatedImage.split('base64,')[1];
    }

    // Generate expected effects for each treatment
    const effects = generateTreatmentEffects(treatmentNames);

    // Check if aborted after generation
    if (signal?.aborted) {
      throw new Error('Request was cancelled');
    }

    return {
      simulatedImageBase64,
      effects
    };
  } catch (error) {
    // Check if this is an abort error
    if (signal?.aborted || (error instanceof Error && error.message === 'Request was cancelled')) {
      throw new Error('Request was cancelled');
    }
    // Only log other errors
    console.error(`Error in simulation:`, error);
    throw error;
  }
};

/**
 * Generates descriptions of the expected effects for each treatment.
 * @param treatmentNames - Array of treatment names
 * @returns Array of effect descriptions
 */
const generateTreatmentEffects = (treatmentNames: string[]): string[] => {
  const effectsMap: { [key: string]: string } = {
    'Picosecond Laser': 'Significant reduction in hyperpigmentation through nano-photoacoustic fragmentation with enhanced dermal remodeling',
    'Fractional Laser': 'Accelerated collagen synthesis through micro-thermal zone regeneration and enhanced elastin production',
    'Permanent Laser Hair Removal': 'Targeted follicular melanin absorption leading to long-term follicle inactivation',
    'Tempsure Gold RF Lifting': 'Non-invasive dermal matrix restructuring through targeted thermocollagenesis and elastin fiber realignment',
    'Thermage': 'Deep tissue thermolift with radiofrequency-induced collagen contraction and long-term neocollagenesis',
    'Flexsure Body Contouring': 'Selective adipocyte thermolysis with lymphatic metabolic enhancement',
    'Hyaluronic Acid Filler': 'Volumetric enhancement with cross-linked hyaluronic acid integration and improved dermal hydration matrix',
    'Botulinum Toxin': 'Precision neuromuscular junction modulation with dynamic wrinkle reduction and preventative dermal preservation',
    'Fat Dissolving Injection': 'Targeted phosphatidylcholine-mediated lipolysis with cytokine-induced fat cell membrane disruption',
    'PRP (Platelet-Rich Plasma)': 'Autologous growth factor activation stimulating cellular regeneration and enhanced extracellular matrix production',
    'HydroFacial': 'Multi-phasic dermal resurfacing with vortex extraction technology and antioxidant infusion',
    'Aqua Acupuncture': 'Micro-hydration channel formation with transdermal nutrient delivery and bioactive peptide infusion',
    'Head Spa Machine': 'Enhanced follicular microcirculation with sebum regulation and scalp microbiome rebalancing',
    'Acupuncture': 'Meridian-based microcirculation enhancement with natural collagen induction therapy'
  };

  // Map each treatment name to its effect, filtering out unknown treatments
  return treatmentNames
    .map(name => effectsMap[name] || null)
    .filter(effect => effect !== null) as string[];
};
