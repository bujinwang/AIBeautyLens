// Scraped skincare product data from ecosmetic.ca
// Source: https://ecosmetic.ca/shop/ and https://ecosmetic.ca/product-category/skin-type/oily/

import { SkincareRecommendation } from '../types';

// Product data organized by skin type
interface ProductsByType {
  [key: string]: SkincareProduct[];
}

// Product structure matching website data
export interface SkincareProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  size?: string;
  skinType: string[];
  description?: string;
  ingredients?: string;
  usage?: string;
  imageUrl?: string;
  productUrl?: string;
}

// Convert products to recommendations format
export const getRecommendationsForSkinType = (
  skinType: string,
  concerns: string[] = []
): SkincareRecommendation[] => {
  // Get products for this skin type
  const relevantProducts = SKINCARE_PRODUCTS.filter(product =>
    product.skinType.includes(skinType.toLowerCase()) ||
    product.skinType.includes('all')
  );

  // Map to recommendations format
  return relevantProducts.map(product => {
    // Determine usage pattern based on category
    const usage = getRecommendedUsage(product.category);

    // Map ingredients to recommendation format
    let ingredients = product.ingredients || getDefaultIngredients(product.category, skinType);

    // Create reason text based on skin type match
    const reason = `Recommended for ${skinType} skin${
      concerns.length > 0 ? ` and targets ${concerns.join(', ')}` : ''
    }`;

    // Create full product name with brand only
    const fullProductName = `${product.brand} ${product.name}`;

    return {
      productType: product.category,
      productName: fullProductName,
      size: product.size,  // Keep size as a separate field
      recommendedIngredients: ingredients,
      recommendedUsage: usage,
      reason: reason,
      targetConcerns: concerns,
      precautions: getPrecautions(product.category, skinType)
    };
  });
};

// Helper function to determine usage pattern
const getRecommendedUsage = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'cleanser':
      return 'Twice daily';
    case 'toner':
      return 'Twice daily after cleansing';
    case 'exfoliator':
      return '1-3 times per week';
    case 'serum':
    case 'targeted treatment':
      return 'Daily or as directed';
    case 'hydrator':
    case 'moisturizer':
      return 'Twice daily';
    case 'masks':
      return '1-2 times per week';
    case 'sunscreen':
      return 'Morning and reapply every 2 hours when outdoors';
    case 'eye care':
      return 'Morning and evening';
    default:
      return 'As directed on package';
  }
};

// Helper function for default ingredients recommendation
const getDefaultIngredients = (category: string, skinType: string): string => {
  if (skinType.toLowerCase() === 'oily') {
    switch (category.toLowerCase()) {
      case 'cleanser':
        return 'Salicylic acid, Tea tree oil, Glycolic acid, Foaming agents, Zinc PCA';
      case 'toner':
        return 'Witch hazel, Glycolic acid, Niacinamide, Zinc PCA, Alcohol-free formulas';
      case 'exfoliator':
        return 'BHA (Salicylic acid), AHA (Glycolic acid), Jojoba beads, Fruit enzymes';
      case 'targeted treatment':
        return 'Niacinamide, Retinol, Salicylic acid, Benzoyl peroxide, Tea tree oil';
      case 'hydrator':
      case 'moisturizer':
        return 'Hyaluronic acid, Niacinamide, Oil-free formulations, Gel-based textures, Zinc PCA';
      case 'masks':
        return 'Clay, Charcoal, Sulfur, Kaolin, Bentonite, Tea tree oil';
      case 'sunscreen':
        return 'Oil-free, Non-comedogenic, Zinc oxide, Matte-finish formulas';
      case 'serum':
        return 'Niacinamide, Salicylic acid, Zinc, Hyaluronic acid, Oil-controlling ingredients';
      default:
        return 'Non-comedogenic, oil-free formulations with oil-controlling ingredients';
    }
  } else if (skinType.toLowerCase() === 'dry') {
    switch (category.toLowerCase()) {
      case 'cleanser':
        return 'Hyaluronic acid, Ceramides, Glycerin';
      case 'toner':
        return 'Alcohol-free, Hyaluronic acid, Glycerin';
      case 'moisturizer':
      case 'hydrator':
        return 'Ceramides, Shea butter, Hyaluronic acid, Squalane';
      case 'targeted treatment':
        return 'Hyaluronic acid, Peptides, Niacinamide';
      default:
        return 'Hydrating formulations';
    }
  } else if (skinType.toLowerCase() === 'normal') {
    switch (category.toLowerCase()) {
      case 'cleanser':
        return 'Ceramides, Glycerin, Hyaluronic Acid (Sulfate-free)';
      case 'toner':
        return 'Rose Water, Glycerin, Niacinamide, Panthenol';
      case 'serum':
        return 'Vitamin C, Hyaluronic Acid, Niacinamide';
      case 'moisturizer':
      case 'hydrator':
        return 'Hyaluronic Acid, Ceramides, Glycerin, Antioxidants';
      case 'targeted treatment':
        return 'Retinol, Vitamin C, Niacinamide';
      case 'exfoliator':
        return 'AHA (Glycolic Acid), Fruit Enzymes, Jojoba Beads';
      case 'masks':
        return 'Hyaluronic Acid, Antioxidants, Clay';
      case 'sunscreen':
        return 'Zinc Oxide, Titanium Dioxide, Hyaluronic Acid, Vitamin E';
      case 'night treatment':
        return 'Retinol, Peptides, Ceramides, Squalane';
      case 'eye care':
        return 'Peptides, Caffeine, Vitamin E, Hyaluronic Acid';
      default:
        return 'Balanced formulations for normal skin';
    }
  } else if (skinType.toLowerCase() === 'combination') {
    switch (category.toLowerCase()) {
      case 'cleanser':
        return 'Gentle foaming cleansers, LHA, Glycolic Acid, Salicylic Acid';
      case 'toner':
        return 'Witch Hazel, Niacinamide, Green Tea Extract, Hyaluronic Acid';
      case 'exfoliator':
        return 'Dual-action exfoliants, Salicylic Acid for T-zone, Lactic Acid for cheeks';
      case 'serum':
        return 'Niacinamide, Hyaluronic Acid, Zinc PCA';
      case 'targeted treatment':
        return 'Salicylic Acid (for T-zone), Dioic Acid, Hyaluronic Acid (for drier areas)';
      case 'moisturizer':
      case 'hydrator':
        return 'Lightweight gel-creams, Hyaluronic Acid, Niacinamide, Ceramides';
      case 'masks':
        return 'Multi-masking: Clay for T-zone, Hydrating for cheeks';
      case 'sunscreen':
        return 'Lightweight, non-comedogenic formulas, Zinc Oxide, Titanium Dioxide';
      default:
        return 'Balanced formulations for combination skin zones';
    }
  }

  // Default for other skin types
  return 'Ingredients suited for your skin type';
};

