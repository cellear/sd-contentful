#!/usr/bin/env node

/**
 * Transform Drupal export CSV to Contentful import format
 * 
 * Adds missing columns: slug, tipNumber
 * Maps image paths to actual file locations
 * Standardizes column names
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createWriteStream } = require('fs');

// Configuration
const INPUT_CSV = path.join(__dirname, 'data', 'export.csv');
const OUTPUT_CSV = path.join(__dirname, 'data', 'contentful-import.csv');
const IMAGE_BASE_PATH = path.join(__dirname, '..', 'legacy-reference', 'files', '2024-01');

/**
 * Convert title to URL-safe slug
 */
function titleToSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract filename from Drupal path
 * Example: /sites/default/files/2024-01/image.png -> image.png
 */
function extractImageFilename(drupalPath) {
  if (!drupalPath || drupalPath.trim() === '') return '';
  
  // Remove leading slash and get filename
  const filename = path.basename(drupalPath.trim());
  
  // Check if file exists in the image directory
  const fullPath = path.join(IMAGE_BASE_PATH, filename);
  if (fs.existsSync(fullPath)) {
    return path.join('..', 'legacy-reference', 'files', '2024-01', filename);
  }
  
  // Try alternative extensions
  const baseName = path.parse(filename).name;
  const extensions = ['.png', '.jpg', '.jpeg', '.gif'];
  for (const ext of extensions) {
    const altPath = path.join(IMAGE_BASE_PATH, baseName + ext);
    if (fs.existsSync(altPath)) {
      return path.join('..', 'legacy-reference', 'files', '2024-01', `${baseName}${ext}`);
    }
  }
  
  console.warn(`Warning: Image not found for path: ${drupalPath}`);
  return '';
}

/**
 * Read and transform CSV
 */
async function transformCSV() {
  const rows = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(INPUT_CSV)
      .pipe(csv())
      .on('data', (row) => {
        const title = row.title || row.Title || '';
        const body = row.Body || row.body || '';
        const imageUrl = row['Image-url'] || row['image-url'] || row['Image-URL'] || '';
        
        // Generate slug from title
        const slug = titleToSlug(title);
        
        // Extract tip number from title or use row number
        // Try to find number in title, otherwise use row index + 1
        const tipNumberMatch = title.match(/\d+/);
        const tipNumber = tipNumberMatch 
          ? parseInt(tipNumberMatch[0], 10) 
          : rows.length + 1;
        
        // Map image path
        const imagePath = extractImageFilename(imageUrl);
        
        rows.push({
          title: title,
          slug: slug,
          tipNumber: tipNumber,
          body: body,
          imagePath: imagePath
        });
      })
      .on('end', () => {
        // Sort by tipNumber to ensure correct order
        rows.sort((a, b) => a.tipNumber - b.tipNumber);
        
        // Write output CSV
        const headers = ['title', 'slug', 'tipNumber', 'body', 'imagePath'];
        const csvRows = [
          headers.join(','),
          ...rows.map(row => {
            // Escape quotes and wrap in quotes if contains comma or quote
            const escapeCSV = (str) => {
              if (!str) return '""';
              const escaped = String(str).replace(/"/g, '""');
              if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
                return `"${escaped}"`;
              }
              return escaped;
            };
            
            return [
              escapeCSV(row.title),
              escapeCSV(row.slug),
              row.tipNumber,
              escapeCSV(row.body),
              escapeCSV(row.imagePath)
            ].join(',');
          })
        ];
        
        fs.writeFileSync(OUTPUT_CSV, csvRows.join('\n'), 'utf-8');
        
        console.log(`✅ Transformed ${rows.length} tips`);
        console.log(`📄 Output written to: ${OUTPUT_CSV}`);
        console.log(`\n📊 Summary:`);
        console.log(`   - Tips with images: ${rows.filter(r => r.imagePath).length}`);
        console.log(`   - Tips without images: ${rows.filter(r => !r.imagePath).length}`);
        console.log(`   - Tip numbers range: ${Math.min(...rows.map(r => r.tipNumber))} - ${Math.max(...rows.map(r => r.tipNumber))}`);
        
        resolve(rows);
      })
      .on('error', reject);
  });
}

// Check if csv-parser is available
try {
  require.resolve('csv-parser');
  transformCSV().catch(console.error);
} catch (e) {
  console.error('Error: csv-parser package not found.');
  console.error('Install it with: npm install csv-parser');
  console.error('\nAlternatively, you can use the Python version: python3 transform-csv.py');
  process.exit(1);
}

