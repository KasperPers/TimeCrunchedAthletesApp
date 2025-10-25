/**
 * Manual Workout Import
 *
 * Quick alternative to crawling - manually curated Zwift workouts with detailed interval structures
 * Based on popular workouts from whatsonzwift.com
 *
 * Usage: npx ts-node scripts/manual-workout-import.ts
 */

import fs from 'fs';
import path from 'path';

// Curated list of popular Zwift workouts with detailed interval structures
const manualWorkouts = [
  // Recovery Workouts
  {
    name: 'Recovery Spin',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 30,
    type: 'Recovery',
    tss: 20,
    description: 'Easy recovery ride. Keep power low and cadence high. Active recovery to promote adaptation.',
    difficulty: 'Beginner',
    author: 'Zwift',
    intervals: [
      { type: 'warmup', duration: 300, powerLow: 40, powerHigh: 50, label: 'Easy Warmup' },
      { type: 'steady', duration: 1200, powerLow: 50, powerHigh: 55, label: 'Recovery Zone' },
      { type: 'cooldown', duration: 300, powerLow: 40, powerHigh: 50, label: 'Easy Cooldown' },
    ],
    buildInstructions: '1. Warmup: 5min @ 40-50% FTP\n2. Main: 20min @ 50-55% FTP\n3. Cooldown: 5min @ 40-50% FTP',
  },
  {
    name: 'Easy Does It',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 45,
    type: 'Recovery',
    tss: 30,
    description: 'Extended recovery session. Perfect for the day after a hard workout.',
    difficulty: 'Beginner',
    author: 'Zwift',
    intervals: [
      { type: 'warmup', duration: 300, powerLow: 40, powerHigh: 50, label: 'Gentle Start' },
      { type: 'steady', duration: 2100, powerLow: 50, powerHigh: 60, label: 'Easy Zone 1-2' },
      { type: 'cooldown', duration: 300, powerLow: 40, powerHigh: 50, label: 'Wind Down' },
    ],
    buildInstructions: '1. Warmup: 5min @ 40-50% FTP\n2. Main: 35min @ 50-60% FTP\n3. Cooldown: 5min @ 40-50% FTP',
  },

  // Endurance Workouts
  {
    name: 'Foundation',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 60,
    type: 'Endurance',
    tss: 50,
    description: 'Aerobic base building. Steady endurance pace in Zone 2.',
    difficulty: 'Beginner',
    author: 'Zwift',
    intervals: [
      { type: 'warmup', duration: 600, powerLow: 50, powerHigh: 65, label: 'Gradual Warmup' },
      { type: 'steady', duration: 2700, powerLow: 65, powerHigh: 75, label: 'Zone 2 Endurance' },
      { type: 'cooldown', duration: 300, powerLow: 50, powerHigh: 60, label: 'Easy Spin' },
    ],
    buildInstructions: '1. Warmup: 10min @ 50-65% FTP\n2. Main: 45min @ 65-75% FTP (Zone 2)\n3. Cooldown: 5min @ 50-60% FTP',
  },
  {
    name: 'Long Steady Distance',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 90,
    type: 'Endurance',
    tss: 75,
    description: 'Extended endurance ride. Building aerobic capacity and mental toughness.',
    difficulty: 'Intermediate',
    author: 'Zwift',
    intervals: [
      { type: 'warmup', duration: 600, powerLow: 50, powerHigh: 65, label: 'Easy Start' },
      { type: 'steady', duration: 4800, powerLow: 65, powerHigh: 75, label: 'Steady Endurance' },
      { type: 'cooldown', duration: 300, powerLow: 50, powerHigh: 60, label: 'Easy Finish' },
    ],
    buildInstructions: '1. Warmup: 10min @ 50-65% FTP\n2. Main: 75min @ 65-75% FTP (Zone 2)\n3. Cooldown: 5min @ 50-60% FTP',
  },

  // Tempo/Sweet Spot Workouts
  {
    name: 'Sweet Spot Session',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 60,
    type: 'Tempo',
    tss: 70,
    description: '3x10 minutes at 88-93% FTP. Maximum fitness gains in minimum time.',
    difficulty: 'Intermediate',
    author: 'Zwift',
    intervals: [
      { type: 'warmup', duration: 600, powerLow: 50, powerHigh: 70, label: 'Gradual Warmup' },
      { type: 'interval', duration: 600, powerLow: 88, powerHigh: 93, label: 'Sweet Spot #1' },
      { type: 'rest', duration: 300, powerLow: 50, powerHigh: 60, label: 'Recovery' },
      { type: 'interval', duration: 600, powerLow: 88, powerHigh: 93, label: 'Sweet Spot #2' },
      { type: 'rest', duration: 300, powerLow: 50, powerHigh: 60, label: 'Recovery' },
      { type: 'interval', duration: 600, powerLow: 88, powerHigh: 93, label: 'Sweet Spot #3' },
      { type: 'cooldown', duration: 600, powerLow: 45, powerHigh: 55, label: 'Easy Spin' },
    ],
    buildInstructions: '1. Warmup: 10min @ 50-70% FTP\n2. 3x10min @ 88-93% FTP with 5min recovery @ 50-60% FTP\n3. Cooldown: 10min @ 45-55% FTP',
  },
  {
    name: 'Tempo Intervals',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 45,
    type: 'Tempo',
    tss: 60,
    description: '2x15 minutes at 85-90% FTP. Great for time-crunched athletes.',
    difficulty: 'Intermediate',
    author: 'Zwift',
    intervals: [
      { type: 'warmup', duration: 600, powerLow: 50, powerHigh: 70, label: 'Warmup' },
      { type: 'interval', duration: 900, powerLow: 85, powerHigh: 90, label: 'Tempo #1' },
      { type: 'rest', duration: 300, powerLow: 50, powerHigh: 60, label: 'Recovery' },
      { type: 'interval', duration: 900, powerLow: 85, powerHigh: 90, label: 'Tempo #2' },
      { type: 'cooldown', duration: 300, powerLow: 45, powerHigh: 55, label: 'Cooldown' },
    ],
    buildInstructions: '1. Warmup: 10min @ 50-70% FTP\n2. 2x15min @ 85-90% FTP with 5min recovery\n3. Cooldown: 5min @ 45-55% FTP',
  },

  // Threshold Workouts
  {
    name: 'FTP Builder',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 60,
    type: 'Threshold',
    tss: 75,
    description: '2x20 minutes at FTP. Classic threshold workout.',
    difficulty: 'Advanced',
    author: 'Zwift',
    intervals: [
      { type: 'warmup', duration: 600, powerLow: 50, powerHigh: 75, label: 'Progressive Warmup' },
      { type: 'interval', duration: 1200, powerLow: 95, powerHigh: 100, label: 'FTP Interval #1' },
      { type: 'rest', duration: 600, powerLow: 50, powerHigh: 60, label: 'Recovery' },
      { type: 'interval', duration: 1200, powerLow: 95, powerHigh: 100, label: 'FTP Interval #2' },
      { type: 'cooldown', duration: 600, powerLow: 45, powerHigh: 55, label: 'Easy Cooldown' },
    ],
    buildInstructions: '1. Warmup: 10min @ 50-75% FTP\n2. 2x20min @ 95-100% FTP (at threshold) with 10min recovery\n3. Cooldown: 10min @ 45-55% FTP',
  },
  {
    name: 'FTP Booster',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 45,
    type: 'Threshold',
    tss: 65,
    description: '3x10 minutes at 95-100% FTP. Hard but effective.',
    difficulty: 'Advanced',
    author: 'Zwift',
    intervals: [
      { type: 'warmup', duration: 600, powerLow: 50, powerHigh: 75, label: 'Warmup' },
      { type: 'interval', duration: 600, powerLow: 95, powerHigh: 100, label: 'Threshold #1' },
      { type: 'rest', duration: 240, powerLow: 50, powerHigh: 60, label: 'Rest' },
      { type: 'interval', duration: 600, powerLow: 95, powerHigh: 100, label: 'Threshold #2' },
      { type: 'rest', duration: 240, powerLow: 50, powerHigh: 60, label: 'Rest' },
      { type: 'interval', duration: 600, powerLow: 95, powerHigh: 100, label: 'Threshold #3' },
      { type: 'cooldown', duration: 420, powerLow: 45, powerHigh: 55, label: 'Cooldown' },
    ],
    buildInstructions: '1. Warmup: 10min @ 50-75% FTP\n2. 3x10min @ 95-100% FTP with 4min recovery\n3. Cooldown: 7min @ 45-55% FTP',
  },
  {
    name: 'Over-Unders',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 60,
    type: 'Threshold',
    tss: 75,
    description: 'Intervals alternating between 95% and 105% FTP. Teaches pacing and mental toughness.',
    difficulty: 'Advanced',
    author: 'Zwift',
    intervals: [
      { type: 'warmup', duration: 600, powerLow: 50, powerHigh: 75, label: 'Warmup' },
      { type: 'interval', duration: 180, powerLow: 95, powerHigh: 95, label: 'Under #1' },
      { type: 'interval', duration: 120, powerLow: 105, powerHigh: 105, label: 'Over #1' },
      { type: 'interval', duration: 180, powerLow: 95, powerHigh: 95, label: 'Under #2' },
      { type: 'interval', duration: 120, powerLow: 105, powerHigh: 105, label: 'Over #2' },
      { type: 'rest', duration: 300, powerLow: 50, powerHigh: 60, label: 'Recovery' },
      { type: 'interval', duration: 180, powerLow: 95, powerHigh: 95, label: 'Under #3' },
      { type: 'interval', duration: 120, powerLow: 105, powerHigh: 105, label: 'Over #3' },
      { type: 'interval', duration: 180, powerLow: 95, powerHigh: 95, label: 'Under #4' },
      { type: 'interval', duration: 120, powerLow: 105, powerHigh: 105, label: 'Over #4' },
      { type: 'rest', duration: 300, powerLow: 50, powerHigh: 60, label: 'Recovery' },
      { type: 'interval', duration: 180, powerLow: 95, powerHigh: 95, label: 'Under #5' },
      { type: 'interval', duration: 120, powerLow: 105, powerHigh: 105, label: 'Over #5' },
      { type: 'interval', duration: 180, powerLow: 95, powerHigh: 95, label: 'Under #6' },
      { type: 'interval', duration: 120, powerLow: 105, powerHigh: 105, label: 'Over #6' },
      { type: 'cooldown', duration: 600, powerLow: 45, powerHigh: 55, label: 'Cooldown' },
    ],
    buildInstructions: '1. Warmup: 10min @ 50-75% FTP\n2. 3 sets of (3min @ 95% FTP + 2min @ 105% FTP) x 2, with 5min recovery between sets\n3. Cooldown: 10min @ 45-55% FTP',
  },

  // VO2Max Workouts
  {
    name: 'VO2 Max Intervals',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 45,
    type: 'VO2Max',
    tss: 65,
    description: '5x3 minutes at 110-120% FTP. Improves maximum aerobic capacity.',
    difficulty: 'Advanced',
    author: 'Zwift',
    intervals: [
      { type: 'warmup', duration: 600, powerLow: 50, powerHigh: 80, label: 'Progressive Warmup' },
      { type: 'interval', duration: 180, powerLow: 110, powerHigh: 120, label: 'VO2 #1' },
      { type: 'rest', duration: 180, powerLow: 45, powerHigh: 55, label: 'Recovery' },
      { type: 'interval', duration: 180, powerLow: 110, powerHigh: 120, label: 'VO2 #2' },
      { type: 'rest', duration: 180, powerLow: 45, powerHigh: 55, label: 'Recovery' },
      { type: 'interval', duration: 180, powerLow: 110, powerHigh: 120, label: 'VO2 #3' },
      { type: 'rest', duration: 180, powerLow: 45, powerHigh: 55, label: 'Recovery' },
      { type: 'interval', duration: 180, powerLow: 110, powerHigh: 120, label: 'VO2 #4' },
      { type: 'rest', duration: 180, powerLow: 45, powerHigh: 55, label: 'Recovery' },
      { type: 'interval', duration: 180, powerLow: 110, powerHigh: 120, label: 'VO2 #5' },
      { type: 'cooldown', duration: 600, powerLow: 45, powerHigh: 55, label: 'Easy Spin' },
    ],
    buildInstructions: '1. Warmup: 10min @ 50-80% FTP\n2. 5x3min @ 110-120% FTP with 3min recovery @ 45-55% FTP\n3. Cooldown: 10min @ 45-55% FTP',
  },
  {
    name: 'Short and Sweet',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 30,
    type: 'VO2Max',
    tss: 50,
    description: '6x2 minutes at 115% FTP. High-intensity, time-efficient.',
    difficulty: 'Advanced',
    author: 'Zwift',
    intervals: [
      { type: 'warmup', duration: 420, powerLow: 50, powerHigh: 80, label: 'Warmup' },
      { type: 'interval', duration: 120, powerLow: 115, powerHigh: 120, label: 'VO2 #1' },
      { type: 'rest', duration: 120, powerLow: 45, powerHigh: 55, label: 'Rest' },
      { type: 'interval', duration: 120, powerLow: 115, powerHigh: 120, label: 'VO2 #2' },
      { type: 'rest', duration: 120, powerLow: 45, powerHigh: 55, label: 'Rest' },
      { type: 'interval', duration: 120, powerLow: 115, powerHigh: 120, label: 'VO2 #3' },
      { type: 'rest', duration: 120, powerLow: 45, powerHigh: 55, label: 'Rest' },
      { type: 'interval', duration: 120, powerLow: 115, powerHigh: 120, label: 'VO2 #4' },
      { type: 'rest', duration: 120, powerLow: 45, powerHigh: 55, label: 'Rest' },
      { type: 'interval', duration: 120, powerLow: 115, powerHigh: 120, label: 'VO2 #5' },
      { type: 'rest', duration: 120, powerLow: 45, powerHigh: 55, label: 'Rest' },
      { type: 'interval', duration: 120, powerLow: 115, powerHigh: 120, label: 'VO2 #6' },
      { type: 'cooldown', duration: 240, powerLow: 45, powerHigh: 55, label: 'Cooldown' },
    ],
    buildInstructions: '1. Warmup: 7min @ 50-80% FTP\n2. 6x2min @ 115-120% FTP with 2min recovery\n3. Cooldown: 4min @ 45-55% FTP',
  },

  // Mixed Workouts
  {
    name: 'Pyramid Power',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 60,
    type: 'Mixed',
    tss: 72,
    description: 'Progressive intervals building from tempo to VO2max. 1-2-3-4-3-2-1 minute efforts.',
    difficulty: 'Intermediate',
    author: 'Zwift',
    intervals: [
      { type: 'warmup', duration: 600, powerLow: 50, powerHigh: 75, label: 'Warmup' },
      { type: 'interval', duration: 60, powerLow: 85, powerHigh: 90, label: '1min Tempo' },
      { type: 'rest', duration: 60, powerLow: 50, powerHigh: 60, label: 'Rest' },
      { type: 'interval', duration: 120, powerLow: 90, powerHigh: 95, label: '2min SS' },
      { type: 'rest', duration: 120, powerLow: 50, powerHigh: 60, label: 'Rest' },
      { type: 'interval', duration: 180, powerLow: 95, powerHigh: 100, label: '3min FTP' },
      { type: 'rest', duration: 180, powerLow: 50, powerHigh: 60, label: 'Rest' },
      { type: 'interval', duration: 240, powerLow: 100, powerHigh: 110, label: '4min Hard' },
      { type: 'rest', duration: 240, powerLow: 50, powerHigh: 60, label: 'Rest' },
      { type: 'interval', duration: 180, powerLow: 95, powerHigh: 100, label: '3min FTP' },
      { type: 'rest', duration: 180, powerLow: 50, powerHigh: 60, label: 'Rest' },
      { type: 'interval', duration: 120, powerLow: 90, powerHigh: 95, label: '2min SS' },
      { type: 'rest', duration: 120, powerLow: 50, powerHigh: 60, label: 'Rest' },
      { type: 'interval', duration: 60, powerLow: 85, powerHigh: 90, label: '1min Tempo' },
      { type: 'cooldown', duration: 540, powerLow: 45, powerHigh: 55, label: 'Cooldown' },
    ],
    buildInstructions: '1. Warmup: 10min @ 50-75% FTP\n2. Pyramid: 1-2-3-4-3-2-1 minutes (85-110% FTP) with equal recovery\n3. Cooldown: 9min @ 45-55% FTP',
  },

  // Additional shorter workouts for variety
  {
    name: 'Active Recovery',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 30,
    type: 'Recovery',
    tss: 15,
    description: 'Very easy spinning. Promotes blood flow and recovery.',
    difficulty: 'Beginner',
    author: 'Zwift',
    intervals: [
      { type: 'steady', duration: 1800, powerLow: 45, powerHigh: 55, label: 'Easy Spin' },
    ],
    buildInstructions: '30min @ 45-55% FTP - very easy effort',
  },
  {
    name: 'Base Miles',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 120,
    type: 'Endurance',
    tss: 100,
    description: 'Long endurance ride. Perfect for weekends.',
    difficulty: 'Intermediate',
    author: 'Zwift',
    intervals: [
      { type: 'warmup', duration: 600, powerLow: 50, powerHigh: 65, label: 'Ease In' },
      { type: 'steady', duration: 6300, powerLow: 65, powerHigh: 75, label: 'Zone 2 Steady' },
      { type: 'cooldown', duration: 300, powerLow: 50, powerHigh: 60, label: 'Easy End' },
    ],
    buildInstructions: '1. Warmup: 10min @ 50-65% FTP\n2. Main: 105min @ 65-75% FTP\n3. Cooldown: 5min @ 50-60% FTP',
  },
  {
    name: 'Quick Threshold Hit',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 30,
    type: 'Threshold',
    tss: 45,
    description: '2x10 minutes at threshold. Short but effective.',
    difficulty: 'Advanced',
    author: 'Zwift',
    intervals: [
      { type: 'warmup', duration: 300, powerLow: 50, powerHigh: 75, label: 'Quick Warmup' },
      { type: 'interval', duration: 600, powerLow: 95, powerHigh: 100, label: 'FTP #1' },
      { type: 'rest', duration: 240, powerLow: 50, powerHigh: 60, label: 'Recovery' },
      { type: 'interval', duration: 600, powerLow: 95, powerHigh: 100, label: 'FTP #2' },
      { type: 'cooldown', duration: 60, powerLow: 45, powerHigh: 55, label: 'Cooldown' },
    ],
    buildInstructions: '1. Warmup: 5min @ 50-75% FTP\n2. 2x10min @ 95-100% FTP with 4min recovery\n3. Cooldown: 1min @ 45-55% FTP',
  },
  {
    name: 'Tabata',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 30,
    type: 'VO2Max',
    tss: 45,
    description: '8x20 seconds all-out with 10 seconds rest. Classic Tabata protocol.',
    difficulty: 'Advanced',
    author: 'Zwift',
    intervals: [
      { type: 'warmup', duration: 600, powerLow: 50, powerHigh: 80, label: 'Warmup' },
      { type: 'interval', duration: 20, powerLow: 150, powerHigh: 200, label: 'Sprint #1' },
      { type: 'rest', duration: 10, powerLow: 40, powerHigh: 50, label: 'Rest' },
      { type: 'interval', duration: 20, powerLow: 150, powerHigh: 200, label: 'Sprint #2' },
      { type: 'rest', duration: 10, powerLow: 40, powerHigh: 50, label: 'Rest' },
      { type: 'interval', duration: 20, powerLow: 150, powerHigh: 200, label: 'Sprint #3' },
      { type: 'rest', duration: 10, powerLow: 40, powerHigh: 50, label: 'Rest' },
      { type: 'interval', duration: 20, powerLow: 150, powerHigh: 200, label: 'Sprint #4' },
      { type: 'rest', duration: 10, powerLow: 40, powerHigh: 50, label: 'Rest' },
      { type: 'interval', duration: 20, powerLow: 150, powerHigh: 200, label: 'Sprint #5' },
      { type: 'rest', duration: 10, powerLow: 40, powerHigh: 50, label: 'Rest' },
      { type: 'interval', duration: 20, powerLow: 150, powerHigh: 200, label: 'Sprint #6' },
      { type: 'rest', duration: 10, powerLow: 40, powerHigh: 50, label: 'Rest' },
      { type: 'interval', duration: 20, powerLow: 150, powerHigh: 200, label: 'Sprint #7' },
      { type: 'rest', duration: 10, powerLow: 40, powerHigh: 50, label: 'Rest' },
      { type: 'interval', duration: 20, powerLow: 150, powerHigh: 200, label: 'Sprint #8' },
      { type: 'cooldown', duration: 960, powerLow: 45, powerHigh: 55, label: 'Long Cooldown' },
    ],
    buildInstructions: '1. Warmup: 10min @ 50-80% FTP\n2. 8x20sec all-out (150-200% FTP) with 10sec rest\n3. Cooldown: 16min @ 45-55% FTP',
  },
];

// Save to JSON file
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const outputPath = path.join(dataDir, 'zwift-workouts.json');
fs.writeFileSync(outputPath, JSON.stringify(manualWorkouts, null, 2));

console.log(`✓ Created ${manualWorkouts.length} manual workouts with detailed interval structures`);
console.log(`✓ Saved to: ${outputPath}`);
console.log('\nWorkout breakdown:');
console.log(`  Recovery: ${manualWorkouts.filter(w => w.type === 'Recovery').length}`);
console.log(`  Endurance: ${manualWorkouts.filter(w => w.type === 'Endurance').length}`);
console.log(`  Tempo: ${manualWorkouts.filter(w => w.type === 'Tempo').length}`);
console.log(`  Threshold: ${manualWorkouts.filter(w => w.type === 'Threshold').length}`);
console.log(`  VO2Max: ${manualWorkouts.filter(w => w.type === 'VO2Max').length}`);
console.log(`  Mixed: ${manualWorkouts.filter(w => w.type === 'Mixed').length}`);
console.log('\nNext step: Import to database');
console.log('  curl -X POST http://localhost:3000/api/workouts/import');
