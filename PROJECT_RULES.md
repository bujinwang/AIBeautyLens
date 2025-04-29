# AIBeautyLens Project Rules & Guidelines

This document outlines the primary rules, conventions, and best practices to follow when developing the AIBeautyLens application. Adhering to these guidelines ensures consistency, maintainability, and collaboration efficiency.

## 1. Core Technologies

*   **Framework:** React Native with Expo SDK (~50)
*   **Language:** TypeScript (Strict typing is encouraged)
*   **Navigation:** React Navigation (Stack Navigator v6)
*   **Styling:** React Native `StyleSheet` API
*   **API Calls:** `axios`
*   **Localization:** `i18next` with `react-i18next`
*   **Linting:** ESLint (Configured in `.eslintrc.js` - *assuming standard location*)

## 2. Coding Style & Conventions

*   **TypeScript:**
    *   Utilize TypeScript for all new code (`.ts`, `.tsx`).
    *   Define interfaces and types for props, state, and API payloads. Store shared types in `src/types/`.
    *   Avoid `any` where possible. Use specific types or `unknown`.
*   **React:**
    *   Use functional components with Hooks (`useState`, `useEffect`, etc.).
    *   Keep components small, focused, and reusable.
*   **Naming:**
    *   Components: `PascalCase` (e.g., `AnalysisScreen.tsx`, `AILogoIcon.tsx`)
    *   Files: `PascalCase` for components/screens, `camelCase` for services/utilities (e.g., `geminiService.ts`).
    *   Variables/Functions: `camelCase`.
    *   Constants: `UPPER_SNAKE_CASE` (e.g., `BORDER_RADIUS`, `PROCESSING_STEPS`).
*   **Imports:**
    *   Organize imports: React/RN -> Libraries -> Absolute Paths (`src/*`) -> Relative Paths (`./`, `../`).
    *   Use path aliases if configured (e.g., `@components/`). *(Check `babel.config.js` or `tsconfig.json` if needed)*
*   **Comments:**
    *   Add comments to explain complex logic, workarounds, or non-obvious code sections.
    *   Use `// TODO:` or `// FIXME:` prefixes for actionable comments.

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

*   **Local State:** Use `useState` for component-specific state.
*   **Shared State:** For state shared between non-parent/child components, consider React Context API or lifting state up. If complexity grows significantly, discuss introducing a dedicated state management library (e.g., Zustand, Redux Toolkit).

## 5. Styling

*   **Method:** Use `StyleSheet.create` for defining styles.
*   **Theme:** Adhere strictly to the theme defined in `src/constants/theme.ts` (COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS).
*   **Inline Styles:** Avoid inline styles unless necessary for dynamic values or minor tweaks.
*   **Responsiveness:** Use `Platform`, `Dimensions`, and flexible layout techniques (`flex`, percentages) to ensure layouts adapt to different screen sizes (iPhone, iPad) and orientations.

## 6. API Calls

*   **Location:** Centralize API logic within the `src/services/` directory.
*   **Client:** Use the configured `axios` instance.
*   **State Handling:** Implement proper loading and error states in components that trigger API calls. Provide user feedback during these states.

## 7. Localization

*   **Implementation:** Use the `useLocalization` hook provided by `src/i18n/localizationContext.tsx`.
*   **Strings:** Define all user-facing strings within the `translations` object in the context file. Avoid hardcoding strings directly in components.

## 8. Linting & Formatting

*   **ESLint:** Ensure code adheres to the project's ESLint configuration. Run `npm run lint` (or `yarn lint`) and fix errors/warnings before committing code.
*   **Formatting:** Use Prettier (if configured) or maintain consistent formatting according to the established style.

## 9. Dependencies

*   **Adding:** Discuss with the team before adding new major dependencies to `package.json`.
*   **Updating:** Update dependencies cautiously, testing thoroughly afterward.

## 10. Git Workflow

*   *(Define your specific branch strategy, commit message format, PR process, etc. here)*
    *   Example: Use feature branches (`feature/feature-name`).
    *   Example: Write clear commit messages (e.g., `feat: Add processing indicator scroll view`).
    *   Example: Require pull requests for merging into `main`/`develop`. 