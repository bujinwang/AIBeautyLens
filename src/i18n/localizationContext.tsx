import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Available languages
export const languages = {
  en: 'English',
  zh: '简体中文' // Simplified Chinese
};

// Translations
export const translations: Record<string, Record<string, string>> = {
  en: {
    // General
    settings: 'Settings',
    language: 'Language',
    about: 'About',
    version: 'Version',
    privacyPolicy: 'Privacy Policy',
    loading: 'Loading',
    error: 'Error',
    shareError: 'Failed to share report',
    results: 'Results',

    // Home Screen
    startAnalysis: 'Start DermaGraph™ Analysis',
    beforeAfterAnalysis: 'Start ProgressScan™ Analysis',
    beforeAfterDescription: 'Compare your skin progress with AI-powered comparison',
    eliteAnalysisFeatures: 'Elite Analysis Features',
    dermaGraphAnalysis: 'DermaGraph™ Analysis',
    dermaGraphDescription: 'AI-powered skin scanning for comprehensive assessment',
    rejuvenationRx: 'RejuvenationRx™',
    rejuvenationDescription: 'Personalized treatment recommendations from aesthetic experts',
    treatmentVision: 'TreatmentVision™',
    treatmentVisionDescription: 'Visualize potential results with our advanced simulation technology',
    beautyBlueprint: 'BeautyBlueprint™',
    beautyBlueprintDescription: 'Personalized treatment planning system for your beauty journey',
    tagline: 'The expertise of 100 aesthetic doctors in a single scan',
    privacyFirstDesign: 'Privacy-First Design: All processing happens on-device or via secure API calls',
    viewPrivacyPolicy: 'View Privacy Policy →',

    // Camera Screen
    takePhoto: 'Take Photo',
    retake: 'Retake',
    confirm: 'Confirm',
    purposeOfVisit: 'Purpose of Visit',
    appointmentLength: 'Appointment Length',
    positionFace: 'Position your face within the frame for best results',
    centerYourFace: 'Ensure eyes and forehead are centered in the frame',
    gallery: 'Gallery',
    capture: 'Capture',
    beginAnalysis: 'Full Face Analysis', // Updated text
    requestingPermission: 'Requesting camera permission...',
    noAccessCamera: 'No access to camera',
    goBack: 'Go Back',
    visitPurposeHint: 'Example: Reduce fine lines and improve skin elasticity...',
    startEyeAnalysis: 'Start OptiScan™ Analysis', // Updated text
    processingText: 'Clinical-grade dermatological analysis in progress',

    // Analysis Screen
    analyzing: 'Analyzing your skin... Our AI is processing 500+ data points from your image, analyzing texture, tone, pores, and specific conditions. This advanced analysis requires significant computing power and references thousands of clinical cases to provide personalized insights equivalent to multiple specialist consultations.',
    estimatedTime: 'Estimated time: 3 minutes',
    viewTreatmentPlan: 'View treatment plan',
    clinicalLensAnalysis: 'ClinicalLens™ Analysis',
    skinMatrixResults: 'SkinMatrix™ Analysis Results',
    poweredByAesthetiScan: 'Powered by AesthetiScan™ technology',
    estimatedAge: 'Estimated Age',
    skinType: 'Skin Type',
    gender: 'Gender',
    facialFeatureAnalysis: 'Facial Feature Analysis',
    professionalGradeAnalysis: 'Professional-grade skin analysis in your pocket',
    visitInformation: 'Visit Information',
    detailsForConsultation: 'Details for this consultation',
    showSkincareAdvice: 'Show Skincare Advice',
    viewSkincareAdvice: 'View Skincare Advice',
    gettingAIRecommendations: 'Getting AI recommendations...',
    loadingRecommendations: 'Loading recommendations...',
    noProductsFound: 'No specific products found for this category',
    noRecommendationsAvailable: 'No recommendations available',
    noFeaturesDetected: 'No features detected',
    personalizedSkincareAdvice: 'Personalized Skincare Advice',
    recommendedRegimen: 'Recommended regimen for',
    skincareProductRecommendations: 'Skincare Product Recommendations',
    tailoredRecommendations: 'The following recommendations are tailored to your',
    skinTypeAndConcerns: 'skin type and specific concerns identified in your analysis. Incorporate these products gradually into your routine for best results.',
    recommendedProduct: 'Recommended Product:',
    keyIngredients: 'Key Ingredients:',
    usage: 'Usage:',
    why: 'Why:',
    targetedConcerns: 'Targeted Concerns:',
    severity: 'Severity:',
    importantNotes: 'Important Notes:',
    patchTest: '• Patch test new products before applying to your entire face',
    introduceNewProducts: '• Introduce new products one at a time, with 1-2 weeks between additions',
    consistencyIsKey: '• Consistency is key - results typically take 4-6 weeks to become visible',
    notSubstitute: '• These recommendations are based on AI analysis and not a substitute for dermatologist advice',
    discontinueUse: '• Discontinue use of any product that causes irritation or discomfort',
    purposeOfVisitLabel: 'Purpose of Visit:',
    appointmentLengthLabel: 'Appointment Length:',
    analysisFootnote: 'Analysis performed with DermaPrecision™ Technology, trained on data from thousands of clinical assessments.',
    tryAgainLater: 'Try Again Later',
    contactClinic: 'Contact Clinic',
    tryDifferentDevice: 'Try Different Device',
    retryAnalysis: 'Retry Analysis',
    analysisUnavailable: 'Analysis Temporarily Unavailable',
    highDemandMessage: 'Our facial analysis service is currently unavailable due to high demand.',
    ipadLimitation: 'iPad devices may experience additional limitations with this service.',
    skinHealthImportant: 'Your skin health is important to us, and we apologize for the inconvenience.',
    ipadCompatibilityIssue: 'iPad Compatibility Issue',
    trySolutions: 'Try these solutions:',
    lessFaceBackground: 'Take a photo with less background - focus closer on the face',
    goodLighting: 'Ensure good lighting conditions',
    usePhone: 'Use a phone instead of an iPad if available',
    tryAgain: 'Try Again',
    takeNewPhoto: 'Take New Photo',
    analyzeEyeArea: 'Analyze Eye Area',
    viewEyeAnalysis: 'View Eye Analysis',
    analyzingEyeArea: 'Analyzing your eye area... Our AI is processing 300+ data points from your image, focusing on fine lines, puffiness, dark circles, and skin texture around the eyes. This specialized analysis references thousands of clinical cases to provide insights equivalent to an oculoplastic consultation.',
    eyeProcessingText: 'Analyzing your eye area... Our AI is processing 300+ data points from your image, focusing on fine lines, puffiness, dark circles, and skin texture around the eyes. This specialized analysis references thousands of clinical cases to provide insights equivalent to an oculoplastic consultation.',

    // Treatment Screen
    recommendedTreatments: 'Recommended Treatments',
    basedOnAnalysis: 'Based on your facial analysis, the following treatments are recommended:',
    skinMatrixSummary: 'SkinMatrix™ Analysis Summary',
    age: 'Age:',
    features: 'Features:',
    identified: 'identified',
    years: 'years',
    area: 'Area:',
    whyRecommended: 'Why it\'s recommended:',
    benefits: 'Benefits:',
    selectedTreatments: 'Selected Treatments:',
    total: 'Total:',
    viewReport: 'View Report',

    // Report Screen
    treatmentReport: 'Treatment Report',
    hairScalpAnalysisReport: 'Hair & Scalp Analysis Report',
    eyeAnalysisReport: 'Eye Analysis Report',
    facialAnalysisReport: 'Facial Analysis Report',
    beforeAfterAnalysisReport: 'Before & After Analysis Report',
    date: 'Date:',
    totalEstimatedCost: 'Total Estimated Cost',
    importantInformation: 'Important Information',
    disclaimer: 'This analysis is powered by advanced machine learning algorithms trained on data from thousands of aesthetic medicine cases and specialist consultations. While our AI provides comprehensive insights based on extensive medical data, individual results may vary. For optimal results, please consult with a qualified aesthetic medicine specialist who can consider your unique needs and medical history.',
    generating: 'Generating...',
    shareReport: 'Share Report',
    startOver: 'Start Over',
    failedToLoadImage: 'Failed to load image. Please try again.',
    noImageAvailable: 'No image available',

    // Diagnosis Report Screen
    diagnosisReport: 'Diagnosis Report',
    showDiagnosisReport: 'Show Diagnosis Report',
    profileAnalysis: 'Profile Analysis',
    undertone: 'Undertone',
    confidence: 'confidence',
    overallSkinHealth: 'Overall Skin Health',
    clinicalAssessment: 'Clinical Assessment',
    location: 'Location:',
    severityLevel: 'Severity Level:',
    probableCauses: 'Probable Causes:',
    characteristics: 'Characteristics:',
    treatmentPriority: 'Treatment Priority:',
    analysisInformation: 'Analysis Information',
    disclaimerNote: 'Note: This report is for informational purposes and does not constitute medical advice. For specific skin concerns, please consult with a qualified healthcare professional.',

    // Skin Condition Status
    active: 'Active',
    healing: 'Healing',
    chronic: 'Chronic',
    mild: 'Mild',
    moderate: 'Moderate',
    severe: 'Severe',

    // Treatment Priority
    immediateAttention: 'Immediate attention',
    highPriority: 'High priority',
    moderatePriority: 'Moderate priority',
    lowPriority: 'Low priority',
    maintenance: 'Maintenance',
    notSpecified: 'Not specified',

    // Privacy Policy Screen
    lastUpdated: 'Last Updated:',
    infoWeCollect: '1. Information We Collect',
    infoWeCollectText: 'AIBeautyLens collects and processes facial images solely for providing personalized skincare recommendations. Images are captured through your device camera or selected from your photo library.',
    howWeUseInfo: '2. How We Use Your Information',
    howWeUseInfoText: '• Analyze facial features and skin conditions\n• Generate personalized skincare recommendations\n• Create treatment simulations\n• Provide before/after comparisons',
    dataStorage: '3. Data Storage and Security',
    dataStorageText: '• All facial images are processed with encryption\n• Images are stored temporarily on your device only\n• No permanent storage of facial data\n• No facial recognition or biometric data collection',
    thirdParty: '4. Third-Party Services',
    thirdPartyText: 'Images are securely transmitted to Google Gemini Vision API for analysis. No data is shared with other third parties or used for identification or tracking purposes.',
    dataRetention: '5. Data Retention',
    dataRetentionText: '• Images are automatically deleted after analysis\n• No long-term storage of facial data\n• Users can manually delete images at any time',
    yourRights: '6. Your Rights',
    yourRightsText: 'You have the right to:\n• Access your data\n• Delete your data\n• Opt-out of data collection',
    contactUs: '7. Contact Us',
    contactUsText: 'For any privacy-related questions or concerns, please contact us at:',

    // Settings Screen
    back: 'Back',

    // Before/After Analysis Screen
    beforeAfterTitle: 'ProgressScan™ Analysis',
    beforeAfterInstructions: 'Select or capture before and after treatment images for AI analysis',
    beforeTreatment: 'Before Treatment',
    afterTreatment: 'After Treatment',
    addBeforeImage: 'Add Before Image',
    addAfterImage: 'Add After Image',
    camera: 'Camera',
    reset: 'Reset',
    analyzeChanges: 'Analyze Changes',
    capturingBeforeImage: 'Capture Before Image',
    capturingAfterImage: 'Capture After Image',
    cancel: 'Cancel',
    missingImagesTitle: 'Missing Images',
    missingImagesMessage: 'Please provide both before and after images for analysis.',
    analysisFailedTitle: 'Analysis Failed',
    analysisFailedMessage: 'There was a problem analyzing your images. Please try again.',

    // Before/After Comparison Report Screen
    progressScanResults: 'ProgressScan™ Results',
    analysisResults: 'Analysis Results',
    overallImprovement: 'Overall Improvement:',
    skinToneChange: 'Skin Tone Change:',
    textureChange: 'Texture Change:',
    wrinkleReduction: 'Wrinkle Reduction:',
    moistureLevel: 'Moisture Level:',
    recommendations: 'Recommendations',
    improvementAreas: 'Treatment Improvement Areas',
    beforeImageLabel: 'Before',
    afterImageLabel: 'After',
    shareProgressReport: 'Share Report',
    returnToHome: 'Return to Home',
    resultsFallbackWarning: 'Using estimated analysis results. The AI was unable to fully analyze your images.',

    // Eye Analysis Screen
    eyeAreaAnalysis: 'Eye Area Analysis',
    noAnalysisResults: 'No analysis results available.',
    eyeAreaOverview: 'Eye Area Overview',
    eyeAreaConditions: 'Eye Area Conditions',
    recommendedEyeCare: 'Recommended Eye Care',
    backToAnalysis: 'Back to Analysis',
    personalizedEyeCareAdvice: 'Personalized Eye Care Advice',
    eyeAnalysisReportTitle: 'Eye Analysis Report',
    eyeAnalysisSummaryTitle: 'Eye Analysis Summary',
    noTreatmentsSelected: 'No treatments were selected.',
    viewDetailedEyeReport: 'Detailed Eye Report',
    viewEyeSkincare: 'Eye Skincare Advice',
    viewEyeTreatments: 'Recommended Eye Treatments',
    noAnalysisDataAvailable: 'No analysis data available to proceed.',
    eyeAnalysisFailed: 'Eye analysis failed. Please try again.',
    recommendedEyeTreatments: 'Recommended Eye Treatments',
    basedOnYourEyeAnalysis: 'Based on your eye area analysis:',
    noTreatmentsAvailable: 'No specific eye treatments were recommended based on this analysis.',
    confirmSelection: 'Confirm Selection',
    eyePatchTest: '• Patch test new products before applying around the eyes',
    eyeIntroduceNewProducts: '• Introduce new products one at a time, with 1-2 weeks between additions',
    eyeConsistencyIsKey: '• Consistency is key - results typically take 4-6 weeks to become visible',
    eyeNotSubstitute: '• These recommendations are based on AI analysis and not a substitute for professional advice',
    eyeDiscontinueUse: '• Discontinue use of any product that causes irritation or discomfort',
    startHairScalpAnalysis: 'Start Hair & Scalp Analysis',
    hairScalpAnalysis: 'Hair & Scalp Analysis',
    hairScalpDescription: 'AI-powered multi-angle hair and scalp assessment',
    selectHairScalpImages: 'Select Hair & Scalp Images',
    analyzeHairScalp: 'Analyze Hair & Scalp',
    hairScalpSubtitle: 'Detailed Hair and Scalp Assessment',
    assessmentDate: 'Assessment Date',
    hairLossPattern: 'Hair Loss Pattern',
    hairQuality: 'Hair Quality',
    scalpCondition: 'Scalp Condition',
    preliminaryDiagnosis: 'Preliminary Diagnosis',
    overallCondition: 'Overall Condition',
    hairScalpProcessingText: 'Analyzing your hair and scalp... Our AI is processing multi-angle images to assess hair density, scalp health, and follicular miniaturization.',
    analyzingHairScalp: 'Analyzing your hair and scalp... Our AI is processing multi-angle images to assess hair density, scalp health, and follicular miniaturization.',
    viewDetailedReport: 'View Detailed Report',
    viewHaircare: 'View Haircare',
    viewHairTreatments: 'View Hair Treatments',
    eyeHealthWarningNote: 'Note: Potential eye health concerns were observed. Please review the detailed report and consult an ophthalmologist if needed.',
    facialAnalysisButton: 'Facial Analysis',
    eyeAnalysisButton: 'Eye Area Analysis',
    beforeAfterButton: 'Before & After Analysis',
    hairScalpAnalysisButton: 'Hair & Scalp Analysis',

    // Haircare recommendations
    recommendedHaircare: 'Recommended Haircare',
    personalizedHaircareAdvice: 'Personalized haircare advice for your hair & scalp condition',
    recommendedHaircareRoutine: 'Recommended Haircare Routine',
    hairPatchTest: '• Patch test any new product 24 hours before full application',
    hairIntroduceNewProducts: '• Introduce new products one at a time',
    hairConsistencyIsKey: '• Consistency is key - follow recommended routine for at least 4-6 weeks',
    hairNotSubstitute: '• These recommendations are not a substitute for professional advice',
    hairDiscontinueUse: '• Discontinue use if any product causes irritation or discomfort',
    overallRecommendation: 'Overall Recommendation',

    // Hair treatments translations
    recommendedHairTreatments: 'Recommended Hair Treatments',
    basedOnYourHairAnalysis: 'Based on your hair and scalp analysis:',
    diagnosis: 'Diagnosis',
    loadingTreatments: 'Loading treatments...',
    noHairTreatmentsAvailable: 'No specific hair treatments were recommended based on this analysis.',
    recommendedForAndrogenetic: 'Highly recommended for androgenetic alopecia to slow hair loss and potentially stimulate new growth.',
    recommendedForDryScalp: 'Recommended to address dry, flaky scalp conditions by removing buildup and providing deep hydration.',
    recommendedForScalpHealth: 'Recommended to improve overall scalp health and create a better environment for hair growth.',
    recommendedForHairLoss: 'PRP therapy can help stimulate dormant hair follicles and strengthen existing hair.',
    recommendedBasedOnAnalysis: 'This treatment is recommended based on your hair and scalp analysis.',
    failedToLoadTreatments: 'Failed to load treatments. Please try again.',
    contraindications: 'Contraindications',

    // Hair recommendation types
    consultation: 'consultation',
    history: 'history',
    trichoscope: 'trichoscope',
    labTests: 'labTests',
    treatment: 'treatment',
    lifestyle: 'lifestyle',

    // Feature labels for reports
    feature: 'feature',

    // Clinical evaluation
    clinicalEvaluation: 'Clinical Evaluation',
    evaluationText: 'Enter clinical notes and evaluation...',
    saveEvaluation: 'Save Evaluation',
    evaluationSaved: 'Evaluation saved',
  },
  zh: {
    // General
    settings: '设置',
    language: '语言',
    about: '关于',
    version: '版本',
    privacyPolicy: '隐私政策',
    loading: '加载中',
    error: '错误',
    shareError: '分享报告失败',
    results: '结果',

    // Home Screen
    startAnalysis: '开始 DermaGraph™ 分析',
    beforeAfterAnalysis: '开始 ProgressScan™ 分析',
    beforeAfterDescription: '使用AI助力比较您的皮肤进展情况',
    eliteAnalysisFeatures: '精英分析功能',
    dermaGraphAnalysis: 'DermaGraph™ 分析',
    dermaGraphDescription: 'AI驱动的皮肤扫描，全面评估',
    rejuvenationRx: 'RejuvenationRx™',
    rejuvenationDescription: '来自美容专家的个性化治疗建议',
    treatmentVision: 'TreatmentVision™',
    treatmentVisionDescription: '通过我们的先进模拟技术可视化潜在结果',
    beautyBlueprint: 'BeautyBlueprint™',
    beautyBlueprintDescription: '为您的美丽之旅定制个性化治疗计划',
    tagline: '一次扫描，汇集100位美容医生的专业知识',
    privacyFirstDesign: '隐私优先设计：所有处理都在设备上或通过安全API调用进行',
    viewPrivacyPolicy: '查看隐私政策 →',

    // Camera Screen
    takePhoto: '拍照',
    retake: '重拍',
    confirm: '确认',
    purposeOfVisit: '访问目的',
    appointmentLength: '预约时长',
    positionFace: '将您的脸放在框内以获得最佳效果',
    centerYourFace: '确保眼睛和额头在框内居中',
    gallery: '相册',
    capture: '拍摄',
    beginAnalysis: '全脸分析', // Updated text
    requestingPermission: '请求相机权限...',
    noAccessCamera: '无法访问相机',
    goBack: '返回',
    visitPurposeHint: '例如：减少细纹并改善皮肤弹性...',
    startEyeAnalysis: '开始 OptiScan™ 分析', // Updated text
    processingText: '临床级皮肤科分析正在进行中',

    // Analysis Screen
    analyzing: '正在分析您的皮肤... 我们的AI正在处理您图像中的500多个数据点，分析纹理、肤色、毛孔和特定皮肤状况。这种高级分析需要强大的计算能力，并参考了数千个临床案例，为您提供相当于多次专家咨询的个性化见解。',
    estimatedTime: '预计时间：3分钟',
    viewTreatmentPlan: '查看治疗计划',
    clinicalLensAnalysis: 'ClinicalLens™ 分析',
    skinMatrixResults: 'SkinMatrix™ 分析结果',
    poweredByAesthetiScan: '由 AesthetiScan™ 技术提供支持',
    estimatedAge: '估计年龄',
    skinType: '皮肤类型',
    gender: '性别',
    facialFeatureAnalysis: '面部特征分析',
    professionalGradeAnalysis: '专业级皮肤分析',
    visitInformation: '访问信息',
    detailsForConsultation: '咨询的详细信息',
    purposeOfVisitLabel: '访问目的:',
    appointmentLengthLabel: '预约时长:',
    analysisFootnote: '分析由 DermaPrecision™ 技术执行，该技术基于数千个临床评估数据进行训练。',
    tryAgainLater: '稍后再试',
    showSkincareAdvice: '显示护肤建议',
    viewSkincareAdvice: '查看护肤建议',
    gettingAIRecommendations: '正在获取AI推荐...',
    loadingRecommendations: '正在加载推荐...',
    noProductsFound: '没有找到此类别的特定产品',
    noRecommendationsAvailable: '没有可用的推荐',
    noFeaturesDetected: '未检测到特征',
    personalizedSkincareAdvice: '个性化护肤建议',
    recommendedRegimen: '推荐的护理方案适用于',
    skincareProductRecommendations: '护肤产品推荐',
    tailoredRecommendations: '以下推荐是为您的',
    skinTypeAndConcerns: '皮肤类型和分析中识别的特定问题量身定制的。逐步将这些产品纳入您的日常护理中，以获得最佳效果。',
    recommendedProduct: '推荐产品:',
    keyIngredients: '主要成分:',
    usage: '使用方法:',
    why: '原因:',
    targetedConcerns: '针对的问题:',
    severity: '严重程度:',
    importantNotes: '重要提示:',
    patchTest: '• 在全脸使用新产品前进行小范围测试',
    introduceNewProducts: '• 一次引入一种新产品，间隔1-2周',
    consistencyIsKey: '• 坚持是关键 - 效果通常需要4-6周才能显现',
    notSubstitute: '• 这些建议基于AI分析，不能替代皮肤科医生的建议',
    discontinueUse: '• 如果产品引起刺激或不适，请停止使用',
    contactClinic: '联系诊所',
    tryDifferentDevice: '尝试使用其他设备',
    retryAnalysis: '重新分析',
    analysisUnavailable: '分析服务暂时不可用',
    highDemandMessage: '由于需求量大，我们的面部分析服务目前不可用。',
    ipadLimitation: 'iPad 设备可能会遇到此服务的其他限制。',
    skinHealthImportant: '您的皮肤健康对我们非常重要，我们对给您带来的不便深表歉意。',
    ipadCompatibilityIssue: 'iPad 兼容性问题',
    trySolutions: '尝试这些解决方案：',
    lessFaceBackground: '拍摄时减少背景 - 将焦点更集中在面部',
    goodLighting: '确保良好的光线条件',
    usePhone: '如果可能，使用手机而不是 iPad',
    tryAgain: '再试一次',
    takeNewPhoto: '拍摄新照片',
    analyzeEyeArea: '分析眼部区域',
    viewEyeAnalysis: '查看眼部分析',
    analyzingEyeArea: '正在分析您的眼部区域... 我们的AI正在处理您图像中的300多个数据点，重点关注眼周的细纹、浮肿、黑眼圈和皮肤纹理。这项专业分析参考了数千个临床案例，旨在提供相当于眼整形外科咨询的见解。',
    eyeProcessingText: '正在分析您的眼部区域... 我们的AI正在处理您图像中的300多个数据点，重点关注眼周的细纹、浮肿、黑眼圈和皮肤纹理。这项专业分析参考了数千个临床案例，旨在提供相当于眼整形外科咨询的见解。',

    // Treatment Screen
    recommendedTreatments: '推荐的治疗方案',
    basedOnAnalysis: '根据您的面部分析，推荐以下治疗方案：',
    skinMatrixSummary: 'SkinMatrix™ 分析摘要',
    age: '年龄:',
    features: '特征:',
    identified: '已识别',
    years: '岁',
    area: '区域:',
    whyRecommended: '为什么推荐:',
    benefits: '好处:',
    selectedTreatments: '已选治疗方案:',
    total: '总计:',
    viewReport: '查看报告',

    // Report Screen
    treatmentReport: '治疗报告',
    hairScalpAnalysisReport: '头发与头皮分析报告',
    eyeAnalysisReport: '眼部分析报告',
    facialAnalysisReport: '面部分析报告',
    beforeAfterAnalysisReport: '前后对比分析报告',
    date: '日期:',
    totalEstimatedCost: '总估计费用',
    importantInformation: '重要信息',
    disclaimer: '此分析由先进的机器学习算法提供支持，该算法基于数千个美容医学案例和专家咨询的数据进行训练。尽管我们的人工智能基于广泛的医学数据提供全面的见解，但个人结果可能会有所不同。为了获得最佳效果，请咨询合格的美容医学专家，他们可以考虑您的独特需求和病史。',
    generating: '正在生成...',
    shareReport: '分享报告',
    startOver: '重新开始',
    failedToLoadImage: '图片加载失败。请重试。',
    noImageAvailable: '无可用图像',

    // Diagnosis Report Screen
    diagnosisReport: '诊断报告',
    showDiagnosisReport: '显示诊断报告',
    profileAnalysis: '概况分析',
    undertone: '肤色基调',
    confidence: '置信度',
    overallSkinHealth: '整体皮肤健康状况',
    clinicalAssessment: '临床评估',
    location: '位置:',
    severityLevel: '严重程度:',
    probableCauses: '可能原因:',
    characteristics: '特征:',
    treatmentPriority: '治疗优先级:',
    analysisInformation: '分析信息',
    disclaimerNote: '注意：本报告仅供参考，不构成医疗建议。对于特定的皮肤问题，请咨询合格的医疗专业人员。',

    // Skin Condition Status
    active: '活跃期',
    healing: '恢复期',
    chronic: '慢性期',
    mild: '轻度',
    moderate: '中度',
    severe: '重度',

    // Treatment Priority
    immediateAttention: '需要立即关注',
    highPriority: '高优先级',
    moderatePriority: '中等优先级',
    lowPriority: '低优先级',
    maintenance: '维护性治疗',
    notSpecified: '未指定',

    // Privacy Policy Screen
    lastUpdated: '最后更新：',
    infoWeCollect: '1. 我们收集的信息',
    infoWeCollectText: 'AIBeautyLens收集和处理面部图像仅用于提供个性化的护肤建议。图像通过您的设备相机或从您的相册中选择。',
    howWeUseInfo: '2. 我们如何使用您的信息',
    howWeUseInfoText: '• 分析面部特征和皮肤状况\n• 生成个性化的护肤建议\n• 创建治疗模拟\n• 提供前/后对比',
    dataStorage: '3. 数据存储和安全',
    dataStorageText: '• 所有面部图像都经过加密处理\n• 图像仅暂时存储在您的设备上\n• 不永久存储面部数据\n• 不收集面部识别或生物特征数据',
    thirdParty: '4. 第三方服务',
    thirdPartyText: '图像安全传输到Google Gemini Vision API进行分析。不与其他第三方共享数据，也不用于识别或跟踪目的。',
    dataRetention: '5. 数据保留',
    dataRetentionText: '• 图像在分析后自动删除\n• 不长期存储面部数据\n• 用户可以随时手动删除图像',
    yourRights: '6. 您的权利',
    yourRightsText: '您有权利：\n• 访问您的数据\n• 删除您的数据\n• 选择退出数据收集',
    contactUs: '7. 联系我们',
    contactUsText: '如有任何与隐私相关的问题或疑虑，请联系我们：',

    // Settings Screen
    back: '返回',

    // Before/After Analysis Screen
    beforeAfterTitle: 'ProgressScan™ 分析',
    beforeAfterInstructions: '选择或拍摄治疗前后的图像进行AI分析',
    beforeTreatment: '治疗前',
    afterTreatment: '治疗后',
    addBeforeImage: '添加治疗前图像',
    addAfterImage: '添加治疗后图像',
    camera: '相机',
    reset: '重置',
    analyzeChanges: '分析变化',
    capturingBeforeImage: '拍摄治疗前图像',
    capturingAfterImage: '拍摄治疗后图像',
    cancel: '取消',
    missingImagesTitle: '图像缺失',
    missingImagesMessage: '请提供治疗前和治疗后的图像进行分析。',
    analysisFailedTitle: '分析失败',
    analysisFailedMessage: '分析您的图像时出现问题。请重试。',

    // Before/After Comparison Report Screen
    progressScanResults: 'ProgressScan™ 结果',
    analysisResults: '分析结果',
    overallImprovement: '整体改善:',
    skinToneChange: '肤色变化:',
    textureChange: '肌理变化:',
    wrinkleReduction: '皱纹减少:',
    moistureLevel: '水分水平:',
    recommendations: '建议',
    improvementAreas: '治疗改善区域',
    beforeImageLabel: '治疗前',
    afterImageLabel: '治疗后',
    shareProgressReport: '分享报告',
    returnToHome: '返回首页',
    resultsFallbackWarning: '使用估计的分析结果。AI无法完全分析您的图像。',

    // Eye Analysis Screen
    eyeAreaAnalysis: '眼部区域分析',
    noAnalysisResults: '无可用分析结果。',
    eyeAreaOverview: '眼部区域概览',
    eyeAreaConditions: '眼部区域状况',
    recommendedEyeCare: '推荐的眼部护理',
    backToAnalysis: '返回分析',
    personalizedEyeCareAdvice: '个性化眼部护理建议',
    eyeAnalysisReportTitle: '眼部分析报告',
    eyeAnalysisSummaryTitle: '眼部分析摘要',
    noTreatmentsSelected: '未选择任何治疗方案。',
    viewDetailedEyeReport: '详细眼部分析报告',
    viewEyeSkincare: '眼部护肤建议',
    viewEyeTreatments: '推荐眼部治疗',
    noAnalysisDataAvailable: '无可用分析数据。',
    eyeAnalysisFailed: '眼部分析失败，请重试。',
    recommendedEyeTreatments: '推荐的眼部治疗',
    basedOnYourEyeAnalysis: '根据您的眼部分析：',
    noTreatmentsAvailable: '根据本次分析，没有推荐特定的眼部治疗。',
    confirmSelection: '确认选择',
    eyePatchTest: '• 在眼周使用新产品前进行小范围测试',
    eyeIntroduceNewProducts: '• 一次引入一种新产品，间隔1-2周',
    eyeConsistencyIsKey: '• 坚持是关键 - 效果通常需要4-6周才能显现',
    eyeNotSubstitute: '• 这些建议基于AI分析，不能替代专业建议',
    eyeDiscontinueUse: '• 如果产品引起刺激或不适，请停止使用',
    eyeHealthObservations: '眼部健康观察',
    eyeHealthWarningIntro: '观察到以下情况。这些并非诊断，但可能需要咨询眼科医生：',
    eyeHealthDisclaimer: '这不是医疗诊断。如有任何眼部健康问题，请咨询眼科医生。',
    eyeHealthWarningNote: '注意：观察到潜在的眼部健康问题。请查看详细报告并在需要时咨询眼科医生。',
    facialAnalysisButton: '面部分析',
    eyeAnalysisButton: '眼部分析',
    beforeAfterButton: '前后对比分析',
    hairScalpAnalysisButton: '头发与头皮分析',
    analyzingHairScalp: '正在分析您的头发和头皮... 我们的AI正在处理多角度图像，以评估头发密度、头皮健康和毛囊微型化情况。',
    hairScalpProcessingText: '正在分析您的头发和头皮... 我们的AI正在处理多角度图像，以评估头发密度、头皮健康和毛囊微型化情况。',
    hairScalpAnalysis: '头发与头皮分析',
    hairScalpDescription: 'AI驱动的多角度头发和头皮评估',
    selectHairScalpImages: '选择头发和头皮图像',
    analyzeHairScalp: '分析头发与头皮',
    hairScalpSubtitle: '详细的头发和头皮评估',
    assessmentDate: '评估日期',
    hairLossPattern: '脱发模式',
    hairQuality: '头发质量',
    scalpCondition: '头皮状况',
    preliminaryDiagnosis: '初步诊断',
    overallCondition: '整体状况',
    startHairScalpAnalysis: '开始头发与头皮分析',
    viewDetailedReport: '查看详细报告',
    viewHaircare: '查看头发护理',
    viewHairTreatments: '查看头发治疗',

    // Haircare recommendations - Chinese
    recommendedHaircare: '推荐的头发护理',
    personalizedHaircareAdvice: '根据您的头发和头皮状况提供的个性化头发护理建议',
    recommendedHaircareRoutine: '推荐的头发护理流程',
    hairPatchTest: '• 在完全使用任何新产品之前，先进行24小时的局部测试',
    hairIntroduceNewProducts: '• 一次仅引入一种新产品',
    hairConsistencyIsKey: '• 坚持是关键 - 遵循推荐的护理流程至少4-6周',
    hairNotSubstitute: '• 这些建议不能替代专业意见',
    hairDiscontinueUse: '• 如果任何产品导致刺激或不适，请停止使用',
    overallRecommendation: '总体建议',

    // Hair treatments translations
    recommendedHairTreatments: '推荐的发型治疗',
    basedOnYourHairAnalysis: '根据您的头发和头皮分析：',
    diagnosis: '诊断',
    loadingTreatments: '加载治疗...',
    noHairTreatmentsAvailable: '根据本次分析，没有推荐特定的头发治疗。',
    recommendedForAndrogenetic: '非常推荐用于雄性脱发，以减缓脱发并可能刺激新生长。',
    recommendedForDryScalp: '推荐用于解决干燥、脱屑的头皮状况，通过去除堆积并提供深层保湿。',
    recommendedForScalpHealth: '推荐用于改善整体头皮健康并创建更好的头发生长环境。',
    recommendedForHairLoss: 'PRP疗法可以帮助刺激休眠的毛囊并加强现有的头发。',
    recommendedBasedOnAnalysis: '此治疗是根据您的头发和头皮分析推荐的。',
    failedToLoadTreatments: '加载治疗失败。请重试。',
    contraindications: '禁忌症',

    // Hair recommendation types
    consultation: '咨询',
    history: '病史',
    trichoscope: '毛发镜检查',
    labTests: '实验室检测',
    treatment: '治疗',
    lifestyle: '生活方式',
    
    // Feature labels for reports
    feature: '特征',

    // Clinical evaluation
    clinicalEvaluation: '临床评估',
    evaluationText: '输入临床备注和评估...',
    saveEvaluation: '保存评估',
    evaluationSaved: '评估已保存',
  }
};

// Create context type
type LocalizationContextType = {
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  t: (key: string) => string;
  languages: Record<string, string>;
};

// Create context
const LocalizationContext = createContext<LocalizationContextType>({
  currentLanguage: 'en',
  setCurrentLanguage: () => {},
  t: (key) => key,
  languages: languages
});

export const LocalizationProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Get saved language or default to English
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('language');
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
        }
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading language preference:', error);
        setIsLoaded(true);
      }
    };

    loadLanguage();
  }, []);

  // Update AsyncStorage when language changes
  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem('language', currentLanguage)
        .catch(error => console.error('Error saving language preference:', error));
    }
  }, [currentLanguage, isLoaded]);

  // Get text based on current language
  const t = (key: string): string => {
    if (!translations[currentLanguage]) {
      return key;
    }
    return translations[currentLanguage][key] || key;
  };

  if (!isLoaded) {
    return null; // Or a loading indicator
  }

  return (
    <LocalizationContext.Provider value={{ currentLanguage, setCurrentLanguage, t, languages }}>
      {children}
    </LocalizationContext.Provider>
  );
};

// Custom hook to use localization
export const useLocalization = () => useContext(LocalizationContext);
