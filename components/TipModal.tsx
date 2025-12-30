"use client";

import React, { useEffect, useRef } from "react";
import { Tip } from "@/lib/types/tip";
import TipDetail from "./TipDetail";
import styles from "./TipModal.module.css";

interface TipModalProps {
  tip: Tip | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * TipModal component displays a tip in a modal overlay.
 * 
 * Closes on ESC key press, click outside, or close button click.
 * Matches the pop-up behavior from the original React app.
 */
export default function TipModal({ tip, isOpen, onClose }: TipModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Close on click outside modal content
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !tip) {
    return null;
  }

  return (
    <div
      className={styles.modalOverlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.modalContent} ref={modalRef}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <div className={styles.modalBody}>
          <TipDetail tip={tip} />
        </div>
      </div>
    </div>
  );
}

