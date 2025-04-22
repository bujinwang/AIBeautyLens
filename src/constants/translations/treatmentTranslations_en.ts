import { TreatmentTranslationsMap, CategoryTranslationsMap } from '../treatmentTypes';

// English translations for treatments
export const TREATMENT_TRANSLATIONS_EN: TreatmentTranslationsMap = {
  // Injectables
  "dermal-facial-fillers": {
    en: {
      name: "Dermal Facial Fillers",
      description: "Injectable dermal fillers to enhance facial contours and reduce signs of aging"
    },
    zh: {
      name: "面部皮肤填充剂",
      description: "注射式皮肤填充剂，增强面部轮廓并减少衰老迹象"
    }
  },
  "dermal-lip-fillers": {
    en: {
      name: "Dermal Lip Fillers",
      description: "Specialized fillers for lip enhancement and definition"
    },
    zh: {
      name: "唇部填充剂",
      description: "专门用于唇部增强和轮廓定义的填充剂"
    }
  },
  "belkyra": {
    en: {
      name: "Belkyra",
      description: "Injectable treatment for reducing submental fat (double chin)"
    },
    zh: {
      name: "Belkyra 注射",
      description: "用于减少下巴脂肪（双下巴）的注射治疗"
    }
  },
  "sculptra": {
    en: {
      name: "Sculptra",
      description: "Collagen stimulator for gradual, natural-looking volume restoration"
    },
    zh: {
      name: "Sculptra 胶原蛋白刺激剂",
      description: "用于逐渐、自然恢复面部体积的胶原蛋白刺激剂"
    }
  },
  "radiesse": {
    en: {
      name: "Radiesse",
      description: "Calcium-based filler for immediate volume and collagen stimulation"
    },
    zh: {
      name: "Radiesse 钙基填充剂",
      description: "基于钙的填充剂，用于即时增加体积和刺激胶原蛋白生成"
    }
  },
  "skin-booster": {
    en: {
      name: "Skin Booster",
      description: "Micro-injections of hyaluronic acid for skin hydration and rejuvenation"
    },
    zh: {
      name: "皮肤助推器",
      description: "透明质酸微注射，用于皮肤水合和焕发活力"
    }
  },
  "botox": {
    en: {
      name: "Neurotoxin (Botox/Dysport)",
      description: "Muscle relaxant for wrinkle reduction and facial rejuvenation"
    },
    zh: {
      name: "神经毒素（肉毒杆菌素/Dysport）",
      description: "肌肉松弛剂，用于减少皱纹和面部焕发活力"
    }
  },
  "prp-facial": {
    en: {
      name: "PFR Facial Rejuvenation",
      description: "Platelet-rich plasma therapy for natural skin regeneration"
    },
    zh: {
      name: "PFR 面部焕肤",
      description: "富含血小板的血浆疗法，用于自然皮肤再生"
    }
  },

  // Laser & Resurfacing
  "fotona-deep": {
    en: {
      name: "Fotona Deep Fractional",
      description: "Advanced laser treatment for deep skin resurfacing and rejuvenation"
    },
    zh: {
      name: "Fotona 深层点阵激光",
      description: "用于深层皮肤重塑和焕发活力的先进激光治疗"
    }
  },
  "m22": {
    en: {
      name: "M22",
      description: "Multi-application platform for various skin concerns"
    },
    zh: {
      name: "M22 多功能平台",
      description: "用于各种皮肤问题的多应用平台"
    }
  },
  "m22-stellar": {
    en: {
      name: "M22 Stellar",
      description: "Advanced IPL treatment for pigmentation and vessels"
    },
    zh: {
      name: "M22 Stellar 强脉冲光",
      description: "用于色素沉着和血管问题的先进IPL治疗"
    }
  },
  "picoway": {
    en: {
      name: "PicoWay",
      description: "Picosecond laser for pigmentation and tattoo removal"
    },
    zh: {
      name: "PicoWay 皮秒激光",
      description: "用于色素沉着和纹身去除的皮秒激光"
    }
  },
  "picosure": {
    en: {
      name: "PicoSure",
      description: "Picosecond laser technology for skin rejuvenation"
    },
    zh: {
      name: "PicoSure 皮秒激光",
      description: "用于皮肤焕发活力的皮秒激光技术"
    }
  },
  "lumecca": {
    en: {
      name: "Lumecca",
      description: "IPL treatment for pigmentation and vascular lesions"
    },
    zh: {
      name: "Lumecca 光子嫩肤",
      description: "用于色素沉着和血管病变的IPL治疗"
    }
  },
  "vbeam": {
    en: {
      name: "VBeam Lasers",
      description: "Pulsed dye laser for vascular conditions"
    },
    zh: {
      name: "VBeam 脉冲染料激光",
      description: "用于血管疾病的脉冲染料激光"
    }
  },

  // Medical Rejuvenation
  "trilift": {
    en: {
      name: "TriLift",
      description: "Triple-action treatment for skin tightening and lifting"
    },
    zh: {
      name: "TriLift 三重提升",
      description: "用于皮肤紧致和提升的三重作用治疗"
    }
  },
  "thermage": {
    en: {
      name: "Thermage",
      description: "Radiofrequency treatment for skin tightening"
    },
    zh: {
      name: "Thermage 热玛吉",
      description: "用于皮肤紧致的射频治疗"
    }
  },
  "ultherapy": {
    en: {
      name: "Ultherapy",
      description: "Ultrasound therapy for skin lifting and tightening"
    },
    zh: {
      name: "Ultherapy 超声刀",
      description: "用于皮肤提升和紧致的超声波治疗"
    }
  },

  // Skin Med Care
  "hydrafacial": {
    en: {
      name: "HydraFacial",
      description: "Multi-step treatment for deep cleansing and hydration"
    },
    zh: {
      name: "HydraFacial 水光焕肤",
      description: "用于深层清洁和保湿的多步骤治疗"
    }
  },
  "mesotherapy": {
    en: {
      name: "Mesotherapy",
      description: "Micro-injections of vitamins and minerals"
    },
    zh: {
      name: "美塑疗法",
      description: "维生素和矿物质的微注射"
    }
  },
  "beauty-booster": {
    en: {
      name: "Beauty Booster",
      description: "Advanced skin hydration and rejuvenation treatment"
    },
    zh: {
      name: "美丽助推器",
      description: "先进的皮肤保湿和焕发活力治疗"
    }
  },
  "bela-md": {
    en: {
      name: "Bela MD",
      description: "Customized facial treatment with advanced technology"
    },
    zh: {
      name: "Bela MD 面部护理",
      description: "使用先进技术的定制面部护理"
    }
  },
  "chemical-peel": {
    en: {
      name: "Chemical Peel",
      description: "Chemical exfoliation for skin renewal"
    },
    zh: {
      name: "化学换肤",
      description: "用于皮肤更新的化学去角质"
    }
  },

  // Body Treatments
  "splendor-x": {
    en: {
      name: "Splendor X",
      description: "Advanced laser hair removal and skin rejuvenation"
    },
    zh: {
      name: "Splendor X 激光脱毛",
      description: "先进的激光脱毛和皮肤焕发活力"
    }
  },
  "emsculpt-neo": {
    en: {
      name: "EMSculpt NEO",
      description: "Muscle building and fat reduction treatment"
    },
    zh: {
      name: "EMSculpt NEO 肌肉塑形",
      description: "肌肉增强和脂肪减少治疗"
    }
  },
  "body-contouring": {
    en: {
      name: "Body Contouring",
      description: "Non-invasive body sculpting treatment"
    },
    zh: {
      name: "身体轮廓塑造",
      description: "非侵入性身体塑形治疗"
    }
  },

  // Women Health
  "btl-emsella": {
    en: {
      name: "BTL EMSELLA",
      description: "Non-invasive treatment for pelvic floor strengthening"
    },
    zh: {
      name: "BTL EMSELLA 盆底肌修复",
      description: "用于盆底肌加强的非侵入性治疗"
    }
  },
  "feminine-wellness": {
    en: {
      name: "Plus 90 Feminine Wellness",
      description: "Comprehensive feminine wellness treatment"
    },
    zh: {
      name: "Plus 90 女性健康",
      description: "全面的女性健康治疗"
    }
  },
  "vaginal-rejuvenation": {
    en: {
      name: "Vaginal Rejuvenation",
      description: "Non-surgical vaginal rejuvenation treatment"
    },
    zh: {
      name: "阴道焕发活力",
      description: "非手术阴道焕发活力治疗"
    }
  },

  // Microblading
  "eyebrows-microblading": {
    en: {
      name: "Eyebrows",
      description: "Semi-permanent eyebrow enhancement"
    },
    zh: {
      name: "眉毛",
      description: "半永久性眉毛增强"
    }
  },
  "lips-microblading": {
    en: {
      name: "Lips",
      description: "Semi-permanent lip enhancement"
    },
    zh: {
      name: "嘴唇",
      description: "半永久性唇部增强"
    }
  },
  "hairline-microblading": {
    en: {
      name: "Hairline",
      description: "Semi-permanent hairline enhancement"
    },
    zh: {
      name: "发际线",
      description: "半永久性发际线增强"
    }
  },

  // Others
  "scalp-cleaning": {
    en: {
      name: "HydraFacial Scalp Cleaning",
      description: "Deep cleansing treatment for scalp health"
    },
    zh: {
      name: "HydraFacial 头皮清洁",
      description: "用于头皮健康的深层清洁治疗"
    }
  },
  "hair-restoration": {
    en: {
      name: "Hair Restoration",
      description: "Advanced treatment for hair growth and restoration"
    },
    zh: {
      name: "头发修复",
      description: "用于头发生长和修复的先进治疗"
    }
  },
  "hand-treatment": {
    en: {
      name: "Hand Treatment",
      description: "Rejuvenation treatment for hands"
    },
    zh: {
      name: "手部护理",
      description: "手部焕发活力治疗"
    }
  },
  "snoring-treatment": {
    en: {
      name: "Snoring Treatment",
      description: "Non-invasive treatment for snoring reduction"
    },
    zh: {
      name: "打鼾治疗",
      description: "用于减少打鼾的非侵入性治疗"
    }
  },
  "massage": {
    en: {
      name: "Massage",
      description: "Therapeutic massage treatments"
    },
    zh: {
      name: "按摩",
      description: "治疗性按摩"
    }
  },
  "acupuncture": {
    en: {
      name: "Acupuncture",
      description: "Traditional Chinese medicine treatment"
    },
    zh: {
      name: "针灸",
      description: "传统中医治疗"
    }
  }
};

