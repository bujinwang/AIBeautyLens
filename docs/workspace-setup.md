# AI Beauty Lens Monorepo Workspace Setup

## Overview

This project is structured as a monorepo using Yarn workspaces, containing multiple packages that work together to provide the AI Beauty Lens application.

## Workspace Structure

```
ai-beauty-lens-monorepo/
├── app/                          # React Native mobile application
├── backend/                      # NestJS backend API
├── cloud-functions/              # Google Cloud Functions
│   ├── gemini-analysis/         # Gemini Vision API analysis
│   └── image-processor/         # Image processing functions
├── shared/                       # Shared types and utilities
├── infrastructure/               # Infrastructure as code
├── docs/                        # Documentation
└── package.json                 # Root workspace configuration
```

## Workspaces

### 1. App (`@aibeautylens/app`)
- **Technology**: React Native with Expo
- **Purpose**: Mobile application for iOS and Android
- **Location**: `./app/`

### 2. Backend (`@aibeautylens/backend`)
- **Technology**: NestJS with TypeScript
- **Purpose**: REST API and WebSocket server
- **Location**: `./backend/`

### 3. Shared (`@aibeautylens/shared`)
- **Technology**: TypeScript
- **Purpose**: Shared types, constants, and utilities
- **Location**: `./shared/`

### 4. Cloud Functions
- **Technology**: Google Cloud Functions with TypeScript
- **Purpose**: Serverless functions for image processing and AI analysis
- **Location**: `./cloud-functions/`

## Development Workflow

### Prerequisites
- Node.js >= 18.0.0
- Yarn >= 1.22.0
- Expo CLI (for mobile development)
- Google Cloud SDK (for cloud functions)

### Installation
```bash
# Install all dependencies for all workspaces
yarn install:all

# Or simply
yarn install
```

### Development Commands

#### Mobile App
```bash
# Start Expo development server
yarn app:start

# Run on Android
yarn app:android

# Run on iOS
yarn app:ios
```

#### Backend
```bash
# Start backend in development mode
yarn backend:start

# Build backend
yarn backend:build
```

#### Shared Package
```bash
# Build shared package
yarn shared:build

# Watch mode for development
yarn workspace @aibeautylens/shared build:watch
```

#### Cloud Functions
```bash
# Deploy all functions
yarn functions:deploy
```

#### Global Commands
```bash
# Run linting across all workspaces
yarn lint

# Run tests across all workspaces
yarn test

# Clean all workspaces
yarn clean
```

## Build and Deployment

### Mobile App
The mobile app is built and deployed using Expo Application Services (EAS):
```bash
cd app
eas build --platform all
eas submit --platform all
```

### Backend
The backend can be deployed to various platforms:
```bash
yarn backend:build
# Deploy to your preferred platform (Google Cloud Run, AWS, etc.)
```

### Cloud Functions
```bash
cd cloud-functions
./deploy-functions.sh
```

## TypeScript Configuration

The monorepo uses a shared TypeScript configuration with path mapping for the shared package:

```json
{
  "paths": {
    "@aibeautylens/shared": ["./shared/src"],
    "@aibeautylens/shared/*": ["./shared/src/*"]
  }
}
```

## Shared Package Usage

Import shared types and utilities in any workspace:

```typescript
import { AnalysisResult, SkinAnalysis } from '@aibeautylens/shared';
import { formatDate, generateId } from '@aibeautylens/shared';
```

## Troubleshooting

### Common Issues

1. **Module resolution errors**: Ensure the shared package is built before using it in other workspaces
2. **Metro bundler issues**: Clear Metro cache with `yarn workspace @aibeautylens/app start --clear`
3. **TypeScript errors**: Run `yarn shared:build` to generate type definitions

### Useful Commands

```bash
# Clear all node_modules and reinstall
yarn clean && yarn install

# Reset Metro bundler cache
yarn workspace @aibeautylens/app start --clear

# Check workspace dependencies
yarn workspaces info