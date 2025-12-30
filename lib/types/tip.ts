import { Document } from "@contentful/rich-text-types";

/**
 * Tip entity matching Contentful content model.
 * 
 * This is the canonical type definition for a Tip.
 * All adapter functions return this interface.
 */
export interface Tip {
  /** The title of the tip */
  title: string;
  
  /** URL-friendly slug (unique identifier) */
  slug: string;
  
  /** Sequential tip number (1-31) */
  tipNumber: number;
  
  /** Rich text content (Contentful Rich Text Document) */
  body: Document;
  
  /** Optional image URL (Contentful CDN URL) */
  imageUrl?: string;
}

