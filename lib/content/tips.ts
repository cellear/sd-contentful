import { Entry } from "contentful";
import { Document } from "@contentful/rich-text-types";
import { contentfulClient } from "./contentful";
import { Tip } from "@/lib/types/tip";

/**
 * Contentful entry structure for Tip content type.
 * This matches what Contentful returns from the API.
 */
interface ContentfulTipFields {
  title?: string;
  slug?: string;
  tipNumber?: number;
  body?: Document;
  image?: {
    sys: {
      id: string;
      type: string;
      linkType: string;
    };
    fields?: {
      file?: {
        url?: string;
        fileName?: string;
        contentType?: string;
        details?: {
          size?: number;
          image?: {
            width?: number;
            height?: number;
          };
        };
      };
      title?: string;
      description?: string;
    };
  };
}

/**
 * Extracts image URL from Contentful asset reference.
 * Contentful assets can be linked (just sys.id) or included (with fields).
 * Also handles assets from the includes array.
 * 
 * @param image - Contentful asset reference
 * @param includes - Contentful response includes (for resolving linked assets)
 * @returns Image URL or undefined if not available
 */
function extractImageUrl(
  image: ContentfulTipFields['image'],
  includes?: { Asset?: Array<{ sys: { id: string }; fields?: { file?: { url?: string } } }> }
): string | undefined {
  if (!image) {
    return undefined;
  }

  // If asset is included (has fields), extract URL directly
  if (image.fields?.file?.url) {
    // Contentful URLs are relative, need to prepend https:
    const url = image.fields.file.url;
    return url.startsWith('//') ? `https:${url}` : url.startsWith('http') ? url : `https:${url}`;
  }

  // If asset is just a link (sys.id only), try to resolve from includes
  if (image.sys?.id && includes?.Asset) {
    const asset = includes.Asset.find((a) => a.sys.id === image.sys.id);
    if (asset?.fields?.file?.url) {
      const url = asset.fields.file.url;
      return url.startsWith('//') ? `https:${url}` : url.startsWith('http') ? url : `https:${url}`;
    }
  }

  return undefined;
}

/**
 * Transforms a Contentful entry to our Tip interface.
 * Filters out entries with missing required fields.
 * 
 * @param entry - Contentful entry object
 * @param includes - Contentful response includes (for resolving linked assets)
 * @returns Tip object or null if entry is invalid
 */
function transformEntryToTip(entry: Entry<any>, includes?: any): Tip | null {
  const fields = entry.fields as ContentfulTipFields;

  // Debug: Log available fields in development
  if (process.env.NODE_ENV === 'development' && !fields.image) {
    console.log('Available fields:', Object.keys(fields));
    console.log('Image field value:', fields.image);
  }

  // Validate all required fields are present
  if (
    !fields.title ||
    !fields.slug ||
    typeof fields.tipNumber !== "number" ||
    !fields.body
  ) {
    // Silently filter out invalid tips (per contract)
    return null;
  }

  return {
    title: fields.title,
    slug: fields.slug,
    tipNumber: fields.tipNumber,
    body: fields.body,
    imageUrl: extractImageUrl(fields.image, includes),
  };
}

/**
 * Retrieves all tips ordered by tipNumber in ascending order.
 * 
 * @returns Promise resolving to array of Tip objects
 * @throws Error with simple message if Contentful API unavailable
 */
export async function getAllTips(): Promise<Tip[]> {
  try {
    const response = await contentfulClient.getEntries<any>({
      content_type: "tip",
      include: 2, // Include linked assets (images) in the response
    });

    // Transform entries to Tip objects and filter out invalid ones
    const tips = response.items
      .map((entry) => transformEntryToTip(entry, response.includes))
      .filter((tip: Tip | null): tip is Tip => tip !== null);

    // Sort by tipNumber ascending (numeric sort)
    tips.sort((a: Tip, b: Tip) => a.tipNumber - b.tipNumber);

    return tips;
  } catch (error) {
    // Log actual error for debugging (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.error('Contentful API error:', error);
    }
    // Simple error handling per constitution
    throw new Error("Contentful is down!");
  }
}

/**
 * Retrieves a single tip by its slug.
 * 
 * @param slug - The URL-safe slug identifier (e.g., "03-site-builder")
 * @returns Promise resolving to Tip object or null if not found
 * @throws Error with simple message if Contentful API unavailable
 */
export async function getTipBySlug(slug: string): Promise<Tip | null> {
  try {
    const response = await contentfulClient.getEntries<any>({
      content_type: "tip",
      "fields.slug": slug,
      limit: 1,
      include: 2, // Include linked assets (images) in the response
    });

    if (response.items.length === 0) {
      return null;
    }

    // Transform entry to Tip, return null if invalid
    return transformEntryToTip(response.items[0], response.includes);
  } catch (error) {
    // Simple error handling per constitution
    throw new Error("Contentful is down!");
  }
}

