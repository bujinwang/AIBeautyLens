# System Patterns: AIBeautyLens

## 1. System Architecture Overview

*   (To be filled: High-level diagram or description of the frontend, backend, AI services, and cloud functions.)
*   (To be filled: Data flow between components.)

## 2. Key Technical Decisions

*   **Monorepo:** Using Yarn Workspaces for managing `app`, `backend`, and `shared` packages.
*   **Frontend Framework:** React Native with Expo.
*   **Backend Framework:** NestJS.
*   **AI Service:** Google Gemini (currently, with considerations for alternatives due to China accessibility).
*   **Cloud Storage:** Google Cloud Storage (GCS) for image uploads (via pre-signed URLs).
*   **Authentication:** JWT-based authentication for the backend.
*   **Cloud Functions:** For specific, isolated processing tasks (e.g., image processing, AI analysis orchestration).
*   **Database:** (To be determined/filled: e.g., Firestore, PostgreSQL).

## 3. Design Patterns in Use

*   **Backend:**
    *   Module-based architecture (NestJS modules).
    *   Controller-Service pattern.
    *   Dependency Injection.
    *   DTOs (Data Transfer Objects) for API request/response validation.
*   **Frontend:**
    *   Component-based architecture (React).
    *   (To be filled: State management patterns, navigation patterns).
*   **General:**
    *   (To be filled: e.g., Repository pattern if applicable).

## 4. Component Relationships

*   **Mobile App (Frontend)** <-> **NestJS API (Backend)**: RESTful API calls.
*   **NestJS API (Backend)** <-> **GCS**: Pre-signed URL generation, potentially direct interactions.
*   **NestJS API (Backend)** <-> **AI Models (e.g., Gemini via Cloud Function or direct API)**: Analysis requests.
*   **NestJS API (Backend)** <-> **Database**: Data persistence.
*   **Cloud Functions** <-> **Other GCP Services / External APIs**: As needed.

---
*Self-Correction: This is an initial draft. Please review and update this document with specific details and diagrams as the system evolves.*
