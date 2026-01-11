# Contentful Import Guide

This guide helps you import all 31 tips from the CSV file into Contentful.

## Overview

Contentful's web UI **does not have a built-in CSV import feature**. You have a few options:

1. **Management API Script** (Recommended) - Automated import with image uploads
2. **Contentful CLI + cfimp** - Third-party CSV import tool
3. **Manual Entry** - Time-consuming but straightforward

## Option 1: Management API Script (Recommended)

We've created a script that automatically imports your CSV and uploads images.

### Step 1: Get Management API Token

1. Go to https://app.contentful.com/spaces/r4mpogvp9tf2
2. Click the **gear icon** (⚙️) in the upper right
3. Select **API keys**
4. Scroll down to **Content Management API - access token**
5. Click **Generate personal token** (or use existing one)
6. Copy the token (you'll only see it once!)

**Important**: This is different from the Delivery API token you already have. You need the **Management API** token to create/edit content.

### Step 2: Install Dependencies

**For Node.js (JavaScript version):**
```bash
npm install contentful-management csv-parser
```

**For Python version:**
```bash
pip install contentful-management
```

### Step 3: Run Import Script

**JavaScript version:**
```bash
CONTENTFUL_MANAGEMENT_TOKEN=your-token-here node scripts/import-to-contentful.js
```

**Python version:**
```bash
CONTENTFUL_MANAGEMENT_TOKEN=your-token-here python3 scripts/import-to-contentful.py
```

### What the Script Does

1. ✅ Reads `scripts/data/contentful-import.csv`
2. ✅ Uploads all 31 images to Contentful Media library
3. ✅ Creates Tip entries with title, slug, tipNumber, body
4. ✅ Converts plain text body to Rich Text format
5. ✅ Links images to entries
6. ✅ Publishes all entries

### Troubleshooting

**Error: "contentful-management not found"**
- Install it: `npm install contentful-management` (or `pip install contentful-management`)

**Error: "401 Unauthorized"**
- Check your Management API token is correct
- Make sure you're using the Management API token, not the Delivery API token

**Error: "Content type 'tip' not found"**
- Make sure the Tip content type exists in Contentful
- Verify the content type ID is exactly `tip` (lowercase)

**Images not uploading**
- Check that image files exist at the paths specified in CSV
- Verify file permissions allow reading the image files

## Option 2: Contentful CLI + cfimp

### Install Contentful CLI
```bash
npm install -g contentful-cli
```

### Install cfimp
```bash
npm install -g cfimp
```

### Authenticate
```bash
contentful login
```

### Import CSV
```bash
cfimp -input:scripts/data/contentful-import.csv -model:tip -space:r4mpogvp9tf2
```

**Note**: cfimp may require additional configuration for image uploads and Rich Text conversion.

## Option 3: Manual Entry (Fallback)

If automated import doesn't work, you can enter tips manually:

1. Go to **Content** → **Add entry** → **Tip**
2. Fill in fields:
   - Title: from CSV
   - Slug: from CSV
   - Tip Number: from CSV
   - Body: Copy/paste from CSV (Contentful will convert to Rich Text)
   - Image: Upload from `legacy-reference/files/2024-01/` (or 2024-02, 2024-05)
3. Click **Publish**

Repeat for all 31 tips.

## Verification

After import, verify:

1. Go to **Content** → **Tip** entries
2. Check that all 31 tips are listed
3. Open a few tips and verify:
   - All fields are populated correctly
   - Images are present and display correctly
   - Body content is formatted properly
4. Visit your Next.js app and verify tips appear

## Next Steps

Once import is complete:
- All 31 tips should be visible in your Next.js app
- Images should display on detail pages
- You can proceed with CSS styling story

