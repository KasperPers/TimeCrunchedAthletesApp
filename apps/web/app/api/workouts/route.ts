import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/workouts
 * Fetch workouts with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const type = searchParams.get('type');
    const minDuration = searchParams.get('minDuration')
      ? parseInt(searchParams.get('minDuration')!)
      : undefined;
    const maxDuration = searchParams.get('maxDuration')
      ? parseInt(searchParams.get('maxDuration')!)
      : undefined;
    const minTSS = searchParams.get('minTSS')
      ? parseFloat(searchParams.get('minTSS')!)
      : undefined;
    const maxTSS = searchParams.get('maxTSS')
      ? parseFloat(searchParams.get('maxTSS')!)
      : undefined;
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : undefined;

    // Build where clause
    const where: any = {};

    if (type) {
      where.type = {
        equals: type,
        mode: 'insensitive',
      };
    }

    if (minDuration || maxDuration) {
      where.duration = {};
      if (minDuration) where.duration.gte = minDuration;
      if (maxDuration) where.duration.lte = maxDuration;
    }

    if (minTSS || maxTSS) {
      where.tss = {};
      if (minTSS) where.tss.gte = minTSS;
      if (maxTSS) where.tss.lte = maxTSS;
    }

    // Fetch workouts
    const workouts = await prisma.zwiftWorkout.findMany({
      where,
      take: limit,
      orderBy: [
        { type: 'asc' },
        { duration: 'asc' },
      ],
    });

    // Parse JSON fields
    const parsedWorkouts = workouts.map((w) => ({
      ...w,
      tags: w.tags ? JSON.parse(w.tags) : [],
      intervals: w.intervals ? JSON.parse(w.intervals) : undefined,
    }));

    return NextResponse.json({
      workouts: parsedWorkouts,
      count: parsedWorkouts.length,
    });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workouts' },
      { status: 500 }
    );
  }
}
