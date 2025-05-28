#!/bin/bash

# Deploy script for AI Beauty Lens Cloud Functions
set -e

echo "🚀 Deploying AI Beauty Lens Cloud Functions..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Please install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Error: Not authenticated with Google Cloud"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Set project if provided
if [ ! -z "$1" ]; then
    echo "📋 Setting project to: $1"
    gcloud config set project $1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: No project set"
    echo "Please set a project: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📋 Deploying to project: $PROJECT_ID"

# Deploy Gemini Analysis Function
echo "🔍 Deploying Gemini Analysis Function..."
cd cloud-functions/gemini-analysis
echo "📦 Installing dependencies for Gemini Analysis Function..."
yarn install --frozen-lockfile || yarn install # Use --frozen-lockfile for CI/CD, fallback to install
npm run build
gcloud functions deploy analyzeImage \
    --runtime nodejs20 \
    --trigger-topic image-uploaded \
    --memory 512MB \
    --timeout 300s \
    --region us-central1 \
    --source . \
    --entry-point analyzeImage

cd ../.. # Go back to the root directory

# Deploy Image Processor Function
echo "🖼️  Deploying Image Processor Function..."
cd cloud-functions/image-processor
echo "📦 Installing dependencies for Image Processor Function..."
yarn install --frozen-lockfile || yarn install # Use --frozen-lockfile for CI/CD, fallback to install
npm run build
gcloud functions deploy processImage \
    --runtime nodejs20 \
    --trigger-http \
    --memory 1GB \
    --timeout 300s \
    --region us-central1 \
    --source . \
    --entry-point processImage

cd ..

echo "✅ All functions deployed successfully!"
echo ""
echo "📋 Function URLs:"
echo "🔍 Gemini Analysis: Triggered by Pub/Sub topic 'image-uploaded'"
echo "🖼️  Image Processor: $(gcloud functions describe processImage --region=us-central1 --format='value(httpsTrigger.url)')"
echo ""
echo "🔧 To view logs:"
echo "   gcloud functions logs read analyzeImage --region=us-central1"
echo "   gcloud functions logs read processImage --region=us-central1"
