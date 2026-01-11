import { getAllTips } from "@/lib/content/tips";
import TipList from "@/components/TipList";

/**
 * Home page - displays list of all tips ordered by tipNumber.
 * 
 * Uses Server-Side Rendering (SSR) to fetch tips from Contentful
 * via the adapter layer. Handles errors gracefully with simple messages.
 */

// Force dynamic rendering and disable all caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BUILD_VERSION = "2.1"; // Increment this to verify fresh builds

export default async function Home() {
  let tips;
  let error;

  try {
    tips = await getAllTips();
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h1>Simplify Drupal</h1>
      {error ? (
        <div>
          <p>Error (Build v{BUILD_VERSION}): {error}</p>
          <p style={{ fontSize: "0.8em", color: "#666", marginTop: "1rem" }}>
            Build version: {BUILD_VERSION} | Generated: {new Date().toISOString()}
          </p>
        </div>
      ) : (
        <TipList tips={tips || []} />
      )}
    </main>
  );
}

