import { notFound } from "next/navigation";
import { getTipBySlug } from "@/lib/content/tips";
import TipDetail from "@/components/TipDetail";
import ErrorMessage from "@/components/ErrorMessage";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Tip detail page - displays a single tip by slug.
 * 
 * Uses Server-Side Rendering (SSR) to fetch tip from Contentful via adapter.
 * Shows 404 page if tip not found, or error message if adapter fails.
 */
export default async function TipDetailPage({ params }: PageProps) {
  // In Next.js 16+, params is a Promise and must be awaited
  const { slug } = await params;
  
  let tip;
  let error;

  try {
    tip = await getTipBySlug(slug);
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  // Handle adapter errors
  if (error) {
    return (
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
        <ErrorMessage message={error} />
      </main>
    );
  }

  // Handle tip not found (404)
  if (!tip) {
    notFound();
  }

  // Render tip detail
  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <TipDetail tip={tip} />
    </main>
  );
}

