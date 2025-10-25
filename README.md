# Time Crunched Athletes - Monorepo

Smart workout recommendations for busy athletes - available on Web and Mobile.

## 📦 Structure

```
├── apps/
│   ├── web/              # Next.js web application
│   └── mobile/           # Expo/React Native mobile app
└── packages/
    └── shared/           # Shared business logic & types
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Install all dependencies (root + all workspaces)
npm install

# Or install each workspace separately
npm install --workspace=apps/web
npm install --workspace=apps/mobile
npm install --workspace=packages/shared
```

### Development

**Run Web App:**
```bash
npm run web
# or
cd apps/web && npm run dev
```

**Run Mobile App:**
```bash
npm run mobile
# or
cd apps/mobile && npm start
```

**Type Check Shared Package:**
```bash
npm run shared
```

## 📱 Apps

### Web (`apps/web/`)
Next.js application with:
- Strava OAuth authentication
- Training analytics dashboard
- Workout recommendations
- FTP tracking & projections

See [apps/web/README.md](apps/web/README.md) for details.

### Mobile (`apps/mobile/`)
Expo/React Native mobile app with:
- Native iOS/Android experience
- Same training science as web
- Optimized for mobile gestures
- Offline-first architecture (coming soon)

See [apps/mobile/README.md](apps/mobile/README.md) for details.

## 📚 Shared Package (`packages/shared/`)

Contains all business logic shared between web and mobile:

- **Services:** Training analysis, FTP calculations, recommendations
- **Types:** TypeScript interfaces for all data models
- **Utils:** Shared utilities and helpers

## 🛠️ Development Workflow

### Adding New Features

1. **Shared Logic:** Add to `packages/shared/src/services/`
2. **Web UI:** Implement in `apps/web/components/`
3. **Mobile UI:** Implement in `apps/mobile/components/`

### Making Changes to Shared Package

```bash
cd packages/shared
# Make changes to src/services/* or src/types/*
npm run type-check  # Verify types
```

Both apps will automatically use the updated shared code.

## 🔧 Workspace Scripts

```bash
npm run web             # Start web dev server
npm run mobile          # Start mobile dev server
npm run shared          # Type-check shared package
npm run install:all     # Install all workspaces
npm run clean           # Remove all node_modules
npm run type-check      # Type-check all packages
```

## 📖 Documentation

- [Web App Setup](apps/web/SETUP.md)
- [Mobile App Setup](apps/mobile/README.md) (coming soon)
- [Shared Package](packages/shared/README.md) (coming soon)
- [Architecture](apps/web/CLAUDE.md)

## 🏗️ Tech Stack

### Web
- Next.js 15
- TypeScript
- Tailwind CSS
- Prisma (SQLite/PostgreSQL)
- NextAuth.js

### Mobile
- Expo
- React Native
- NativeWind (Tailwind for RN)
- TypeScript

### Shared
- TypeScript
- Zod (validation)
- Axios (HTTP client)

## 🤝 Contributing

This is a personal project, but feedback is welcome!

## 📝 License

ISC
