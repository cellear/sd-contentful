import React from 'react';
import styles from './Footer.module.css';

/**
 * Footer component with project description and GitHub link.
 * 
 * Appears on all pages to provide context about the demo/experiment nature
 * of this project and link back to the source code.
 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <p className={styles.description}>
          <strong>SD-CONTENTFUL</strong> - A technology demonstration exploring Contentful+Next.js as an alternative to Drupal. 
          This is a <strong>demo/experiment</strong>, not intended to replace the current Simplify Drupal site.
        </p>
        <p className={styles.link}>
          <a href="https://github.com/cellear/sd-contentful" target="_blank" rel="noopener noreferrer">
            View source code on GitHub →
          </a>
        </p>
      </div>
    </footer>
  );
}

