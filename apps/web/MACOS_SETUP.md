# Time Crunched Athletes - macOS Setup Guide

Complete installation guide for running the app on your Mac.

## Prerequisites

### 1. Install Homebrew (if not already installed)

Homebrew is a package manager for macOS. Open **Terminal** and run:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js

```bash
# Install Node.js (includes npm)
brew install node

# Verify installation
node --version  # Should show v18 or higher
npm --version   # Should show v9 or higher
```

**Alternative**: Download Node.js directly from https://nodejs.org (LTS version recommended)

### 3. Install Git (if not already installed)

```bash
# Install Git
brew install git

# Verify installation
git --version
```

## Installation Steps

### Step 1: Get the Code

If you cloned from GitHub:
```bash
# Navigate to where you want the project
cd ~/Documents  # or wherever you prefer

# Clone the repository
git clone https://github.com/KasperPers/TimeCrunchedAthletesApp.git

# Navigate into the project
cd TimeCrunchedAthletesApp
```

If you downloaded as a ZIP:
```bash
# Extract the ZIP file (double-click in Finder)
# Then navigate to it in Terminal
cd ~/Downloads/TimeCrunchedAthletesApp  # adjust path as needed
```

### Step 2: Install Dependencies

```bash
# Install all Node.js packages
npm install
```

This will take 1-2 minutes and install ~140 packages.

### Step 3: Configure Environment Variables

Your `.env.local` file is already configured with Strava credentials! Verify it exists:

```bash
# Check the file exists
cat .env.local
```

You should see your Strava credentials. If the file is missing, create it:

```bash
# Create .env.local file
cat > .env.local << 'EOF'
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="/Ndj0lD1fETt2UwDJn6afohFe3vAQvaGniv1DxT3CGs="

# Strava OAuth
STRAVA_CLIENT_ID="181924"
STRAVA_CLIENT_SECRET="eb074055f944bd71fe8f1b156cf78fb8a3808108"
EOF
```

### Step 4: Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Create the SQLite database
npm run db:push
```

**If you get errors** about Prisma engines:
```bash
# Try with environment variable
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npm run db:generate
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npm run db:push
```

### Step 5: Configure Strava App

1. Go to https://www.strava.com/settings/api
2. Find your app with Client ID `181924`
3. Verify these settings:
   - **Authorization Callback Domain**: `localhost`
   - **Website**: Can be anything (e.g., `http://localhost:3000`)

⚠️ The callback domain must be exactly `localhost` (no http://, no port number)

### Step 6: Start the Development Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 15.5.6
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

### Step 7: Open the App

Open your browser and navigate to:
```
http://localhost:3000
```

## Using the App

### First Login

1. Click **"Connect with Strava"**
2. You'll be redirected to Strava
3. Click **"Authorize"** to allow access
4. You'll be redirected back to the dashboard

### Sync Your Activities

1. Click **"Sync Activities"** button
2. Wait a few seconds while it fetches your recent activities
3. View your training metrics:
   - Weekly TSS
   - Training Load
   - Intensity Distribution

### Get Workout Recommendations

1. Select number of sessions (1-7)
2. Set duration for each session
3. Click **"Get Workout Recommendations"**
4. View personalized Zwift workouts!

## Troubleshooting

### Port 3000 Already in Use

If you see "Port 3000 is already in use":

```bash
# Find what's using port 3000
lsof -ti:3000

# Kill that process
kill -9 $(lsof -ti:3000)

# Or run on a different port
PORT=3001 npm run dev
```

### Database Errors

```bash
# Reset the database
rm -f prisma/dev.db prisma/dev.db-journal
npm run db:push
```

### OAuth Callback Error

**Error**: "The redirect_uri MUST match the registered callback URL for this application."

**Solution**:
1. Go to https://www.strava.com/settings/api
2. Make sure **Authorization Callback Domain** is exactly: `localhost`
3. Restart your dev server: `Ctrl+C` then `npm run dev`

### TypeScript Errors

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run dev
```

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Prisma Client Errors

```bash
# Regenerate Prisma Client
npm run db:generate

# If that fails, try:
npx prisma generate --skip-engine-validation
```

## Stopping the Server

Press `Ctrl + C` in the Terminal where the server is running.

## Restarting the App

Every time you want to use the app:

```bash
# Navigate to the project folder
cd ~/Documents/TimeCrunchedAthletesApp  # or wherever you installed it

# Start the server
npm run dev

# Open http://localhost:3000 in your browser
```

## macOS-Specific Tips

### Using Terminal
- Open Terminal: `Cmd + Space`, type "Terminal", press Enter
- Navigate folders: `cd foldername`
- Go back one folder: `cd ..`
- See current folder contents: `ls`
- See full path: `pwd`

### Recommended Code Editor
- **VS Code**: Download from https://code.visualstudio.com
- Open project in VS Code: `code .` (from project folder)

### Database Browser
View/edit your database:
```bash
npm run db:studio
```
Opens at http://localhost:5555

## Updating Your FTP

The app uses a default FTP of 200W. To set your actual FTP:

```bash
# Open Prisma Studio
npm run db:studio
```

1. Navigate to the `User` table
2. Find your record
3. Update the `ftp` field with your actual FTP (e.g., 250)
4. Click "Save 1 change"
5. Refresh the app

## Performance Tips

For best performance on Mac:
- Close unused browser tabs
- Use Google Chrome or Safari
- Ensure you have at least 4GB free RAM

## Uninstalling

To completely remove the app:

```bash
# Navigate to project folder
cd ~/Documents/TimeCrunchedAthletesApp

# Go up one level
cd ..

# Remove the entire folder
rm -rf TimeCrunchedAthletesApp
```

## Getting Help

If you encounter issues:
1. Check the error message in Terminal
2. Check browser console (Right-click → Inspect → Console)
3. Review the main [SETUP.md](./SETUP.md) guide
4. Check that all Prerequisites are installed correctly

## Next Steps

- ✅ App running? Test with your Strava account!
- 📊 View your training metrics
- 💪 Get personalized workout recommendations
- 🚀 When ready, see [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel deployment

---

**Need help?** Check that:
- ✓ Node.js v18+ is installed (`node --version`)
- ✓ You're in the correct folder (`pwd`)
- ✓ `.env.local` file exists and has Strava credentials
- ✓ Port 3000 is not in use by another app
- ✓ Strava callback domain is set to `localhost`
