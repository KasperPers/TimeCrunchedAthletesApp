import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get weekly plans for next 4 weeks
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get start of current week (Sunday)
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);

    // Get plans for next 4 weeks
    const plans = await prisma.weeklyPlan.findMany({
      where: {
        userId: session.user.id,
        weekStartDate: {
          gte: currentWeekStart,
        },
      },
      orderBy: {
        weekStartDate: 'asc',
      },
      take: 4,
    });

    // Convert dates to ISO strings and parse session durations
    const serializedPlans = plans.map((plan) => ({
      id: plan.id,
      weekStartDate: plan.weekStartDate.toISOString(),
      numSessions: plan.numSessions,
      sessionDurations: JSON.parse(plan.sessionDurations),
    }));

    return NextResponse.json({ plans: serializedPlans });
  } catch (error) {
    console.error('Error fetching weekly plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weekly plans' },
      { status: 500 }
    );
  }
}

// Save or update a weekly plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { weekStartDate, numSessions, sessionDurations } = body;

    if (!weekStartDate || !numSessions || !sessionDurations) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const weekStart = new Date(weekStartDate);

    const plan = await prisma.weeklyPlan.upsert({
      where: {
        userId_weekStartDate: {
          userId: session.user.id,
          weekStartDate: weekStart,
        },
      },
      update: {
        numSessions,
        sessionDurations: JSON.stringify(sessionDurations),
      },
      create: {
        userId: session.user.id,
        weekStartDate: weekStart,
        numSessions,
        sessionDurations: JSON.stringify(sessionDurations),
      },
    });

    return NextResponse.json({
      success: true,
      plan: {
        id: plan.id,
        weekStartDate: plan.weekStartDate.toISOString(),
        numSessions: plan.numSessions,
        sessionDurations: JSON.parse(plan.sessionDurations),
      },
    });
  } catch (error) {
    console.error('Error saving weekly plan:', error);
    return NextResponse.json(
      { error: 'Failed to save weekly plan' },
      { status: 500 }
    );
  }
}
