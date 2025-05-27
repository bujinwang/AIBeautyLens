# AIBeautyLens MVP & Feature Plan

For project setup and workspace structure, see [README.md](./README.md). For coding and contribution rules, see [PROJECT_RULES.md](./PROJECT_RULES.md).

---

## Simplified MVP Plan: Standalone iOS Aesthetic Treatment App

This document outlines the product plan, feature set, and technical implementation for the MVP of AIBeautyLens as a standalone iOS app (no backend server).

### Core MVP Features

- **Photo Capture**
  - Native iOS camera integration
  - Photo storage on device only
  - Basic face framing guides

- **Local LLM Integration**
  - Direct API calls to OpenAI from the iOS app
  - Analyze facial features using GPT-4o Vision
  - Age estimation included in analysis

- **Hardcoded Treatment Database**
  - Predefined treatment list stored in the app
  - No remote database or management needed
  - Static pricing and descriptions

- **Treatment Simulation**
  - Direct API calls to DALL-E from the iOS app
  - Before/after comparison views
  - Simple image caching for performance

- **Basic Treatment Report**
  - On-device PDF generation
  - Share via standard iOS share sheet
  - Treatment details and simulated results

---

## Technical Implementation

### App Structure

```
app/
├── App.tsx                    # Main application entry
├── components/                # Reusable UI components
├── screens/                   # Main app screens
│   ├── CameraScreen.tsx       # Photo capture
│   ├── AnalysisScreen.tsx     # Analysis results
│   ├── TreatmentScreen.tsx    # Treatment selection
│   ├── SimulationScreen.tsx   # Before/after display
│   └── ReportScreen.tsx       # Treatment report
├── services/                  # API integrations
│   ├── openaiService.ts       # Direct GPT-4o integration
│   └── imageGenService.ts     # DALL-E integration
├── constants/                 # App constants
│   └── treatments.ts          # Hardcoded treatment list
└── utils/                     # Helper functions
    ├── imageUtils.ts          # Image processing
    └── reportGenerator.ts     # PDF generation
```

### API Integrations

- **OpenAI (GPT-4o Vision) for facial analysis**
- **OpenAI (DALL-E 3) for treatment simulation**

### Hardcoded Treatment Database Example

See `src/constants/treatments.ts` for the full list and structure. Example:

```ts
export const TREATMENTS = [
  {
    id: "pico-laser",
    name: "Picosecond Laser",
    category: "Laser",
    area: "Face",
    description: "Advanced laser technology that delivers energy in ultra-short picosecond pulses to target pigmentation and improve skin texture",
    price: 400
  },
  // ...more treatments
];
```

### App Workflow

1. User takes or selects a photo
2. App sends photo to OpenAI API for analysis
3. User browses recommended treatments
4. App sends photo and treatment info to DALL-E API for simulation
5. User views before/after comparison
6. App generates and shares a treatment report (PDF)

---

## Development Timeline (4 Weeks)

- **Week 1:** Core App Setup (camera, navigation, hardcoded data)
- **Week 2:** Analysis Implementation (OpenAI API, facial analysis, recommendations)
- **Week 3:** Simulation Features (DALL-E API, before/after UI, selection, caching)
- **Week 4:** Report Generation & Polish (PDF, sharing, UI polish, testing)

---

## Cost & Security Considerations

- **API Usage Only:**
  - Analysis: ~$0.10 per analysis (GPT-4o Vision)
  - Simulation: ~$0.04 per simulation (DALL-E 3)
  - No monthly hosting costs
- **Security:**
  - Use environment variables for API keys
  - Obfuscate keys and consider Apple Keychain
  - Add terms of service regarding photo privacy

---

## Treatment Categories & Example Data

- Laser Treatments (e.g., Picosecond Laser, Fractional Laser, Hair Removal)
- Radiofrequency Treatments (e.g., Tempsure RF, Thermage, Flexsure)
- Injection Treatments (e.g., HA Filler, Botox, Fat Dissolving, PRP)
- Special Treatments (e.g., HydroFacial, Aqua Acupuncture)

See `src/constants/treatments.ts` for the full, categorized list.