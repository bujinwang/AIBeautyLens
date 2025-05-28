import { Storage } from '@google-cloud/storage';
import { Firestore } from '@google-cloud/firestore';
import { PredictionServiceClient } from '@google-cloud/aiplatform';

const storage = new Storage();
const firestore = new Firestore();

// Configure the AI Platform client for Gemini Vision API
// Replace with your actual project ID and location
const PROJECT_ID = process.env.GCP_PROJECT_ID || 'aibeautylens'; // Replace with your GCP Project ID
const LOCATION = process.env.GCP_LOCATION || 'us-central1'; // Replace with your GCP Region
const PUBLISHER = 'google-cloud';
const MODEL = 'gemini-pro-vision'; // Or your specific Gemini Vision model

const predictionServiceClient = new PredictionServiceClient({
  apiEndpoint: `${LOCATION}-aiplatform.googleapis.com`,
});

/**
 * Cloud Function triggered by Pub/Sub when an image is uploaded
 * Analyzes the image using Gemini Vision API
 */
export const analyzeImage = async (message: any) => { // Changed type from PubsubMessage
  try {
    console.log('Received message:', message);
    
    // Parse the message data
    const data = message.data ? JSON.parse(Buffer.from(message.data, 'base64').toString()) : {};
    console.log('Parsed data:', data);

    const { bucket, name: fileName, imageId, patientId, clinicianId } = data;

    if (!bucket || !fileName || !imageId || !patientId || !clinicianId) {
      console.error('Missing required data in Pub/Sub message:', { bucket, fileName, imageId, patientId, clinicianId });
      throw new Error('Missing required data in Pub/Sub message.');
    }

    const imagePath = `gs://${bucket}/${fileName}`;
    console.log(`Starting analysis for image: ${imagePath}`);

    // 1. Download image from Cloud Storage
    const file = storage.bucket(bucket).file(fileName);
    const [fileBuffer] = await file.download();
    const base64EncodedImage = fileBuffer.toString('base64');

    // 2. Send to Gemini Vision API
    // Manually construct the Value object for instances and parameters
    const instance = {
      structValue: {
        fields: {
          image: {
            structValue: {
              fields: {
                bytesBase64Encoded: {
                  stringValue: base64EncodedImage,
                },
              },
            },
          },
          // Add text prompts here if needed for specific analysis
          // prompt: { stringValue: "Describe the image in detail." }
        },
      },
    };

    const parameters = {
      structValue: {
        fields: {
          temperature: {
            numberValue: 0.2,
          },
          maxOutputTokens: {
            numberValue: 1024,
          },
        },
      },
    };

    const request = {
      endpoint: `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/${PUBLISHER}/models/${MODEL}`,
      instances: [instance],
      parameters: parameters,
    };

    const [response] = await predictionServiceClient.predict(request);
    console.log('Gemini API response:', JSON.stringify(response, null, 2));

    // 3. Process analysis results
    const predictions = response.predictions;
    let analysisResult = 'No analysis found.';

    if (predictions && predictions.length > 0) {
      // Assuming the first prediction contains the relevant text output
      const structValue = predictions[0].structValue;
      if (structValue && structValue.fields && structValue.fields.content) {
        analysisResult = structValue.fields.content.stringValue || analysisResult;
      }
    }

    // 4. Store results in Firestore
    const analysisRecordRef = firestore.collection('analysisRecords').doc();
    await analysisRecordRef.set({
      imageId: imageId,
      patientId: patientId,
      clinicianId: clinicianId,
      gcsUri: imagePath,
      analysisResult: analysisResult,
      modelUsed: MODEL,
      analysisDate: Firestore.FieldValue.serverTimestamp(), // Corrected Timestamp usage
      status: 'completed',
    });
    console.log(`Analysis results stored in Firestore for image ${imageId} with record ID: ${analysisRecordRef.id}`);

    // 5. Update the corresponding image document in Firestore (optional, but good for linking)
    // Assuming you have an 'images' collection where imageId corresponds to document ID
    const imageRef = firestore.collection('images').doc(imageId);
    await imageRef.update({
      latestAnalysisRecordId: analysisRecordRef.id,
      status: 'analyzed',
      updatedAt: Firestore.FieldValue.serverTimestamp(), // Corrected Timestamp usage
    });
    console.log(`Image document ${imageId} updated with latest analysis record ID.`);
    
    console.log('Image analysis completed successfully');
  } catch (error) {
    console.error('Error analyzing image:', error);
    // It's important to re-throw the error so Cloud Functions knows the execution failed
    throw error;
  }
};
