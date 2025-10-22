/**
 * Crawl whatsonzwift.com to fetch real Zwift workout data
 *
 * Usage:
 *   npm install cheerio axios
 *   npx ts-node scripts/crawl-zwift-workouts.ts
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

interface CrawledWorkout {
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

const WORKOUTS_URL = 'https://whatsonzwift.com/workouts/';
const WORKOUT_TYPES = ['recovery', 'endurance', 'tempo', 'threshold', 'vo2max', 'mixed'];

/**
 * Fetch and parse a single workout page
 */
async function fetchWorkoutDetails(url: string): Promise<CrawledWorkout | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    // Extract workout details
    // NOTE: These selectors are placeholders - adjust based on actual HTML structure
    const name = $('h1.workout-title, h1.entry-title, .workout-name').first().text().trim();
    const description = $('p.workout-description, .workout-details p').first().text().trim();
    const durationText = $('span.duration, .workout-duration').text();
    const tssText = $('span.tss, .workout-tss').text();
    const typeText = $('span.type, .workout-type, .category').text().trim();
    const difficultyText = $('span.difficulty, .workout-difficulty').text().trim();
    const authorText = $('span.author, .workout-author').text().trim();

    // Parse duration (e.g., "45 minutes" or "1 hour 15 minutes")
    let duration = 0;
    const hourMatch = durationText.match(/(\d+)\s*h(ou)?r/i);
    const minMatch = durationText.match(/(\d+)\s*m(in)?/i);
    if (hourMatch) duration += parseInt(hourMatch[1]) * 60;
    if (minMatch) duration += parseInt(minMatch[1]);

    // Parse TSS
    const tssMatch = tssText.match(/(\d+)/);
    const tss = tssMatch ? parseInt(tssMatch[1]) : undefined;

    // Determine type from various sources
    let type = typeText;
    if (!type && url.includes('/')) {
      // Try to infer from URL or page structure
      const urlType = WORKOUT_TYPES.find(t =>
        url.toLowerCase().includes(t) ||
        response.data.toLowerCase().includes(`class="${t}"`)
      );
      type = urlType || 'Mixed';
    }

    // Capitalize type
    type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

    return {
      name: name || 'Unknown Workout',
      url,
      duration: duration || 60, // Default to 60 if not found
      type: type || 'Mixed',
      tss,
      description: description || undefined,
      difficulty: difficultyText || undefined,
      author: authorText || undefined,
      tags: [],
    };
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

/**
 * Crawl the workouts listing page
 */
async function crawlWorkoutsListing(): Promise<string[]> {
  try {
    console.log('Fetching workouts listing from:', WORKOUTS_URL);
    const response = await axios.get(WORKOUTS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    // Find all workout links
    // NOTE: Adjust selector based on actual HTML structure
    const workoutLinks: string[] = [];

    // Try multiple possible selectors
    const selectors = [
      'a.workout-link',
      '.workout-item a',
      'article a',
      '.entry a',
      'a[href*="/workout/"]',
    ];

    for (const selector of selectors) {
      $(selector).each((_, element) => {
        const href = $(element).attr('href');
        if (href && href.includes('/workout')) {
          const fullUrl = href.startsWith('http') ? href : `https://whatsonzwift.com${href}`;
          if (!workoutLinks.includes(fullUrl)) {
            workoutLinks.push(fullUrl);
          }
        }
      });

      if (workoutLinks.length > 0) {
        console.log(`Found ${workoutLinks.length} workouts using selector: ${selector}`);
        break;
      }
    }

    return workoutLinks;
  } catch (error) {
    console.error('Error crawling workouts listing:', error);
    return [];
  }
}

/**
 * Main crawling function
 */
async function crawlAllWorkouts() {
  console.log('Starting whatsonzwift.com workout crawler...\n');

  // Get all workout URLs
  const workoutUrls = await crawlWorkoutsListing();

  if (workoutUrls.length === 0) {
    console.error('No workout URLs found. The site structure may have changed.');
    console.log('\nPlease manually browse https://whatsonzwift.com/workouts/');
    console.log('and update the selectors in this script based on the HTML structure.');
    return;
  }

  console.log(`Found ${workoutUrls.length} workouts. Fetching details...\n`);

  // Fetch details for each workout (with delay to be respectful)
  const workouts: CrawledWorkout[] = [];

  for (let i = 0; i < Math.min(workoutUrls.length, 100); i++) {
    const url = workoutUrls[i];
    console.log(`[${i + 1}/${workoutUrls.length}] Fetching: ${url}`);

    const workout = await fetchWorkoutDetails(url);
    if (workout) {
      workouts.push(workout);
      console.log(`  ✓ ${workout.name} (${workout.duration}min, ${workout.type})`);
    }

    // Be respectful - wait 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Save to JSON file
  const outputPath = path.join(process.cwd(), 'data', 'zwift-workouts.json');
  const dataDir = path.join(process.cwd(), 'data');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(workouts, null, 2));

  console.log(`\n✓ Successfully crawled ${workouts.length} workouts`);
  console.log(`✓ Saved to: ${outputPath}`);
  console.log('\nNext steps:');
  console.log('1. Review the generated file: data/zwift-workouts.json');
  console.log('2. Import to database: npm run import-workouts');
  console.log('3. Or use API: POST /api/workouts/import');
}

// Run the crawler
crawlAllWorkouts().catch(console.error);
