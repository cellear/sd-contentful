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

  // Enhanced diagnostics for missing environment variables
  const missingVars: string[] = [];
  if (!spaceId) missingVars.push('CONTENTFUL_SPACE_ID');
  if (!accessToken) missingVars.push('CONTENTFUL_ACCESS_TOKEN');

  if (missingVars.length > 0) {
    const timestamp = new Date().toISOString();
    const env = process.env.NODE_ENV || 'unknown';
    const platform = process.env.VERCEL ? 'Vercel' : 
                     process.env.PANTHEON_ENVIRONMENT ? 'Pantheon' : 
                     'Unknown';
    
    // Log detailed diagnostic information
    console.error('=== Missing Contentful Environment Variables ===');
    console.error('Timestamp:', timestamp);
    console.error('Environment:', env);
    console.error('Platform:', platform);
    console.error('Missing Variables:', missingVars.join(', '));
    console.error('CONTENTFUL_SPACE_ID present:', !!spaceId);
    console.error('CONTENTFUL_ACCESS_TOKEN present:', !!accessToken);
    console.error('===============================================');
    
    throw new Error(
      `Missing required Contentful environment variables: ${missingVars.join(', ')}. ` +
      `Please set them in your deployment platform's environment configuration. ` +
      `For local development, use .env.local file. ` +
      `For Vercel: Set in Project Settings > Environment Variables. ` +
      `For Pantheon: Set in Site Dashboard > Environment Variables. ` +
      `Platform detected: ${platform}, Environment: ${env}, Timestamp: ${timestamp}`
    );
  }

  // Log successful configuration (but not the actual values)
  console.log('Contentful client initialized:', {
    spaceId: spaceId ? `${spaceId.substring(0, 4)}...` : 'missing',
    accessToken: accessToken ? `${accessToken.substring(0, 4)}...` : 'missing',
    platform: process.env.VERCEL ? 'Vercel' : 
              process.env.PANTHEON_ENVIRONMENT ? 'Pantheon' : 
              'Unknown',
    environment: process.env.NODE_ENV || 'unknown',
  });

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
