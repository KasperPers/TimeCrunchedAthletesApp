import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

interface ImportWorkout {
  name: string;
  url: string;
  duration: number;
  type: string;
  tss?: number;
  description?: string;
  difficulty?: string;
  author?: string;
  tags?: string[];
}

/**
 * POST /api/workouts/import
 * Import workouts from JSON file or request body
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication (optional - you might want this to be admin-only)
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get workouts from request body or file
    let workouts: ImportWorkout[] = [];
    const body = await request.json().catch(() => null);

    if (body?.workouts) {
      // Workouts provided in request
      workouts = body.workouts;
    } else {
      // Try to read from data/zwift-workouts.json
      const dataPath = path.join(process.cwd(), 'data', 'zwift-workouts.json');

      if (!fs.existsSync(dataPath)) {
        return NextResponse.json(
          {
            error: 'No workout data found',
            message: 'Run the crawler first: npx ts-node scripts/crawl-zwift-workouts.ts',
          },
          { status: 400 }
        );
      }

      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      workouts = JSON.parse(fileContent);
    }

    if (!Array.isArray(workouts) || workouts.length === 0) {
      return NextResponse.json(
        { error: 'Invalid workout data format' },
        { status: 400 }
      );
    }

    console.log(`Importing ${workouts.length} workouts...`);

    // Import workouts to database (upsert to avoid duplicates)
    const results = {
      created: 0,
      updated: 0,
      failed: 0,
    };

    for (const workout of workouts) {
      try {
        await prisma.zwiftWorkout.upsert({
          where: { url: workout.url },
          update: {
            name: workout.name,
            duration: workout.duration,
            type: workout.type,
            tss: workout.tss || null,
            description: workout.description || null,
            difficulty: workout.difficulty || null,
            author: workout.author || null,
            tags: workout.tags ? JSON.stringify(workout.tags) : null,
            intervals: workout.intervals ? JSON.stringify(workout.intervals) : null,
            buildInstructions: workout.buildInstructions || null,
          },
          create: {
            name: workout.name,
            url: workout.url,
            duration: workout.duration,
            type: workout.type,
            tss: workout.tss || null,
            description: workout.description || null,
            difficulty: workout.difficulty || null,
            author: workout.author || null,
            tags: workout.tags ? JSON.stringify(workout.tags) : null,
            intervals: workout.intervals ? JSON.stringify(workout.intervals) : null,
            buildInstructions: workout.buildInstructions || null,
          },
        });

        results.created++;
      } catch (error) {
        console.error(`Failed to import workout: ${workout.name}`, error);
        results.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${results.created} workouts`,
      results,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import workouts', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workouts/import
 * Get import status and instructions
 */
export async function GET() {
  const dataPath = path.join(process.cwd(), 'data', 'zwift-workouts.json');
  const fileExists = fs.existsSync(dataPath);

  let workoutCount = 0;
  if (fileExists) {
    try {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      const workouts = JSON.parse(fileContent);
      workoutCount = Array.isArray(workouts) ? workouts.length : 0;
    } catch (error) {
      console.error('Error reading workout file:', error);
    }
  }

  // Get database count
  const dbCount = await prisma.zwiftWorkout.count();

  return NextResponse.json({
    fileExists,
    workoutCount,
    databaseCount: dbCount,
    instructions: {
      step1: 'Run crawler: npx ts-node scripts/crawl-zwift-workouts.ts',
      step2: 'Import to DB: POST /api/workouts/import',
      step3: 'Verify: Check this endpoint to see counts',
    },
  });
}