// Helper function for precautions
const getPrecautions = (category: string, skinType: string): string => {
  if (skinType.toLowerCase() === 'oily') {
    switch (category.toLowerCase()) {
      case 'exfoliator':
        return 'Do not over-exfoliate, which can lead to increased oil production';
      case 'targeted treatment':
        return 'Introduce retinol gradually to avoid irritation';
      case 'moisturizer':
      case 'hydrator':
        return 'Avoid heavy, occlusive ingredients that may clog pores';
      case 'cleanser':
        return 'Use a gentle foaming cleanser that removes excess oil without stripping the skin completely';
      case 'toner':
        return 'Select alcohol-free formulas that balance oil without causing dryness';
      case 'masks':
        return 'Limit clay or charcoal masks to 1-2 times weekly to prevent over-drying';
      default:
        return 'Patch test new products before full application';
    }
  } else if (skinType.toLowerCase() === 'sensitive') {
    switch (category.toLowerCase()) {
      case 'cleanser':
        return 'Avoid cleansers with sulfates, fragrances or alcohol that can irritate sensitive skin';
      case 'exfoliator':
        return 'Use extremely gentle exfoliants no more than once weekly; avoid physical scrubs';
      case 'serum':
        return 'Introduce one new serum at a time with a 2-week gap to identify potential irritants';
      case 'targeted treatment':
        return 'Avoid products with high concentrations of active ingredients like retinol or acids';
      case 'sunscreen':
        return 'Choose mineral sunscreens (zinc oxide, titanium dioxide) over chemical filters';
      case 'toner':
        return 'Avoid astringents and alcohol-based toners; select formulas with soothing ingredients';
      case 'moisturizer':
      case 'hydrator':
        return 'Look for products with minimal ingredients and avoid common irritants like fragrances';
      case 'masks':
        return 'Use only masks specifically formulated for sensitive skin, and test on a small area first';
      default:
        return 'Always patch test new products for at least 24 hours before applying to your entire face';
    }
  } else if (skinType.toLowerCase() === 'normal') {
    switch (category.toLowerCase()) {
      case 'exfoliator':
        return 'Use 1-3 times weekly to maintain skin\'s natural balance without over-exfoliating';
      case 'targeted treatment':
        return 'Even with normal skin, introduce active ingredients gradually and monitor for any reactions';
      case 'serum':
        return 'For optimal results, apply to clean skin before moisturizer';
      case 'sunscreen':
        return 'Always apply as the final step in your morning routine and reapply throughout the day';
      default:
        return 'Although normal skin is generally resilient, always patch test new products';
    }
  } else if (skinType.toLowerCase() === 'combination') {
    switch (category.toLowerCase()) {
      case 'cleanser':
        return 'Avoid harsh cleansers that can strip dry areas while trying to control oil in the T-zone';
      case 'exfoliator':
        return 'Consider using different exfoliation methods for different facial zones - gentle chemical exfoliants for dry areas, stronger ones for oily T-zone';
      case 'targeted treatment':
        return 'Apply targeted treatments only to areas that need them - oil control for T-zone, hydration for dry areas';
      case 'moisturizer':
      case 'hydrator':
        return 'Consider using different moisturizers for different parts of your face or a balanced formula specifically for combination skin';
      case 'masks':
        return 'Try multi-masking technique - apply clay masks to oily areas and hydrating masks to dry areas simultaneously';
      case 'toner':
        return 'Focus toner application on oilier areas, being careful not to over-dry the cheeks and other dry zones';
      default:
        return 'Pay attention to how products affect different zones of your face, as combination skin often requires zone-specific treatments';
    }
  }

  return 'Patch test new products before full application';
};

