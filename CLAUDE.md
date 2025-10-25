# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Time Crunched Athletes is a Next.js app that provides intelligent training recommendations for busy cyclists. It analyzes Strava activities, calculates training metrics (TSS, CTL/ATL, FTP), and recommends optimal Zwift workouts based on available time and current fitness state.

## Essential Commands

```bash
# Development
npm run dev                 # Start dev server (http://localhost:3000)
npm run build              # Production build
npm run lint               # ESLint

# Database (Prisma)
npm run db:generate        # Generate Prisma client after schema changes
npm run db:push            # Push schema changes to database
npm run db:studio          # Open Prisma Studio GUI

# Setup (first time)
npm install
npm run db:push            # Initialize SQLite database
# Configure .env.local with Strava credentials
```

## Architecture

### Tech Stack
- **Next.js 15** with App Router (not Pages Router)
- **TypeScript** with strict mode
- **Prisma ORM** with SQLite (dev) / can use PostgreSQL (prod)
- **NextAuth.js** for Strava OAuth authentication
- **Tailwind CSS** for styling

### Directory Structure

```
app/
├── api/                          # API routes (Next.js App Router)
│   ├── auth/[...nextauth]/       # NextAuth config
│   ├── sync-activities/          # Sync Strava data
│   ├── recommendations/          # Generate workout recommendations
│   ├── ftp-metrics/              # FTP estimation and projections
│   └── weekly-plans/             # Weekly training plan CRUD
├── dashboard/                    # Main app page (requires auth)
└── page.tsx                      # Landing/login page

lib/
├── services/                     # Core business logic
│   ├── analysis.ts               # Training metrics calculation (TSS, load ratios)
│   ├── recommendations.ts        # Workout recommendation engine
│   ├── ftp.ts                    # FTP estimation & projection algorithms
│   ├── strava.ts                 # Strava API client
│   └── zwift-workouts.ts         # Zwift workout matching
├── types/index.ts                # TypeScript interfaces
├── auth.ts                       # NextAuth configuration
└── prisma.ts                     # Prisma client singleton

components/                       # React components (TSX)
├── FtpInsights/                  # FTP tracking & projection UI
├── CalendarView.tsx              # Weekly calendar with workouts
├── WorkoutDetailModal.tsx        # Workout details display
└── ...

prisma/
└── schema.prisma                 # Database schema
```

### Key Data Models (Prisma)

- **User**: Stores Strava profile, FTP, weight
- **Activity**: Cached Strava activities with calculated TSS, intensity, workout type
- **WeeklyPlan**: User's training plan (sessions per week, durations)
- **Recommendation**: Generated workout recommendations linked to a plan
- **ZwiftWorkout**: Curated Zwift workout library

### Core Training Concepts

**Training Stress Score (TSS)**
Quantifies workout difficulty accounting for duration and intensity. Calculated from power data (or estimated from HR). Formula: `TSS = (hours × IF² × 100)` where IF = Intensity Factor (NP/FTP).

**Acute/Chronic Training Load (ATL/CTL)**
- ATL: 7-day rolling average TSS (acute load/fatigue)
- CTL: 42-day rolling average TSS (chronic load/fitness)
- TSB: Training Stress Balance = CTL - ATL (positive = fresh, negative = fatigued)

**Training Load Ratio**
`Acute / Chronic` ratio. Optimal range: 0.8-1.3. Above 1.5 indicates overtraining risk.

**Polarized Training**
Evidence-based approach: ~80% low intensity (Z1-Z2), ~20% high intensity (Z4-Z5).

**FTP (Functional Threshold Power)**
Estimated from Strava activities using 20-min power (×0.95) or max 1-hour power. Used to calculate intensity zones and TSS.

### Service Layer Architecture

**TrainingAnalysisService** (`lib/services/analysis.ts`)
Calculates training metrics from activity history:
- Weekly/acute/chronic TSS
- Training load ratio
- Intensity distribution across power zones
- Determines training needs (recovery, threshold, VO2max, etc.)

**RecommendationEngine** (`lib/services/recommendations.ts`)
Generates weekly workout plans:
- Distributes workout types across sessions (follows polarized model)
- Matches Zwift workouts to target TSS and duration
- Prevents back-to-back hard sessions
- Adapts to current training load state

**FTPService** (`lib/services/ftp.ts`)
Handles FTP estimation and projections:
- Estimates FTP from 90 days of power data
- Calculates CTL/ATL/TSB metrics
- Projects future FTP and CTL (4-6 weeks)
- Generates adaptive training plans based on readiness

**ZwiftWorkoutService** (`lib/services/zwift-workouts.ts`)
Matches user needs to Zwift workout library by type, duration, and TSS.

