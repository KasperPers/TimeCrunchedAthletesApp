# Database Update Required

⚠️ **Action Required**: Your database schema is out of sync with the code.

## Quick Fix

Run this command to update your database:

```bash
npm run db:push
```

## What This Does

The recent workout visualization update added two new fields to the `ZwiftWorkout` table:
- `intervals` - Stores detailed interval structures
- `buildInstructions` - Stores manual Zwift build instructions

Without running the migration, the app can't properly access the database.

## Steps to Resolve

1. **Stop your dev server** (Ctrl+C if running)

2. **Update the database:**
   ```bash
   npm run db:push
   ```

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

4. **Test the activities sync** - It should work now!

## If You Still Have Issues

If `npm run db:push` fails with a Prisma engine error, use:

```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npm run db:push
```

## After the Migration

Once the database is updated, you can:
1. Sync your activities ✅
2. Generate workout data: `npx ts-node scripts/manual-workout-import.ts`
3. Import workouts: `curl -X POST http://localhost:3000/api/workouts/import`
4. See workout visualizations in your recommendations!

---

**Note**: This is a one-time migration. The schema is now stable and includes all the fields needed for workout visualizations.
