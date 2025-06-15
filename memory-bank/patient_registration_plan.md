# Patient Registration Page Flows - App Side Design Plan

This document outlines the design plan for the patient registration page flows on the AIBeautyLens mobile application, covering both clinician-led and patient self-registration scenarios.

## 1. Goal

Design distinct app screen flows for clinician-led patient registration and patient self-registration, incorporating required fields and privacy considerations.

## 2. Assumptions

*   The app uses React Native for UI development.
*   Navigation is handled by `AppNavigator.js` (likely React Navigation).
*   Existing UI components (e.g., `Button.tsx`, `ScreenWrapper.tsx`) can be reused or extended.
*   Encryption for `contact_info` and `additional_phi_details` will be handled by a utility function (e.g., in `src/utils/encryption.ts`).

## 3. Required Fields & Privacy Considerations

Based on the `Patient` model in `backend/prisma/schema.prisma` and user clarification:

*   **Clinician-led Registration:**
    *   `full_name` (Required)
    *   `contact_info` (Optional, to be encrypted at application level)
    *   `additional_phi_details` (Optional, to be encrypted at application level)

*   **Patient Self-Registration:**
    *   `full_name` (Required)
    *   `email` (Required, Unique)
    *   `password` (Required, MinLength 8 characters)
    *   `date_of_birth` (Optional)
    *   `gender` (Optional)
    *   `contact_info` (Optional, to be encrypted at application level)
    *   `additional_phi_details` (Optional, to be encrypted at application level)

## 4. Flow 1: Clinician-led Patient Registration

This flow is initiated by a clinician within their authenticated session.

### Screen: `ClinicianPatientRegistrationScreen.tsx`

*   **Purpose:** Allow clinicians to quickly register new patients with minimal required information.
*   **Layout:**
    *   `ScreenWrapper` component for consistent layout.
    *   Header: "Register New Patient"
    *   Input Field:
        *   `Full Name` (Text Input, Required)
    *   Optional Input Fields (for `contact_info` and `additional_phi_details`):
        *   `Contact Information` (Text Area/Input, Optional, will be encrypted)
        *   `Additional PHI Details` (Text Area/Input, Optional, will be encrypted)
    *   Button: "Register Patient"
*   **Validation:**
    *   `Full Name` must not be empty.
*   **Navigation:**
    *   On successful registration: Navigate to a "Patient Details" screen or a "Patient List" screen.
    *   On error: Display an `ErrorToast`.

### Process:

1.  Clinician navigates to this screen from their dashboard or a patient management section.
2.  Clinician fills in the `Full Name` and optionally `Contact Information` and `Additional PHI Details`.
3.  Upon "Register Patient" submission:
    *   The app encrypts `contact_info` and `additional_phi_details` using `src/utils/encryption.ts`.
    *   A request is sent to the backend's patient registration endpoint (e.g., `/patients/register-by-clinician`).
    *   Backend creates the patient record.
    *   App navigates to the next appropriate screen.

## 5. Flow 2: Patient Self-Registration

This flow is for new patients signing up for the app themselves.

### Screen 1: `PatientSignUpScreen.tsx` (Basic Info)

*   **Purpose:** Collect essential information for account creation.
*   **Layout:**
    *   `ScreenWrapper` component.
    *   Header: "Create Your Account"
    *   Input Fields:
        *   `Full Name` (Text Input, Required)
        *   `Email` (Email Input, Required, Unique)
        *   `Password` (Password Input, Required, MinLength 8 characters, Confirm Password)
    *   Button: "Next"
*   **Validation:**
    *   `Full Name` must not be empty.
    *   `Email` must be a valid email format and unique (backend validation).
    *   `Password` must meet minimum length requirements and match confirmation.
*   **Navigation:**
    *   On successful validation: Navigate to `PatientProfileSetupScreen.tsx`.
    *   On error: Display an `ErrorToast`.

### Screen 2: `PatientProfileSetupScreen.tsx` (Optional Details & Privacy Consent)

*   **Purpose:** Allow patients to provide optional demographic and health information, and acknowledge privacy.
*   **Layout:**
    *   `ScreenWrapper` component.
    *   Header: "Complete Your Profile (Optional)"
    *   Optional Input Fields:
        *   `Date of Birth` (Date Picker)
        *   `Gender` (Dropdown/Picker: Male, Female, Other, Prefer not to say)
        *   `Contact Information` (Text Area/Input, Optional, will be encrypted)
        *   `Additional PHI Details` (Text Area/Input, Optional, will be encrypted)
    *   Checkbox: "I agree to the Privacy Policy and Terms of Service." (Required to proceed)
    *   Button: "Complete Registration"
*   **Validation:**
    *   Privacy Policy checkbox must be checked.
*   **Navigation:**
    *   On successful submission: Navigate to `HomeScreen.tsx` or a "Registration Success" screen.
    *   On error: Display an `ErrorToast`.

### Process:

1.  Patient starts from a "Sign Up" option on the initial app screen.
2.  Patient fills in basic info on `PatientSignUpScreen.tsx`.
3.  Upon "Next" submission:
    *   A temporary user account might be created on the backend, or the data is held in state.
    *   Navigates to `PatientProfileSetupScreen.tsx`.
4.  Patient fills in optional details and agrees to terms on `PatientProfileSetupScreen.tsx`.
5.  Upon "Complete Registration" submission:
    *   The app encrypts `contact_info` and `additional_phi_details`.
    *   A request is sent to the backend's patient registration endpoint (e.g., `/auth/register-patient`).
    *   Backend creates/updates the patient record and associates it with the user account.
    *   App navigates to the `HomeScreen.tsx`.

## 6. Flow Diagrams

```mermaid
graph TD
    A[App Launch] --> B{User Type?}
    B -- Clinician --> C[Clinician Dashboard]
    C --> D[Register New Patient Button]
    D --> E[ClinicianPatientRegistrationScreen]
    E -- Submit --> F{Backend API Call: /patients/register-by-clinician}
    F -- Success --> G[Patient Details/List Screen]
    F -- Error --> H[ErrorToast]

    B -- Patient --> I[Welcome/Login Screen]
    I --> J[Sign Up Button]
    J --> K[PatientSignUpScreen (Basic Info)]
    K -- Submit --> L{Validate Basic Info}
    L -- Valid --> M[PatientProfileSetupScreen (Optional Details)]
    L -- Invalid --> H
    M -- Submit --> N{Backend API Call: /auth/register-patient}
    N -- Success --> O[Home Screen]
    N -- Error --> H
```

## 7. Next Steps for Implementation (after plan approval)

1.  Create new DTOs in `backend/src/modules/patients/dto/` for `CreatePatientByClinicianDto.ts` and `RegisterPatientDto.ts` (if not already existing).
2.  Update `backend/src/modules/patients/patients.controller.ts` and `patients.service.ts` to handle these new registration endpoints.
3.  Create new React Native screens: `ClinicianPatientRegistrationScreen.tsx`, `PatientSignUpScreen.tsx`, `PatientProfileSetupScreen.tsx` in `app/src/screens/`.
4.  Add these new screens to `app/src/navigation/AppNavigator.js`.
5.  Implement UI components for input fields, buttons, and date pickers.
6.  Implement client-side validation.
7.  Integrate with `src/services/api.ts` to call backend endpoints.
8.  Implement encryption for sensitive fields using `src/utils/encryption.ts`.