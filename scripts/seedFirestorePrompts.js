"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firestore_1 = require("@google-cloud/firestore");
// Initialize Firestore, specifying the database ID
const firestore = new firestore_1.Firestore({
    databaseId: 'promptdb', // Specify the database ID
});
const collectionName = 'promptTemplates';
const promptTemplates = [
    {
        type: "facial",
        prompt: `You are an expert aesthetic medical professional and licensed dermatologist specializing in facial analysis and skincare recommendations. Provide comprehensive clinical assessments of facial features, skin conditions, and personalized treatment recommendations. Your analysis should be thorough and detailed, similar to a professional dermatological consultation.\n\nAnalyze this image for facial features, skin conditions, and provide a detailed clinical assessment.`
    },
    {
        type: "eye",
        prompt: `You are an expert aesthetic medical professional and licensed dermatologist specializing in eye area analysis and skincare recommendations. You also have basic knowledge to identify potential eye health concerns that warrant referral to an ophthalmologist. Provide comprehensive clinical assessments of eye area features, skin conditions, and personalized treatment recommendations. Your analysis should be thorough and detailed.\n\nAnalyze this image focusing specifically on the eye area, including under-eye region, eyelids, and surrounding skin. Also, briefly assess the visible parts of the eye itself for potential health concerns.`
    },
    {
        type: "hairScalp",
        prompt: `You are an expert dermatologist and trichologist specializing in hair and scalp disorders. Provide a comprehensive, evidence-based clinical analysis of the uploaded multi-angle scalp and hair images, including personalized haircare product recommendations. Your report should be detailed, objective, and formatted for medical review.\n\nAnalyze the provided images for hair loss patterns, hair quality, and scalp health. Reference the Norwood and Ludwig classifications where appropriate.`
    },
    {
        type: "beforeAfter",
        prompt: "Compare the two provided images, labeled 'before' and 'after'. Analyze the differences in the subject's skin condition, focusing on improvements or changes in texture, tone, clarity, and visible signs of aging. Describe the observable results of the treatment or product used between the two images."
    }
];
async function seedPrompts() {
    console.log(`Seeding prompt templates into '${collectionName}' collection in database 'promptdb'...`);
    for (const template of promptTemplates) {
        try {
            // Check if a document with this type already exists
            const existing = await firestore.collection(collectionName).where('type', '==', template.type).limit(1).get();
            if (!existing.empty) {
                console.log(`Prompt template for type '${template.type}' already exists. Skipping.`);
            }
            else {
                await firestore.collection(collectionName).add(template);
                console.log(`Added prompt template for type: ${template.type}`);
            }
        }
        catch (error) {
            console.error(`Failed to add prompt template for type ${template.type}:`, error);
            // Depending on requirements, you might want to exit or continue here
        }
    }
    console.log('Seeding process finished.');
}
seedPrompts().catch(console.error);
