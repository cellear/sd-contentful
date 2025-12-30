#!/usr/bin/env node

/**
 * Import CSV data into Contentful using Management API
 * 
 * This script:
 * 1. Reads contentful-import.csv
 * 2. Uploads images to Contentful Media library
 * 3. Creates Tip entries with all fields
 * 4. Converts plain text body to Rich Text format
 * 5. Publishes all entries
 * 
 * Requirements:
 * - npm install contentful-management
 * - Management API token (different from Delivery API token)
 * 
 * Usage:
 *   CONTENTFUL_MANAGEMENT_TOKEN=your-token node import-to-contentful.js
 */

const contentfulManagement = require('contentful-management');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const spaceId = process.env.CONTENTFUL_SPACE_ID || 'r4mpogvp9tf2';
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

if (!managementToken) {
  console.error('❌ Error: CONTENTFUL_MANAGEMENT_TOKEN environment variable is required');
  console.error('\nTo get a Management API token:');
  console.error('1. Go to Contentful → Settings → API keys');
  console.error('2. Click "Content Management API - access token"');
  console.error('3. Create a new token or use an existing one');
  console.error('\nThen run:');
  console.error(`  CONTENTFUL_MANAGEMENT_TOKEN=your-token node import-to-contentful.js`);
  process.exit(1);
}

const CSV_FILE = path.join(__dirname, 'contentful-import.csv');
const client = contentfulManagement.createClient({
  accessToken: managementToken,
});

/**
 * Convert plain text to Contentful Rich Text Document
 */
function textToRichText(text) {
  if (!text || !text.trim()) {
    return {
      nodeType: 'document',
      data: {},
      content: []
    };
  }

  // Split text into paragraphs (double newlines)
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  
  if (paragraphs.length === 0) {
    // Single paragraph
    return {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'paragraph',
          data: {},
          content: text.split('\n').map(line => ({
            nodeType: 'text',
            value: line.trim() || ' ',
            marks: [],
            data: {}
          }))
        }
      ]
    };
  }

  // Multiple paragraphs
  return {
    nodeType: 'document',
    data: {},
    content: paragraphs.map(para => ({
      nodeType: 'paragraph',
      data: {},
      content: para.split('\n').map(line => ({
        nodeType: 'text',
        value: line.trim() || ' ',
        marks: [],
        data: {}
      }))
    }))
  };
}

/**
 * Upload image file to Contentful
 * 
 * Uses createAssetFromFiles which handles the upload process automatically
 */
async function uploadImage(space, environment, imagePath) {
  if (!imagePath || !imagePath.trim()) {
    return null;
  }

  const fullPath = path.join(__dirname, imagePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  Image not found: ${imagePath}`);
    return null;
  }

  try {
    const fileBuffer = fs.readFileSync(fullPath);
    const fileName = path.basename(fullPath);
    const contentType = getContentType(fileName);

    // Create asset from file buffer
    const asset = await environment.createAssetFromFiles({
      fields: {
        title: {
          'en-US': fileName
        },
        file: {
          'en-US': {
            contentType: contentType,
            fileName: fileName,
            file: fileBuffer
          }
        }
      }
    });

    // Process asset
    await asset.processForAllLocales();
    
    // Wait for processing to complete
    let processed = false;
    let attempts = 0;
    while (!processed && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedAsset = await environment.getAsset(asset.sys.id);
      if (updatedAsset.fields.file && updatedAsset.fields.file['en-US']) {
        processed = true;
      }
      attempts++;
    }

    // Publish asset
    await asset.publish();

    console.log(`  ✓ Uploaded image: ${fileName}`);
    return asset.sys.id;
  } catch (error) {
    console.error(`  ✗ Failed to upload ${imagePath}:`, error.message);
    return null;
  }
}

/**
 * Get content type from filename
 */
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return types[ext] || 'image/jpeg';
}

/**
 * Read CSV file
 */
function readCSV() {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

/**
 * Main import function
 */
async function importToContentful() {
  try {
    console.log('📖 Reading CSV file...');
    const rows = await readCSV();
    console.log(`✅ Found ${rows.length} tips to import\n`);

    console.log('🔌 Connecting to Contentful...');
    const space = await client.getSpace(spaceId);
    const environment = await space.getEnvironment('master');
    console.log('✅ Connected\n');

    const results = {
      success: 0,
      failed: 0,
      skipped: 0
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const tipNumber = parseInt(row.tipNumber, 10);
      
      console.log(`[${i + 1}/${rows.length}] Importing tip ${tipNumber}: ${row.title}`);

      try {
        // Check if entry already exists
        const existing = await environment.getEntries({
          content_type: 'tip',
          'fields.slug': row.slug,
          limit: 1
        });

        if (existing.items.length > 0) {
          console.log(`  ⚠️  Entry with slug "${row.slug}" already exists, skipping...`);
          results.skipped++;
          continue;
        }

        // Upload image if provided
        let imageAssetId = null;
        if (row.imagePath && row.imagePath.trim()) {
          imageAssetId = await uploadImage(space, environment, row.imagePath);
        }

        // Convert body text to Rich Text
        const richTextBody = textToRichText(row.body);

        // Create entry
        const entry = await environment.createEntry('tip', {
          fields: {
            title: {
              'en-US': row.title
            },
            slug: {
              'en-US': row.slug
            },
            tipNumber: {
              'en-US': tipNumber
            },
            body: {
              'en-US': richTextBody
            },
            ...(imageAssetId && {
              image: {
                'en-US': {
                  sys: {
                    type: 'Link',
                    linkType: 'Asset',
                    id: imageAssetId
                  }
                }
              }
            })
          }
        });

        // Publish entry
        await entry.publish();

        console.log(`  ✅ Created and published: ${row.slug}`);
        results.success++;

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`  ✗ Failed: ${error.message}`);
        results.failed++;
      }
    }

    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Success: ${results.success}`);
    console.log(`   ⚠️  Skipped: ${results.skipped}`);
    console.log(`   ✗ Failed: ${results.failed}`);
    console.log(`\n🎉 Import complete!`);

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    if (error.message.includes('401')) {
      console.error('\nThe Management API token is invalid or expired.');
    } else if (error.message.includes('404')) {
      console.error('\nContent type "tip" not found. Make sure it exists in your space.');
    }
    process.exit(1);
  }
}

// Check if contentful-management is installed
try {
  require.resolve('contentful-management');
  importToContentful();
} catch (e) {
  console.error('❌ Error: contentful-management package not found.');
  console.error('Install it with: npm install contentful-management');
  console.error('\nYou may need to install it in the worktree directory:');
  console.error('  cd .worktrees/001-contentful-migration');
  console.error('  npm install contentful-management');
  process.exit(1);
}

