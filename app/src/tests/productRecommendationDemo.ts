// Demo script to test the single product recommendation function
import { getSingleProductRecommendations } from '../services/geminiService';
import { SkincareRecommendation } from '../types';

// Sample skin analysis result
const sampleSkincareRecommendations: SkincareRecommendation[] = [
  {
    productType: 'Cleanser',
    recommendedIngredients: 'Salicylic acid, Tea tree oil, Glycolic acid',
    recommendedUsage: 'Twice daily',
    reason: 'Recommended for oily skin and targets acne',
    targetConcerns: ['acne', 'oiliness'],
    precautions: 'Use a gentle foaming cleanser that removes excess oil without stripping the skin completely'
  },
  {
    productType: 'Toner',
    recommendedIngredients: 'Witch hazel, Glycolic acid, Niacinamide',
    recommendedUsage: 'Twice daily after cleansing',
    reason: 'Recommended for oily skin and targets large pores',
    targetConcerns: ['oiliness', 'large pores'],
    precautions: 'Select alcohol-free formulas that balance oil without causing dryness'
  },
  {
    productType: 'Hydrator',
    recommendedIngredients: 'Hyaluronic acid, Niacinamide, Oil-free formulations',
    recommendedUsage: 'Twice daily',
    reason: 'Recommended for combination skin to balance oil production while hydrating dry areas',
    targetConcerns: ['dryness', 'oiliness'],
    precautions: 'Consider different moisturizers for different parts of your face'
  },
  {
    productType: 'Sunscreen',
    recommendedIngredients: 'Zinc Oxide, Titanium Dioxide, Antioxidants',
    recommendedUsage: 'Morning and reapply every 2 hours when outdoors',
    reason: 'Recommended for all skin types to prevent UV damage',
    targetConcerns: [],
    precautions: 'Always apply as the final step in your morning routine'
  }
];

// Demonstrate product recommendations for each skin type
const demoProductRecommendations = async () => {
  const skinTypes = ['normal', 'dry', 'oily', 'combination', 'sensitive'];
  
  for (const skinType of skinTypes) {
    console.log(`\n=============== RECOMMENDATIONS FOR ${skinType.toUpperCase()} SKIN ===============`);
    
    try {
      const products = await getSingleProductRecommendations({
        skinType,
        concerns: ['acne', 'dryness'],
        existingRecommendations: sampleSkincareRecommendations
      });
      
      console.log(`Found ${products.length} recommended products:`);
      
      // Group by category
      const categories: {[key: string]: any} = {};
      
      products.forEach(product => {
        // Log product details
        console.log(`\n[${product.category}] ${product.brand} - ${product.name} ($${product.price})`);
        console.log(`Description: ${product.description || 'No description available'}`);
        console.log(`Ingredients: ${product.ingredients || 'No ingredients listed'}`);
        
        // Collect statistics
        if (!categories[product.category]) {
          categories[product.category] = 1;
        } else {
          categories[product.category]++;
        }
      });
      
      console.log('\nCategory breakdown:');
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`- ${category}: ${count} product(s)`);
      });
      
    } catch (error) {
      console.error(`Error getting recommendations for ${skinType} skin:`, error);
    }
  }
};

// Execute demo if run directly
demoProductRecommendations().catch(console.error);

export { demoProductRecommendations }; 