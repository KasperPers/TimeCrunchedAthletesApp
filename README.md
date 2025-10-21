# Time Crunched Athletes 🚴💪

**Smart workout recommendations for busy athletes**

An intelligent training planner that analyzes your Strava activities and recommends optimal Zwift workouts based on your available time and current fitness level.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)
![Strava](https://img.shields.io/badge/Strava-API-FC4C02?style=flat&logo=strava)

## 🎯 Features

### Advanced Training Analysis
- **Training Stress Score (TSS)** - Quantify training load for each workout
- **Acute/Chronic Training Load** - Monitor fitness and fatigue balance
- **Intensity Distribution** - Analyze time spent in each training zone
- **Smart Periodization** - Recommendations based on current training state

### Personalized Workout Planning
- Connect your Strava account to analyze recent activities
- Specify weekly training availability (sessions and durations)
- Get AI-powered Zwift workout recommendations
- Workouts tailored to your fitness level and time constraints

### Time-Efficient Training
Perfect for athletes who want maximum results in minimum time:
- Optimized workout selection
- Evidence-based training principles (polarized training, sweet spot)
- Prevents overtraining and undertraining
- Maintains training balance and progression

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Strava account with recent activities
- (Optional) Strava API credentials for OAuth

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd TimeCrunchedAthletesApp

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Strava credentials

# Initialize database
npm run db:push

# Start development server
npm run dev
```

Visit http://localhost:3000

## 📖 Documentation

- **[macOS Quick Start](./QUICKSTART_MAC.md)** - ⚡ 5-minute setup for Mac users
- **[macOS Setup Guide](./MACOS_SETUP.md)** - Complete macOS installation guide
- **[Setup Guide](./SETUP.md)** - Detailed setup instructions and troubleshooting
- **[Deployment Guide](./DEPLOYMENT.md)** - Deploy to Vercel or other platforms

## 🏗️ Tech Stack

### Frontend & Backend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **NextAuth.js** - Authentication with Strava OAuth

### Database & ORM
- **Prisma** - Type-safe database ORM
- **SQLite** - Local development (upgrade to PostgreSQL for production)

### Integrations
- **Strava API** - Activity data and OAuth
- **Zwift Workout Library** - Curated workout database

## 📊 How It Works

### 1. Data Collection
- User authenticates with Strava OAuth
- App fetches last 6 weeks of activities
- Activities cached in local database

### 2. Training Analysis
The app calculates multiple metrics:

**Training Stress Score (TSS)**
- Quantifies workout difficulty
- Accounts for duration and intensity
- Based on power data when available

**Training Load Ratio**
- Acute TSS (7-day average) / Chronic TSS (42-day average)
- Optimal range: 0.8 - 1.3
- Prevents overtraining and undertraining

**Intensity Distribution**
- Recovery (< 55% FTP)
- Endurance (55-75% FTP)
- Tempo (76-90% FTP)
- Threshold (91-105% FTP)
- VO2Max (106-120% FTP)
- Anaerobic (> 120% FTP)

### 3. Workout Recommendations
Based on analysis, the app:
- Determines training needs (e.g., more base, more intensity)
- Distributes workout types across the week (polarized approach)
- Matches Zwift workouts to session duration and target TSS
- Provides reasoning for each recommendation

### 4. Training Principles
Recommendations follow evidence-based principles:
- **Polarized Training**: 80% easy, 20% hard
- **Progressive Overload**: Gradual fitness building
- **Recovery**: Prevents back-to-back hard sessions
- **Specificity**: Matches workouts to current needs

## 🎨 Features in Detail

### Dashboard
- Overview of training metrics
- Weekly TSS and training load
- Intensity distribution visualization
- Recent activity summary

### Session Planner
- Set number of weekly sessions (1-7)
- Define duration for each session (15-180 minutes)
- Get instant recommendations

### Workout Cards
Each recommendation includes:
- Workout name and type
- Duration and estimated TSS
- Detailed description
- Link to Zwift workout
- Reasoning for the selection

## 🔒 Privacy & Data

- Your Strava data is only used for training analysis
- Activities stored locally in your database
- No data shared with third parties
- Revoke access anytime through Strava settings

## 🛠️ Development

### Project Structure
```
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # NextAuth configuration
│   │   ├── sync-activities/   # Strava sync endpoint
│   │   └── recommendations/   # Workout recommendations
│   ├── dashboard/             # Main dashboard page
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home/login page
├── components/                # React components
├── lib/
│   ├── services/              # Business logic
│   │   ├── strava.ts         # Strava API client
│   │   ├── analysis.ts       # Training analysis
│   │   ├── zwift-workouts.ts # Workout library
│   │   └── recommendations.ts # Recommendation engine
│   ├── types/                 # TypeScript types
│   ├── auth.ts               # Auth configuration
│   └── prisma.ts             # Database client
├── prisma/
│   └── schema.prisma         # Database schema
└── public/                    # Static assets
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

### Database Schema

Key models:
- **User** - User profile with FTP and Strava data
- **Activity** - Cached Strava activities with calculated TSS
- **WeeklyPlan** - User's training plan for the week
- **Recommendation** - Generated workout recommendations

## 🚧 Roadmap

Future enhancements:
- [ ] Manual FTP input in UI
- [ ] Historical training analysis
- [ ] Custom workout creation
- [ ] Multi-sport support (swimming, running)
- [ ] Training plan templates
- [ ] Real-time Zwift integration
- [ ] Mobile app (React Native)
- [ ] Coach collaboration features

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

ISC

## 🙏 Acknowledgments

- **Strava** for the excellent API
- **Zwift** for inspiring effective indoor training
- **Training Peaks** for TSS methodology
- **Dr. Stephen Seiler** for polarized training research

## 💬 Support

For issues and questions:
- Check [SETUP.md](./SETUP.md) for troubleshooting
- Open an issue on GitHub
- Review [Strava API documentation](https://developers.strava.com)

---

**Built for time-crunched athletes who want maximum results in minimum time** 🎯
