# Technical Context: AIBeautyLens

## 1. Technologies Used

*   **Monorepo Management:** Yarn Workspaces
*   **Frontend:**
    *   React Native (with Expo SDK ~50)
    *   TypeScript
    *   React Navigation (Stack Navigator v6)
    *   `StyleSheet` API for styling
    *   `axios` for API calls
    *   `i18next` with `react-i18next` for localization
*   **Backend:**
    *   Node.js
    *   NestJS Framework
    *   TypeScript
    *   `@nestjs/passport`, `passport-jwt`, `passport-local` for authentication
    *   `@nestjs/jwt` for JWT handling
    *   `@google-cloud/storage` for GCS integration
    *   `dotenv` for environment variable management
*   **Shared Code:**
    *   TypeScript (for types, constants, utils shared between frontend and backend)
*   **Cloud Services:**
    *   Google Cloud Platform (GCP)
        *   Google Cloud Storage (GCS)
        *   Google Cloud Functions (for Gemini analysis, image processing)
        *   Google IAM (for permissions)
    *   AI Model: Google Gemini API
*   **Linting:** ESLint (see `.eslintrc.js`)
*   **Version Control:** Git

## 2. Development Setup

*   **IDE:** VS Code recommended
*   **Node.js Version:** (To be specified, e.g., LTS version like v18 or v20)
*   **Yarn Version:** (To be specified, e.g., v1.22.x)
*   **GCloud CLI:** Required for GCP interactions, ADC setup.
*   **Environment Variables:**
    *   Backend: Managed via `.env` file (e.g., `GCS_BUCKET_NAME`, `GCS_SIGNING_SERVICE_ACCOUNT_EMAIL`, `JWT_SECRET`).
*   **Key Scripts (from root `package.json`):**
    *   `yarn app:dev`: Runs the frontend Expo app.
    *   `yarn backend:dev`: Runs the backend NestJS server in watch mode.
    *   `yarn backend:build`: Builds the backend.
    *   `yarn backend:start`: Starts the built backend.
    *   (Other relevant scripts for linting, testing, etc.)

## 3. Technical Constraints

*   **Organization Policy:** Creation of service account keys is disabled on GCP. This necessitates using Application Default Credentials (ADC) with user accounts and service account impersonation for local development interacting with GCP services that require signing (like GCS pre-signed URLs).
*   **AI Model Accessibility:** Google Gemini services may have accessibility issues in certain regions (e.g., China), requiring consideration of alternative models or proxy solutions for affected users.
*   **Cross-Platform Compatibility:** Ensure features and UI work consistently across iOS and Android.
*   **Strict Typing:** TypeScript strict mode is encouraged. Avoid `any`.

## 4. Key Dependencies (Illustrative - to be expanded)

*   **Frontend (`app/package.json`):**
    *   `expo`
    *   `react`
    *   `react-native`
    *   `@react-navigation/native`
    *   `axios`
    *   `i18next`
*   **Backend (`backend/package.json`):**
    *   `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
    *   `@nestjs/config`
    *   `@nestjs/jwt`, `@nestjs/passport`
    *   `@google-cloud/storage`
    *   `typescript`
    *   `reflect-metadata`
    *   `rxjs`
*   **Shared (`shared/package.json`):**
    *   `typescript` (primarily for type definitions)

---
*Self-Correction: This is an initial draft. Please review and update this document with specific versions and further details as the project progresses.*
