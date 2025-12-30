#!/usr/bin/env python3

"""
Import CSV data into Contentful using Management API

This script:
1. Reads contentful-import.csv
2. Uploads images to Contentful Media library
3. Creates Tip entries with all fields
4. Converts plain text body to Rich Text format
5. Publishes all entries

Requirements:
- pip install contentful-management
- Management API token (different from Delivery API token)

Usage:
  CONTENTFUL_MANAGEMENT_TOKEN=your-token python3 import-to-contentful.py
"""

import os
import sys
import csv
import time
import base64
from pathlib import Path

try:
    from contentful_management import Client
except ImportError:
    print('❌ Error: contentful-management package not found.')
    print('Install it with: pip install contentful-management')
    sys.exit(1)

space_id = os.getenv('CONTENTFUL_SPACE_ID', 'r4mpogvp9tf2')
management_token = os.getenv('CONTENTFUL_MANAGEMENT_TOKEN')

if not management_token:
    print('❌ Error: CONTENTFUL_MANAGEMENT_TOKEN environment variable is required')
    print('\nTo get a Management API token:')
    print('1. Go to Contentful → Settings → API keys')
    print('2. Click "Content Management API - access token"')
    print('3. Create a new token or use an existing one')
    print('\nThen run:')
    print('  CONTENTFUL_MANAGEMENT_TOKEN=your-token python3 import-to-contentful.py')
    sys.exit(1)

CSV_FILE = Path(__file__).parent / 'contentful-import.csv'
client = Client(management_token)

def text_to_rich_text(text):
    """Convert plain text to Contentful Rich Text Document"""
    if not text or not text.strip():
        return {
            'nodeType': 'document',
            'data': {},
            'content': []
        }
    
    # Split into paragraphs (double newlines)
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    
    if not paragraphs:
        # Single paragraph - split by single newlines
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        return {
            'nodeType': 'document',
            'data': {},
            'content': [{
                'nodeType': 'paragraph',
                'data': {},
                'content': [
                    {
                        'nodeType': 'text',
                        'value': line or ' ',
                        'marks': [],
                        'data': {}
                    }
                    for line in lines
                ]
            }]
        }
    
    # Multiple paragraphs
    return {
        'nodeType': 'document',
        'data': {},
        'content': [{
            'nodeType': 'paragraph',
            'data': {},
            'content': [
                {
                    'nodeType': 'text',
                    'value': line or ' ',
                    'marks': [],
                    'data': {}
                }
                for line in para.split('\n')
            ]
        } for para in paragraphs]
    }

def get_content_type(filename):
    """Get MIME type from filename"""
    ext = Path(filename).suffix.lower()
    types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    }
    return types.get(ext, 'image/jpeg')

async def upload_image(space, environment, image_path):
    """Upload image file to Contentful"""
    if not image_path or not image_path.strip():
        return None
    
    full_path = Path(__file__).parent / image_path
    if not full_path.exists():
        print(f'  ⚠️  Image not found: {image_path}')
        return None
    
    try:
        filename = full_path.name
        content_type = get_content_type(filename)
        
        # Read file
        with open(full_path, 'rb') as f:
            file_data = f.read()
        
        # Create asset
        asset = environment.assets().create({
            'fields': {
                'title': {
                    'en-US': filename
                },
                'file': {
                    'en-US': {
                        'contentType': content_type,
                        'fileName': filename,
                        'upload': base64.b64encode(file_data).decode('utf-8')
                    }
                }
            }
        })
        
        # Process asset
        asset.process()
        
        # Wait for processing
        processed = False
        attempts = 0
        while not processed and attempts < 10:
            time.sleep(1)
            updated_asset = environment.assets().find(asset.id)
            if updated_asset.fields.get('file'):
                processed = True
            attempts += 1
        
        # Publish asset
        asset.publish()
        
        print(f'  ✓ Uploaded image: {filename}')
        return asset.id
    except Exception as error:
        print(f'  ✗ Failed to upload {image_path}: {error}')
        return None

def read_csv():
    """Read CSV file"""
    rows = []
    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows

async def import_to_contentful():
    """Main import function"""
    try:
        print('📖 Reading CSV file...')
        rows = read_csv()
        print(f'✅ Found {len(rows)} tips to import\n')
        
        print('🔌 Connecting to Contentful...')
        space = client.spaces().find(space_id)
        environment = space.environments().find('master')
        print('✅ Connected\n')
        
        results = {
            'success': 0,
            'failed': 0,
            'skipped': 0
        }
        
        for i, row in enumerate(rows, 1):
            tip_number = int(row['tipNumber'])
            print(f'[{i}/{len(rows)}] Importing tip {tip_number}: {row["title"]}')
            
            try:
                # Check if entry already exists
                existing = environment.entries().all({
                    'content_type': 'tip',
                    'fields.slug': row['slug'],
                    'limit': 1
                })
                
                if existing:
                    print(f'  ⚠️  Entry with slug "{row["slug"]}" already exists, skipping...')
                    results['skipped'] += 1
                    continue
                
                # Upload image if provided
                image_asset_id = None
                if row.get('imagePath') and row['imagePath'].strip():
                    image_asset_id = await upload_image(space, environment, row['imagePath'])
                
                # Convert body to Rich Text
                rich_text_body = text_to_rich_text(row['body'])
                
                # Create entry
                entry_data = {
                    'fields': {
                        'title': {'en-US': row['title']},
                        'slug': {'en-US': row['slug']},
                        'tipNumber': {'en-US': tip_number},
                        'body': {'en-US': rich_text_body}
                    }
                }
                
                if image_asset_id:
                    entry_data['fields']['image'] = {
                        'en-US': {
                            'sys': {
                                'type': 'Link',
                                'linkType': 'Asset',
                                'id': image_asset_id
                            }
                        }
                    }
                
                entry = environment.entries().create('tip', entry_data)
                
                # Publish entry
                entry.publish()
                
                print(f'  ✅ Created and published: {row["slug"]}')
                results['success'] += 1
                
                # Small delay to avoid rate limits
                time.sleep(0.5)
            except Exception as error:
                print(f'  ✗ Failed: {error}')
                results['failed'] += 1
        
        print('\n📊 Import Summary:')
        print(f'   ✅ Success: {results["success"]}')
        print(f'   ⚠️  Skipped: {results["skipped"]}')
        print(f'   ✗ Failed: {results["failed"]}')
        print('\n🎉 Import complete!')
        
    except Exception as error:
        print(f'❌ Import failed: {error}')
        if '401' in str(error):
            print('\nThe Management API token is invalid or expired.')
        elif '404' in str(error):
            print('\nContent type "tip" not found. Make sure it exists in your space.')
        sys.exit(1)

if __name__ == '__main__':
    import asyncio
    asyncio.run(import_to_contentful())

