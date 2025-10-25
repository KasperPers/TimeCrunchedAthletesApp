# Zwift Workout Import Guide

This guide explains how to populate the workout database with real Zwift workouts from [whatsonzwift.com](https://whatsonzwift.com).

## Overview

The app now uses real Zwift workout data instead of hardcoded workouts. This provides:
- **Real workout details** from the Zwift library
- **Direct links** to whatsonzwift.com workout pages
- **Up-to-date workout catalog** that you can refresh anytime
- **Fallback workouts** if the database is empty

## Quick Start

### 1. Install Dependencies

```bash
npm install cheerio axios
```

### 2. Update Database Schema

```bash
npm run db:push
```

This adds the `ZwiftWorkout` table to your database.

### 3. Run the Crawler

```bash
npx ts-node scripts/crawl-zwift-workouts.ts
```

This will:
- Fetch workout listings from whatsonzwift.com
- Extract details for each workout (name, duration, type, TSS, description)
- Save results to `data/zwift-workouts.json`
- Be respectful with a 500ms delay between requests

**Expected output:**
```
Starting whatsonzwift.com workout crawler...
Found 50 workouts. Fetching details...

[1/50] Fetching: https://whatsonzwift.com/workout/...
  ✓ FTP Builder (45min, Threshold)
[2/50] Fetching: https://whatsonzwift.com/workout/...
  ✓ Easy Spin (30min, Recovery)
...

✓ Successfully crawled 50 workouts
✓ Saved to: /path/to/data/zwift-workouts.json
```

### 4. Import to Database

Option A: Via API (recommended)
```bash
curl -X POST http://localhost:3000/api/workouts/import \
  -H "Content-Type: application/json" \
  -d '{}'
```

Option B: Via your browser
1. Start the dev server: `npm run dev`
2. Log in to the app
3. Open: http://localhost:3000/api/workouts/import
4. You'll see import status and instructions
5. Use a tool like Postman to POST to that endpoint

### 5. Verify Import

```bash
curl http://localhost:3000/api/workouts/import
```

You should see:
```json
{
  "fileExists": true,
  "workoutCount": 50,
  "databaseCount": 50,
  "instructions": { ... }
}
```

## How It Works

### Architecture

```
whatsonzwift.com
      ↓
[Crawler Script] → data/zwift-workouts.json
      ↓
[Import API] → Database (ZwiftWorkout table)
      ↓
[Workout Service] → Used by recommendation engine
```

### Database Schema

```prisma
model ZwiftWorkout {
  id          String   @id @default(cuid())
  name        String
  url         String   @unique
  duration    Int      // in minutes
  type        String   // Recovery, Endurance, Tempo, Threshold, VO2Max
  tss         Float?   // Training Stress Score
  description String?
  difficulty  String?  // Beginner, Intermediate, Advanced
  author      String?  // Workout author/plan
  tags        String?  // JSON array
}
```

### Workout Service

The `ZwiftWorkoutService` now:
1. Fetches workouts from database
2. Falls back to hardcoded workouts if DB is empty
3. Filters by type, duration, TSS
4. Finds best matches for user's available time

## Customizing the Crawler

If whatsonzwift.com changes its HTML structure, you'll need to update the selectors in `scripts/crawl-zwift-workouts.ts`:

```typescript
// Current selectors (may need adjustment)
const name = $('h1.workout-title, h1.entry-title').first().text().trim();
const description = $('p.workout-description').first().text().trim();
const durationText = $('span.duration').text();
```

**To find the right selectors:**
1. Open whatsonzwift.com/workouts in your browser
2. Right-click a workout and select "Inspect"
3. Find the HTML elements containing workout details
4. Update the selectors in the script

## API Endpoints

### GET /api/workouts

Fetch workouts with filters:

```bash
# Get all workouts
curl http://localhost:3000/api/workouts

# Filter by type
curl http://localhost:3000/api/workouts?type=Threshold

# Filter by duration
curl "http://localhost:3000/api/workouts?minDuration=30&maxDuration=60"

# Filter by TSS
curl "http://localhost:3000/api/workouts?minTSS=50&maxTSS=80"

# Combine filters
curl "http://localhost:3000/api/workouts?type=Tempo&minDuration=45&limit=10"
```

### POST /api/workouts/import

Import workouts from JSON file:

```bash
curl -X POST http://localhost:3000/api/workouts/import \
  -H "Content-Type: application/json"
```

Or provide workouts directly:

```bash
curl -X POST http://localhost:3000/api/workouts/import \
  -H "Content-Type: application/json" \
  -d '{
    "workouts": [
      {
        "name": "Custom Workout",
        "url": "https://example.com/workout",
        "duration": 60,
        "type": "Threshold",
        "tss": 75
      }
    ]
  }'
```

### GET /api/workouts/import

Check import status:

```bash
curl http://localhost:3000/api/workouts/import
```

## Troubleshooting

### Problem: Crawler finds 0 workouts

**Solution:** The HTML structure of whatsonzwift.com may have changed.

1. Browse to https://whatsonzwift.com/workouts/
2. Inspect the page HTML
3. Update selectors in `scripts/crawl-zwift-workouts.ts`
4. Look for these elements:
   - Workout listing links
   - Workout title
   - Duration
   - Type/category
   - TSS/difficulty

### Problem: Import fails with database error

**Solution:** Make sure you've run the database migration:

```bash
npm run db:push
```

### Problem: Workouts still showing old data

**Solution:** The service caches fallback workouts. Clear and reimport:

```bash
# Delete all workouts
npx prisma studio
# Go to ZwiftWorkout table and delete all rows

# Re-import
curl -X POST http://localhost:3000/api/workouts/import
```

### Problem: Crawler is too slow

**Solution:** Adjust the delay in `scripts/crawl-zwift-workouts.ts`:

```typescript
// Reduce from 500ms to 250ms (but be respectful!)
await new Promise(resolve => setTimeout(resolve, 250));
```

Or limit the number of workouts:

```typescript
// Change from 100 to 30
for (let i = 0; i < Math.min(workoutUrls.length, 30); i++) {
```

## Updating Workouts

To refresh your workout database with latest data:

```bash
# 1. Run crawler again
npx ts-node scripts/crawl-zwift-workouts.ts

# 2. Re-import (upserts, so won't create duplicates)
curl -X POST http://localhost:3000/api/workouts/import
```

The import uses `upsert` based on URL, so:
- Existing workouts are updated
- New workouts are created
- No duplicates

## Production Deployment

For production (e.g., Vercel):

1. **Pre-populate workouts** before deployment:
   ```bash
   # Run locally
   npx ts-node scripts/crawl-zwift-workouts.ts

   # Commit the JSON file
   git add data/zwift-workouts.json
   git commit -m "Add Zwift workout data"
   ```

2. **Auto-import on first deployment**:

   Add to your deployment script or create a manual import step:
   ```bash
   curl -X POST https://your-domain.vercel.app/api/workouts/import
   ```

3. **Set up periodic updates** (optional):

   Use a cron job or GitHub Actions to refresh weekly:
   ```yaml
   # .github/workflows/update-workouts.yml
   name: Update Zwift Workouts
   on:
     schedule:
       - cron: '0 0 * * 0'  # Every Sunday
   jobs:
     update:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - run: npm install
         - run: npx ts-node scripts/crawl-zwift-workouts.ts
         - run: curl -X POST https://your-domain.vercel.app/api/workouts/import
   ```

## Fallback Workouts

If the database is empty, the app uses hardcoded fallback workouts from `lib/services/zwift-workouts.ts`.

These provide:
- 20+ curated workouts across all types
- Reasonable TSS estimates
- Basic descriptions
- Generic whatsonzwift.com URLs

**Recommendation:** Always import real workouts for the best experience!

## Summary

✅ **Do this once:**
1. Install dependencies: `npm install cheerio axios`
2. Update database: `npm run db:push`
3. Run crawler: `npx ts-node scripts/crawl-zwift-workouts.ts`
4. Import: `curl -X POST http://localhost:3000/api/workouts/import`

✅ **Do this periodically** (optional):
1. Re-run crawler to get latest workouts
2. Re-import to update database

✅ **In production:**
1. Commit `data/zwift-workouts.json` to git
2. Run import API after deployment
3. Set up automated updates if desired

---

**Questions?** Check the [main README](./README.md) or open an issue!
