export const TREATMENTS = [
  // Laser Treatments
  {
    id: "pico-laser",
    name: "Picosecond Laser",
    category: "Laser",
    area: "Face",
    description: "Advanced laser technology that delivers energy in ultra-short picosecond pulses to target pigmentation and improve skin texture",
    price: 400
  },
  {
    id: "fractional-laser",
    name: "Fractional Laser",
    category: "Laser",
    area: "Face",
    description: "Creates micro-damage zones to stimulate collagen production and skin rejuvenation",
    price: 450
  },
  {
    id: "laser-hair-removal",
    name: "Permanent Laser Hair Removal",
    category: "Laser",
    area: "Various",
    description: "Uses laser energy to target hair follicles for permanent hair reduction",
    price: 300
  },
  
  // Radiofrequency Treatments
  {
    id: "tempsure-rf",
    name: "Tempsure Gold RF Lifting",
    category: "Radiofrequency",
    area: "Face",
    description: "Radiofrequency treatment that heats deep skin layers to stimulate collagen production and tighten skin",
    price: 500
  },
  {
    id: "thermage",
    name: "Thermage",
    category: "Radiofrequency",
    area: "Face/Body",
    description: "Premium radiofrequency treatment for significant skin tightening and contouring",
    price: 1200
  },
  {
    id: "flexsure",
    name: "Flexsure Body Contouring",
    category: "Radiofrequency",
    area: "Body",
    description: "Targeted radiofrequency treatment for body contouring and fat reduction",
    price: 600
  },
  
  // Injection Treatments
  {
    id: "ha-filler",
    name: "Hyaluronic Acid Filler",
    category: "Injection",
    area: "Face",
    description: "Injectable gel that adds volume, smooths lines, and enhances facial contours",
    price: 650
  },
  {
    id: "botox",
    name: "Botulinum Toxin",
    category: "Injection",
    area: "Face",
    description: "Relaxes muscles to reduce the appearance of wrinkles and fine lines",
    price: 350
  },
  {
    id: "fat-dissolving",
    name: "Fat Dissolving Injection",
    category: "Injection",
    area: "Face/Body",
    description: "Injectable treatment that breaks down fat cells for localized fat reduction",
    price: 550
  },
  {
    id: "prp",
    name: "PRP (Platelet-Rich Plasma)",
    category: "Injection",
    area: "Face/Scalp",
    description: "Uses patient's own blood plasma to stimulate cell regeneration and collagen production",
    price: 600
  },
  
  // Special Treatments
  {
    id: "hydrofacial",
    name: "HydroFacial",
    category: "Special",
    area: "Face",
    description: "Multi-step treatment that cleanses, exfoliates, and hydrates the skin",
    price: 200
  },
  {
    id: "aqua-needle",
    name: "Aqua Acupuncture",
    category: "Special",
    area: "Face",
    description: "Microinjections of hyaluronic acid and nutrients for skin hydration and rejuvenation",
    price: 300
  },
  {
    id: "head-spa",
    name: "Head Spa Machine",
    category: "Special",
    area: "Scalp",
    description: "Deep cleansing and stimulating treatment for the scalp to promote hair health and relieve tension",
    price: 65
  },
  {
    id: "acupuncture",
    name: "Acupuncture",
    category: "Special",
    area: "Face/Body",
    description: "Traditional therapy using fine needles to stimulate specific points on the body, promoting natural healing and wellness",
    price: 85
  }
];

// Categorized treatments for easier filtering
export const TREATMENT_CATEGORIES = [
  {
    id: "laser",
    name: "Laser Treatments",
    description: "Advanced light-based therapies for skin rejuvenation and hair removal"
  },
  {
    id: "radiofrequency",
    name: "Radiofrequency Treatments",
    description: "Energy-based treatments for skin tightening and body contouring"
  },
  {
    id: "injection",
    name: "Injection Treatments",
    description: "Injectable treatments for wrinkle reduction, volume enhancement, and more"
  },
  {
    id: "special",
    name: "Special Treatments",
    description: "Specialized treatments for skin rejuvenation and enhancement"
  }
]; 