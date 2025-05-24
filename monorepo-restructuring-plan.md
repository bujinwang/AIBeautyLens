# Monorepo Restructuring Implementation Plan

## Phase 1: Folder Structure Creation

### Step 1: Create Main Directories
```bash
mkdir -p app
mkdir -p backend
mkdir -p cloud-functions/gemini-analysis
mkdir -p cloud-functions/image-processor
mkdir -p shared/src/types
mkdir -p shared/src/constants
mkdir -p shared/src/utils
mkdir -p infrastructure/terraform
mkdir -p infrastructure/gcp-setup
mkdir -p infrastructure/firestore-rules
mkdir -p docs
```

### Step 2: Create Root Workspace Configuration

#### Root package.json
```json
{
  "name": "ai-beauty-lens-monorepo",
  "version": "1.0.6",
  "private": true,
  "workspaces": [
    "app",
    "backend",
    "cloud-functions/*",
    "shared"
  ],
  "scripts": {
    "app:start": "yarn workspace @aibeautylens/app start",
    "app:android": "yarn workspace @aibeautylens/app android",
    "app:ios": "yarn workspace @aibeautylens/app ios",
    "backend:start": "yarn workspace @aibeautylens/backend start:dev",
    "backend:build": "yarn workspace @aibeautylens/backend build",
    "functions:deploy": "cd cloud-functions && ./deploy-functions.sh",
    "shared:build": "yarn workspace @aibeautylens/shared build",
    "lint": "yarn workspaces run lint",
    "test": "yarn workspaces run test",
    "install:all": "yarn install",
    "clean": "yarn workspaces run clean"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^8.30.1",
    "@typescript-eslint/parser": "^8.30.1",
    "eslint": "^9.24.0",
    "typescript": "^5.8.2"
  },
  "engines": {
    "node": ">=18.0.0",
    "yarn": ">=1.22.0"
  }
}
```

