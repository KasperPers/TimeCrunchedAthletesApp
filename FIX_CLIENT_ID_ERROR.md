# How to Fix: client_id is required Error

The `.env.local` file needs to be created manually on your machine (it's not in git for security).

## Quick Fix

Run these commands in Terminal from your project folder:

```bash
# Make sure you're in the project directory
cd ~/Documents/TimeCrunchedAthletesApp

# Create the .env.local file with your Strava credentials
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

# Verify the file was created
cat .env.local

# Restart the dev server
npm run dev
```

Then try connecting with Strava again at http://localhost:3000

## Alternative: Create File Manually

1. Open your project folder in Finder
2. Create a new file called `.env.local` (note the dot at the start)
3. Paste this content:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="/Ndj0lD1fETt2UwDJn6afohFe3vAQvaGniv1DxT3CGs="
STRAVA_CLIENT_ID="181924"
STRAVA_CLIENT_SECRET="eb074055f944bd71fe8f1b156cf78fb8a3808108"
```

4. Save the file
5. Restart the dev server (`Ctrl+C` then `npm run dev`)

## Why This Happened

`.env.local` contains sensitive credentials (your Strava secret), so it's not stored in GitHub. Everyone needs to create their own copy locally.
