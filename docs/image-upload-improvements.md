# Image Upload System Improvements

This document outlines the improvements made to the image upload system in the AIBeautyLens project.

## Overview of Changes

We've implemented a robust image upload system with the following features:

1. **Signed URL Generation**: Secure, time-limited URLs for direct-to-storage uploads
2. **Rate Limiting**: Protection against abuse of the signed URL generation endpoint
3. **Configurable Expiration**: Control over URL lifetime
4. **Comprehensive Logging**: Tracking of successful and failed uploads
5. **Error Handling**: Graceful handling of upload failures

## Environment Variable Configuration

### Development Environment

The following environment variables should be set in your `.env` file for local development:

```
GCS_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=ai-beauty-lens
GCS_SIGNING_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```

For local development, the system uses the `gcloud` CLI for signed URL generation, which requires:
- Authenticated gcloud CLI (`gcloud auth login`)
- Service account with appropriate permissions
- "Service Account Token Creator" role assigned to your user account on the service account

### Production Environment

In production, the following environment variables should be set:

```
GCS_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=ai-beauty-lens
GCS_SIGNING_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```

The production environment uses the Google Cloud Storage client library with Application Default Credentials (ADC).

## Service Account Configuration

The service account used for signed URL generation requires the following permissions:

1. **Storage Object Creator** (`roles/storage.objectCreator`) - For creating objects in the bucket
2. **Storage Object Viewer** (`roles/storage.objectViewer`) - For reading objects in the bucket
3. **Service Account Token Creator** (`roles/iam.serviceAccountTokenCreator`) - For impersonation in development

## Security Improvements

1. **Rate Limiting**: 
   - 100 requests per 15-minute window per IP address
   - Configurable in `gcs.service.ts`

2. **URL Expiration**:
   - Default: 15 minutes
   - Configurable: 1-60 minutes
   - Can be set per request via the API

3. **Least Privilege Principle**:
   - Service account has minimal permissions required
   - JWT authentication required for all endpoints

## Monitoring

1. **Logging**:
   - Successful uploads are logged with object name and IP
   - Failed uploads are logged with error details and IP
   - Logs include timestamps for troubleshooting

2. **Future Improvements**:
   - Set up Cloud Monitoring alerts for permission issues
   - Implement a dashboard for upload statistics
   - Configure error rate alerting

## API Usage

### Frontend

```typescript
// Upload from base64 image
const publicUrl = await uploadImageToGCS(
  base64Image,
  'profile-picture',
  30 // Optional: expiration in minutes
);

// Upload from file URI
const publicUrl = await uploadImageFromUri(
  fileUri,
  'profile-picture',
  30 // Optional: expiration in minutes
);
```

### Backend

```typescript
// Generate a signed URL
POST /api/gcs/signed-url
{
  "filename": "image-name",
  "fileExtension": "jpg",
  "expirationMinutes": 30 // Optional
}

// Log successful upload
POST /api/gcs/log-upload-success
{
  "objectName": "image-name.jpg"
}

// Log failed upload
POST /api/gcs/log-upload-failure
{
  "objectName": "image-name.jpg",
  "error": "Error message"
}
```

## Testing the Upload Flow

To test the full image upload flow:

1. Ensure your environment variables are properly set
2. Authenticate with the backend to obtain a JWT token
3. Use the `uploadImageToGCS` or `uploadImageFromUri` functions from the frontend
4. Verify the image appears in your Google Cloud Storage bucket
5. Check the logs for successful upload events 