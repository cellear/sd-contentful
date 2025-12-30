import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { Tip } from "@/lib/types/tip";
import styles from "./TipDetail.module.css";

interface TipDetailProps {
  tip: Tip;
}

/**
 * TipDetail component displays a single tip with title, optional image, and rich text body.
 * 
 * Uses Contentful's official rich text renderer to preserve all formatting
 * (headings, lists, links, etc.) from the WYSIWYG editor.
 * Uses CSS Modules for styling to match original Simplify Drupal site.
 */
export default function TipDetail({ tip }: TipDetailProps) {
  // Custom renderers for rich text content with CSS Module classes
  const options = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node: any, children: React.ReactNode) => (
        <p className={styles.paragraph}>{children}</p>
      ),
      [BLOCKS.HEADING_1]: (node: any, children: React.ReactNode) => (
        <h1 className={styles.heading1}>{children}</h1>
      ),
      [BLOCKS.HEADING_2]: (node: any, children: React.ReactNode) => (
        <h2 className={styles.heading2}>{children}</h2>
      ),
      [BLOCKS.HEADING_3]: (node: any, children: React.ReactNode) => (
        <h3 className={styles.heading3}>{children}</h3>
      ),
      [BLOCKS.UL_LIST]: (node: any, children: React.ReactNode) => (
        <ul className={styles.list}>{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (node: any, children: React.ReactNode) => (
        <ol className={styles.list}>{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (node: any, children: React.ReactNode) => (
        <li className={styles.listItem}>{children}</li>
      ),
      [INLINES.HYPERLINK]: (node: any, children: React.ReactNode) => (
        <a href={node.data.uri} className={styles.link}>{children}</a>
      ),
    },
  };

  return (
    <article className={styles.article}>
      <h1>{tip.title}</h1>
      {tip.imageUrl && (
        <div className={styles.imageContainer}>
          <img
            src={tip.imageUrl}
            alt={tip.title}
            className={styles.image}
          />
        </div>
      )}
      <div>
        {documentToReactComponents(tip.body, options)}
      </div>
    </article>
  );
}

