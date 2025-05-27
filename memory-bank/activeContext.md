# Active Context: AIBeautyLens

## 1. Current Work Focus

*   **Primary:** Completed implementation of core clinician authentication (register, login, JWT, basic RBAC) using Prisma and PostgreSQL.
*   **Secondary:** Ongoing investigation into GCS pre-signed URL generation issues with local ADC.

## 2. Recent Changes

*   **Authentication Module (Clinicians):**
    *   Created `CliniciansService` and `CliniciansModule`.
    *   Refactored `AuthService`, `JwtStrategy`, and `LocalStrategy` to use `CliniciansService` and Prisma.
    *   Implemented `Roles` decorator, `Role` enum, and `RolesGuard` for RBAC.
    *   Updated `AuthController` with new DTOs (`RegisterClinicianDto`, `LoginDto`) and RBAC.
*   **Database ORM Switch & Prisma Setup:** (Details from previous state remain relevant)
    *   Switched ORM from TypeORM to Prisma.
    *   Installed Prisma CLI and Client.
    *   Initialized Prisma in the `backend` project.
    *   Defined data models (Clinician, Patient, Organization, ClinicianPatientAssignment) in `prisma/schema.prisma`.
    *   Configured `DATABASE_URL` in `.env` for PostgreSQL.
    *   Successfully ran initial database migration (`prisma migrate dev`).
    *   Created `PrismaService` and `PrismaModule` and integrated into `AppModule`.
*   **Memory Bank Updates:**
    *   Updated `progress.md`, `systemPatterns.md`, `techContext.md`, and `activeContext.md` to reflect Prisma adoption and Auth module progress.
    *   Created `database_strategy_plan.md`.
*   (Previous GCS/Build changes still relevant)
*   Backend build issues were resolved; `backend/dist/main.js` is now being created.
*   The NestJS server can be started using `node backend/dist/main.js`.

## 3. Next Steps

*   **Backend Development:**
    *   Thoroughly test the implemented authentication flow (registration, login, JWT validation, role guards).
    *   Implement NestJS modules for Patients and Organizations.
    *   Develop services and controllers for managing Patients and Organizations using `PrismaService`.
    *   Refine DTOs and add further validation as needed.
*   **GCS Pre-signed URLs:** Continue investigating workarounds for local v4 signing with user ADC and service account impersonation, or prioritize testing in a GCP environment.
*   **Memory Bank Population:** Continue to fill in details in `productContext.md` and other placeholder files.

## 4. Active Decisions and Considerations

*   **ORM Choice:** Prisma is the selected ORM for PostgreSQL.
*   **Database Schema:** Initial schema for core entities is defined in `prisma/schema.prisma`.
*   (Previous GCS considerations still relevant)
*   The organization policy prevents the creation of service account keys, necessitating reliance on ADC and service account impersonation for GCS.
*   The primary goal for GCS is to enable local development and testing of pre-signed URL generation.

---
*Self-Correction: This is an initial draft. Please review and update this document as the context evolves.*
