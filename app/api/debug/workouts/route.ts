import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const workouts = await prisma.zwiftWorkout.findMany({
      take: 5,
    });

    const debug = workouts.map((workout) => ({
      name: workout.name,
      type: workout.type,
      duration: workout.duration,
      hasIntervals: !!workout.intervals,
      intervalsLength: workout.intervals?.length || 0,
      intervalsParsed: workout.intervals ? JSON.parse(workout.intervals).length : 0,
      hasBuildInstructions: !!workout.buildInstructions,
    }));

    return NextResponse.json({
      totalWorkouts: workouts.length,
      debug
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
