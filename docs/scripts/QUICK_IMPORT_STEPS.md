# Quick Import Steps

## Get Your Management API Token

1. Go to: https://app.contentful.com/spaces/r4mpogvp9tf2/settings/api-keys
2. Scroll to **"Content Management API - access token"** section
3. Click **"Generate personal token"**
4. Give it a name like "Import Script"
5. **Copy the token immediately** (you won't see it again!)

## Install Dependencies

```bash
npm install contentful-management csv-parser
```

## Run the Import

```bash
CONTENTFUL_MANAGEMENT_TOKEN=your-token-here node scripts/import-to-contentful.js
```

Replace `your-token-here` with the token you copied in step 1.

## What Happens

The script will:
- ✅ Read all 31 tips from `scripts/data/contentful-import.csv`
- ✅ Upload all images to Contentful
- ✅ Create Tip entries with all fields
- ✅ Convert body text to Rich Text format
- ✅ Link images to entries
- ✅ Publish everything

**Time**: About 2-3 minutes for all 31 tips.

## Troubleshooting

**"contentful-management not found"**
```bash
npm install contentful-management csv-parser
```

**"401 Unauthorized"**
- Make sure you're using the **Management API** token (not Delivery API)
- Token should start with something like `CFPAT-...`

**"Content type 'tip' not found"**
- Go to Contentful → Content model
- Make sure "Tip" content type exists
- Verify it's exactly `tip` (lowercase)

**Script stops or errors**
- Check the error message - it will tell you which tip failed
- You can re-run the script - it will skip entries that already exist

## Verify Import

1. Go to Contentful → Content → Tip entries
2. You should see all 31 tips
3. Open a few and verify images are present
4. Visit your Next.js app: http://localhost:3000
5. All tips should appear!

