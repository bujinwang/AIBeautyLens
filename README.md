# AI Beauty Lens

AI Beauty Lens is a standalone iOS mobile application that uses artificial intelligence to analyze facial features and recommend personalized aesthetic treatments. The app leverages OpenAI's GPT-4o Vision and DALL-E APIs for facial analysis and treatment simulation, with all data stored locally for maximum privacy. No backend server is required.

## Features

- Native iOS camera/photo library integration
- On-device photo storage (no cloud upload)
- Facial analysis and age estimation using GPT-4o Vision
- Personalized treatment recommendations from a hardcoded database
- Treatment simulation (before/after) using DALL-E
- On-device PDF treatment report generation and iOS share sheet
- Simple, privacy-focused design

## Tech Stack

- **Framework:** React Native (Expo SDK ~50)
- **Language:** TypeScript
- **Navigation:** React Navigation (Stack Navigator v6)
- **Styling:** React Native `StyleSheet` API, custom theme
- **API Calls:** `axios` (OpenAI GPT-4o, DALL-E)
- **Localization:** `i18next` with `react-i18next`
- **PDF Generation:** On-device (no backend)

## Directory Structure (Key)

```
src/
  components/         # Reusable UI components
  screens/            # Main app screens
    CameraScreen.tsx
    AnalysisScreen.tsx
    TreatmentScreen.tsx
    SimulationScreen.tsx
    ReportScreen.tsx
  services/           # API integrations
    openaiService.ts  # GPT-4o Vision
    imageGenService.ts# DALL-E
  constants/          # App constants
    treatments.ts     # Hardcoded treatment list
  utils/              # Helper functions
    imageUtils.ts     # Image processing
    reportGenerator.ts# PDF generation
```

## API Usage

- **Facial Analysis:**
  - Uses OpenAI GPT-4o Vision API to analyze facial images and estimate age.
  - Returns treatment recommendations from a hardcoded list.
- **Treatment Simulation:**
  - Uses DALL-E API to generate realistic after images based on selected treatments.
- **All API keys are stored securely using environment variables.**

## Security & Privacy

- No backend server; all data is stored on-device.
- API keys are managed with React Native Config and obfuscation techniques.
- User photos are never uploaded to a remote server.
- Terms of service include photo privacy information.

## Development Timeline (MVP)

**Week 1:** Core app setup, camera/photo integration, navigation, hardcoded treatments

**Week 2:** OpenAI API integration, facial analysis, treatment recommendation UI, secure API key storage

**Week 3:** DALL-E integration, before/after UI, treatment selection, result caching

**Week 4:** PDF report generation, iOS sharing, UI polish, device testing

## Cost Considerations

- Only API usage costs (no hosting):
  - GPT-4o Vision: ~$0.10/analysis
  - DALL-E: ~$0.04/simulation

---

For more details, see `Tasks.MD`.
