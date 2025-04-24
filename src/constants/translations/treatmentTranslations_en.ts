import { TreatmentTranslationsMap, CategoryTranslationsMap } from '../treatmentTypes';

// English translations for treatments
export const TREATMENT_TRANSLATIONS_EN: TreatmentTranslationsMap = {
  // Injectables
  "dermal-facial-fillers": {
    en: {
      name: "Dermal Facial Fillers",
      description: "Injectable hyaluronic acid fillers that restore volume, smooth lines, and enhance facial contours. Effective for nasolabial folds, marionette lines, cheek hollowing, and age-related volume loss. Results last 6-18 months depending on product and area treated."
    },
    zh: {
      name: "面部皮肤填充剂",
      description: "注射式透明质酸填充剂，可恢复面部体积，平滑皱纹，增强面部轮廓。有效改善法令纹、木偶纹、面颊凹陷和年龄相关的体积流失。根据产品和治疗区域，效果可持续6-18个月。适用于中度至重度皱纹和面部凹陷。"
    }
  },
  "dermal-lip-fillers": {
    en: {
      name: "Dermal Lip Fillers",
      description: "Specialized hyaluronic acid fillers designed specifically for lip enhancement, adding volume, improving symmetry, and defining the lip border. Can correct thin lips, asymmetry, and age-related volume loss. Results typically last 6-12 months with natural-looking enhancement."
    },
    zh: {
      name: "唇部填充剂",
      description: "专门设计用于唇部增强的透明质酸填充剂，可增加唇部体积，改善对称性，并定义唇部轮廓。能够矫正唇薄、不对称和年龄相关的唇部体积流失。效果通常持续6-12个月，提供自然美观的增强效果。适用于想要丰唇或改善唇部形态的人士。"
    }
  },
  "belkyra": {
    en: {
      name: "Belkyra",
      description: "FDA-approved injectable treatment containing deoxycholic acid that permanently destroys fat cells under the chin (submental fat). Reduces double chin appearance without surgery. Typically requires 2-4 treatment sessions spaced 4-6 weeks apart for optimal results. Creates a more defined jawline and profile."
    },
    zh: {
      name: "Belkyra 注射",
      description: "FDA批准的注射治疗，含有脱氧胆酸，可永久破坏下巴下方（下颌下）的脂肪细胞。无需手术即可减少双下巴的外观。通常需要2-4次治疗疗程，间隔4-6周，以获得最佳效果。创造更加清晰的下颌线条和侧面轮廓。适用于有轻度至中度下颌下脂肪堆积的患者。"
    }
  },
  "sculptra": {
    en: {
      name: "Sculptra",
      description: "Advanced collagen biostimulator containing poly-L-lactic acid that gradually restores facial volume by stimulating your body's own collagen production. Treats deep facial wrinkles, hollow temples, sunken cheeks, and facial aging. Results develop over 2-3 months and can last up to 2 years. Provides natural-looking, progressive rejuvenation."
    },
    zh: {
      name: "Sculptra 胶原蛋白刺激剂",
      description: "先进的胶原蛋白生物刺激剂，含有聚左旋乳酸，通过刺激身体自身的胶原蛋白生成来逐渐恢复面部体积。治疗深层面部皱纹、凹陷的太阳穴、凹陷的脸颊和面部老化。效果在2-3个月内逐渐显现，可持续长达2年。提供自然、渐进的面部年轻化效果。适用于需要全面面部体积恢复的患者。"
    }
  },
  "radiesse": {
    en: {
      name: "Radiesse",
      description: "Unique calcium hydroxylapatite-based dermal filler that provides immediate volume correction and stimulates natural collagen production for long-term results. Excellent for deep wrinkles, nasolabial folds, cheek augmentation, jawline definition, and hand rejuvenation. Results last 12-18 months with continued improvement over time."
    },
    zh: {
      name: "Radiesse 钙基填充剂",
      description: "独特的羟基磷灰石钙基皮肤填充剂，可提供即时体积修复并刺激天然胶原蛋白生成，实现长期效果。非常适合深层皱纹、法令纹、面颊增强、下颌线定义和手部年轻化。效果可持续12-18个月，随着时间推移持续改善。适用于需要结构性支撑和轮廓塑造的面部区域，特别适合中度至重度皱纹和体积流失。"
    }
  },
  "skin-booster": {
    en: {
      name: "Skin Booster",
      description: "Advanced micro-injection treatment using stabilized hyaluronic acid to deeply hydrate skin from within. Improves skin quality, elasticity, and luminosity while reducing fine lines. Treats face, neck, décolletage, and hands. Particularly effective for dehydrated, dull, or crepey skin. Typically requires 2-3 initial treatments with maintenance every 4-6 months."
    },
    zh: {
      name: "皮肤玻尿酸注射",
      description: "先进的微注射治疗，使用稳定的透明质酸从内部深层滋润皮肤。改善皮肤质量、弹性和光泽，同时减少细纹。可治疗面部、颈部、胸部和手部。对于干燥、暗沉或皱纹皮肤特别有效。通常需要2-3次初始治疗，每4-6个月进行一次维护治疗。适用于各种肤质，特别是缺水、缺乏光泽、有细纹或初期老化迹象的皮肤。"
    }
  },
  "botox": {
    en: {
      name: "Neurotoxin (Botox/Dysport)",
      description: "Purified protein injectable that temporarily relaxes targeted facial muscles to reduce dynamic wrinkles. Effectively treats forehead lines, frown lines, crow's feet, bunny lines, and neck bands. Can also be used for jawline slimming, lip flip, and hyperhidrosis (excessive sweating). Results appear within 3-7 days and typically last 3-4 months."
    },
    zh: {
      name: "神经毒素（肉毒杆菌素/Dysport）",
      description: "纯化蛋白注射剂，可暂时放松目标面部肌肉以减少动态皱纹。有效治疗前额纹、眉间纹、鱼尾纹、兔子纹和颈纹。还可用于下颌线瘦身、唇翻转和多汗症（过度出汗）。效果在3-7天内出现，通常持续3-4个月。适用于想要减少表情纹和预防皱纹形成的人士。治疗快速，恢复时间短，效果自然。"
    }
  },
  "prp-facial": {
    en: {
      name: "PRP Facial Rejuvenation",
      description: "Advanced regenerative treatment using your own platelet-rich plasma to stimulate collagen production and tissue regeneration. Improves skin texture, tone, fine lines, and scarring. Can be combined with microneedling for enhanced results. Particularly effective for acne scars, sun damage, and early signs of aging. Provides natural rejuvenation with minimal downtime."
    },
    zh: {
      name: "PRP 面部焕肤",
      description: "先进的再生治疗，使用您自身的富含血小板的血浆来刺激胶原蛋白生成和组织再生。改善皮肤纹理、肤色、细纹和疤痕。可与微针结合使用以增强效果。对痤疮疤痕、日晒损伤和早期老化迹象特别有效。提供自然的焕肤效果，恢复时间短。适用于寻求自然、非手术面部年轻化的人士，特别适合皮肤质地不均、色素沉着和轻度皱纹问题。"
    }
  },

  // Laser & Resurfacing
  "fotona-deep": {
    en: {
      name: "Fotona Deep Fractional",
      description: "Advanced non-ablative fractional laser treatment that penetrates deep into the skin to stimulate collagen remodeling. Effectively treats deep wrinkles, acne scars, surgical scars, stretch marks, and skin laxity. Creates controlled micro-injuries that trigger the skin's natural healing process. Provides significant improvement with minimal downtime compared to traditional ablative lasers."
    },
    zh: {
      name: "Fotona 深层点阵激光",
      description: "先进的非剥脱性点阵激光治疗，深入渗透皮肤以刺激胶原蛋白重塑。有效治疗深层皱纹、痤疮疤痕、手术疤痕、妊娠纹和皮肤松弛。创造受控的微损伤，触发皮肤的自然愈合过程。与传统剥脱性激光相比，提供显著改善，恢复时间短。适用于需要显著改善皮肤质地、疤痕和皱纹的人士，特别适合那些不能接受长时间恢复期的患者。"
    }
  },
  "m22": {
    en: {
      name: "M22",
      description: "Versatile multi-application platform offering multiple light-based treatments including IPL, ResurFX, and Q-Switched Nd:YAG. Treats a wide range of skin concerns including sun damage, age spots, vascular lesions, rosacea, acne, skin texture, and wrinkles. Customizable to address multiple skin concerns in a single session with minimal downtime."
    },
    zh: {
      name: "M22 多功能平台",
      description: "多功能治疗平台，提供多种基于光的治疗，包括IPL强脉冲光、ResurFX点阵激光和Q开关Nd:YAG激光。治疗多种皮肤问题，包括日晒损伤、老年斑、血管病变、酒糟鼻、痤疮、皮肤纹理和皱纹。可定制以在单次治疗中解决多种皮肤问题，恢复时间短。适用于有多种皮肤问题的患者，如色素沉着、血管问题和皮肤质地不均。治疗舒适，效果显著，适合各种肤质。"
    }
  },
  "m22-stellar": {
    en: {
      name: "M22 Stellar",
      description: "Advanced Intense Pulsed Light (IPL) treatment specifically designed to target pigmentation and vascular concerns. Effectively treats sun spots, age spots, freckles, rosacea, broken capillaries, and spider veins. Uses optimized light technology to precisely target specific chromophores in the skin. Typically requires 3-5 sessions for optimal results with minimal downtime."
    },
    zh: {
      name: "M22 Stellar 强脉冲光",
      description: "专门设计用于针对色素沉着和血管问题的先进强脉冲光(IPL)治疗。有效治疗太阳斑、老年斑、雀斑、酒糟鼻、破裂的毛细血管和蜘蛛状静脉。使用优化的光技术精确靶向皮肤中的特定色素。通常需要3-5次治疗才能获得最佳效果，恢复时间短。适用于有色素沉着、红血丝、面部潮红或不均匀肤色的患者。治疗舒适，可见效果快，适合多种肤质。"
    }
  },
  "picoway": {
    en: {
      name: "PicoWay",
      description: "Ultra-short pulse picosecond laser that shatters pigment into tiny particles without damaging surrounding tissue. Highly effective for treating stubborn pigmentation, melasma, sun damage, age spots, and tattoo removal. Also improves acne scars, fine lines, and skin texture through collagen stimulation. Suitable for all skin types with minimal risk of post-inflammatory hyperpigmentation."
    },
    zh: {
      name: "PicoWay 皮秒激光",
      description: "超短脉冲皮秒激光，可将色素粉碎成微小颗粒而不损伤周围组织。对顽固性色素沉着、黄褐斑、日晒损伤、老年斑和纹身去除非常有效。通过胶原蛋白刺激还可改善痤疮疤痕、细纹和皮肤纹理。适用于所有肤质，炎症后色素沉着的风险最小。特别适合亚洲肤质和深色肤质，可安全有效地治疗各种色素问题。治疗舒适，恢复时间短，效果显著。"
    }
  },
  "picosure": {
    en: {
      name: "PicoSure",
      description: "Revolutionary picosecond laser that delivers ultra-short pulse durations to target skin concerns with minimal thermal damage. Effectively treats pigmentation, acne scars, wrinkles, and tattoos. The FOCUS Lens Array option stimulates collagen and elastin production for overall skin rejuvenation. Requires fewer treatments than traditional lasers with faster recovery time."
    },
    zh: {
      name: "PicoSure 皮秒激光",
      description: "革命性皮秒激光，提供超短脉冲持续时间，以最小的热损伤靶向皮肤问题。有效治疗色素沉着、痤疮疤痕、皱纹和纹身。FOCUS聚焦透镜阵列选项刺激胶原蛋白和弹性蛋白生成，实现整体皮肤焕发活力。与传统激光相比，需要更少的治疗次数，恢复时间更快。适用于各种肤质，包括亚洲肤质，可安全有效地治疗多种皮肤问题。治疗舒适，恢复时间短，效果持久。"
    }
  },
  "lumecca": {
    en: {
      name: "Lumecca",
      description: "High-intensity IPL (Intense Pulsed Light) treatment that targets pigmentation and vascular issues with 2-3 times more energy than standard IPL. Effectively treats sun damage, age spots, vascular lesions, rosacea, and uneven skin tone. Visible improvement after just 1-2 sessions with minimal downtime. Creates clearer, more even-toned skin with improved luminosity."
    },
    zh: {
      name: "Lumecca 光子嫩肤",
      description: "高强度IPL（强脉冲光）治疗，比标准IPL提供2-3倍更多的能量，靶向色素沉着和血管问题。有效治疗日晒损伤、老年斑、血管病变、酒糟鼻和不均匀肤色。仅需1-2次治疗即可看到明显改善，恢复时间短。创造更清晰、更均匀的肤色，提高皮肤光泽度。适用于有色素沉着、红血丝或不均匀肤色的患者。治疗快速，舒适，效果显著，适合多种肤质。"
    }
  },
  "vbeam": {
    en: {
      name: "VBeam Lasers",
      description: "Gold standard pulsed dye laser specifically designed to target vascular conditions. Effectively treats rosacea, facial redness, broken capillaries, spider veins, port wine stains, and certain scars. Uses a 595nm wavelength that is selectively absorbed by hemoglobin in blood vessels. Features patented Dynamic Cooling Device for enhanced comfort during treatment. Typically requires 2-4 sessions for optimal results."
    },
    zh: {
      name: "VBeam 脉冲染料激光",
      description: "专门设计用于靶向血管问题的黄金标准脉冲染料激光。有效治疗酒糟鼻、面部潮红、破裂的毛细血管、蜘蛛状静脉、酒渍胎记和某些疤痕。使用595纳米波长，被血管中的血红蛋白选择性吸收。配备专利动态冷却装置，提高治疗过程中的舒适度。通常需要2-4次治疗才能获得最佳效果。适用于各种血管问题，包括持久性面部潮红、血管扩张和血管性病变。治疗精确，恢复时间短，效果显著。"
    }
  },

  // Medical Rejuvenation
  "trilift": {
    en: {
      name: "TriLift",
      description: "Comprehensive triple-action facial rejuvenation system combining Dynamic Muscle Activation (DMA), TriPollar RF energy, and targeted ultrasound. Simultaneously lifts and tightens skin, tones facial muscles, and enhances facial contours. Provides both immediate and long-term results with no downtime. Particularly effective for jowls, nasolabial folds, and overall facial sagging."
    },
    zh: {
      name: "TriLift 三重提升",
      description: "综合性三重作用面部年轻化系统，结合动态肌肉激活(DMA)、TriPollar射频能量和靶向超声波。同时提升和紧致皮肤，调理面部肌肉，增强面部轮廓。提供即时和长期效果，无恢复期。对下颌松弛、法令纹和整体面部下垂特别有效。适用于寻求非侵入性面部提升和紧致的人士，特别适合轻度至中度皮肤松弛和面部下垂。治疗舒适，无痛，效果自然，可立即恢复正常活动。"
    }
  },
  "thermage": {
    en: {
      name: "Thermage",
      description: "Gold standard radiofrequency treatment that delivers heat deep into the skin to stimulate collagen production and remodel existing collagen. Provides non-invasive skin tightening and lifting for face, neck, and body. Results develop over 2-6 months and can last up to 2 years with a single treatment. Particularly effective for jowls, loose skin under the chin, and crepey eyelids."
    },
    zh: {
      name: "Thermage 热玛吉",
      description: "黄金标准射频治疗，将热量深入皮肤以刺激胶原蛋白生成并重塑现有胶原蛋白。为面部、颈部和身体提供非侵入性皮肤紧致和提升。效果在2-6个月内逐渐显现，单次治疗可持续长达2年。对下颌松弛、下巴下方松弛的皮肤和皱纹眼睑特别有效。适用于寻求显著皮肤紧致和提升效果的人士，特别适合中度皮肤松弛和老化迹象。治疗一次性完成，无恢复期，效果持久，适合各种肤质。"
    }
  },
  "ultherapy": {
    en: {
      name: "Ultherapy",
      description: "FDA-cleared non-invasive treatment using focused ultrasound energy to lift and tighten skin by targeting the deep structural layers typically addressed in surgical facelifts. Stimulates new collagen production at multiple depths. Treats face, neck, décolletage, and brow with no downtime. Results develop over 2-3 months and can last up to 2 years."
    },
    zh: {
      name: "Ultherapy 超声刀",
      description: "FDA批准的非侵入性治疗，使用聚焦超声波能量通过靶向通常在手术面部提升中处理的深层结构层来提升和紧致皮肤。在多个深度刺激新的胶原蛋白生成。治疗面部、颈部、胸部和眉毛，无恢复期。效果在2-3个月内逐渐显现，可持续长达2年。适用于寻求显著皮肤提升和紧致效果的人士，特别适合中度至重度皮肤松弛和老化迹象。治疗精确，效果自然，适合各种肤质。"
    }
  },

  // Skin Med Care
  "hydrafacial": {
    en: {
      name: "HydraFacial",
      description: "Advanced multi-step facial treatment that combines cleansing, exfoliation, extraction, hydration, and antioxidant protection. Uses patented Vortex-Fusion technology to deliver serums deep into the skin. Effectively treats fine lines, wrinkles, enlarged pores, oily/congested skin, and hyperpigmentation. Provides immediate results with no downtime. Suitable for all skin types, including sensitive skin."
    },
    zh: {
      name: "HydraFacial 水光焕肤",
      description: "先进的多步骤面部护理，结合清洁、去角质、提取、保湿和抗氧化保护。使用专利的涡流融合技术将精华液深入输送到皮肤中。有效治疗细纹、皱纹、毛孔粗大、油性/堵塞皮肤和色素沉着。提供即时效果，无恢复期。适用于所有肤质，包括敏感肌肤。治疗舒适，无刺激，效果立竿见影，是深层清洁和焕肤的理想选择。可根据不同皮肤问题定制精华液，满足个性化需求。"
    }
  },
  "mesotherapy": {
    en: {
      name: "Mesotherapy",
      description: "Minimally invasive treatment involving multiple micro-injections of vitamins, minerals, amino acids, and hyaluronic acid directly into the mesoderm (middle layer of skin). Stimulates collagen and elastin production while improving circulation and cellular metabolism. Effectively treats dull skin, fine lines, dehydration, and uneven skin tone. Can also be used for hair loss and localized fat reduction. Typically requires a series of 4-6 treatments for optimal results."
    },
    zh: {
      name: "美塑疗法",
      description: "微创治疗，将维生素、矿物质、氨基酸和透明质酸直接注入中胚层（皮肤中层）。刺激胶原蛋白和弹性蛋白生成，同时改善血液循环和细胞代谢。有效治疗暗沉皮肤、细纹、脱水和不均匀肤色。还可用于脱发和局部脂肪减少。通常需要4-6次治疗才能获得最佳效果。适用于寻求整体皮肤质量改善的人士，特别适合皮肤暗沉、缺乏光泽、初期老化迹象和轻度色素沉着问题。治疗快速，恢复时间短，效果自然渐进。"
    }
  },
  "beauty-booster": {
    en: {
      name: "Beauty Booster",
      description: "Premium micro-injection treatment using a specialized multi-needle device to deliver a customized blend of hyaluronic acid, vitamins, minerals, and amino acids into the skin. Provides deep hydration, improves skin elasticity, and reduces fine lines. Particularly effective for face, neck, décolletage, and hands. Creates a natural, radiant glow with improved skin texture and tone. Typically requires 3 initial treatments followed by maintenance sessions."
    },
    zh: {
      name: "美丽助推器",
      description: "高级微注射治疗，使用专业多针装置将定制混合的透明质酸、维生素、矿物质和氨基酸注入皮肤。提供深层保湿，改善皮肤弹性，减少细纹。对面部、颈部、胸部和手部特别有效。创造自然、光彩照人的光泽，改善皮肤纹理和肤色。通常需要3次初始治疗，然后进行维护治疗。适用于寻求全面皮肤质量改善的人士，特别适合干燥、缺水、失去光泽和初期老化迹象的皮肤。治疗舒适，恢复时间短，效果持久。"
    }
  },
  "bela-md": {
    en: {
      name: "Bela MD",
      description: "All-in-one advanced facial platform combining diamond microdermabrasion, hydrodermabrasion, electroporation, and LED light therapy. Customizable to address multiple skin concerns including acne, hyperpigmentation, fine lines, and dehydration. Uses proprietary technology to enhance product penetration and cellular renewal. Provides immediate visible results with progressive improvement over time. Suitable for all skin types with no downtime."
    },
    zh: {
      name: "Bela MD 面部护理",
      description: "多合一先进面部平台，结合钻石微晶磨皮、水疗磨皮、电穿孔和LED光疗。可定制以解决多种皮肤问题，包括痤疮、色素沉着、细纹和脱水。使用专有技术增强产品渗透和细胞更新。提供即时可见的效果，随着时间的推移逐渐改善。适用于所有肤质，无恢复期。治疗舒适，效果显著，可根据不同皮肤问题定制治疗方案。是全面面部护理和皮肤质量改善的理想选择。"
    }
  },
  "chemical-peel": {
    en: {
      name: "Chemical Peel",
      description: "Controlled application of chemical solutions to exfoliate and remove damaged outer layers of skin. Available in different strengths (superficial, medium, deep) to address various skin concerns. Effectively treats acne, hyperpigmentation, sun damage, fine lines, and uneven skin texture. Stimulates collagen production and cell turnover for renewed, smoother skin. Downtime varies from none to 7-10 days depending on peel strength."
    },
    zh: {
      name: "化学换肤",
      description: "控制性应用化学溶液去角质并去除受损的皮肤外层。有不同强度（表层、中层、深层）可用于解决各种皮肤问题。有效治疗痤疮、色素沉着、日晒损伤、细纹和不均匀的皮肤纹理。刺激胶原蛋白生成和细胞更新，使皮肤焕然一新，更加光滑。恢复时间因换肤强度而异，从无到7-10天不等。适用于各种皮肤问题，包括痤疮、色素沉着、皮肤纹理不均和初期老化迹象。治疗快速，效果显著，可根据皮肤问题和恢复时间选择适合的强度。"
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