#### Root tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "allowJs": true,
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "moduleResolution": "node",
    "baseUrl": "./",
    "paths": {
      "@aibeautylens/shared": ["./shared/src"],
      "@aibeautylens/shared/*": ["./shared/src/*"]
    },
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "exclude": ["node_modules", "dist", "build"]
}
```

### Step 3: Move Current App Files

#### Files to Move to app/ Directory:
- `src/` → `app/src/`
- `android/` → `app/android/`
- `ios/` → `app/ios/`
- `assets/` → `app/assets/`
- `public/` → `app/public/`
- `scripts/` → `app/scripts/`
- `app.json` → `app/app.json`
- `babel.config.js` → `app/babel.config.js`
- `metro.config.js` → `app/metro.config.js`
- `eas.json` → `app/eas.json`
- `index.js` → `app/index.js`
- `polyfills.js` → `app/polyfills.js`
- `transformer.js` → `app/transformer.js`
- `webpack.config.js` → `app/webpack.config.js`

#### Create app/package.json
```json
{
  "name": "@aibeautylens/app",
  "version": "1.0.6",
  "main": "index.js",
  "scripts": {
    "start": "expo start --localhost",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "generate-icons": "node scripts/generate-icons.js",
    "clean": "rm -rf node_modules .expo"
  },
  "dependencies": {
    "@aibeautylens/shared": "*",
    "@expo/metro-runtime": "~5.0.4",
    "@expo/vector-icons": "^14.1.0",
    "@expo/webpack-config": "^19.0.1",
    "@react-native-async-storage/async-storage": "2.1.2",
    "@react-navigation/native": "6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "axios": "^1.8.4",
    "expo": "~53.0.0",
    "expo-build-properties": "~0.14.6",
    "expo-camera": "16.1.6",
    "expo-clipboard": "7.1.4",
    "expo-constants": "~17.1.6",
    "expo-crypto": "~14.1.4",
    "expo-file-system": "~18.1.10",
    "expo-image-manipulator": "13.1.7",
    "expo-image-picker": "16.1.4",
    "expo-linear-gradient": "14.1.4",
    "expo-mail-composer": "14.1.4",
    "expo-media-library": "17.1.6",
    "expo-sharing": "~13.1.5",
    "expo-status-bar": "~2.2.3",
    "expo-web-browser": "~14.1.6",
    "i18next": "^25.0.1",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "react-i18next": "^15.4.1",
    "react-native": "0.79.2",
    "react-native-crypto": "^2.2.0",
    "react-native-gesture-handler": "~2.24.0",
    "react-native-keychain": "^10.0.0",
    "react-native-localize": "^3.4.1",
    "react-native-randombytes": "^3.6.1",
    "react-native-safe-area-context": "5.4.0",
    "react-native-screens": "~4.10.0",
    "react-native-svg": "15.11.2",
    "react-native-web": "0.20.0",
    "react-native-webview": "13.13.5",
    "stream-browserify": "^3.0.0",
    "vm-browserify": "^1.1.2"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@types/react": "~19.0.7",
    "@typescript-eslint/eslint-plugin": "^8.30.1",
    "@typescript-eslint/parser": "^8.30.1",
    "babel-plugin-module-resolver": "^5.0.2",
    "eslint": "^9.24.0",
    "eslint-plugin-react": "^7.37.5",
    "eslint-plugin-react-native": "^5.0.0",
    "metro": "^0.82.0",
    "metro-core": "^0.82.0",
    "metro-react-native-babel-transformer": "0.77.0",
    "metro-resolver": "^0.82.0",
    "sharp": "^0.33.2",
    "typescript": "^5.8.2"
  },
  "private": true,
  "expo": {
    "doctor": {
      "reactNativeDirectoryCheck": {
        "exclude": [
          "react-native-crypto",
          "react-native-randombytes",
          "stream-browserify",
          "vm-browserify"
        ]
      }
    }
  }
}
```

### Step 4: Create Backend Workspace Structure

#### backend/package.json
```json
{
  "name": "@aibeautylens/backend",
  "version": "1.0.6",
  "description": "NestJS backend for AI Beauty Lens",
  "author": "AI Beauty Lens Team",
  "private": true,
  "license": "UNLICENSED",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "clean": "rm -rf dist node_modules"
  },
  "dependencies": {
    "@aibeautylens/shared": "*",
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/websockets": "^10.0.0",
    "@nestjs/platform-socket.io": "^10.0.0",
    "@google-cloud/storage": "^7.0.0",
    "@google-cloud/firestore": "^7.0.0",
    "@google-cloud/pubsub": "^4.0.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.0",
    "passport-local": "^1.0.0",
    "bcrypt": "^5.1.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "socket.io": "^4.7.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.2",
    "@types/node": "^20.3.1",
    "@types/passport-jwt": "^3.0.9",
    "@types/passport-local": "^1.0.35",
    "@types/bcrypt": "^5.0.0",
    "@types/supertest": "^2.0.12",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.42.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "jest": "^29.5.0",
    "prettier": "^3.0.0",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.0",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.1",
    "typescript": "^5.1.3"
  }
}
```

### Step 5: Create Shared Workspace

#### shared/package.json
```json
{
  "name": "@aibeautylens/shared",
  "version": "1.0.6",
  "description": "Shared types and utilities for AI Beauty Lens",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "lint": "eslint \"src/**/*.ts\" --fix",
    "test": "jest",
    "clean": "rm -rf dist node_modules"
  },
  "dependencies": {
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1"
  },
  "devDependencies": {
    "@types/node": "^20.3.1",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.42.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.1.3"
  }
}
```

### Step 6: Create Cloud Functions Structure

#### cloud-functions/gemini-analysis/package.json
```json
{
  "name": "gemini-analysis-function",
  "version": "1.0.0",
  "description": "Google Cloud Function for Gemini Vision API analysis",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "functions-framework --target=analyzeImage",
    "deploy": "gcloud functions deploy analyzeImage --runtime nodejs20 --trigger-topic image-uploaded",
    "clean": "rm -rf dist node_modules"
  },
  "dependencies": {
    "@google-cloud/functions-framework": "^3.0.0",
    "@google-cloud/firestore": "^7.0.0",
    "@google-cloud/storage": "^7.0.0",
    "@google-cloud/aiplatform": "^3.0.0",
    "@google-cloud/pubsub": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.3.1",
    "typescript": "^5.1.3"
  }
}
```

### Step 7: Update Configuration Files

#### Files to Update After Move:
1. `app/metro.config.js` - Update to resolve workspace dependencies
2. `app/babel.config.js` - Add module resolver for shared workspace
3. `app/tsconfig.json` - Update paths for shared types
4. Update import statements in React Native app to use shared workspace

### Step 8: Create Documentation

#### docs/workspace-setup.md
- Workspace structure explanation
- Development workflow
- Build and deployment instructions

#### docs/migration-notes.md
- Changes made during restructuring
- Updated import paths
- New development commands

## Implementation Order

1. ✅ Create folder structure
2. ✅ Create root workspace configuration
3. ✅ Move React Native app files
4. ✅ Create backend workspace structure
5. ✅ Create shared workspace
6. ✅ Create cloud functions structure
7. ⏳ Update configuration files
8. ⏳ Update import paths
9. ⏳ Test workspace setup

## Next Steps

After creating this structure, we need to:
1. Update all import paths in the React Native app
2. Configure metro and babel for workspace resolution
3. Set up TypeScript path mapping
4. Test that all workspaces build correctly
5. Implement the backend modules according to the architectural plan