# AIBeautyLens Project Rules & Guidelines

This document outlines the primary rules, conventions, and best practices to follow when developing the AIBeautyLens application. For project setup and workspace structure, see [README.md](./README.md). For product requirements and MVP plan, see [Tasks.MD](./Tasks.MD).

## 1. Core Technologies

*   **Framework:** React Native with Expo SDK (~50)
*   **Language:** TypeScript (Strict typing is encouraged)
*   **Navigation:** React Navigation (Stack Navigator v6)
*   **Styling:** React Native `StyleSheet` API
*   **API Calls:** `axios`
*   **Localization:** `i18next` with `react-i18next`
*   **Linting:** ESLint (Configured in `.eslintrc.js`)

## 2. Coding Style & Conventions

*   **TypeScript:**
    *   Use TypeScript for all new code (`.ts`, `.tsx`).
    *   Define interfaces/types for props, state, API payloads (in `src/types/`).
    *   Avoid `any`; use specific types or `unknown`.
*   **React:**
    *   Use functional components with Hooks.
    *   Keep components small, focused, and reusable.
*   **Naming:**
    *   Components/Files: `PascalCase` (e.g., `AnalysisScreen.tsx`)
    *   Services/Utilities Files: `camelCase` (e.g., `geminiService.ts`).
    *   Variables/Functions: `camelCase`.
    *   Constants: `UPPER_SNAKE_CASE`.
*   **Imports:**
    *   Organize: React/RN -> Libraries -> Absolute Paths (`src/*`) -> Relative Paths (`./`, `../`).
*   **Comments:**
    *   Explain complex logic, workarounds. Use `// TODO:`, `// FIXME:`.

## 3. Directory Structure

Follow the existing structure:

```
src/
├── App.tsx             # Root component, navigation setup
├── assets/             # Static assets (images, fonts)
├── components/         # Reusable UI components
├── constants/          # Theme, shared constants (theme.ts, treatments.ts)
├── hooks/              # Custom hooks (if any)
├── i18n/               # Localization files (localizationContext.tsx, translations)
├── navigation/         # Navigation setup, navigators (if separated from App.tsx)
├── screens/            # Top-level screen components
├── services/           # API call logic, external service interactions (geminiService.ts)
├── types/              # Shared TypeScript types/interfaces
└── utils/              # Utility functions
```

## 4. State Management

*   Prefer `useState` for local state.
*   Use React Context or lift state for simple sharing. Discuss libraries like Zustand/Redux for complex needs.

## 5. Styling

*   Use `StyleSheet.create`.
*   Strictly use the theme from `src/constants/theme.ts` (COLORS, SPACING, TYPOGRAPHY, etc.).
*   Avoid inline styles unless necessary for dynamic values.
*   Ensure responsiveness using `Platform`, `Dimensions`, `flex`.

## 6. API Calls

*   Centralize in `src/services/`.
*   Use the configured `axios` instance.
*   Implement loading/error states in calling components.

## 7. Localization

*   Use the `useLocalization` hook.
*   Define strings in `src/i18n/localizationContext.tsx`. No hardcoded UI strings.

## 8. Linting & Formatting

*   Adhere to ESLint rules (`npm run lint`).
*   Follow existing formatting style (Prettier if configured).

## 9. Dependencies

*   Consult before adding major dependencies.

## 10. Git Workflow

*   Use feature branches (`feature/feature-name`).
*   Write clear commit messages (e.g., `feat: Add processing indicator scroll view`).
*   Require pull requests for merging into `main`/`develop`. 