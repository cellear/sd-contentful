# Pantheon Deployment Guide

This guide covers deploying the SD-Contentful Next.js application to Pantheon's Next.js hosting platform.

## ✅ Deployment Success Summary

**Status**: Successfully deployed and running!  
**Live Site**: https://dev-sd-contentful.pantheonsite.io/  
**Health Endpoint**: https://dev-sd-contentful.pantheonsite.io/api/health

### What Works
- ✅ Full Next.js App Router application running on Pantheon
- ✅ 28 tips successfully loaded from Contentful
- ✅ Server-Side Rendering (SSR) working correctly
- ✅ Environment variables configured and accessible
- ✅ Health check endpoint for monitoring
- ✅ Enhanced error diagnostics for troubleshooting

### Key Lessons Learned

1. **Cache Clearing is Essential**: After deploying new code or changing environment variables, use Pantheon's "Clear Cache" button. The cache can persist old errors even after fixes are deployed.

2. **Environment Variable Configuration**: Set `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN` in Pantheon's dashboard (exact location may vary - coordinate with Pantheon engineering team).

3. **Build Verification**: The app includes build version identifiers in error messages to help verify when fresh code is deployed vs. cached responses.

4. **Health Check Endpoint**: Visit `/api/health` to verify environment configuration and Contentful connectivity without triggering page caches.

5. **Platform Detection**: The app automatically detects it's running on Pantheon (though currently shows as "Unknown/Local" - Pantheon's Next.js environment may not expose standard environment variables yet).

### Deployment Timeline
- Initial deployment: Environment variable configuration issue (typo in Space ID)
- After fixing credentials: Caching issue prevented seeing fresh data
- After cache clearing: Full success with all 28 tips displaying correctly

## Prerequisites

- Access to Pantheon dashboard for your site
- Contentful Space ID and Access Token (same values used on Vercel)
- Pantheon site configured for Next.js (not traditional PHP/Drupal hosting)

## Required Environment Variables

The application requires two environment variables to connect to Contentful:

### `CONTENTFUL_SPACE_ID`
- **Description**: Your Contentful space identifier
- **Example**: `abc123xyz456`
- **Where to find it**: Contentful Dashboard → Settings → General Settings → Space ID

### `CONTENTFUL_ACCESS_TOKEN`
- **Description**: Content Delivery API access token
- **Example**: `abc123xyz456def789...`
- **Where to find it**: Contentful Dashboard → Settings → API keys → Content delivery / preview tokens
- **Important**: Use the Content Delivery API token, not the Content Management API token

## Configuration Steps

### Step 1: Gather Your Contentful Credentials

If you have the app working on Vercel, you can retrieve these values from:
- Vercel Dashboard → Your Project → Settings → Environment Variables

