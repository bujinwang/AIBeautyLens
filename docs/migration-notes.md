# Migration Notes - Monorepo Restructuring

## Overview

This document outlines the changes made during the monorepo restructuring of the AI Beauty Lens project.

## Structural Changes

### File Movements

The following files and directories were moved from the root to the `app/` workspace:

#### Directories
- `src/` → `app/src/`
- `android/` → `app/android/`
- `ios/` → `app/ios/`
- `assets/` → `app/assets/`
- `public/` → `app/public/`
- `scripts/` → `app/scripts/`

#### Configuration Files
- `app.json` → `app/app.json`
- `babel.config.js` → `app/babel.config.js`
- `metro.config.js` → `app/metro.config.js`
- `eas.json` → `app/eas.json`
- `index.js` → `app/index.js`
- `polyfills.js` → `app/polyfills.js`
- `transformer.js` → `app/transformer.js`
- `webpack.config.js` → `app/webpack.config.js`

### New Workspace Structure

#### Created Workspaces
1. **App Workspace** (`@aibeautylens/app`)
   - Contains the React Native mobile application
   - All existing app code moved here

2. **Backend Workspace** (`@aibeautylens/backend`)
   - New NestJS backend structure
   - Ready for backend implementation

3. **Shared Workspace** (`@aibeautylens/shared`)
   - Common types, constants, and utilities
   - Shared across all workspaces

4. **Cloud Functions**
   - `gemini-analysis/` - For Gemini Vision API integration
   - `image-processor/` - For image processing tasks

#### New Directories
- `infrastructure/` - Infrastructure as code
- `docs/` - Project documentation

## Configuration Updates

### Root Level Changes

#### New Files
- Root `package.json` - Yarn workspace configuration
- Root `tsconfig.json` - Shared TypeScript configuration

#### Updated Scripts
The root package.json now includes workspace-specific scripts:
```json
{
  "app:start": "yarn workspace @aibeautylens/app start",
  "app:android": "yarn workspace @aibeautylens/app android",
  "app:ios": "yarn workspace @aibeautylens/app ios",
  "backend:start": "yarn workspace @aibeautylens/backend start:dev",
  "shared:build": "yarn workspace @aibeautylens/shared build"
}
```

### App Workspace Changes

#### Package.json Updates
- Package name changed to `@aibeautylens/app`
- Added dependency on `@aibeautylens/shared`
- Maintained all existing dependencies

#### Required Configuration Updates (Next Steps)
The following files need to be updated to work with the new structure:

1. **`app/metro.config.js`**
   - Add workspace resolution for `@aibeautylens/shared`
   - Update resolver configuration

2. **`app/babel.config.js`**
   - Add module resolver plugin
   - Configure path mapping for shared workspace

3. **`app/tsconfig.json`**
   - Create app-specific TypeScript configuration
   - Extend root tsconfig.json
   - Add path mapping for shared types

## Import Path Changes

### Before (Old Structure)
```typescript
// Direct relative imports
import { SomeType } from '../types/index';
import { API_ENDPOINTS } from '../constants/api';
```

### After (New Structure)
```typescript
// Workspace imports
import { SomeType, API_ENDPOINTS } from '@aibeautylens/shared';
```

## Development Workflow Changes

### Before
```bash
# Old commands
npm start
npm run android
npm run ios
```

### After
```bash
# New workspace commands
yarn app:start
yarn app:android
yarn app:ios

# Or from app directory
cd app && yarn start
```

## Breaking Changes

### Import Statements
All imports from shared code need to be updated to use the new workspace package:
- Update imports in React Native components
- Update imports in services and utilities
- Update imports in type definitions

### Build Process
- Shared package must be built before app development
- Metro bundler configuration needs workspace support
- TypeScript path mapping required for proper resolution

## Migration Checklist

### ✅ Completed
- [x] Created monorepo folder structure
- [x] Moved React Native app files to `app/` workspace
- [x] Created workspace package.json files
- [x] Created shared workspace with basic types and utilities
- [x] Created backend workspace structure
- [x] Created cloud functions structure
- [x] Created documentation

### ⏳ Remaining Tasks
- [ ] Update `app/metro.config.js` for workspace resolution
- [ ] Update `app/babel.config.js` with module resolver
- [ ] Create `app/tsconfig.json` with proper path mapping
- [ ] Update all import statements in React Native app
- [ ] Test workspace setup and builds
- [ ] Implement backend modules
- [ ] Set up cloud functions
- [ ] Configure CI/CD for monorepo

## Testing the Migration

### Verify Workspace Setup
```bash
# Install all dependencies
yarn install

# Check workspace info
yarn workspaces info

# Build shared package
yarn shared:build

# Test app startup
yarn app:start
```

### Common Issues and Solutions

1. **Metro bundler can't resolve shared package**
   - Solution: Update metro.config.js with workspace resolver

2. **TypeScript can't find shared types**
   - Solution: Build shared package and update tsconfig.json

3. **Import errors in React Native**
   - Solution: Update import statements to use workspace package

## Rollback Plan

If issues arise, the migration can be rolled back by:
1. Moving files back from `app/` to root
2. Restoring original package.json
3. Reverting import statements
4. Removing workspace configuration

However, it's recommended to fix issues rather than rollback, as the monorepo structure provides better organization and scalability.