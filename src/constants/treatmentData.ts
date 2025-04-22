import { BaseTreatment } from './treatmentTypes';

// Base treatment data without translations
export const BASE_TREATMENTS: BaseTreatment[] = [
  // Injectables
  {
    id: "dermal-facial-fillers",
    category: "Injectables",
    area: "Face",
    price: 650,
    contraindications: [
      "Active skin infections or inflammation",
      "Autoimmune diseases affecting the skin",
      "Bleeding disorders or use of blood thinners",
      "Pregnancy or breastfeeding",
      "History of severe allergies or anaphylaxis",
      "Recent dental work (within 2 weeks)",
      "Active herpes outbreak in treatment area",
      "History of keloid scarring"
    ],
    restrictions: "Not recommended for clients under 18 or with active skin conditions"
  },
  {
    id: "dermal-lip-fillers",
    category: "Injectables",
    area: "Lips",
    price: 550,
    contraindications: [
      "Active cold sores",
      "Oral infections",
      "Autoimmune diseases",
      "Pregnancy or breastfeeding"
    ],
    restrictions: "Not recommended for clients under 18"
  },
  {
    id: "belkyra",
    category: "Injectables",
    area: "Face",
    price: 800,
    contraindications: [
      "Pregnancy or breastfeeding",
      "Infection in treatment area",
      "Difficulty swallowing",
      "Previous surgical procedures in the area"
    ],
    restrictions: "Multiple sessions may be required for optimal results"
  },
  {
    id: "sculptra",
    category: "Injectables",
    area: "Face",
    price: 900,
    contraindications: [
      "Active skin infections",
      "Autoimmune conditions",
      "History of keloid formation",
      "Pregnancy or breastfeeding"
    ],
    restrictions: "Results develop over several months"
  },
  {
    id: "radiesse",
    category: "Injectables",
    area: "Face/Hands",
    price: 750,
    contraindications: [
      "Severe allergies",
      "Bleeding disorders",
      "Pregnancy or breastfeeding",
      "Active skin infections"
    ],
    restrictions: "Not recommended for lip enhancement"
  },
  {
    id: "skin-booster",
    category: "Injectables",
    area: "Face",
    price: 400,
    contraindications: [
      "Active acne",
      "Skin infections",
      "Autoimmune conditions",
      "Recent sun exposure"
    ],
    restrictions: "May require multiple sessions"
  },
  {
    id: "botox",
    category: "Injectables",
    area: "Face",
    price: 350,
    contraindications: [
      "Neuromuscular junction disorders (e.g., Myasthenia Gravis)",
      "Active infection at injection sites",
      "Pregnancy or breastfeeding",
      "History of adverse reactions to botulinum toxin",
      "Lambert-Eaton syndrome",
      "Taking aminoglycoside antibiotics",
      "Severe ptosis or muscle weakness",
      "Psychological conditions affecting treatment expectations"
    ],
    restrictions: "Results typically last 3-4 months"
  },
  {
    id: "prp-facial",
    category: "Injectables",
    area: "Face",
    price: 600,
    contraindications: [
      "Blood disorders",
      "Active skin infections",
      "Recent sun exposure",
      "Certain medications"
    ],
    restrictions: "Results may vary based on individual healing response"
  },

  // Laser & Resurfacing
  {
    id: "fotona-deep",
    category: "Laser",
    area: "Face",
    price: 800,
    contraindications: [
      "Active skin infections or inflammation",
      "Recent sun exposure or tanning",
      "History of keloid scarring",
      "Pregnancy or breastfeeding",
      "Use of photosensitizing medications",
      "Uncontrolled diabetes",
      "Active cold sores in treatment area",
      "Isotretinoin use within past 6 months"
    ],
    restrictions: "Requires downtime for healing"
  },
  {
    id: "m22",
    category: "Laser",
    area: "Face/Body",
    price: 500,
    contraindications: [
      "Recent tanning",
      "Photosensitivity",
      "Certain medications",
      "Pregnancy"
    ],
    restrictions: "Treatment plan varies by condition"
  },
  {
    id: "m22-stellar",
    category: "Laser",
    area: "Face",
    price: 600,
    contraindications: [
      "Dark skin types",
      "Recent sun exposure",
      "Active skin infections",
      "Pregnancy"
    ],
    restrictions: "Series of treatments recommended"
  },
  {
    id: "picoway",
    category: "Laser",
    area: "Face",
    price: 700,
    contraindications: [
      "Recent sun exposure",
      "Pregnancy",
      "Active skin conditions",
      "Certain medications"
    ],
    restrictions: "Multiple sessions may be needed"
  },
  {
    id: "picosure",
    category: "Laser",
    area: "Face",
    price: 750,
    contraindications: [
      "Active skin infections",
      "Recent sun exposure",
      "Pregnancy",
      "History of keloids"
    ],
    restrictions: "Treatment plan varies by condition"
  },
  {
    id: "lumecca",
    category: "Laser",
    area: "Face/Body",
    price: 450,
    contraindications: [
      "Recent tanning",
      "Photosensitivity",
      "Pregnancy",
      "Certain skin conditions"
    ],
    restrictions: "Not suitable for all skin types"
  },
  {
    id: "vbeam",
    category: "Laser",
    area: "Face/Body",
    price: 500,
    contraindications: [
      "Blood disorders",
      "Recent sun exposure",
      "Pregnancy",
      "Certain medications"
    ],
    restrictions: "May require multiple sessions"
  },

  // Medical Rejuvenation
  {
    id: "trilift",
    category: "Medical Rejuvenation",
    area: "Face",
    price: 900,
    contraindications: [
      "Pregnancy",
      "Metal implants",
      "Active skin infections",
      "Recent fillers"
    ],
    restrictions: "Results develop over time"
  },
  {
    id: "thermage",
    category: "Medical Rejuvenation",
    area: "Face/Body",
    price: 1200,
    contraindications: [
      "Pacemakers",
      "Metal implants",
      "Pregnancy",
      "Active skin conditions"
    ],
    restrictions: "One treatment typically recommended"
  },
  {
    id: "ultherapy",
    category: "Medical Rejuvenation",
    area: "Face/Neck",
    price: 2500,
    contraindications: [
      "Very thin skin",
      "Active infections",
      "Pregnancy",
      "Certain medical conditions"
    ],
    restrictions: "Results develop over 2-3 months"
  },

  // Skin Med Care
  {
    id: "hydrafacial",
    category: "Skin Med Care",
    area: "Face",
    price: 200,
    contraindications: [
      "Active rosacea",
      "Severe acne",
      "Recent chemical peels",
      "Sunburn"
    ],
    restrictions: "Safe for most skin types"
  },
  {
    id: "mesotherapy",
    category: "Skin Med Care",
    area: "Face/Body",
    price: 300,
    contraindications: [
      "Blood disorders",
      "Pregnancy",
      "Active infections",
      "Autoimmune conditions"
    ],
    restrictions: "Series of treatments recommended"
  },
  {
    id: "beauty-booster",
    category: "Skin Med Care",
    area: "Face",
    price: 350,
    contraindications: [
      "Active acne",
      "Skin infections",
      "Recent procedures",
      "Pregnancy"
    ],
    restrictions: "Maintenance treatments recommended"
  },
  {
    id: "bela-md",
    category: "Skin Med Care",
    area: "Face",
    price: 250,
    contraindications: [
      "Active infections",
      "Recent procedures",
      "Severe sensitivity",
      "Open wounds"
    ],
    restrictions: "Treatment plan varies by skin condition"
  },
  {
    id: "chemical-peel",
    category: "Skin Med Care",
    area: "Face",
    price: 150,
    contraindications: [
      "Open wounds or active skin infections",
      "Recent sun exposure or sunburn",
      "Pregnancy or breastfeeding",
      "History of keloid scarring",
      "Active herpes simplex virus",
      "Recent facial surgery",
      "Use of isotretinoin within past 6 months",
      "Compromised skin barrier"
    ],
    restrictions: "Downtime varies by peel strength"
  },

  // Body Treatments
  {
    id: "splendor-x",
    category: "Body Treatment",
    area: "Body",
    price: 400,
    contraindications: [
      "Recent tanning",
      "Pregnancy",
      "Active skin conditions",
      "Certain medications"
    ],
    restrictions: "Multiple sessions required"
  },
  {
    id: "emsculpt-neo",
    category: "Body Treatment",
    area: "Body",
    price: 800,
    contraindications: [
      "Metal or electronic implants in treatment area",
      "Recent surgery in treatment area",
      "Pregnancy",
      "Active cancer or malignancy",
      "Severe cardiovascular conditions",
      "Bleeding disorders",
      "Severe muscle conditions",
      "Uncontrolled diabetes"
    ],
    restrictions: "Series of treatments recommended"
  },
  {
    id: "body-contouring",
    category: "Body Treatment",
    area: "Body",
    price: 600,
    contraindications: [
      "Pregnancy",
      "Recent surgery",
      "Metal implants",
      "Certain medical conditions"
    ],
    restrictions: "Results vary by individual"
  },

  // Women Health
  {
    id: "btl-emsella",
    category: "Women Health",
    area: "Pelvic Area",
    price: 300,
    contraindications: [
      "Pregnancy or immediate postpartum",
      "Metal implants in pelvic area",
      "Recent pelvic surgery",
      "Active urinary tract infection",
      "Severe prolapse",
      "Active cancer",
      "Cardiac pacemaker or defibrillator",
      "Copper IUD"
    ],
    restrictions: "Series of treatments recommended"
  },
  {
    id: "feminine-wellness",
    category: "Women Health",
    area: "Intimate Area",
    price: 500,
    contraindications: [
      "Pregnancy",
      "Active infections",
      "Recent procedures",
      "Certain medical conditions"
    ],
    restrictions: "Consultation required"
  },
  {
    id: "vaginal-rejuvenation",
    category: "Women Health",
    area: "Intimate Area",
    price: 700,
    contraindications: [
      "Pregnancy",
      "Active infections",
      "Recent procedures",
      "Certain medical conditions"
    ],
    restrictions: "Medical screening required"
  },

  // Microblading
  {
    id: "eyebrows-microblading",
    category: "Microblading",
    area: "Face",
    price: 500,
    contraindications: [
      "Pregnancy or breastfeeding",
      "Use of blood thinners or anticoagulants",
      "Active skin conditions in treatment area",
      "Chemotherapy or radiation therapy",
      "Uncontrolled diabetes",
      "History of keloid scarring",
      "Active autoimmune conditions",
      "Recent Botox (within 2 weeks)"
    ],
    restrictions: "Touch-up may be needed"
  },
  {
    id: "lips-microblading",
    category: "Microblading",
    area: "Face",
    price: 400,
    contraindications: [
      "Active cold sores",
      "Pregnancy",
      "Blood thinners",
      "Recent lip procedures"
    ],
    restrictions: "Results vary by skin type"
  },
  {
    id: "hairline-microblading",
    category: "Microblading",
    area: "Scalp",
    price: 600,
    contraindications: [
      "Scalp conditions",
      "Recent hair treatments",
      "Pregnancy",
      "Blood thinners"
    ],
    restrictions: "Multiple sessions may be needed"
  },

  // Others
  {
    id: "scalp-cleaning",
    category: "Others",
    area: "Scalp",
    price: 150,
    contraindications: [
      "Active scalp infections",
      "Recent chemical treatments",
      "Open wounds",
      "Severe sensitivity"
    ],
    restrictions: "Regular maintenance recommended"
  },
  {
    id: "hair-restoration",
    category: "Others",
    area: "Scalp",
    price: 800,
    contraindications: [
      "Active scalp conditions",
      "Recent procedures",
      "Certain medications",
      "Autoimmune conditions"
    ],
    restrictions: "Long-term treatment plan required"
  },
  {
    id: "hand-treatment",
    category: "Others",
    area: "Hands",
    price: 200,
    contraindications: [
      "Active infections",
      "Recent injuries",
      "Severe arthritis",
      "Certain skin conditions"
    ],
    restrictions: "Results vary by age and condition"
  },
  {
    id: "snoring-treatment",
    category: "Others",
    area: "Throat",
    price: 400,
    contraindications: [
      "Sleep apnea",
      "Recent throat surgery",
      "Severe respiratory conditions",
      "Pregnancy"
    ],
    restrictions: "Medical evaluation required"
  },
  {
    id: "massage",
    category: "Others",
    area: "Body",
    price: 100,
    contraindications: [
      "Recent injuries",
      "Blood clots",
      "Fever",
      "Certain medical conditions"
    ],
    restrictions: "Intensity adjusted to individual needs"
  },
  {
    id: "acupuncture",
    category: "Others",
    area: "Body",
    price: 85,
    contraindications: [
      "Bleeding disorders or use of blood thinners",
      "Pregnancy (certain points)",
      "Severe skin conditions in treatment areas",
      "Active infections",
      "Severe cardiovascular disease",
      "Uncontrolled diabetes",
      "Hemophilia",
      "Neutropenia or thrombocytopenia"
    ],
    restrictions: "Series of treatments may be recommended"
  }
];

// Base category data without translations
export const BASE_CATEGORIES = [
  {
    id: "injectables",
  },
  {
    id: "laser",
  },
  {
    id: "medical-rejuvenation",
  },
  {
    id: "skin-med-care",
  },
  {
    id: "body-treatment",
  },
  {
    id: "women-health",
  },
  {
    id: "microblading",
  },
  {
    id: "others",
  }
];
