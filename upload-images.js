#!/usr/bin/env node

/**
 * Upload images and link them to existing Tip entries
 * 
 * This script:
 * 1. Reads contentful-import.csv
 * 2. Uploads images to Contentful Media library
 * 3. Links images to existing Tip entries by slug
 * 4. Publishes updated entries
 */

const contentfulManagement = require('contentful-management');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const spaceId = process.env.CONTENTFUL_SPACE_ID || 'r4mpogvp9tf2';
const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;

if (!managementToken) {
  console.error('❌ Error: CONTENTFUL_MANAGEMENT_TOKEN environment variable is required');
  process.exit(1);
}

const CSV_FILE = path.join(__dirname, 'contentful-import.csv');
const client = contentfulManagement.createClient({
  accessToken: managementToken,
});

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

async function uploadImage(environment, imagePath) {
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

    // Check if asset with same filename already exists
    try {
      const existingAssets = await environment.getAssets({
        'fields.title': fileName,
        limit: 1
      });
      
      if (existingAssets.items.length > 0) {
        const existingAsset = existingAssets.items[0];
        console.log(`  ℹ️  Asset "${fileName}" already exists, reusing...`);
        
        // Make sure it's published
        if (!existingAsset.isPublished()) {
          await existingAsset.publish();
        }
        
        return existingAsset.sys.id;
      }
    } catch (error) {
      // If check fails, proceed with creating new asset
    }

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

    // Publish asset (only if not already published)
    try {
      if (!asset.isPublished()) {
        await asset.publish();
      }
    } catch (error) {
      // If already published or version conflict, fetch latest and try again
      if (error.status === 409) {
        const latestAsset = await environment.getAsset(asset.sys.id);
        if (!latestAsset.isPublished()) {
          await latestAsset.publish();
        }
      } else {
        throw error;
      }
    }

    console.log(`  ✓ Uploaded image: ${fileName}`);
    return asset.sys.id;
  } catch (error) {
    console.error(`  ✗ Failed to upload ${imagePath}:`, error.message);
    return null;
  }
}

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

async function uploadImages() {
  try {
    console.log('📖 Reading CSV file...');
    const rows = await readCSV();
    console.log(`✅ Found ${rows.length} tips\n`);

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
      
      console.log(`[${i + 1}/${rows.length}] Processing tip ${tipNumber}: ${row.title}`);

      try {
        // Find existing entry by slug
        const existing = await environment.getEntries({
          content_type: 'tip',
          'fields.slug': row.slug,
          limit: 1
        });

        if (existing.items.length === 0) {
          console.log(`  ⚠️  Entry with slug "${row.slug}" not found, skipping...`);
          results.skipped++;
          continue;
        }

        const entry = existing.items[0];

        // Check if entry already has an image
        if (entry.fields.image && entry.fields.image['en-US']) {
          console.log(`  ⚠️  Entry already has an image, skipping...`);
          results.skipped++;
          continue;
        }

        // Upload image if provided
        let imageAssetId = null;
        if (row.imagePath && row.imagePath.trim()) {
          imageAssetId = await uploadImage(environment, row.imagePath);
        }

        if (!imageAssetId) {
          console.log(`  ⚠️  No image to upload, skipping...`);
          results.skipped++;
          continue;
        }

        // Fetch latest version of entry to avoid version conflicts
        let latestEntry = await environment.getEntry(entry.sys.id);
        const wasPublished = latestEntry.isPublished();
        
        // Unpublish entry if published (required to update)
        if (wasPublished) {
          await latestEntry.unpublish();
        }
        
        // Fetch again to get updated version after unpublishing
        latestEntry = await environment.getEntry(entry.sys.id);
        
        // Update entry with image
        latestEntry.fields.image = {
          'en-US': {
            sys: {
              type: 'Link',
              linkType: 'Asset',
              id: imageAssetId
            }
          }
        };
        
        // Save entry
        const updatedEntry = await latestEntry.update();
        
        // Fetch again after update to get latest version
        const finalEntry = await environment.getEntry(entry.sys.id);
        
        // Publish entry (only if it was published before)
        if (wasPublished) {
          await finalEntry.publish();
        }

        console.log(`  ✅ Linked image to: ${row.slug}`);
        results.success++;

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`  ✗ Failed: ${error.message}`);
        results.failed++;
      }
    }

    console.log('\n📊 Upload Summary:');
    console.log(`   ✅ Success: ${results.success}`);
    console.log(`   ⚠️  Skipped: ${results.skipped}`);
    console.log(`   ✗ Failed: ${results.failed}`);
    console.log(`\n🎉 Image upload complete!`);

  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

uploadImages();

