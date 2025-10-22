# Database Migration Required

After pulling these changes, you need to update your database schema:

```bash
npm run db:push
```

This adds the `ZwiftWorkout` table to store real workout data from whatsonzwift.com.

## What's New

- ✅ Zwift workout crawler script
- ✅ Database table for real workout data
- ✅ API endpoints for importing and querying workouts
- ✅ Updated recommendation engine to use database workouts
- ✅ Fallback to hardcoded workouts if database is empty

## Next Steps

1. **Update database:**
   ```bash
   npm run db:push
   ```

2. **Install crawler dependencies:**
   ```bash
   npm install cheerio axios
   ```

3. **Follow the workout import guide:**
   See [WORKOUT_IMPORT.md](./WORKOUT_IMPORT.md) for complete instructions

## Quick Test

After migrating, verify the setup:

```bash
# Check import status
curl http://localhost:3000/api/workouts/import

# Should show:
# {
#   "fileExists": false,
#   "workoutCount": 0,
#   "databaseCount": 0,
#   "instructions": { ... }
# }
```

The app will use fallback workouts until you run the crawler and import real data.
