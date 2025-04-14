// @ts-ignore
import Constants from 'expo-constants';

// This is a placeholder, you should set up a proper env variable system
const OPENAI_API_KEY = Constants.expoConfig?.extra?.openaiApiKey || '';

export const generateTreatmentSimulation = async (base64Image: string, treatmentDescriptions: string) => {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Generate a realistic after image showing the results of these cosmetic treatments: ${treatmentDescriptions}. Maintain the same identity but show the specific improvements. The image should look realistic and professional, like a before/after comparison for a medical aesthetics clinic.`,
        n: 1,
        size: "1024x1024",
        image: base64Image,
        quality: "hd"
      })
    });
    
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'Error generating simulation');
    }
    return data.data[0].url;
  } catch (error) {
    console.error('Error generating simulation:', error);
    throw error;
  }
}; 