import { NextResponse } from 'next/server';
import { contentfulClient } from '@/lib/content/contentful';

/**
 * Health check endpoint for diagnosing Contentful configuration.
 * 
 * This endpoint verifies:
 * 1. Environment variables are set
 * 2. Contentful API connection works
 * 3. Current environment details
 * 
 * Usage: GET /api/health
 * Returns: JSON object with diagnostic information
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  const env = process.env.NODE_ENV || 'unknown';
  
  // Detect platform
  const platform = process.env.VERCEL ? 'Vercel' :
                   process.env.PANTHEON_ENVIRONMENT ? 'Pantheon' :
                   'Unknown/Local';
  
  // Check environment variables
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;
  
  const envVarsStatus = {
    CONTENTFUL_SPACE_ID: {
      present: !!spaceId,
      value: spaceId ? `${spaceId.substring(0, 4)}...` : 'NOT SET',
    },
    CONTENTFUL_ACCESS_TOKEN: {
      present: !!accessToken,
      value: accessToken ? `${accessToken.substring(0, 4)}...` : 'NOT SET',
    },
  };
  
  // Test Contentful API connection
  let contentfulStatus = {
    connected: false,
    error: null as string | null,
    tipCount: null as number | null,
  };
  
  try {
    const response = await contentfulClient.getEntries({
      content_type: 'tip',
      limit: 1,
    });
    
    contentfulStatus.connected = true;
    contentfulStatus.tipCount = response.total;
  } catch (error) {
    contentfulStatus.connected = false;
    contentfulStatus.error = error instanceof Error ? error.message : 'Unknown error';
  }
  
  // Determine overall health status
  const isHealthy = envVarsStatus.CONTENTFUL_SPACE_ID.present && 
                    envVarsStatus.CONTENTFUL_ACCESS_TOKEN.present &&
                    contentfulStatus.connected;
  
  const response = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp,
    environment: env,
    platform,
    platformDetails: {
      vercel: !!process.env.VERCEL,
      pantheon: !!process.env.PANTHEON_ENVIRONMENT,
      pantheonEnv: process.env.PANTHEON_ENVIRONMENT || null,
    },
    environmentVariables: envVarsStatus,
    contentful: contentfulStatus,
    recommendations: [] as string[],
  };
  
  // Add recommendations if there are issues
  if (!envVarsStatus.CONTENTFUL_SPACE_ID.present) {
    response.recommendations.push('Set CONTENTFUL_SPACE_ID environment variable');
  }
  if (!envVarsStatus.CONTENTFUL_ACCESS_TOKEN.present) {
    response.recommendations.push('Set CONTENTFUL_ACCESS_TOKEN environment variable');
  }
  if (!contentfulStatus.connected && envVarsStatus.CONTENTFUL_SPACE_ID.present && envVarsStatus.CONTENTFUL_ACCESS_TOKEN.present) {
    response.recommendations.push('Check that credentials are valid and have proper permissions');
    response.recommendations.push('Verify network connectivity to Contentful API (cdn.contentful.com)');
  }
  
  return NextResponse.json(response, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

