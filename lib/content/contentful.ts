import { createClient, ContentfulClientApi } from "contentful";

let _contentfulClient: ContentfulClientApi<any> | null = null;

/**
 * Gets or creates the Contentful client instance (lazy initialization).
 * 
 * Reads environment variables:
 * - CONTENTFUL_SPACE_ID: Your Contentful Space ID
 * - CONTENTFUL_ACCESS_TOKEN: Your Contentful Access Token
 * 
 * @throws Error if required environment variables are missing (at runtime)
 */
function getContentfulClient(): ContentfulClientApi<any> {
  if (_contentfulClient) {
    return _contentfulClient;
  }

  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

  if (!spaceId || !accessToken) {
    throw new Error(
      "CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN environment variables are required. " +
      "Please set them in your .env.local file or Vercel environment variables."
    );
  }

  // Debug: Log that we have credentials (but not the actual values)
  if (process.env.NODE_ENV === 'development') {
    console.log('Contentful client config:', {
      spaceId: spaceId ? `${spaceId.substring(0, 4)}...` : 'missing',
      accessToken: accessToken ? `${accessToken.substring(0, 4)}...` : 'missing',
    });
  }

  _contentfulClient = createClient({
    space: spaceId,
    accessToken: accessToken,
  });

  return _contentfulClient;
}

// Export proxy object that lazily initializes the client
// This allows the build to succeed even without env vars (they'll be set at runtime in Vercel)
export const contentfulClient = new Proxy({} as ContentfulClientApi<any>, {
  get(_target, prop) {
    const client = getContentfulClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
