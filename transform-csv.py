#!/usr/bin/env python3

"""
Transform Drupal export CSV to Contentful import format

Adds missing columns: slug, tipNumber
Maps image paths to actual file locations
Standardizes column names
"""

import csv
import re
import os
from pathlib import Path
from urllib.parse import unquote
from html import unescape

# Configuration
INPUT_CSV = Path(__file__).parent / 'export.csv'
OUTPUT_CSV = Path(__file__).parent / 'contentful-import.csv'
HTML_FILE = Path(__file__).parent / 'sd.html'
IMAGE_BASE_PATHS = [
    Path(__file__).parent / 'legacy-reference/files/2024-01',
    Path(__file__).parent / 'legacy-reference/files/2024-02',
    Path(__file__).parent / 'legacy-reference/files/2024-05',
]

def extract_slugs_from_html():
    """Extract slug-to-title mapping from HTML file"""
    if not HTML_FILE.exists():
        return {}
    
    with open(HTML_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern: match tip links with their titles
    pattern = r'<div class="views-view-responsive-grid__item">.*?<a href="/([^"]+)".*?<h6 class="box-date[^"]*">Jan (\d+)</h6>.*?<h5 class="box-caption">([^<]+)</h5>'
    matches = re.findall(pattern, content, re.DOTALL)
    
    slug_map = {}
    for slug, day, title in matches:
        # Decode HTML entities and normalize
        clean_title = unescape(title.strip())
        # Remove extra whitespace
        clean_title = re.sub(r'\s+', ' ', clean_title)
        slug_map[clean_title] = slug
    
    return slug_map

def title_to_slug(title, slug_map):
    """Get slug from HTML if available, otherwise generate from title"""
    # Try exact match first
    if title in slug_map:
        return slug_map[title]
    
    # Try normalized match (remove quotes, etc.)
    normalized = re.sub(r'["\']', '', title).strip()
    if normalized in slug_map:
        return slug_map[normalized]
    
    # Try partial match (first 30 chars)
    title_start = title[:30].strip()
    for html_title, slug in slug_map.items():
        if html_title.startswith(title_start) or title_start in html_title:
            return slug
    
    # Fallback: generate slug from title
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = re.sub(r'^-+|-+$', '', slug)
    return slug

def extract_image_filename(drupal_path):
    """Extract filename from Drupal path and map to actual file location"""
    if not drupal_path or not drupal_path.strip():
        return ''
    
    # URL-decode the path to handle encoded characters like %C2%B7 (middle dot)
    decoded_path = unquote(drupal_path.strip())
    
    # Extract directory and filename from path
    # Example: /sites/default/files/2024-01/image.png -> (2024-01, image.png)
    path_parts = decoded_path.split('/')
    filename = path_parts[-1] if path_parts else ''
    
    # Determine which directory based on path
    dir_name = None
    if '2024-01' in decoded_path:
        dir_name = '2024-01'
    elif '2024-02' in decoded_path:
        dir_name = '2024-02'
    elif '2024-05' in decoded_path:
        dir_name = '2024-05'
    else:
        # Default to 2024-01 if not specified
        dir_name = '2024-01'
    
    # Try to find the file in the appropriate directory
    image_base = Path(__file__).parent / 'legacy-reference/files' / dir_name
    
    # Check exact filename match
    full_path = image_base / filename
    if full_path.exists():
        return f'legacy-reference/files/{dir_name}/{filename}'
    
    # Try alternative extensions
    base_name = os.path.splitext(filename)[0]
    for ext in ['.png', '.jpg', '.jpeg', '.gif']:
        alt_path = image_base / f'{base_name}{ext}'
        if alt_path.exists():
            return f'legacy-reference/files/{dir_name}/{base_name}{ext}'
    
    # Try fuzzy matching - remove URL-encoded characters and search
    clean_base = re.sub(r'[^\w-]', '', base_name)
    for file in image_base.glob(f'{clean_base}*'):
        if file.is_file():
            return f'legacy-reference/files/{dir_name}/{file.name}'
    
    print(f'Warning: Image not found for path: {drupal_path}', file=os.sys.stderr)
    return ''

def escape_csv(value):
    """Escape CSV value properly"""
    if not value:
        return '""'
    value_str = str(value)
    # Escape quotes
    escaped = value_str.replace('"', '""')
    # Wrap in quotes if contains comma, quote, or newline
    if ',' in escaped or '"' in value_str or '\n' in escaped:
        return f'"{escaped}"'
    return escaped

def transform_csv():
    """Read and transform CSV"""
    # Extract slugs from HTML first
    slug_map = extract_slugs_from_html()
    print(f'Extracted {len(slug_map)} slugs from HTML')
    
    rows = []
    
    with open(INPUT_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader):
            title = row.get('title', row.get('Title', '')).strip()
            body = row.get('Body', row.get('body', '')).strip()
            image_url = row.get('Image-url', row.get('image-url', row.get('Image-URL', ''))).strip()
            
            # Get slug from HTML mapping or generate from title
            slug = title_to_slug(title, slug_map)
            
            # Extract tip number from slug (e.g., "01-prioritize-simplicity" -> 1)
            # or from title, or use row number
            slug_number_match = re.search(r'^(\d+)', slug)
            title_number_match = re.search(r'\d+', title)
            if slug_number_match:
                tip_number = int(slug_number_match.group(1))
            elif title_number_match:
                tip_number = int(title_number_match.group())
            else:
                tip_number = idx + 1
            
            # Map image path
            image_path = extract_image_filename(image_url)
            
            rows.append({
                'title': title,
                'slug': slug,
                'tipNumber': tip_number,
                'body': body,
                'imagePath': image_path
            })
    
    # Sort by tipNumber
    rows.sort(key=lambda x: x['tipNumber'])
    
    # Write output CSV
    headers = ['title', 'slug', 'tipNumber', 'body', 'imagePath']
    with open(OUTPUT_CSV, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f'✅ Transformed {len(rows)} tips')
    print(f'📄 Output written to: {OUTPUT_CSV}')
    print(f'\n📊 Summary:')
    print(f'   - Tips with images: {sum(1 for r in rows if r["imagePath"])}')
    print(f'   - Tips without images: {sum(1 for r in rows if not r["imagePath"])}')
    tip_numbers = [r['tipNumber'] for r in rows]
    print(f'   - Tip numbers range: {min(tip_numbers)} - {max(tip_numbers)}')
    
    return rows

if __name__ == '__main__':
    transform_csv()

