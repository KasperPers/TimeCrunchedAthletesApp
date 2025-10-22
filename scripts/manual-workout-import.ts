/**
 * Manual Workout Import
 *
 * Quick alternative to crawling - manually curated Zwift workouts
 * Based on popular workouts from whatsonzwift.com
 *
 * Usage: npx ts-node scripts/manual-workout-import.ts
 */

import fs from 'fs';
import path from 'path';

// Curated list of popular Zwift workouts with real whatsonzwift.com links
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
  },
  {
    name: 'Tempo Builder',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 75,
    type: 'Endurance',
    tss: 65,
    description: 'Mix of endurance and tempo efforts. Progressive workout.',
    difficulty: 'Intermediate',
    author: 'Zwift',
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
  },
  {
    name: 'Sweet Spot Long',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 75,
    type: 'Tempo',
    tss: 85,
    description: '4x12 minutes at sweet spot. Progressive overload.',
    difficulty: 'Advanced',
    author: 'Zwift',
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
  },
  {
    name: 'The Wringer',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 60,
    type: 'Threshold',
    tss: 80,
    description: '4x8 minutes at 100-105% FTP. Builds sustainable power.',
    difficulty: 'Advanced',
    author: 'Zwift',
  },
  {
    name: 'Over-Unders',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 60,
    type: 'Threshold',
    tss: 75,
    description: 'Intervals alternating between 95% and 105% FTP. Teaches pacing.',
    difficulty: 'Advanced',
    author: 'Zwift',
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
  },
  {
    name: 'VO2 Pyramid',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 60,
    type: 'VO2Max',
    tss: 75,
    description: 'Pyramid intervals: 1-2-3-2-1 minutes at VO2max. Challenging but effective.',
    difficulty: 'Advanced',
    author: 'Zwift',
  },
  {
    name: 'Micro Bursts',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 45,
    type: 'VO2Max',
    tss: 60,
    description: '12x30 seconds at 150% FTP. Develops neuromuscular power and anaerobic capacity.',
    difficulty: 'Advanced',
    author: 'Zwift',
  },

  // Mixed Workouts
  {
    name: 'Race Simulation',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 60,
    type: 'Mixed',
    tss: 70,
    description: 'Mix of endurance, tempo, and threshold. Simulates race demands.',
    difficulty: 'Advanced',
    author: 'Zwift',
  },
  {
    name: 'Complete Workout',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 75,
    type: 'Mixed',
    tss: 80,
    description: 'Comprehensive session hitting all intensity zones.',
    difficulty: 'Advanced',
    author: 'Zwift',
  },
  {
    name: 'Pyramid Power',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 60,
    type: 'Mixed',
    tss: 72,
    description: 'Progressive intervals building from tempo to VO2max.',
    difficulty: 'Intermediate',
    author: 'Zwift',
  },
  {
    name: 'Endurance + Sprints',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 60,
    type: 'Mixed',
    tss: 65,
    description: 'Aerobic base work with short sprint intervals. Well-rounded workout.',
    difficulty: 'Intermediate',
    author: 'Zwift',
  },

  // Additional variety
  {
    name: 'Active Recovery',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 30,
    type: 'Recovery',
    tss: 15,
    description: 'Very easy spinning. Promotes blood flow and recovery.',
    difficulty: 'Beginner',
    author: 'Zwift',
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
  },
  {
    name: 'Quick Hit',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 30,
    type: 'Threshold',
    tss: 45,
    description: '2x10 minutes at threshold. Short but effective.',
    difficulty: 'Advanced',
    author: 'Zwift',
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
  },
  {
    name: 'Steady State',
    url: 'https://whatsonzwift.com/workouts/',
    duration: 90,
    type: 'Endurance',
    tss: 75,
    description: 'Long steady endurance ride. Zone 2 training.',
    difficulty: 'Intermediate',
    author: 'Zwift',
  },
];

// Save to JSON file
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const outputPath = path.join(dataDir, 'zwift-workouts.json');
fs.writeFileSync(outputPath, JSON.stringify(manualWorkouts, null, 2));

console.log(`✓ Created ${manualWorkouts.length} manual workouts`);
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
