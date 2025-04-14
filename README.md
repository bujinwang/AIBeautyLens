# AIBeautyLens

AIBeautyLens is an iOS app for aesthetic treatment recommendations and visualizations using AI.

## Features

- Capture or select facial photos
- AI-powered facial analysis
- Personalized treatment recommendations
- Before/after treatment simulations
- Shareable treatment reports

## Tech Stack

- React Native with Expo
- OpenAI GPT-4o Vision for facial analysis
- DALL-E 3 for treatment simulations
- Local storage for user data

## Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn
- iOS device or simulator
- Expo Go app (for testing on physical devices)
- OpenAI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/AIBeautyLens.git
cd AIBeautyLens
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
   - Create a `.env` file in the project root
   - Add your OpenAI API key: `OPENAI_API_KEY=your_api_key_here`
   - Or update the key directly in `app.config.js`

4. Start the development server
```bash
npm start
```

5. Scan the QR code with your iOS device using the Expo Go app, or press 'i' to open in iOS simulator

## Project Structure

- `/components` - Reusable UI components
- `/screens` - Main app screens
- `/services` - AI service integrations
- `/constants` - App constants and data
- `/utils` - Helper functions

## Privacy & Security

This is an MVP application that stores all data locally on the device. Photos are only sent to OpenAI's API for analysis and are not stored on any remote server.

## License

[MIT](LICENSE)

## Acknowledgements

- OpenAI for GPT-4o and DALL-E APIs
- React Native and Expo community 