// Products scraped from ecosmetic.ca
export const SKINCARE_PRODUCTS: SkincareProduct[] = [
  // Add products matching the categories shown in the screenshot
  {
    id: 'gentle-cleanser-combo-1',
    name: 'Hydrating Gentle Cleanser',
    brand: 'CeraVe',
    category: 'Gentle Cleanser',
    price: 15.99,
    size: '355ml',
    skinType: ['combination', 'all'],
    description: 'Hydrating non-comedogenic cleanser for gentle yet effective cleansing',
    ingredients: 'Glycerin, Ceramides, Hyaluronic Acid, Non-foaming surfactants',
    usage: 'AM and PM'
  },
  {
    id: 'gentle-cleanser-combo-2',
    name: 'Gentle Foaming Cleanser',
    brand: 'La Roche-Posay',
    category: 'Gentle Cleanser',
    price: 19.99,
    size: '200ml',
    skinType: ['combination', 'all'],
    description: 'Gentle cleanser with Salicylic Acid for combination skin',
    ingredients: 'Salicylic Acid (0.5-2%), Ceramides, Glycerin',
    usage: 'AM and PM'
  },
  {
    id: 'acne-treatment-combo-1',
    name: 'Acne Spot Treatment',
    brand: 'Paula\'s Choice',
    category: 'Acne Treatment Serum/Spot Treatment',
    price: 29.99,
    size: '30ml',
    skinType: ['combination', 'acne-prone'],
    description: 'Targeted spot treatment for active breakouts',
    ingredients: 'Salicylic Acid (2%), Benzoyl Peroxide (2.5%)',
    usage: 'PM, start 2-3 times per week and increase as tolerated. Apply thinly.'
  },
  {
    id: 'acne-treatment-combo-2',
    name: 'Adapalene Gel',
    brand: 'Differin',
    category: 'Acne Treatment Serum/Spot Treatment',
    price: 32.99,
    skinType: ['combination', 'acne-prone'],
    description: 'Retinoid treatment for long-term acne control',
    ingredients: 'Adapalene (0.1%), Glycerin',
    usage: 'PM, start 2-3 times per week and increase as tolerated. Apply thinly.'
  },
  {
    id: 'hydrating-moisturizer-combo-1',
    name: 'Oil-Free Hydrating Gel',
    brand: 'Neutrogena',
    category: 'Hydrating Moisturizer',
    price: 18.99,
    skinType: ['combination', 'all'],
    description: 'Lightweight, non-comedogenic moisturizer for combination skin',
    ingredients: 'Hyaluronic Acid, Glycerin, Ceramides',
    usage: 'AM and PM'
  },
  {
    id: 'hydrating-moisturizer-combo-2',
    name: 'Hydrating Lotion',
    brand: 'CeraVe',
    category: 'Hydrating Moisturizer',
    price: 17.99,
    skinType: ['combination', 'all'],
    description: 'Lightweight, non-comedogenic formula for balanced hydration',
    ingredients: 'Hyaluronic Acid, Glycerin, Ceramides',
    usage: 'AM and PM'
  },

  // ZO Products
  {
    id: 'zo-exfoliating-cleanser',
    name: 'ZO Exfoliating Cleanser Normal to Oily Skin',
    brand: 'ZO',
    category: 'Cleanser',
    price: 64.00,
    size: '50ml',
    skinType: ['normal', 'oily', 'combination'],
    description: 'Exfoliating cleanser for normal to oily skin',
    ingredients: 'Salicylic acid, Jojoba esters',
    usage: 'Use morning and evening. Wet face and apply small amount to face and neck. Work into lather, rinse and pat dry.'
  },
  {
    id: 'zo-acne-treatment-pads',
    name: 'ZO Acne Treatment Pads',
    brand: 'ZO',
    category: 'Targeted Treatment',
    price: 94.00,
    size: '60 pads',
    skinType: ['oily', 'combination', 'acne-prone'],
    description: 'Treatment pads for acne-prone skin',
    ingredients: 'Salicylic acid, Tea tree oil, Glycolic acid',
    usage: 'Use as directed on clean, dry skin. Avoid eye area.'
  },
  {
    id: 'zo-wrinkle-texture-repair',
    name: 'ZO Wrinkle+Texture Repair',
    brand: 'ZO',
    category: 'Targeted Treatment',
    price: 208.00,
    size: '50ml',
    skinType: ['all', 'aging', 'normal'],
    description: 'Targeted treatment for wrinkles and texture issues',
    ingredients: 'Retinol, Peptides, Vitamin E'
  },
  {
    id: 'zo-sunscreen-primer',
    name: 'ZO SunScreen+Primer Broad-Spectrum SPF30',
    brand: 'ZO',
    category: 'Sunscreen',
    price: 88.00,
    size: '30ml',
    skinType: ['all', 'normal'],
    description: 'Dual-action sunscreen and makeup primer',
    ingredients: 'Zinc Oxide, Titanium Dioxide, Antioxidants'
  },
  {
    id: 'zo-sunscreen-powder',
    name: 'ZO Sunscreen + Powder Broad-Spectrum SPF45 (Color: Medium)',
    brand: 'ZO',
    category: 'Sunscreen',
    price: 86.00,
    size: '10g',
    skinType: ['all', 'oily', 'normal'],
    description: 'Powder sunscreen perfect for touch-ups throughout the day',
    ingredients: 'Zinc Oxide, Titanium Dioxide, Antioxidants'
  },
  {
    id: 'zo-smart-tone',
    name: 'ZO Smart-Tone Broad-Spectrum SPF50',
    brand: 'ZO',
    category: 'Sunscreen',
    price: 88.00,
    size: '50ml',
    skinType: ['all', 'normal'],
    description: 'Color-adapting sunscreen with high SPF protection',
    ingredients: 'Zinc Oxide, Titanium Dioxide, Antioxidants'
  },
  {
    id: 'zo-rozatrol',
    name: 'ZO Rozatrol',
    brand: 'ZO',
    category: 'Targeted Treatment',
    price: 128.00,
    size: '50ml',
    skinType: ['sensitive', 'rosacea-prone'],
    description: 'Treatment for redness and rosacea-prone skin',
    ingredients: 'Amino acids, Antioxidants, Anti-inflammatory agents'
  },
  {
    id: 'zo-retinol-brightener',
    name: 'ZO Retinol Skin Brightener',
    brand: 'ZO',
    category: 'Targeted Treatment',
    price: 120.00,
    size: '50ml',
    skinType: ['all', 'hyperpigmented', 'normal'],
    description: 'Brightening treatment with retinol in multiple strengths',
    ingredients: 'Retinol, Antioxidants, Brightening agents'
  },
  {
    id: 'zo-renewal-cream',
    name: 'ZO Renewal Cream',
    brand: 'ZO',
    category: 'Hydrator',
    price: 142.00,
    size: '50ml',
    skinType: ['normal', 'dry', 'combination'],
    description: 'Hydrating renewal cream for normal to dry skin',
    ingredients: 'Retinol, Ceramides, Antioxidants'
  },
  {
    id: 'zo-recovery-cream',
    name: 'ZO Recovery Cream',
    brand: 'ZO',
    category: 'Hydrator',
    price: 146.00,
    size: '50ml',
    skinType: ['sensitive', 'irritated', 'dry'],
    description: 'Recovery cream for sensitive, irritated or dry skin',
    ingredients: 'Ceramides, Anti-inflammatory agents, Antioxidants',
    usage: 'Apply morning and evening to face and neck after cleansing'
  },
  {
    id: 'zo-radical-night-repair',
    name: 'ZO Radical Night Repair',
    brand: 'ZO',
    category: 'Targeted Treatment',
    price: 235.00,
    size: '60ml',
    skinType: ['all', 'aging', 'normal'],
    description: 'Intensive night repair treatment',
    ingredients: 'Retinol, Antioxidants, Peptides'
  },
  {
    id: 'zo-eye-cream',
    name: 'ZO Intense Eye Cream',
    brand: 'ZO',
    category: 'Eye Care',
    price: 159.00,
    size: '15ml',
    skinType: ['all', 'normal'],
    description: 'Intensive eye cream for all skin types',
    ingredients: 'Retinol, Peptides, Vitamin E'
  },

  // LUXYN Products
  {
    id: 'luxyn-hydration-masque',
    name: 'LUXYN Hydration Masque (10 sheets)',
    brand: 'LUXYN',
    category: 'Masks',
    price: 40.00,
    size: '10 sheets',
    skinType: ['all', 'dry', 'dehydrated', 'normal'],
    description: 'Hydrating sheet mask set',
    ingredients: 'Hyaluronic Acid, Niacinamide, Peptides'
  },

  // Additional Normal Skin Products from ecosmetic.ca
  {
    id: 'normal-gentle-cleanser',
    name: 'Gentle Cleanser',
    brand: 'Ecosmetic',
    category: 'Cleanser',
    price: 38.00,
    size: '200ml',
    skinType: ['normal', 'sensitive'],
    description: 'To cleanse effectively without stripping the skin\'s natural moisture barrier, crucial for acne-prone and potentially compromised skin.',
    ingredients: 'Ceramides, Glycerin, Hyaluronic Acid (Sulfate-free)',
    usage: 'AM and PM'
  },
  {
    id: 'normal-daily-hydrator',
    name: 'Daily Hydrator',
    brand: 'Ecosmetic',
    category: 'Hydrator',
    price: 45.00,
    size: '50ml',
    skinType: ['normal'],
    description: 'Lightweight daily moisturizer designed specifically for normal skin types',
    ingredients: 'Hyaluronic Acid, Ceramides, Glycerin, Antioxidants',
    usage: 'Apply morning and evening after cleansing'
  },
  {
    id: 'normal-vitamin-c-serum',
    name: 'Vitamin C Brightening Serum',
    brand: 'SkinCeuticals',
    category: 'Serum',
    price: 110.00,
    size: '30ml',
    skinType: ['normal', 'all'],
    description: 'Brightening and antioxidant serum ideal for maintaining even skin tone',
    ingredients: 'Vitamin C (L-Ascorbic Acid), Vitamin E, Ferulic Acid',
    usage: 'Apply in the morning after cleansing and before moisturizer'
  },
  {
    id: 'normal-spf50-sunscreen',
    name: 'Daily Defense SPF 50',
    brand: 'Ecosmetic',
    category: 'Sunscreen',
    price: 52.00,
    size: '50ml',
    skinType: ['normal', 'all'],
    description: 'Lightweight sunscreen specifically formulated for daily use on normal skin',
    ingredients: 'Zinc Oxide, Titanium Dioxide, Hyaluronic Acid, Vitamin E',
    usage: 'Apply every morning as the final step in skincare routine, reapply every 2 hours when outdoors'
  },
  {
    id: 'normal-balancing-toner',
    name: 'Balancing Toner',
    brand: 'Ecosmetic',
    category: 'Toner',
    price: 32.00,
    size: '200ml',
    skinType: ['normal'],
    description: 'Alcohol-free toner that maintains skin\'s natural pH balance',
    ingredients: 'Rose Water, Glycerin, Niacinamide, Panthenol',
    usage: 'Apply after cleansing, morning and evening'
  },
  {
    id: 'normal-night-repair',
    name: 'Night Repair Complex',
    brand: 'Ecosmetic',
    category: 'Night Treatment',
    price: 78.00,
    size: '30ml',
    skinType: ['normal', 'all'],
    description: 'Restorative night treatment to maintain skin health and prevent premature aging',
    ingredients: 'Retinol, Peptides, Ceramides, Squalane',
    usage: 'Apply in the evening after cleansing'
  },

  // Dry Skin Products from ecosmetic.ca
  {
    id: 'zo-illuminating-aox',
    name: 'ZO Illuminating AOX Targeted Treatment',
    brand: 'ZO',
    category: 'Targeted Treatment',
    price: 204.00,
    size: '50ml',
    skinType: ['all', 'dry', 'aging'],
    description: 'Advanced treatment that brightens and provides antioxidant protection',
    ingredients: 'Vitamin C, Antioxidants, Hydrating agents',
    usage: 'Apply to clean dry skin daily'
  },
  {
    id: 'zo-hydrating-cream',
    name: 'ZO Hydrating Cream',
    brand: 'ZO',
    category: 'Hydrator',
    price: 130.00,
    size: '60ml',
    skinType: ['dry', 'dehydrated', 'normal'],
    description: 'Rich, deeply hydrating cream for dry or dehydrated skin',
    ingredients: 'Ceramides, Hyaluronic Acid, Shea Butter, Vitamin E',
    usage: 'Apply morning and evening to face and neck after cleansing'
  },
  {
    id: 'zo-hydrating-cleanser',
    name: 'ZO Hydrating Cleanser Normal to Dry Skin',
    brand: 'ZO',
    category: 'Cleanser',
    price: 64.00,
    size: '200ml',
    skinType: ['normal', 'dry'],
    description: 'Gentle hydrating cleanser specifically formulated for normal to dry skin',
    ingredients: 'Panthenol, Allantoin, Glycerin, Sodium Hyaluronate',
    usage: 'Use morning and evening. Rinse thoroughly with warm water.'
  },
  {
    id: 'zo-gentle-cleanser',
    name: 'ZO Gentle Cleanser',
    brand: 'ZO',
    category: 'Cleanser',
    price: 64.00,
    size: '200ml',
    skinType: ['sensitive', 'dry', 'irritated'],
    description: 'Ultra-gentle cleanser for sensitive or irritated skin',
    ingredients: 'Hydrating complex, Botanical extracts, Chamomile',
    usage: 'Use morning and evening. Massage onto wet skin, rinse well.'
  },
  {
    id: 'skinceuticals-soothing-cleanser-foam',
    name: 'SkinCeuticals Soothing Cleanser Foam',
    brand: 'SkinCeuticals',
    category: 'Cleanser',
    price: 52.00,
    size: '150ml',
    skinType: ['sensitive', 'dry'],
    description: 'Gentle foaming cleanser that removes impurities without stripping skin',
    ingredients: 'Glycerin, Sorbitol, Orange Oil, Cucumber Extract',
    usage: 'Apply to damp face and neck, massage gently, rinse thoroughly'
  },
  {
    id: 'skinceuticals-redness-neutralizer',
    name: 'SkinCeuticals Redness Neutralizer',
    brand: 'SkinCeuticals',
    category: 'Targeted Treatment',
    price: 86.00,
    size: '50ml',
    skinType: ['sensitive', 'dry', 'rosacea-prone'],
    description: 'Helps reduce the appearance of redness and flushing',
    ingredients: 'Peptides, Silymarin, Bisabolol, Hyaluronic Acid',
    usage: 'Apply to clean face twice daily'
  },
  {
    id: 'skinceuticals-metacell-b3',
    name: 'SkinCeuticals Metacell B3',
    brand: 'SkinCeuticals',
    category: 'Targeted Treatment',
    price: 148.00,
    size: '30ml',
    skinType: ['all', 'dry', 'aging'],
    description: 'Comprehensive daily emulsion that helps improve early signs of photoaging',
    ingredients: 'Niacinamide (5%), Tripeptide Complex, Glycerin',
    usage: 'Apply 1-2 pumps to face, neck, and chest every morning and evening'
  },
  {
    id: 'skinceuticals-ha-intensifier',
    name: 'Skinceuticals H.A. Intensifier',
    brand: 'SkinCeuticals',
    category: 'Serum',
    price: 146.00,
    size: '30ml',
    skinType: ['all', 'dry', 'dehydrated'],
    description: 'Multi-functional serum that amplifies skin\'s hyaluronic acid levels',
    ingredients: 'Proxylane (10%), Purple Rice Extract, Hyaluronic Acid, Licorice Root Extract',
    usage: 'Apply a few drops to face, neck, and chest twice daily'
  },
  {
    id: 'skinceuticals-gentle-cleanser-200ml',
    name: 'SkinCeuticals Gentle Cleanser',
    brand: 'SkinCeuticals',
    category: 'Cleanser',
    price: 56.00,
    size: '200ml',
    skinType: ['dry', 'sensitive'],
    description: 'Creamy, non-foaming cleanser that removes impurities while maintaining skin moisture',
    ingredients: 'Glycerin, Allantoin, Orange Oil, Pro-Vitamin B5',
    usage: 'Apply to damp face and neck morning and evening, rinse with warm water'
  },
  {
    id: 'skinceuticals-emollience',
    name: 'SkinCeuticals Emollience Face Cream',
    brand: 'SkinCeuticals',
    category: 'Hydrator',
    price: 94.00,
    size: '60ml',
    skinType: ['dry', 'very dry'],
    description: 'Rich, restorative moisturizer for dry to very dry skin',
    ingredients: 'Essential oils, Grapeseed Oil, Rose Hip Oil, Macadamia Nut Oil',
    usage: 'Apply twice daily to face, neck, and chest'
  },
  {
    id: 'skinceuticals-triple-lipid-repair',
    name: 'SkinCeuticals 2:4:2 Triple Lipid Repair',
    brand: 'SkinCeuticals',
    category: 'Hydrator',
    price: 170.00,
    size: '50ml',
    skinType: ['aging', 'dry', 'very dry'],
    description: 'Anti-aging cream that restores essential skin lipids and improves the appearance of visible signs of aging',
    ingredients: 'Ceramides, Cholesterol, Fatty Acids, Essential Oils',
    usage: 'Apply a small amount between fingertips, warm, and apply to face, neck and chest'
  },
  // Combination Skin Products from ecosmetic.ca
  {
    id: 'zo-acne-treatment-pads-combo',
    name: 'ZO Acne Treatment Pads',
    brand: 'ZO',
    category: 'Targeted Treatment',
    price: 94.00,
    skinType: ['oily', 'combination', 'acne-prone'],
    description: 'Treatment pads specially formulated for acne-prone and combination skin',
    ingredients: 'Salicylic acid, Tea tree oil, Glycolic acid',
    usage: 'Use as directed on clean, dry skin. Focus on oilier areas of the face. Avoid eye area.'
  },
  {
    id: 'skinceuticals-sheer-physical-spf50',
    name: 'SkinCeuticals Sheer Physical SPF50',
    brand: 'SkinCeuticals',
    category: 'Sunscreen',
    price: 56.00,
    skinType: ['combination', 'sensitive', 'all'],
    description: 'Lightweight, physical sunscreen that\'s ideal for combination and sensitive skin types',
    ingredients: 'Zinc Oxide, Titanium Dioxide, Artemia Salina Extract, Paraffin',
    usage: 'Apply liberally 15 minutes before sun exposure and reapply at least every 2 hours'
  },
  {
    id: 'skinceuticals-micro-exfoliant',
    name: 'SkinCeuticals Micro-exfoliant',
    brand: 'SkinCeuticals',
    category: 'Exfoliator',
    price: 49.00,
    skinType: ['combination', 'normal', 'oily'],
    description: 'Water-activated powder exfoliant that helps refine pores and improve skin texture',
    ingredients: 'Silica, Diatomaceous Earth, Aloe Extract, Citric Acid',
    usage: 'Use 2-3 times per week. Mix a small amount with water to create a paste, massage onto skin, rinse thoroughly'
  },
  {
    id: 'skinceuticals-lha-cleanser',
    name: 'Skinceuticals LHA Cleanser',
    brand: 'SkinCeuticals',
    category: 'Cleanser',
    price: 59.00,
    skinType: ['combination', 'oily', 'aging'],
    description: 'Deep cleansing gel cleanser that decongests pores and helps minimize their appearance',
    ingredients: 'LHA (Lipo-hydroxy acid), Glycolic Acid, Salicylic Acid, Glycerin',
    usage: 'Use twice daily, morning and evening. Apply to damp face and neck, massage gently, rinse thoroughly'
  },
  {
    id: 'skinceuticals-blemish-age-defense',
    name: 'SkinCeuticals Blemish+Age Defense',
    brand: 'SkinCeuticals',
    category: 'Targeted Treatment',
    price: 128.00,
    skinType: ['combination', 'oily', 'aging', 'acne-prone'],
    description: 'Oil-free serum that reduces the formation of acne and helps improve the appearance of fine lines and wrinkles',
    ingredients: 'Dioic Acid, LHA, Salicylic Acid, Glycolic Acid, Citric Acid',
    usage: 'Apply 4-5 drops to face once or twice daily after cleansing'
  },
  {
    id: 'adoreyes-brows-enhancing-serum',
    name: 'ADOREYES Plus Brows Eyebrow Enhancing Serum with Triple Peptide Complex',
    brand: 'ADOREYES',
    category: 'Eye Care',
    price: 79.99,
    skinType: ['all', 'combination'],
    description: 'Specialized serum to enhance eyebrow appearance and fullness',
    ingredients: 'Triple Peptide Complex, Panthenol, Biotin, Hyaluronic Acid',
    usage: 'Apply to clean, dry eyebrows once daily, preferably at night'
  },
  {
    id: 'combination-balancing-toner',
    name: 'Balancing Toner for Combination Skin',
    brand: 'Ecosmetic',
    category: 'Toner',
    price: 34.00,
    skinType: ['combination'],
    description: 'Specialized toner that balances oil production in the T-zone while hydrating drier areas',
    ingredients: 'Witch Hazel, Niacinamide, Green Tea Extract, Hyaluronic Acid',
    usage: 'Apply after cleansing morning and evening with a cotton pad, focusing on T-zone'
  },
  {
    id: 'combination-dual-action-moisturizer',
    name: 'Dual-Action Moisturizer',
    brand: 'Ecosmetic',
    category: 'Hydrator',
    price: 48.00,
    skinType: ['combination'],
    description: 'Innovative moisturizer that provides balanced hydration for combination skin - lightweight on oily areas and richer on dry areas',
    ingredients: 'Hyaluronic Acid, Ceramides, Niacinamide, Zinc PCA',
    usage: 'Apply morning and evening after cleansing and toning'
  },
  // Oily Skin Products from ecosmetic.ca
  {
    id: 'zo-exfoliating-cleanser-oily',
    name: 'ZO Exfoliating Cleanser Normal to Oily Skin',
    brand: 'ZO',
    category: 'Cleanser',
    price: 64.00,
    skinType: ['normal', 'oily'],
    description: 'Exfoliating cleanser specifically formulated for normal to oily skin to remove excess oil and impurities',
    ingredients: 'Salicylic acid, Jojoba esters, Vitamin E',
    usage: 'Use morning and evening. Wet face and apply small amount to face and neck. Work into lather, rinse and pat dry.'
  },
  {
    id: 'zo-acne-treatment-pads-oily',
    name: 'ZO Acne Treatment Pads',
    brand: 'ZO',
    category: 'Targeted Treatment',
    price: 94.00,
    skinType: ['oily', 'acne-prone'],
    description: 'Treatment pads specialized for acne-prone and oily skin types to control excess oil and clear breakouts',
    ingredients: 'Salicylic acid, Tea tree oil, Glycolic acid, Oil-controlling ingredients',
    usage: 'Use as directed on clean, dry skin. Avoid eye area.'
  },
  {
    id: 'oily-skin-oil-control-moisturizer',
    name: 'Oil Control Moisturizer',
    brand: 'Ecosmetic',
    category: 'Hydrator',
    price: 48.00,
    skinType: ['oily', 'acne-prone'],
    description: 'Lightweight, oil-free moisturizer that controls shine while providing necessary hydration',
    ingredients: 'Niacinamide, Hyaluronic Acid, Zinc PCA, Tea Tree Oil',
    usage: 'Apply a small amount morning and evening after cleansing'
  },
  {
    id: 'oily-skin-mattifying-toner',
    name: 'Mattifying Toner',
    brand: 'Ecosmetic',
    category: 'Toner',
    price: 32.00,
    skinType: ['oily'],
    description: 'Alcohol-free toner that refines pores and regulates oil production',
    ingredients: 'Witch hazel, Glycolic acid, Niacinamide, Zinc PCA',
    usage: 'Apply with cotton pad after cleansing morning and evening'
  },
  {
    id: 'oily-skin-clay-mask',
    name: 'Purifying Clay Mask',
    brand: 'Ecosmetic',
    category: 'Masks',
    price: 36.00,
    skinType: ['oily', 'combination'],
    description: 'Deep-cleansing clay mask that absorbs excess oil and clears congestion',
    ingredients: 'Kaolin Clay, Bentonite Clay, Charcoal, Tea Tree Oil',
    usage: 'Apply to clean skin 1-2 times weekly for 10-15 minutes, then rinse thoroughly'
  },

  // Sensitive Skin Products from ecosmetic.ca
  {
    id: 'zo-gentle-cleanser-sensitive',
    name: 'ZO Gentle Cleanser',
    brand: 'ZO',
    category: 'Cleanser',
    price: 64.00,
    skinType: ['sensitive', 'dry', 'irritated'],
    description: 'Ultra-gentle cleanser designed for sensitive and irritated skin',
    ingredients: 'Hydrating complex, Botanical extracts, Chamomile, Allantoin',
    usage: 'Use morning and evening. Apply to damp skin, massage gently, rinse thoroughly'
  },
  {
    id: 'zo-recovery-cream-sensitive',
    name: 'ZO Recovery Cream',
    brand: 'ZO',
    category: 'Hydrator',
    price: 146.00,
    skinType: ['sensitive', 'irritated', 'dry'],
    description: 'Recovery cream specially formulated for sensitive or irritated skin',
    ingredients: 'Ceramides, Anti-inflammatory agents, Antioxidants, Soothing botanicals',
    usage: 'Apply morning and evening to face and neck after cleansing'
  },
  {
    id: 'skinceuticals-redness-neutralizer-sensitive',
    name: 'SkinCeuticals Redness Neutralizer',
    brand: 'SkinCeuticals',
    category: 'Targeted Treatment',
    price: 86.00,
    skinType: ['sensitive', 'rosacea-prone'],
    description: 'Specialized treatment to reduce the appearance of redness and flushing in sensitive skin',
    ingredients: 'Peptides, Silymarin, Bisabolol, Hyaluronic Acid, Soothing complex',
    usage: 'Apply to affected areas morning and evening'
  },
  {
    id: 'skinceuticals-soothing-cleanser-foam-sensitive',
    name: 'SkinCeuticals Soothing Cleanser Foam',
    brand: 'SkinCeuticals',
    category: 'Cleanser',
    price: 52.00,
    skinType: ['sensitive'],
    description: 'Gentle foaming cleanser that cleanses without irritation or dryness',
    ingredients: 'Glycerin, Sorbitol, Orange Oil, Cucumber Extract',
    usage: 'Apply to damp face and neck, massage gently, rinse thoroughly'
  },
  {
    id: 'sensitive-skin-calming-serum',
    name: 'Calming Repair Serum',
    brand: 'Ecosmetic',
    category: 'Serum',
    price: 64.00,
    skinType: ['sensitive', 'irritated'],
    description: 'Soothing serum that reduces irritation and strengthens the skin barrier',
    ingredients: 'Centella Asiatica, Ceramides, Peptides, Green Tea Extract',
    usage: 'Apply 2-3 drops to clean skin morning and evening before moisturizer'
  },
  {
    id: 'sensitive-skin-mineral-sunscreen',
    name: 'Gentle Mineral Sunscreen SPF 40',
    brand: 'Ecosmetic',
    category: 'Sunscreen',
    price: 42.00,
    skinType: ['sensitive', 'all'],
    description: 'Non-irritating mineral sunscreen suitable for even the most sensitive skin',
    ingredients: 'Zinc Oxide, Titanium Dioxide, Squalane, Aloe Vera',
    usage: 'Apply liberally 15 minutes before sun exposure, reapply every 2 hours when outdoors'
  },
  {
    id: 'gentle-cleanser-combo',
    name: 'Gentle Cleanser for Combination Skin',
    brand: 'SkinCeuticals',
    category: 'Gentle Cleanser',
    price: 45.00,
    skinType: ['combination', 'all'],
    description: 'Gentle cleansing formula that balances combination skin without stripping',
    ingredients: 'Glycerin, Ceramides, Hyaluronic Acid, Non-foaming surfactants',
    usage: 'Twice daily (AM and PM)'
  },
  {
    id: 'hydrating-calming-serum-combo',
    name: 'Hydrating & Calming Serum',
    brand: 'SkinCeuticals',
    category: 'Hydrating & Calming Serum',
    price: 82.00,
    skinType: ['combination', 'all'],
    description: 'Balancing serum that hydrates dry areas while controlling oil in T-zone',
    ingredients: 'Niacinamide (4-10%), Hyaluronic Acid, Centella Asiatica, Panthenol',
    usage: 'Once or twice daily (AM/PM)'
  },
  {
    id: 'targeted-acne-treatment-combo',
    name: 'Targeted Acne Treatment',
    brand: 'ZO',
    category: 'Targeted Acne Treatment',
    price: 68.00,
    skinType: ['combination', 'oily', 'acne-prone'],
    description: 'Spot treatment that targets breakouts without over-drying',
    ingredients: 'Azelaic Acid (10-15%), Salicylic Acid (2%)',
    usage: 'Once daily (PM initially), gradually increase if tolerated'
  }
];

