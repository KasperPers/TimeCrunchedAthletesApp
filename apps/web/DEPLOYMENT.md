# Deployment Guide - Vercel

This guide will walk you through deploying your Time Crunched Athletes app to Vercel.

## Prerequisites

- A Vercel account (sign up at https://vercel.com)
- Your Strava API credentials
- Git repository with your code

## Step 1: Prepare for Deployment

### Update Environment Variables

You'll need to set these environment variables in Vercel:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="your-production-secret-here"
STRAVA_CLIENT_ID="your_strava_client_id"
STRAVA_CLIENT_SECRET="your_strava_client_secret"
```

### Update Strava OAuth Settings

1. Go to https://www.strava.com/settings/api
2. Update your application settings:
   - **Authorization Callback Domain**: Add `your-app-name.vercel.app`
   - **Website**: Add `https://your-app-name.vercel.app`

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Vercel will auto-detect it's a Next.js project
4. Configure environment variables:
   - Click "Environment Variables"
   - Add all variables from above
5. Click "Deploy"

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - What's your project name? time-crunched-athletes
# - In which directory is your code? ./
# - Want to override settings? N

# Add environment variables
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
vercel env add STRAVA_CLIENT_ID
vercel env add STRAVA_CLIENT_SECRET
vercel env add DATABASE_URL

# Deploy to production
vercel --prod
```

## Step 3: Configure Database

⚠️ **Important Note**: SQLite (file-based database) has limitations on Vercel:
- The database is read-only in production
- Data doesn't persist between deployments
- Not recommended for production use

### For Production: Upgrade to PostgreSQL

For a production deployment, you should use PostgreSQL:

1. **Get a PostgreSQL Database:**
   - Vercel Postgres (easiest): https://vercel.com/docs/storage/vercel-postgres
   - Supabase (free tier): https://supabase.com
   - Neon (free tier): https://neon.tech
   - Railway: https://railway.app

2. **Update Prisma Schema:**

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

3. **Update DATABASE_URL:**

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
```

4. **Deploy Database Schema:**

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### Quick Start with Vercel Postgres

```bash
# Install Vercel Postgres
vercel env add DATABASE_URL

# Follow prompts to create database
# Vercel will automatically set DATABASE_URL

# Push database schema
npx prisma db push
```

## Step 4: Verify Deployment

1. Visit your deployed app: `https://your-app-name.vercel.app`
2. Test the Strava OAuth flow
3. Sync activities and generate recommendations

## Step 5: Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update Strava OAuth callback domain to match

## Troubleshooting

### OAuth Redirect Issues

**Error**: "Redirect URI mismatch"

**Solution**:
- Check Strava app settings callback domain matches your Vercel domain
- Ensure NEXTAUTH_URL is set correctly (with https://)
- Try using the exact URL format: `https://your-app.vercel.app`

### Database Connection Errors

**Error**: "Can't reach database server"

**Solution**:
- Verify DATABASE_URL is set correctly
- For PostgreSQL, check connection string format
- Ensure database allows connections from Vercel's IP ranges

### Build Failures

**Error**: "Prisma Client not found"

**Solution**:
Add a `postinstall` script to `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Environment Variables Not Working

**Error**: Variables are undefined

**Solution**:
- Verify variables are set in Vercel dashboard (Settings > Environment Variables)
- Make sure to redeploy after adding variables
- Check variable names match exactly (case-sensitive)

## Production Checklist

Before going live:

- [ ] Switch to PostgreSQL or another production database
- [ ] Set a strong NEXTAUTH_SECRET (minimum 32 characters)
- [ ] Update Strava OAuth callback domains
- [ ] Test OAuth flow end-to-end
- [ ] Test activity sync with real Strava data
- [ ] Verify workout recommendations are generated
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure custom domain (optional)
- [ ] Add analytics (optional)

## Monitoring

### View Logs

```bash
# Real-time logs
vercel logs --follow

# Recent logs
vercel logs
```

### Vercel Analytics

Enable analytics in your project settings for insights on:
- Page views
- Performance metrics
- User behavior

## Cost Considerations

### Vercel Free Tier Includes:
- 100GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Serverless function execution

### Vercel Postgres Free Tier:
- 256 MB storage
- 60 hours compute time/month

For a proof of concept, the free tier should be sufficient.

## Updates and Redeployment

```bash
# Push to git main branch for automatic deployment
git push origin main

# Or manually redeploy
vercel --prod
```

## Alternative Deployment Options

### Railway
- Full-stack platform with PostgreSQL included
- Very easy setup
- Free trial available
- Visit: https://railway.app

### Render
- Free tier for web services
- Supports PostgreSQL
- Visit: https://render.com

### Fly.io
- Edge deployment
- Great for global users
- Visit: https://fly.io

## Need Help?

- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://www.prisma.io/docs
- Strava API: https://developers.strava.com