// English translations for categories
export const CATEGORY_TRANSLATIONS_EN: CategoryTranslationsMap = {
  "injectables": {
    en: {
      name: "Injectables",
      description: "Injectable treatments for facial enhancement and rejuvenation",
      generalRestrictions: "Most injectable treatments require consultation and may have age restrictions"
    },
    zh: {
      name: "注射治疗",
      description: "用于面部增强和焕发活力的注射治疗",
      generalRestrictions: "大多数注射治疗需要咨询，并可能有年龄限制"
    }
  },
  "laser": {
    en: {
      name: "Laser & Resurfacing",
      description: "Advanced laser and light-based treatments for skin concerns",
      generalRestrictions: "Most laser treatments require a series of sessions and have specific pre/post care requirements"
    },
    zh: {
      name: "激光和表面重塑",
      description: "用于皮肤问题的先进激光和光疗治疗",
      generalRestrictions: "大多数激光治疗需要一系列疗程，并有特定的前/后护理要求"
    }
  },
  "medical-rejuvenation": {
    en: {
      name: "Medical Rejuvenation",
      description: "Advanced medical treatments for skin rejuvenation",
      generalRestrictions: "These treatments often require preparation and may have recovery time"
    },
    zh: {
      name: "医疗焕肤",
      description: "用于皮肤焕发活力的先进医疗治疗",
      generalRestrictions: "这些治疗通常需要准备，并可能有恢复时间"
    }
  },
  "skin-med-care": {
    en: {
      name: "Skin Med Care",
      description: "Medical-grade skincare treatments and procedures",
      generalRestrictions: "Treatment plans are customized based on skin condition and concerns"
    },
    zh: {
      name: "医疗级皮肤护理",
      description: "医疗级皮肤护理治疗和程序",
      generalRestrictions: "治疗计划根据皮肤状况和问题进行定制"
    }
  },
  "body-treatment": {
    en: {
      name: "Body Treatment",
      description: "Specialized treatments for body contouring and improvement",
      generalRestrictions: "Results vary by individual and may require multiple sessions"
    },
    zh: {
      name: "身体护理",
      description: "用于身体轮廓塑造和改善的专业治疗",
      generalRestrictions: "结果因个人而异，可能需要多次疗程"
    }
  },
  "women-health": {
    en: {
      name: "Women Health",
      description: "Specialized treatments for women's health and wellness",
      generalRestrictions: "These treatments require medical screening and consultation"
    },
    zh: {
      name: "女性健康",
      description: "专门用于女性健康和保健的治疗",
      generalRestrictions: "这些治疗需要医疗筛查和咨询"
    }
  },
  "microblading": {
    en: {
      name: "Microblading",
      description: "Semi-permanent makeup and cosmetic tattooing",
      generalRestrictions: "Results are semi-permanent and may require touch-ups"
    },
    zh: {
      name: "半永久纹绣",
      description: "半永久性化妆和美容纹身",
      generalRestrictions: "结果是半永久性的，可能需要修饰"
    }
  },
  "others": {
    en: {
      name: "Others",
      description: "Additional specialized treatments and services",
      generalRestrictions: "Various treatments with specific requirements and considerations"
    },
    zh: {
      name: "其他",
      description: "其他专业治疗和服务",
      generalRestrictions: "各种治疗有特定的要求和注意事项"
    }
  }
};
