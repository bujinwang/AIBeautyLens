export const TREATMENTS = [
  // Injectables
  {
    id: "dermal-facial-fillers",
    name: "Dermal Facial Fillers",
    category: "Injectables",
    area: "Face",
    description: "Injectable dermal fillers to enhance facial contours and reduce signs of aging",
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
    name: "Dermal Lip Fillers",
    category: "Injectables",
    area: "Lips",
    description: "Specialized fillers for lip enhancement and definition",
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
    name: "Belkyra",
    category: "Injectables",
    area: "Face",
    description: "Injectable treatment for reducing submental fat (double chin)",
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
    name: "Sculptra",
    category: "Injectables",
    area: "Face",
    description: "Collagen stimulator for gradual, natural-looking volume restoration",
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
    name: "Radiesse",
    category: "Injectables",
    area: "Face/Hands",
    description: "Calcium-based filler for immediate volume and collagen stimulation",
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
    name: "Skin Booster",
    category: "Injectables",
    area: "Face",
    description: "Micro-injections of hyaluronic acid for skin hydration and rejuvenation",
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
    name: "Neurotoxin (Botox/Dysport)",
    category: "Injectables",
    area: "Face",
    description: "Muscle relaxant for wrinkle reduction and facial rejuvenation",
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
    name: "PFR Facial Rejuvenation",
    category: "Injectables",
    area: "Face",
    description: "Platelet-rich plasma therapy for natural skin regeneration",
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
    name: "Fotona Deep Fractional",
    category: "Laser",
    area: "Face",
    description: "Advanced laser treatment for deep skin resurfacing and rejuvenation",
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
    name: "M22",
    category: "Laser",
    area: "Face/Body",
    description: "Multi-application platform for various skin concerns",
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
    name: "M22 Stellar",
    category: "Laser",
    area: "Face",
    description: "Advanced IPL treatment for pigmentation and vessels",
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
    name: "PicoWay",
    category: "Laser",
    area: "Face",
    description: "Picosecond laser for pigmentation and tattoo removal",
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
    name: "PicoSure",
    category: "Laser",
    area: "Face",
    description: "Picosecond laser technology for skin rejuvenation",
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
    name: "Lumecca",
    category: "Laser",
    area: "Face/Body",
    description: "IPL treatment for pigmentation and vascular lesions",
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
    name: "VBeam Lasers",
    category: "Laser",
    area: "Face/Body",
    description: "Pulsed dye laser for vascular conditions",
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
    name: "TriLift",
    category: "Medical Rejuvenation",
    area: "Face",
    description: "Triple-action treatment for skin tightening and lifting",
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
    name: "Thermage",
    category: "Medical Rejuvenation",
    area: "Face/Body",
    description: "Radiofrequency treatment for skin tightening",
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
    name: "Ultherapy",
    category: "Medical Rejuvenation",
    area: "Face/Neck",
    description: "Ultrasound therapy for skin lifting and tightening",
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
    name: "HydraFacial",
    category: "Skin Med Care",
    area: "Face",
    description: "Multi-step treatment for deep cleansing and hydration",
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
    name: "Mesotherapy",
    category: "Skin Med Care",
    area: "Face/Body",
    description: "Micro-injections of vitamins and minerals",
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
    name: "Beauty Booster",
    category: "Skin Med Care",
    area: "Face",
    description: "Advanced skin hydration and rejuvenation treatment",
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
    name: "Bela MD",
    category: "Skin Med Care",
    area: "Face",
    description: "Customized facial treatment with advanced technology",
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
    name: "Chemical Peel",
    category: "Skin Med Care",
    area: "Face",
    description: "Chemical exfoliation for skin renewal",
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
    name: "Splendor X",
    category: "Body Treatment",
    area: "Body",
    description: "Advanced laser hair removal and skin rejuvenation",
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
    name: "EMSculpt NEO",
    category: "Body Treatment",
    area: "Body",
    description: "Muscle building and fat reduction treatment",
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
    name: "Body Contouring",
    category: "Body Treatment",
    area: "Body",
    description: "Non-invasive body sculpting treatment",
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
    name: "BTL EMSELLA",
    category: "Women Health",
    area: "Pelvic Area",
    description: "Non-invasive treatment for pelvic floor strengthening",
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
    name: "Plus 90 Feminine Wellness",
    category: "Women Health",
    area: "Intimate Area",
    description: "Comprehensive feminine wellness treatment",
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
    name: "Vaginal Rejuvenation",
    category: "Women Health",
    area: "Intimate Area",
    description: "Non-surgical vaginal rejuvenation treatment",
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
    name: "Eyebrows",
    category: "Microblading",
    area: "Face",
    description: "Semi-permanent eyebrow enhancement",
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
    name: "Lips",
    category: "Microblading",
    area: "Face",
    description: "Semi-permanent lip enhancement",
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
    name: "Hairline",
    category: "Microblading",
    area: "Scalp",
    description: "Semi-permanent hairline enhancement",
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
    name: "HydraFacial Scalp Cleaning",
    category: "Others",
    area: "Scalp",
    description: "Deep cleansing treatment for scalp health",
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
    name: "Hair Restoration",
    category: "Others",
    area: "Scalp",
    description: "Advanced treatment for hair growth and restoration",
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
    name: "Hand Treatment",
    category: "Others",
    area: "Hands",
    description: "Rejuvenation treatment for hands",
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
    name: "Snoring Treatment",
    category: "Others",
    area: "Throat",
    description: "Non-invasive treatment for snoring reduction",
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
    name: "Massage",
    category: "Others",
    area: "Body",
    description: "Therapeutic massage treatments",
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
    name: "Acupuncture",
    category: "Others",
    area: "Body",
    description: "Traditional Chinese medicine treatment",
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

// Categorized treatments for easier filtering
export const TREATMENT_CATEGORIES = [
  {
    id: "injectables",
    name: "Injectables",
    description: "Injectable treatments for facial enhancement and rejuvenation",
    generalRestrictions: "Most injectable treatments require consultation and may have age restrictions"
  },
  {
    id: "laser",
    name: "Laser & Resurfacing",
    description: "Advanced laser and light-based treatments for skin concerns",
    generalRestrictions: "Most laser treatments require a series of sessions and have specific pre/post care requirements"
  },
  {
    id: "medical-rejuvenation",
    name: "Medical Rejuvenation",
    description: "Advanced medical treatments for skin rejuvenation",
    generalRestrictions: "These treatments often require preparation and may have recovery time"
  },
  {
    id: "skin-med-care",
    name: "Skin Med Care",
    description: "Medical-grade skincare treatments and procedures",
    generalRestrictions: "Treatment plans are customized based on skin condition and concerns"
  },
  {
    id: "body-treatment",
    name: "Body Treatment",
    description: "Specialized treatments for body contouring and improvement",
    generalRestrictions: "Results vary by individual and may require multiple sessions"
  },
  {
    id: "women-health",
    name: "Women Health",
    description: "Specialized treatments for women's health and wellness",
    generalRestrictions: "These treatments require medical screening and consultation"
  },
  {
    id: "microblading",
    name: "Microblading",
    description: "Semi-permanent makeup and cosmetic tattooing",
    generalRestrictions: "Results are semi-permanent and may require touch-ups"
  },
  {
    id: "others",
    name: "Others",
    description: "Additional specialized treatments and services",
    generalRestrictions: "Various treatments with specific requirements and considerations"
  }
]; 