### Authentication Flow

1. User signs in with Strava OAuth (NextAuth.js)
2. Strava returns access token + athlete data (FTP, weight)
3. Profile stored in User model, tokens in Account model
4. Session includes `accessToken` for Strava API calls
5. `/api/sync-activities` fetches last 6 weeks of activities

### Environment Variables

Required in `.env.local`:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"
STRAVA_CLIENT_ID="<from Strava API application>"
STRAVA_CLIENT_SECRET="<from Strava API application>"
```

## Development Patterns

### Database Workflow

After modifying `prisma/schema.prisma`:
1. Run `npm run db:generate` to update Prisma client
2. Run `npm run db:push` to apply schema changes to database
3. Restart dev server if types don't update

### Type Safety

- All Strava data uses `StravaActivity` interface
- Training metrics use `TrainingMetrics` interface
- Workout recommendations use `ZwiftWorkout` interface
- Import from `lib/types/index.ts`

### API Route Pattern

API routes in `app/api/*/route.ts` follow Next.js App Router conventions:
```typescript
export async function GET(req: Request) { ... }
export async function POST(req: Request) { ... }
```

Session access:
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return new Response('Unauthorized', { status: 401 });
}
```

### Client Components

Most components use React Server Components by default. Add `'use client'` directive only when needed for:
- Event handlers (onClick, onChange)
- React hooks (useState, useEffect)
- Browser APIs

### Training Load Calculations

When calculating TSS or training load:
1. Always fetch user's FTP from database (default: 200W if not set)
2. Use `FTPService.calculateTSS()` for individual activities
3. Use `TrainingAnalysisService` for comprehensive metrics
4. Consider both power-based and HR-based estimates

### Recommendation Generation

The recommendation engine follows this flow:
1. Calculate current training metrics from last 42 days
2. Determine training needs (primary/secondary focus)
3. Distribute workout types across week (polarized approach)
4. Match each session to appropriate Zwift workout
5. Validate: no back-to-back very hard sessions, reasonable weekly TSS

## Domain-Specific Knowledge

### Power Zones (% of FTP)
- Z1 Recovery: < 55%
- Z2 Endurance: 55-75%
- Z3 Tempo: 76-90%
- Z4 Threshold: 91-105%
- Z5 VO2Max: 106-120%
- Z6 Anaerobic: > 120%

### Typical TSS Values
- Easy ride (1hr): ~40-60 TSS
- Tempo ride (1hr): ~70-80 TSS
- Threshold intervals (1hr): ~80-100 TSS
- VO2max intervals (1hr): ~90-120 TSS

### Training Load Interpretation
- TSB > +10: Well rested, ready for hard training
- TSB -5 to +5: Balanced, race-ready
- TSB < -10: Fatigued, need recovery
- TSB < -30: Severely fatigued, risk overtraining

### CTL Ramp Rate (per week)
- < 2: Maintenance phase
- 2-5: Safe build
- 5-8: Aggressive build (monitor recovery)
- > 8: Overreach risk

## Common Workflows

### Adding New Workout Types

1. Update Zwift workout scraper or manually add to ZwiftWorkout table
2. Ensure `type` field matches training zones (Recovery, Endurance, Tempo, Threshold, VO2Max, Mixed)
3. Calculate estimated TSS based on intervals and duration
4. `RecommendationEngine` will automatically include in matching

### Modifying FTP Estimation

FTP estimation logic is in `FTPService.estimateFTP()`. The algorithm:
- Prefers 20-min max power × 0.95
- Falls back to max 1-hour power or 60% of 5-min power
- Confidence score based on ride count, recency, data quality

### Adjusting Recommendation Logic

To change workout distribution patterns, edit `RecommendationEngine.distributeWorkoutTypes()`:
- Follows polarized training by default (80% easy, 20% hard)
- Adapts based on training load (if load > 1.5, replaces hard sessions with recovery)
- Session count determines pattern (1-7 sessions have specific distributions)

## Debugging Tips

- Use `npm run db:studio` to inspect database directly
- Check `app/api/debug/workouts/route.ts` for workout library inspection
- Strava token expires; if sync fails, user needs to re-authenticate
- TSS calculations require valid FTP; default is 200W if missing
- Activity sync fetches last 6 weeks only (Strava API pagination limit without premium)

## Performance Projections

The FTP projection system (`FTPService.generateProjections()`) uses:
- Historical FTP trend (30-day change)
- Heart Rate Efficiency (HR/power ratio trend)
- CTL ramp rate
- Training zone distribution
- Current TSB (fatigue penalty)

Projections are capped at ±10% over 6 weeks and include confidence scores based on data volume, recency, and training volatility.
