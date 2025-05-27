# AI Beauty Lens - Monorepo

A comprehensive AI-powered beauty analysis application built with React Native, NestJS, and Google Cloud Functions.

## 🏗️ Project Structure

This project is organized as a monorepo using Yarn workspaces:

```
ai-beauty-lens-monorepo/
├── app/                          # React Native mobile application
├── backend/                      # NestJS backend API
├── cloud-functions/              # Google Cloud Functions
│   ├── gemini-analysis/         # Gemini Vision API analysis
│   └── image-processor/         # Image processing functions
├── shared/                       # Shared types and utilities
├── infrastructure/               # Infrastructure as code
├── docs/                        # Documentation
└── package.json                 # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- Yarn >= 1.22.0
- Expo CLI (for mobile development)
- Google Cloud SDK (for cloud functions)

### Installation
```bash
# Install all dependencies for all workspaces
yarn install
```

### Development

#### Mobile App
```bash
# Start Expo development server
yarn app:start

# Run on Android
yarn app:android

# Run on iOS
yarn app:ios
```

#### Backend API
```bash
# Start backend in development mode
yarn backend:start

# Build backend
yarn backend:build
```

#### Shared Package
```bash
# Build shared package (required before using in other workspaces)
yarn shared:build
```

#### Cloud Functions
```bash
# Deploy all functions
yarn functions:deploy
```

## 📦 Workspaces

### App (`@aibeautylens/app`)
React Native mobile application with Expo for iOS and Android platforms.

**Key Features:**
- Camera integration for image capture
- AI-powered beauty analysis
- Treatment recommendations
- Multi-language support
- Offline capabilities

### Backend (`@aibeautylens/backend`)
NestJS backend API providing REST endpoints and WebSocket connections.

**Key Features:**
- User authentication and authorization
- Image upload and management
- Analysis result storage
- Real-time notifications
- Integration with Google Cloud services

### Shared (`@aibeautylens/shared`)
Common TypeScript types, constants, and utilities shared across all workspaces.

**Includes:**
- Type definitions for analysis results
- API endpoint constants
- Utility functions
- Validation schemas

### Cloud Functions
Serverless functions for image processing and AI analysis.

**Functions:**
- `gemini-analysis`: Integrates with Gemini Vision API for beauty analysis
- `image-processor`: Handles image upload, validation, and preprocessing

## 🛠️ Development Workflow

1. **Install dependencies**: `yarn install`
2. **Build shared package**: `yarn shared:build`
3. **Start backend**: `yarn backend:start`
4. **Start mobile app**: `yarn app:start`
5. **Deploy functions**: `yarn functions:deploy` (when ready)

## �� Documentation

- [Project Rules & Guidelines](./PROJECT_RULES.md)
- [MVP & Feature Plan](./Tasks.MD)
- [Workspace Setup Guide](./docs/workspace-setup.md)
- [Migration Notes](./docs/migration-notes.md)
- [Architectural Plan](./architectural_plan.md)

## 🧪 Testing

```bash
# Run tests across all workspaces
yarn test

# Run linting across all workspaces
yarn lint
```

## 🚀 Deployment

### Mobile App
```bash
cd app
eas build --platform all
eas submit --platform all
```

### Backend
```bash
yarn backend:build
# Deploy to your preferred platform
```

### Cloud Functions
```bash
yarn functions:deploy
```

## 🔧 Configuration

### Environment Variables
Each workspace may require specific environment variables:

- **App**: Configure in `app/.env`
- **Backend**: Configure in `backend/.env`
- **Cloud Functions**: Configure via Google Cloud Console

### TypeScript
The project uses shared TypeScript configuration with workspace-specific overrides.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](./docs/)
- Open an issue on GitHub
- Contact the development team

---

Built with ❤️ by the AI Beauty Lens Team
