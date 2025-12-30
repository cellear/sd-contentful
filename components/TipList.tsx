"use client";

import { useState } from "react";
import { Tip } from "@/lib/types/tip";
import TipModal from "./TipModal";
import styles from "./TipList.module.css";

interface TipListProps {
  tips: Tip[];
}

/**
 * TipList component displays a grid of tip cards with images.
 * 
 * Each tip is displayed as a card with thumbnail image, tip number, title, and "read more" link.
 * Clicking a card opens a modal with the full tip content (matching React app behavior).
 * Uses CSS Modules for styling.
 */
export default function TipList({ tips }: TipListProps) {
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  /**
   * Handle tip card click - open modal with tip content
   */
  const handleTipClick = (tip: Tip) => {
    setSelectedTip(tip);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTip(null);
  };

  return (
    <>
      <div className={styles.tipList}>
        <div className={styles.tipsGrid}>
          {tips.map((tip) => {
            const thumbnailUrl = getThumbnailUrl(tip.imageUrl);
            return (
              <button
                key={tip.slug}
                onClick={() => handleTipClick(tip)}
                className={styles.tipCard}
                aria-label={`View tip ${tip.tipNumber}: ${tip.title}`}
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
              </button>
            );
          })}
        </div>
      </div>
      <TipModal
        tip={selectedTip}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}

