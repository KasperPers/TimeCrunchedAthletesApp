# ⚡ Quick Start - macOS

**5-minute setup guide for Mac users**

## Prerequisites Check

```bash
# Check if Node.js is installed
node --version  # Need v18+

# If not installed:
brew install node
```

## Setup Commands

```bash
# 1. Navigate to project (adjust path to where you downloaded it)
cd ~/Downloads/TimeCrunchedAthletesApp

# 2. Install dependencies
npm install

# 3. Initialize database
npm run db:push

# 4. Start the app
npm run dev
```

## Open the App

Visit: **http://localhost:3000**

## First Time Use

1. **Click** "Connect with Strava"
2. **Authorize** the app on Strava
3. **Click** "Sync Activities" on dashboard
4. **Set** your weekly plan (sessions + duration)
5. **Click** "Get Workout Recommendations"

## Strava Configuration

Go to https://www.strava.com/settings/api

Make sure:
- **Authorization Callback Domain** = `localhost` ✓

## Common Issues & Fixes

### Port 3000 in use?
```bash
kill -9 $(lsof -ti:3000)
npm run dev
```

### Database error?
```bash
rm -f prisma/dev.db
npm run db:push
```

### OAuth error?
- Check Strava callback domain is exactly: `localhost`
- Restart dev server: `Ctrl+C` then `npm run dev`

## Stopping the Server

Press: `Ctrl + C`

## Restarting Later

```bash
cd ~/Downloads/TimeCrunchedAthletesApp  # or wherever you installed
npm run dev
```

## Set Your FTP

```bash
npm run db:studio  # Opens at http://localhost:5555
# Update FTP in User table
```

## Need Detailed Help?

See **[MACOS_SETUP.md](./MACOS_SETUP.md)** for complete instructions.

---

**Ready to train smarter?** 🚴💪
