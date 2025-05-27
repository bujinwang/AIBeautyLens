#!/usr/bin/env node

/**
 * Test script for image upload functionality
 * 
 * Usage:
 * API_URL=http://localhost:3000/api API_KEY=your-api-key node test-image-upload.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const TEST_IMAGE_PATH = path.join(__dirname, '../app/assets/icon.png');
const API_KEY = process.env.API_KEY || 'test-api-key';

console.log(`Using test image at: ${TEST_IMAGE_PATH}`);
console.log(`API URL: ${API_URL}`);

// Check if test image exists
if (!fs.existsSync(TEST_IMAGE_PATH)) {
  console.error(`Test image not found at ${TEST_IMAGE_PATH}`);
  console.error('Please add a test image or update the TEST_IMAGE_PATH');
  process.exit(1);
}

// Helper function to get base64 of an image
function getBase64(filePath) {
  const fileData = fs.readFileSync(filePath);
  return fileData.toString('base64');
}

// Helper function to get file extension
function getFileExtension(filePath) {
  return path.extname(filePath).substring(1).toLowerCase();
}

// Test the health endpoint
async function testHealth() {
  console.log('\n=== Testing GCS Health Endpoint ===');
  
  try {
    const response = await axios.get(`${API_URL}/gcs/test-health`);
    console.log('✅ Health check successful');
    console.log(`Status: ${response.data.status}`);
    console.log(`Message: ${response.data.message}`);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:');
    console.error(error.response?.data || error.message);
    return false;
  }
}

// Test the signed URL generation
async function testSignedUrlGeneration() {
  console.log('\n=== Testing Signed URL Generation ===');
  
  try {
    const response = await axios.post(
      `${API_URL}/gcs/test-signed-url`,
      {
        filename: 'test-upload',
        fileExtension: getFileExtension(TEST_IMAGE_PATH),
        expirationMinutes: 5
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.error) {
      console.error('❌ Failed to generate signed URL:');
      console.error(response.data.error);
      console.error(response.data.note);
      process.exit(1);
    }
    
    console.log('✅ Successfully generated signed URL');
    console.log(`URL: ${response.data.url}`);
    return response.data.url;
  } catch (error) {
    console.error('❌ Failed to generate signed URL:');
    console.error(error.response?.data || error.message);
    process.exit(1);
  }
}

// Test the upload to GCS
async function testUploadToGCS(signedUrl) {
  console.log('\n=== Testing Upload to GCS ===');
  
  try {
    const fileContent = fs.readFileSync(TEST_IMAGE_PATH);
    const fileExtension = getFileExtension(TEST_IMAGE_PATH);
    
    const response = await axios.put(
      signedUrl,
      fileContent,
      {
        headers: {
          'Content-Type': `image/${fileExtension}`
        }
      }
    );
    
    console.log('✅ Successfully uploaded image to GCS');
    console.log(`Status: ${response.status}`);
    
    // Extract the object name from the signed URL
    const urlParts = signedUrl.split('?')[0].split('/');
    const objectName = urlParts[urlParts.length - 1];
    
    return objectName;
  } catch (error) {
    console.error('❌ Failed to upload image to GCS:');
    console.error(error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the tests
async function runTests() {
  console.log('Starting image upload tests...');
  
  try {
    // First check if the service is healthy
    const isHealthy = await testHealth();
    if (!isHealthy) {
      console.error('❌ Service health check failed. Is the backend server running?');
      process.exit(1);
    }
    
    // Generate signed URL and upload
    const signedUrl = await testSignedUrlGeneration();
    const objectName = await testUploadToGCS(signedUrl);
    
    console.log('\n✅ All tests completed successfully!');
    console.log(`The uploaded image should be available at: https://storage.googleapis.com/ai-beauty-lens/${objectName}`);
  } catch (error) {
    console.error('\n❌ Tests failed:');
    console.error(error);
  }
}

runTests(); 