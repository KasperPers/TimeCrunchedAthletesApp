# Time Crunched Athletes - Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Strava account
- (Optional) A Vercel account for deployment

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Strava API Credentials

1. Go to https://www.strava.com/settings/api
2. Click "Create an App" (or use an existing app)
3. Fill in the application details:
   - **Application Name**: Time Crunched Athletes (or your preferred name)
   - **Category**: Training
   - **Club**: Leave blank (optional)
   - **Website**: http://localhost:3000 (for development)
   - **Authorization Callback Domain**: localhost (important!)
   - **Application Description**: Smart workout planner for time-crunched athletes

4. After creating the app, you'll see:
   - **Client ID**: Copy this
   - **Client Secret**: Copy this (keep it secret!)

### 3. Configure Environment Variables

Edit the `.env.local` file and add your Strava credentials:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# Strava OAuth
STRAVA_CLIENT_ID="your_actual_client_id_here"
STRAVA_CLIENT_SECRET="your_actual_client_secret_here"
```

**Generate a secure NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Initialize the Database

```bash
# Generate Prisma Client (if you encounter network issues, skip this for now)
npm run db:generate

# Create the database
npm run db:push
```

**Note:** If `db:generate` fails due to network restrictions, you can run the app without it initially. The database will still be created when you run `db:push`.

### 5. Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Using the App

### First Time Setup

1. Click "Connect with Strava" on the home page
2. Authorize the app to access your Strava data
3. You'll be redirected to the dashboard

### Creating a Training Plan

1. Click "Sync Activities" to fetch your recent Strava activities
2. View your training metrics (TSS, training load, intensity distribution)
3. Plan your week:
   - Select number of sessions (1-7)
   - Set duration for each session
4. Click "Get Workout Recommendations"
5. View personalized Zwift workouts based on your training data

### Understanding the Metrics

- **Weekly TSS**: Training Stress Score - measures training load
- **Training Load**: Acute:Chronic ratio - indicates if you're training too hard or not enough
  - < 0.8: Training load is low, time to build fitness
  - 0.8-1.3: Optimal training range
  - > 1.3: Risk of overtraining, consider recovery
- **Weekly Hours**: Total training time in the past 7 days
- **Weekly Distance**: Total distance covered in the past 7 days
- **Intensity Distribution**: Breakdown of training by intensity zones

## Troubleshooting

### OAuth Callback Error

If you get an OAuth error:
1. Check that your callback domain in Strava settings is exactly: `localhost`
2. Make sure NEXTAUTH_URL in .env.local is: `http://localhost:3000`
3. Restart the dev server after changing .env.local

### Database Errors

If you get Prisma errors:
```bash
# Reset the database
rm prisma/dev.db
npm run db:push
```

### No Activities Showing

1. Make sure you have activities in Strava from the last 6 weeks
2. Check that the Strava OAuth scope includes `activity:read_all`
3. Try syncing activities again

### TypeScript Errors

If you see TypeScript errors:
```bash
# Regenerate Prisma client
npm run db:generate

# Clear Next.js cache
rm -rf .next
npm run dev
```

## Advanced Configuration

### Setting Your FTP

Currently, the app uses a default FTP of 200W. To set your actual FTP, you need to update it in the database:

1. Run Prisma Studio:
```bash
npm run db:studio
```

2. Navigate to the `User` table
3. Find your user record and update the `ftp` field
4. Save and refresh the app

In a future version, this will be configurable in the UI.

### Customizing Workout Recommendations

The recommendation algorithm is in `lib/services/recommendations.ts`. You can adjust:
- Workout type distribution
- Training load thresholds
- TSS calculations

## Next Steps

See [DEPLOYMENT.md](./DEPLOYMENT.md) for instructions on deploying to Vercel.
