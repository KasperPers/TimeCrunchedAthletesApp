import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkWorkouts() {
  console.log('Checking workouts in database...\n');

  const workouts = await prisma.zwiftWorkout.findMany({
    take: 5,
  });

  console.log(`Found ${workouts.length} workouts\n`);

  workouts.forEach((workout: any) => {
    console.log('---');
    console.log('Name:', workout.name);
    console.log('Type:', workout.type);
    console.log('Duration:', workout.duration);
    console.log('Has intervals?', workout.intervals ? 'YES' : 'NO');
    if (workout.intervals) {
      try {
        const parsed = JSON.parse(workout.intervals);
        console.log('Interval count:', parsed.length);
      } catch (e) {
        console.log('ERROR parsing intervals');
      }
    }
    console.log('Has buildInstructions?', workout.buildInstructions ? 'YES' : 'NO');
  });

  await prisma.$disconnect();
}

checkWorkouts().catch(console.error);
