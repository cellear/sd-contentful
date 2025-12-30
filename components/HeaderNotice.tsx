import React from 'react';
import styles from './HeaderNotice.module.css';

/**
 * HeaderNotice component displays demo/experiment notice in upper right corner.
 * 
 * This is the most important information on the page - clearly indicates
 * this is a demo/experiment, not a replacement for the current site.
 */
export default function HeaderNotice() {
  return (
    <div className={styles.notice}>
      <div className={styles.content}>
        <p className={styles.text}>
          <strong>SD-CONTENTFUL</strong> - A technology demonstration exploring Contentful+Next.js as an alternative to Drupal. 
          This is a <strong>demo/experiment</strong>, not intended to replace the current Simplify Drupal site. 
          Built with <a href="https://github.com/Priivacy-ai/spec-kitty" target="_blank" rel="noopener noreferrer">Spec Kitty</a>.
        </p>
        <p className={styles.link}>
          <a href="https://github.com/cellear/sd-contentful" target="_blank" rel="noopener noreferrer">
            View source on GitHub →
          </a>
        </p>
      </div>
    </div>
  );
}

