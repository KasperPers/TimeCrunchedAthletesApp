# Monorepo Migration Complete! 🎉

Your Time Crunched Athletes project has been restructured into a monorepo with web and mobile apps sharing business logic.

## 📦 New Structure

```
TimeCrunchedAthletesApp/
├── apps/
│   ├── web/                    # Next.js web app (your existing app)
│   └── mobile/                 # Expo React Native mobile app (new!)
├── packages/
│   └── shared/                 # Shared business logic
│       ├── src/
│       │   ├── services/       # TSS, FTP, recommendations logic
│       │   └── types/          # TypeScript interfaces
│       └── package.json
├── package.json                # Root workspace config
└── README.md                   # Monorepo documentation
```

## ✅ What's Been Done

1. **✅ Created monorepo structure** with npm workspaces
2. **✅ Moved Next.js app** to `apps/web/`
3. **✅ Extracted shared logic** to `packages/shared/`
4. **✅ Created Expo mobile app** in `apps/mobile/`
5. **✅ Configured workspace dependencies**

## 🚀 Quick Start

### Run Web App
```bash
# From root
npm run web

# Or navigate to web app
cd apps/web
npm run dev
```

### Run Mobile App
```bash
# From root
npm run mobile

# Or navigate to mobile app
cd apps/mobile
npm start
```

## 🔧 Next Steps (TODO)

### 1. Update Web App Imports
Currently, the web app still imports from local `lib/` folders. You need to update imports to use the shared package:

**Before:**
```typescript
import { TrainingAnalysisService } from '@/lib/services/analysis';
import { FTPService } from '@/lib/services/ftp';
```

**After:**
```typescript
import { TrainingAnalysisService, FTPService } from '@timecrunchedathletes/shared';
```

**Files to Update:**
- `apps/web/app/api/recommendations/route.ts`
- `apps/web/app/api/sync-activities/route.ts`
- `apps/web/app/api/ftp-metrics/route.ts`
- `apps/web/app/dashboard/page.tsx`
- Any other files importing from `lib/services/*` or `lib/types/*`

### 2. Remove Duplicate lib Folder
Once imports are updated, you can delete `apps/web/lib/` (except `lib/auth.ts`, `lib/prisma.ts`, and `lib/utils/` which are web-specific).

### 3. Build Mobile App UI
The Expo app is ready, but needs UI components:

**Start with a simple screen:**
```typescript
// apps/mobile/App.tsx
import { TrainingAnalysisService } from '@timecrunchedathletes/shared';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View>
      <Text>Time Crunched Athletes Mobile</Text>
      <Text>Shared logic is working! ✓</Text>
    </View>
  );
}
```

### 4. Add Mobile Dependencies
For a best-in-class mobile app, install:

```bash
cd apps/mobile

# UI Framework (choose one)
npx expo install nativewind  # Tailwind for React Native
# OR
npm install tamagui

# Navigation
npx expo install expo-router react-native-safe-area-context

# Icons
npx expo install @expo/vector-icons

# Charts for training data
npm install victory-native react-native-svg
```

### 5. Configure TypeScript Path Aliases
Update `apps/web/tsconfig.json` to use the shared package:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@timecrunchedathletes/shared": ["../../packages/shared/src"]
    }
  }
}
```

## 📱 Mobile App Roadmap

### Phase 1: Core Features (Week 1-2)
- [ ] Calendar view with workouts
- [ ] Workout detail screens
- [ ] FTP tracking dashboard
- [ ] Training metrics visualization

### Phase 2: Mobile-Specific (Week 3-4)
- [ ] Swipe gestures for calendar
- [ ] Pull-to-refresh for activity sync
- [ ] Push notifications for workouts
- [ ] Offline mode with local storage

### Phase 3: Advanced (Week 5+)
- [ ] Native charts for TSS/CTL/ATL
- [ ] Workout player/timer
- [ ] Strava OAuth in-app
- [ ] Dark mode

## 🛠️ Development Workflow

### Adding New Features

**For Shared Business Logic:**
```bash
cd packages/shared
# Edit src/services/* or src/types/*
npm run type-check
```

**For Web UI:**
```bash
cd apps/web
npm run dev
# Edit components, pages, etc.
```

**For Mobile UI:**
```bash
cd apps/mobile
npm start
# Edit App.tsx, components, etc.
```

### Testing Changes

```bash
# Type-check all packages
npm run type-check

# Run both apps simultaneously
npm run web    # Terminal 1
npm run mobile # Terminal 2
```

## 🔍 Troubleshooting

### "Cannot find module '@timecrunchedathletes/shared'"

**Solution:** Install workspace dependencies
```bash
npm install
```

### Web app won't start

**Solution:** The web app still references old imports
```bash
cd apps/web
# Update imports as described in "Next Steps" above
```

### Mobile app metro bundler error

**Solution:** Clear cache and restart
```bash
cd apps/mobile
npx expo start --clear
```

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native](https://reactnative.dev/)
- [NativeWind (Tailwind for RN)](https://www.nativewind.dev/)
- [Expo Router (Navigation)](https://docs.expo.dev/router/introduction/)
- [npm Workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces)

## 💡 Tips

- **Keep `packages/shared` pure TypeScript** - no React, no React Native, no Next.js specific code
- **Test shared logic changes in both apps** before committing
- **Use the same TypeScript/Zod versions** across all packages
- **Share types liberally** - both apps should use the same data models

## ✨ What Makes This Best-in-Class

1. **🔄 Code Reuse** - Training logic written once, used everywhere
2. **📱 Native Experience** - React Native for true mobile feel
3. **🚀 Fast Development** - Change shared code → both apps update
4. **🎯 Type Safety** - TypeScript enforced across web & mobile
5. **📦 Monorepo** - Single repo, consistent versioning, easy refactoring

---

**Ready to build?** Start with updating the web app imports, then dive into building the mobile UI! 🚀
