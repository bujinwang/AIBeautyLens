/**
 * This file contains a curated list of haircare products
 * These products are used for recommendations in the haircare analysis
 */

export interface HaircareProduct {
  id: string;
  brand: string;
  name: string;
  category: string; // e.g., "Shampoo", "Conditioner", "Treatment", etc.
  hairType: string[]; // e.g., ["Fine", "All", "Curly", "Damaged"]
  price: number;
  description: string;
  ingredients: string;
  usageInstructions?: string;
}

export const HAIRCARE_PRODUCTS: HaircareProduct[] = [
  {
    id: "hair001",
    brand: "Kerastase",
    name: "Bain Prevention Shampoo",
    category: "Medicated Shampoo",
    hairType: ["Thinning", "All"],
    price: 36,
    description: "Densifying shampoo for hair with thinning concerns, strengthens hair and prevents breakage",
    ingredients: "Keratine, Stemoxydine, PP Vitamin"
  },
  {
    id: "hair002",
    brand: "Olaplex",
    name: "No.4 Bond Maintenance Shampoo",
    category: "Shampoo",
    hairType: ["Damaged", "Chemically-Treated", "All"],
    price: 30,
    description: "Repairs and maintains bonds within the hair, reduces breakage and strengthens hair structure",
    ingredients: "Bis-Aminopropyl Diglycol Dimaleate, Sodium Lauroyl Methyl Isethionate"
  },
  {
    id: "hair003",
    brand: "Briogeo",
    name: "Scalp Revival Charcoal + Coconut Oil Micro-exfoliating Shampoo",
    category: "Exfoliating Shampoo",
    hairType: ["Oily Scalp", "Flaky Scalp", "All"],
    price: 42,
    description: "Detoxifies, removes buildup, and soothes a dry, flaky, itchy scalp",
    ingredients: "Binchotan Charcoal, Coconut Oil, Tea Tree Oil, Peppermint Oil"
  },
  {
    id: "hair004",
    brand: "Moroccanoil",
    name: "Hydrating Conditioner",
    category: "Conditioner",
    hairType: ["Dry", "All"],
    price: 26,
    description: "Improves hair manageability, smoothness and combability while restoring moisture balance",
    ingredients: "Argan Oil, Red Algae, Vitamin E"
  },
  {
    id: "hair005",
    brand: "Living Proof",
    name: "Restore Repair Leave-In",
    category: "Leave-In Treatment",
    hairType: ["Damaged", "Dry", "All"],
    price: 30,
    description: "Repairs existing damage and prevents future damage, improves manageability",
    ingredients: "Healthy Hair Molecule (OFPMA), Biomimetic Emollients, Amino Acid Complex"
  },
  {
    id: "hair006",
    brand: "Nioxin",
    name: "System 2 Scalp Treatment",
    category: "Scalp Treatment",
    hairType: ["Thinning", "Fine"],
    price: 45,
    description: "Delivers essential nutrients to scalp and hair, increases hair diameter, strengthens against damage",
    ingredients: "Niacinamide, Peppermint Oil, Biotin"
  },
  {
    id: "hair007",
    brand: "Paul Mitchell",
    name: "Tea Tree Special Shampoo",
    category: "Medicated Shampoo",
    hairType: ["Oily Scalp", "Irritated Scalp", "All"],
    price: 33,
    description: "Cleanses and soothes irritated scalps, removes impurities, leaves hair fresh and clean",
    ingredients: "Tea Tree Oil, Peppermint, Lavender"
  },
  {
    id: "hair008",
    brand: "Oribe",
    name: "Gold Lust Repair & Restore Mask",
    category: "Hair Mask",
    hairType: ["Damaged", "Dry", "All"],
    price: 63,
    description: "Rejuvenates hair to its healthiest prime, deeply repairs and prevents damage",
    ingredients: "Mediterranean Cypress Extract, Argan Oil, Maracuja Oil, Shea Butter"
  },
  {
    id: "hair009",
    brand: "The Ordinary",
    name: "Multi-Peptide Serum for Hair Density",
    category: "Hair Serum",
    hairType: ["Thinning", "All"],
    price: 18,
    description: "Targets multiple potential causes of hair thinning, improves hair density with continued use",
    ingredients: "Redensyl, Procapil, Baicapil, Capixyl"
  },
  {
    id: "hair010",
    brand: "Aveda",
    name: "Invati Advanced Scalp Revitalizer",
    category: "Scalp Treatment",
    hairType: ["Thinning", "All"],
    price: 67,
    description: "Reduces hair loss by 53% when used as part of the Invati system, thickens hair at the root",
    ingredients: "Turmeric, Ginseng, Amla, Certified Organic Kukui"
  },
  {
    id: "hair011",
    brand: "Christophe Robin",
    name: "Purifying Scalp Scrub with Sea Salt",
    category: "Scalp Scrub",
    hairType: ["All", "Oily Scalp", "Sensitive Scalp"],
    price: 53,
    description: "Soothes and restores balance to sensitive or oily scalps, exfoliates and removes product buildup",
    ingredients: "Sea Salt, Sweet Almond Oil, Bisabolol"
  },
  {
    id: "hair012",
    brand: "Olaplex",
    name: "No.8 Bond Intense Moisture Mask",
    category: "Hair Mask",
    hairType: ["Damaged", "Dry", "All"],
    price: 28,
    description: "Adds intense moisture to dry and damaged hair while repairing broken bonds",
    ingredients: "Bis-Aminopropyl Diglycol Dimaleate, Meadowfoam Seed Oil, Rice Bran Oil"
  },
  {
    id: "hair013",
    brand: "Pureology",
    name: "Hydrate Shampoo",
    category: "Shampoo",
    hairType: ["Dry", "Color-Treated", "All"],
    price: 30,
    description: "Provides intense hydration and color protection for dry, color-treated hair",
    ingredients: "Jojoba, Green Tea, Sage, AntiFade Complex"
  },
  {
    id: "hair014",
    brand: "Bumble and Bumble",
    name: "Hairdresser's Invisible Oil",
    category: "Hair Oil",
    hairType: ["Dry", "Frizzy", "All"],
    price: 40,
    description: "Tames frizz, softens, silkens, de-frizzes, detangles, and protects against breakage and heat damage",
    ingredients: "Coconut Oil, Argan Oil, Macadamia Nut Oil, Sweet Almond Oil"
  },
  {
    id: "hair015",
    brand: "Philip Kingsley",
    name: "Elasticizer",
    category: "Pre-Shampoo Treatment",
    hairType: ["Damaged", "All"],
    price: 49,
    description: "Delivers elasticity, bounce, strength, and shine to all hair types",
    ingredients: "Castor Oil, Elastin, Glycerin, Olive Oil"
  }
];

// Utility function to get products for specific hair types
export const getProductsForHairType = (
  hairType: string, 
  category?: string
): HaircareProduct[] => {
  const normalizedHairType = hairType.toLowerCase();
  
  return HAIRCARE_PRODUCTS.filter(product => {
    // Match either 'All' hair type or the specific hair type
    const matchesHairType = product.hairType.some(type => 
      type.toLowerCase() === 'all' || type.toLowerCase().includes(normalizedHairType)
    );
    
    // If category is specified, filter by that too
    if (category) {
      return matchesHairType && product.category.toLowerCase().includes(category.toLowerCase());
    }
    
    return matchesHairType;
  });
}; 