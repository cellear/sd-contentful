"use client";

import Link from "next/link";
import { Tip } from "@/lib/types/tip";
import styles from "./TipList.module.css";

interface TipListProps {
  tips: Tip[];
}

/**
 * TipList component displays a grid of tip cards with images.
 * 
 * Each tip is displayed as a card with thumbnail image, tip number, title, and "read more" link.
 * Matches the original Simplify Drupal React app grid layout.
 * Uses CSS Modules for styling.
 */
export default function TipList({ tips }: TipListProps) {
  if (tips.length === 0) {
    return (
      <div>
        <p>No tips found. Make sure you have published at least one Tip entry in Contentful.</p>
      </div>
    );
  }

  /**
   * Generate thumbnail URL from Contentful image URL
   * Contentful supports image transformations via URL parameters
   * ?w=250&h=250&fit=fill crops to 250x250 square (matching Drupal's tips_view_250px style)
   */
  function getThumbnailUrl(imageUrl: string | undefined): string | undefined {
    if (!imageUrl) return undefined;
    // Contentful image URLs support transformations
    // Add ?w=250&h=250&fit=fill to crop to 250x250 square
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}w=250&h=250&fit=fill`;
  }

  return (
    <div className={styles.tipList}>
      <div className={styles.tipsGrid}>
        {tips.map((tip) => {
          const thumbnailUrl = getThumbnailUrl(tip.imageUrl);
          return (
            <Link
              key={tip.slug}
              href={`/${tip.slug}`}
              className={styles.tipCard}
            >
              {thumbnailUrl && (
                <img
                  className={styles.tipThumb}
                  alt={tip.title}
                  src={thumbnailUrl}
                  loading="lazy"
                />
              )}
              <h3>Tip {tip.tipNumber}</h3>
              <p>{tip.title}</p>
              <span className={styles.readMore}>Click to read more...</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