Or get them directly from Contentful:
1. Log in to [Contentful](https://app.contentful.com/)
2. Select your space
3. Go to Settings → API keys
4. Use an existing API key or create a new one
5. Copy the Space ID and Content Delivery API access token

### Step 2: Configure Pantheon Environment Variables

The exact steps may vary based on Pantheon's Next.js hosting interface. Generally:

1. **Log in to Pantheon Dashboard**
   - Navigate to your site

2. **Access Environment Variables Settings**
   - Look for: Site Settings → Environment Variables
   - Or: Build Configuration → Environment Variables
   - *Note: Ask your Pantheon contact for the exact location if unclear*

3. **Add the Environment Variables**
   
   Add both variables to **all environments** (dev, test, live):
   
   ```
   CONTENTFUL_SPACE_ID=your_space_id_here
   CONTENTFUL_ACCESS_TOKEN=your_access_token_here
   ```

4. **Save and Trigger Rebuild**
   - After adding variables, trigger a rebuild/redeploy
   - Environment variables are typically only loaded during build time

### Step 3: Verify Configuration

After deployment, use the health check endpoint to verify everything is configured correctly:

1. **Visit the Health Endpoint**
   ```
   https://your-site.pantheonsite.io/api/health
   ```

2. **Check the Response**
   
   A healthy response looks like:
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-01-10T...",
     "environment": "production",
     "platform": "Pantheon",
     "environmentVariables": {
       "CONTENTFUL_SPACE_ID": {
         "present": true,
         "value": "abc1..."
       },
       "CONTENTFUL_ACCESS_TOKEN": {
         "present": true,
         "value": "xyz7..."
       }
     },
     "contentful": {
       "connected": true,
       "error": null,
       "tipCount": 31
     },
     "recommendations": []
   }
   ```

3. **Troubleshoot if Unhealthy**
   
   If status is "unhealthy", check the `recommendations` array for specific issues:
   - Missing environment variables
   - Invalid credentials
   - Network connectivity issues

### Step 4: Test the Application

1. **Homepage**: Visit your site root to see the tips list
2. **Tip Detail**: Click on a tip to view its detail page
3. **Images**: Verify images are loading correctly

## Troubleshooting

### Error: "Missing required Contentful environment variables"

**Symptom**: Health check shows environment variables are not present

**Solutions**:
1. Verify variables are set in Pantheon dashboard
2. Check that variables are set for the correct environment (dev/test/live)
3. Trigger a rebuild after adding variables
4. Verify variable names are exactly: `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN`

### Error: "Authentication Failed (401)"

**Symptom**: Environment variables are present but connection fails with 401

**Solutions**:
1. Verify the access token is correct (copy from Contentful again)
2. Ensure you're using Content **Delivery** API token, not Management API token
3. Check that the token hasn't been revoked or regenerated in Contentful
4. Verify the Space ID matches the space containing the token

### Error: "Space/Content Not Found (404)"

**Symptom**: Connection fails with 404 error

**Solutions**:
1. Verify the Space ID is correct
2. Check that the access token has permission to access this space
3. Ensure the "tip" content type exists in your Contentful space

### Error: "Network Error"

**Symptom**: Connection timeout or network failure

**Solutions**:
1. Check Pantheon's network/firewall settings
2. Verify Pantheon environment can reach `cdn.contentful.com`
3. Contact Pantheon support if network connectivity is restricted
4. Check Contentful status at [status.contentful.com](https://status.contentful.com)

### Error Messages in Browser Console

**Enhanced Diagnostics**: The application now includes detailed error logging:

1. **Check Browser Console**: Open DevTools → Console tab
2. **Look for Detailed Error Messages**: Errors now include:
   - Error type (Authentication Failed, Network Error, etc.)
   - HTTP status codes
   - Timestamp and environment
   - Specific recommendations

Example error message:
```
Failed to fetch tips from Contentful API. Error: Authentication Failed (401). 
Message: Unauthorized. Please check: 1) CONTENTFUL_SPACE_ID is set correctly, 
2) CONTENTFUL_ACCESS_TOKEN is valid and has proper permissions, 
3) Network connectivity to Contentful servers. 
Timestamp: 2026-01-10T12:34:56.789Z, Environment: production
```

### Server-Side Logs

If browser doesn't show helpful errors, check Pantheon's server logs:

1. **Access Pantheon Logs**: Dashboard → Your Site → Logs
2. **Look for Console Output**: Enhanced diagnostics log to server console
3. **Search for**: "Contentful API Error" or "Missing Contentful Environment Variables"

## Differences: Pantheon vs. Vercel

### Environment Variables
- **Vercel**: Set in Project Settings → Environment Variables
- **Pantheon**: Set in Site Dashboard (location may vary)
- **Both**: Variables are read at build time and runtime

### Platform Detection
The application automatically detects the platform:
- Vercel: `process.env.VERCEL` is set
- Pantheon: `process.env.PANTHEON_ENVIRONMENT` is set
- Check `/api/health` to see detected platform

### Build Process
- **Vercel**: Automatic deploys from Git, instant rollbacks
- **Pantheon**: May require manual build triggers, contact Pantheon team for workflow

### Custom Domains
- **Vercel**: Easy custom domain setup in dashboard
- **Pantheon**: Follow Pantheon's domain configuration process

## Health Check Endpoint Reference

### URL
```
GET /api/health
```

### Response Fields

- `status`: "healthy" or "unhealthy"
- `timestamp`: ISO 8601 timestamp
- `environment`: Node.js environment (production, development)
- `platform`: Detected hosting platform (Vercel, Pantheon, Unknown/Local)
- `platformDetails`: Specific platform environment variables
- `environmentVariables`: Status of required Contentful env vars
- `contentful`: Connection test results
- `recommendations`: Array of suggested fixes (if unhealthy)

### HTTP Status Codes
- `200`: Everything is healthy
- `503`: Service unavailable (configuration issue)

## Getting Help

### Pantheon Support
If you encounter Pantheon-specific issues:
- Contact your Pantheon engineering resources
- Provide the `/api/health` endpoint response
- Share relevant server logs from Pantheon dashboard

### Contentful Issues
If Contentful connection fails:
- Verify credentials in Contentful dashboard
- Check [status.contentful.com](https://status.contentful.com)
- Test the same credentials in a local development environment

### Application Issues
If the app itself has bugs:
- Check the GitHub repository
- Review recent changes
- Test locally with `npm run dev`

## Maintenance

### Updating Environment Variables
If you need to change credentials:
1. Update variables in Pantheon dashboard
2. Trigger a rebuild
3. Verify with `/api/health` endpoint

### Monitoring
Consider setting up monitoring for:
- `/api/health` endpoint (should return 200)
- Homepage response time
- Contentful API rate limits

## Additional Resources

- [Pantheon Next.js Documentation](https://docs.pantheon.io/) - Check for Next.js specific guides
- [Contentful Documentation](https://www.contentful.com/developers/docs/)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Deployment](../README.md#deployment) - For comparison and reference

## Quick Reference

### Required Setup Checklist
- [ ] Set `CONTENTFUL_SPACE_ID` in Pantheon
- [ ] Set `CONTENTFUL_ACCESS_TOKEN` in Pantheon  
- [ ] Trigger rebuild after adding variables
- [ ] Visit `/api/health` to verify configuration
- [ ] Test homepage loads with tips list
- [ ] Test tip detail pages work
- [ ] Verify images display correctly

### Quick Diagnosis
1. Visit: `https://your-site.pantheonsite.io/api/health`
2. If unhealthy, follow recommendations in response
3. Check browser console for detailed error messages
4. Review Pantheon server logs if needed