// Organize products by skin type for easy access
export const PRODUCTS_BY_SKIN_TYPE: ProductsByType = {
  oily: SKINCARE_PRODUCTS.filter(product =>
    product.skinType.includes('oily') || product.skinType.includes('all')
  ),
  dry: SKINCARE_PRODUCTS.filter(product =>
    product.skinType.includes('dry') || product.skinType.includes('all')
  ),
  combination: SKINCARE_PRODUCTS.filter(product =>
    product.skinType.includes('combination') || product.skinType.includes('all')
  ),
  sensitive: SKINCARE_PRODUCTS.filter(product =>
    product.skinType.includes('sensitive') || product.skinType.includes('all')
  ),
  normal: SKINCARE_PRODUCTS.filter(product =>
    product.skinType.includes('normal') || product.skinType.includes('all')
  )
};

// Function to get product recommendations based on specific concerns
export const getProductsForConcerns = (
  productType: string,
  concerns: string[] = [],
  skinType: string = 'all'
): SkincareProduct[] => {
  // Map concerns to relevant product ingredients or categories
  const concernMap: {[key: string]: {ingredients: string[], categories: string[]}} = {
    'acne': {
      ingredients: ['salicylic acid', 'benzoyl peroxide', 'tea tree oil', 'sulfur'],
      categories: ['Cleanser', 'Targeted Treatment']
    },
    'aging': {
      ingredients: ['retinol', 'peptides', 'vitamin c', 'hyaluronic acid'],
      categories: ['Targeted Treatment', 'Hydrator', 'Eye Care']
    },
    'hyperpigmentation': {
      ingredients: ['vitamin c', 'niacinamide', 'alpha arbutin', 'kojic acid'],
      categories: ['Targeted Treatment', 'Sunscreen']
    },
    'dryness': {
      ingredients: ['hyaluronic acid', 'ceramides', 'squalane', 'glycerin'],
      categories: ['Hydrator', 'Masks']
    },
    'oiliness': {
      ingredients: ['niacinamide', 'salicylic acid', 'clay'],
      categories: ['Cleanser', 'Toner', 'Masks']
    },
    'sensitivity': {
      ingredients: ['aloe', 'centella asiatica', 'oat extract'],
      categories: ['Cleanser', 'Hydrator']
    },
    'redness': {
      ingredients: ['centella asiatica', 'green tea', 'licorice root'],
      categories: ['Targeted Treatment', 'Hydrator']
    }
  };

  // Start with products for this skin type
  let relevantProducts = skinType === 'all'
    ? SKINCARE_PRODUCTS
    : PRODUCTS_BY_SKIN_TYPE[skinType] || [];

  // Filter by product type first
  if (productType && typeof productType === 'string') {
    console.log(`Filtering products for category ${productType}`);
    // Create an array of possible category matches
    // This helps with internationalization where the category might be in a different language
    const possibleCategories = [productType];

    // Add English equivalents for common Chinese categories
    if (productType === '洁面乳' || productType === '温和洁面乳' || productType === '洗面奶' || productType === '洁面') {
      possibleCategories.push('Cleanser', 'Gentle Cleanser');
    } else if (productType === '保湿霜' || productType === '保湿面霜' || productType === '轻盈保湿霜' || productType === '面霜' || productType === '乳液') {
      possibleCategories.push('Moisturizer', 'Hydrator', 'Hydrating Moisturizer');
    } else if (productType === '精华' || productType === '精华液' || productType === '精华 (日间)' || productType === '精华 (夜间 - 交替使用)' || productType === '日间精华' || productType === '夜间精华') {
      possibleCategories.push('Serum', 'Targeted Treatment', 'Hydrating & Calming Serum');
    } else if (productType === '防晒霜' || productType === '防晒' || productType === '防晒乳') {
      possibleCategories.push('Sunscreen');
    } else if (productType === '保湿精华' || productType === '补水精华') {
      possibleCategories.push('Serum', 'Hydrating & Calming Serum');
    } else if (productType === '精华 (抗炎/色素沉着后炎症)' || productType === '抗炎精华' || productType === '祛斑精华' || productType === '美白精华') {
      possibleCategories.push('Serum', 'Targeted Treatment');
    } else if (productType === '精华 (痘痘/质地 - 谨慎使用)' || productType === '祛痘精华' || productType === '痘痘精华' || productType === '抗痘精华') {
      possibleCategories.push('Targeted Treatment', 'Targeted Acne Treatment');
    } else if (productType === '爽肤水' || productType === '化妆水' || productType === '柔肤水') {
      possibleCategories.push('Toner');
    } else if (productType === '去角质产品' || productType === '磨砂膏' || productType === '去角质') {
      possibleCategories.push('Exfoliator');
    } else if (productType === '面膜') {
      possibleCategories.push('Masks', 'Mask');
    } else if (productType === '眼霜' || productType === '眼部护理') {
      possibleCategories.push('Eye Care', 'Eye Cream');
    }

    console.log(`Possible categories for ${productType}:`, JSON.stringify(possibleCategories));

    relevantProducts = relevantProducts.filter(product => {
      if (!product.category) return false;

      const categoryMatch = possibleCategories.some(cat => {
        if (!cat) return false;
        const productCategoryLower = product.category.toLowerCase();
        const catLower = cat.toLowerCase();

        // Check for exact match or partial match in either direction
        return productCategoryLower === catLower ||
               productCategoryLower.includes(catLower) ||
               catLower.includes(productCategoryLower);
      });

      return categoryMatch;
    });

    console.log(`Found ${relevantProducts.length} products for category ${productType}`);
  }

  // If there are concerns, further filter products that match them
  if (concerns && Array.isArray(concerns) && concerns.length > 0) {
    const targetIngredients: string[] = [];
    const targetCategories: string[] = [];

    // Collect all relevant ingredients and categories from concerns
    concerns.forEach(concern => {
      const lowerConcern = concern.toLowerCase();
      if (concernMap[lowerConcern]) {
        targetIngredients.push(...concernMap[lowerConcern].ingredients);
        targetCategories.push(...concernMap[lowerConcern].categories);
      }
    });

    // Filter products that match any of the target ingredients or categories
    if (targetCategories.length > 0 || targetIngredients.length > 0) {
      relevantProducts = relevantProducts.filter(product => {
        const hasTargetCategory = targetCategories.length > 0 && product.category &&
          targetCategories.some(cat => {
            if (!cat) return false;
            const productCategoryLower = product.category.toLowerCase();
            const catLower = cat.toLowerCase();

            // Check for exact match or partial match in either direction
            return productCategoryLower === catLower ||
                   productCategoryLower.includes(catLower) ||
                   catLower.includes(productCategoryLower);
          });

        const hasTargetIngredient = targetIngredients.length > 0 &&
          product.ingredients &&
          targetIngredients.some(ingredient =>
            product.ingredients?.toLowerCase().includes(ingredient)
          );

        return hasTargetCategory || hasTargetIngredient;
      });
    }
  }

  if (productType && typeof productType === 'string') {
    console.log(`Total products found for ${productType}: ${relevantProducts.length}`);
  } else {
    console.log(`Total products found: ${relevantProducts.length}`);
  }

  return relevantProducts;
};