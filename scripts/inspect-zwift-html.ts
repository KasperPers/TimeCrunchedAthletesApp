/**
 * HTML Inspector for whatsonzwift.com
 *
 * This script fetches the workouts page and helps identify the correct selectors
 *
 * Usage: npx ts-node scripts/inspect-zwift-html.ts
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function inspectPage() {
  try {
    console.log('Fetching https://whatsonzwift.com/workouts/...\n');

    const response = await axios.get('https://whatsonzwift.com/workouts/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    console.log('=== PAGE STRUCTURE ANALYSIS ===\n');

    // Save full HTML for manual inspection
    fs.writeFileSync('debug-whatsonzwift.html', response.data);
    console.log('✓ Saved full HTML to: debug-whatsonzwift.html\n');

    // Check for common link patterns
    console.log('--- Links Found ---');
    const allLinks = $('a').map((_, el) => $(el).attr('href')).get();
    const workoutLinks = allLinks.filter(href =>
      href && (
        href.includes('workout') ||
        href.includes('training') ||
        href.includes('plan')
      )
    ).slice(0, 10);

    console.log(`Total links on page: ${allLinks.length}`);
    console.log(`Potential workout links (first 10):`, workoutLinks);
    console.log('');

    // Check for common article/post structures
    console.log('--- Common Selectors ---');
    const selectors = [
      'article',
      '.post',
      '.workout',
      '.entry',
      'div[class*="workout"]',
      'div[class*="card"]',
      '.wp-block-post',
      'main article',
    ];

    for (const selector of selectors) {
      const count = $(selector).length;
      if (count > 0) {
        console.log(`${selector}: ${count} elements found`);

        // Show first element's HTML structure
        const first = $(selector).first();
        const classes = first.attr('class');
        const hasLink = first.find('a').length > 0;
        const linkHref = first.find('a').first().attr('href');

        console.log(`  - Classes: ${classes || 'none'}`);
        console.log(`  - Has links: ${hasLink}`);
        if (linkHref) console.log(`  - First link: ${linkHref}`);
        console.log('');
      }
    }

    // Check for pagination or load more
    console.log('--- Pagination/Load More ---');
    const loadMoreButton = $('button:contains("Load"), a:contains("Load"), a:contains("More")').length;
    const pagination = $('.pagination, .nav-links, nav[class*="pag"]').length;
    console.log(`Load more buttons: ${loadMoreButton}`);
    console.log(`Pagination elements: ${pagination}`);
    console.log('');

    // Check main content area
    console.log('--- Main Content Area ---');
    const mainSelectors = ['main', '#main', '#content', '.content', 'div[role="main"]'];
    for (const sel of mainSelectors) {
      if ($(sel).length > 0) {
        console.log(`${sel}: Found`);
        const childCount = $(sel).children().length;
        console.log(`  - Child elements: ${childCount}`);
      }
    }
    console.log('');

    // Extract sample workout if possible
    console.log('--- Sample Workout Extraction Attempt ---');
    const article = $('article').first();
    if (article.length > 0) {
      const title = article.find('h1, h2, h3, .title, .entry-title').first().text().trim();
      const link = article.find('a').first().attr('href');
      console.log(`Sample title: "${title}"`);
      console.log(`Sample link: ${link}`);
    } else {
      console.log('No article elements found. The site may use a different structure.');
    }
    console.log('');

    console.log('=== NEXT STEPS ===');
    console.log('1. Open debug-whatsonzwift.html in your browser');
    console.log('2. Look for repeating elements that contain workout information');
    console.log('3. Note the CSS classes and HTML structure');
    console.log('4. Update scripts/crawl-zwift-workouts.ts with the correct selectors');
    console.log('\nOR: Browse https://whatsonzwift.com/workouts/ and use browser DevTools to inspect the structure');

  } catch (error) {
    console.error('Error:', error);
  }
}

inspectPage();
