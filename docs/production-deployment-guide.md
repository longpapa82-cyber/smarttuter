# SmartTuter Production Deployment Guide

**Version**: 1.0
**Last Updated**: 2025-10-31
**Status**: Production Ready ✅

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Vercel Deployment](#vercel-deployment)
4. [Redis Setup (Upstash)](#redis-setup-upstash)
5. [Sentry Configuration](#sentry-configuration)
6. [Domain Configuration](#domain-configuration)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Monitoring Setup](#monitoring-setup)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

---

## Prerequisites

### Required Accounts
- ✅ GitHub account (for code hosting)
- ✅ Vercel account (for deployment)
- ✅ Upstash account (for Redis)
- ✅ Sentry account (for monitoring)
- ✅ Google Cloud account (for Gemini API)
- ⚠️ Anthropic account (optional, for Claude API)

### Required Tools
```bash
# Node.js 18+ and npm
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 9.0.0 or higher

# Git
git --version

# Vercel CLI (optional but recommended)
npm install -g vercel
```

### Cost Overview
- **Free Tier Usage** (current setup):
  - Vercel Hobby: $0/month (100GB bandwidth, 6K edge functions/day)
  - Upstash Redis: $0/month (10K commands/day, 256MB storage)
  - Sentry Developer: $0/month (5K errors/month)
  - Gemini API: Free tier available
  - **Total: $0/month** for small-medium scale

- **Paid Tier** (if needed):
  - Vercel Pro: $20/month (1TB bandwidth, 1M edge functions)
  - Upstash Pay-as-you-go: ~$5-15/month
  - Sentry Team: $26/month (50K errors/month)
  - **Estimated: $50-60/month** for production scale

---

## Environment Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/smartTuter.git
cd smartTuter

# Install dependencies
npm install

# Verify build
npm run build
```

### 2. Environment Variables

Create `.env.local` file in project root:

```bash
# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here  # Optional

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here

# Sentry
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=your-sentry-project
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# App Configuration
NEXT_PUBLIC_APP_URL=https://smarttuter.vercel.app
NODE_ENV=production
```

### 3. Get API Keys

#### Gemini API (Google)
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key to `GEMINI_API_KEY`

#### Anthropic API (Optional)
1. Go to https://console.anthropic.com/
2. Navigate to "API Keys"
3. Create new key
4. Copy to `ANTHROPIC_API_KEY`

---

## Vercel Deployment

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**
   ```
   1. Go to https://vercel.com/new
   2. Click "Import Git Repository"
   3. Select your smartTuter repository
   4. Click "Import"
   ```

2. **Configure Project**
   ```
   Project Name: smarttuter
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Add Environment Variables**
   ```
   Go to Project Settings → Environment Variables
   Add all variables from .env.local:

   Production  → GEMINI_API_KEY
   Production  → UPSTASH_REDIS_REST_URL
   Production  → UPSTASH_REDIS_REST_TOKEN
   Production  → SENTRY_DSN
   Production  → SENTRY_ORG
   Production  → SENTRY_PROJECT
   Production  → SENTRY_AUTH_TOKEN
   Production  → NEXT_PUBLIC_APP_URL
   ```

4. **Deploy**
   ```
   Click "Deploy"
   Wait for build to complete (~2-3 minutes)
   Your app will be live at: https://smarttuter.vercel.app
   ```

### Method 2: Deploy via Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Set environment variables
vercel env add GEMINI_API_KEY production
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
vercel env add SENTRY_DSN production
# ... (add all other variables)

# Trigger new deployment with env vars
vercel --prod
```

### Staging Environment

```bash
# Create staging branch
git checkout -b staging
git push origin staging

# Vercel will auto-deploy staging to:
# https://smarttuter-staging-{hash}.vercel.app

# Configure staging-specific env vars
vercel env add GEMINI_API_KEY preview
vercel env add UPSTASH_REDIS_REST_URL preview
# ... (add all variables for preview)
```

---

## Redis Setup (Upstash)

### 1. Create Database

1. Go to https://console.upstash.com/
2. Click "Create Database"
3. Configure:
   ```
   Name: smarttuter-prod
   Type: Regional
   Region: Asia Pacific (Seoul) - or closest to your users
   TLS: Enabled
   Eviction: No eviction
   ```
4. Click "Create"

### 2. Get Connection Details

```
1. Click on your database
2. Copy "REST URL" → UPSTASH_REDIS_REST_URL
3. Copy "REST Token" → UPSTASH_REDIS_REST_TOKEN
4. Add to Vercel environment variables
```

### 3. Verify Connection

```bash
# Test Redis connection locally
curl -X POST \
  -H "Authorization: Bearer YOUR_REDIS_TOKEN" \
  YOUR_REDIS_URL/ping

# Expected response: {"result":"PONG"}
```

### 4. Configure TTL Strategy

Redis is configured in [lib/cache/redis.ts](../lib/cache/redis.ts):
```typescript
// Default TTLs
tutor_responses: 3600s (1 hour)
progress_summary: 3600s (1 hour)
weaknesses: 21600s (6 hours)
concept_mastery: No expiry (permanent)
```

---

## Sentry Configuration

### 1. Create Project

1. Go to https://sentry.io/
2. Click "Create Project"
3. Select "Next.js"
4. Name: "smarttuter"
5. Copy the DSN

### 2. Configure Alerts

**In Sentry Dashboard**:
```
Settings → Alerts → New Alert Rule

1. Error Rate Alert
   - When: Error count is more than 100 in 1 hour
   - Then: Send notification to email + Slack

2. Performance Alert
   - When: P95 response time is above 3000ms
   - Then: Send notification to email

3. Critical Error Alert
   - When: Event level is "error" or "fatal"
   - Then: Send notification immediately
```

### 3. Source Maps Upload

Already configured in `next.config.ts`:
```typescript
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  automaticVercelMonitors: true,
})
```

Source maps upload automatically on deployment.

---

## Domain Configuration

### Using Vercel Domain

Your app is automatically available at:
```
https://smarttuter.vercel.app
```

### Custom Domain (Optional)

1. **Purchase Domain** (e.g., smarttuter.com)

2. **Add to Vercel**:
   ```
   Project Settings → Domains
   Add Domain: smarttuter.com
   ```

3. **Configure DNS**:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.21.21
   ```

4. **Wait for SSL** (~5-10 minutes)

---

## Post-Deployment Verification

### 1. Health Check

```bash
# Check application health
curl https://smarttuter.vercel.app/api/health | jq

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-10-31T...",
  "version": "8dec6e3",
  "environment": "production",
  "checks": {
    "redis": { "status": "ok", "latency": 15 },
    "environment": { "status": "ok" },
    "apiKeys": { "status": "ok" }
  }
}
```

### 2. Service Worker

```bash
# Visit in browser
https://smarttuter.vercel.app

# Open DevTools → Application → Service Workers
# Should see: Status: activated and running
```

### 3. Monitoring Dashboard

```bash
# Access monitoring dashboard
https://smarttuter.vercel.app/monitoring

# Should display:
- Health status: Healthy
- API metrics
- Cache performance
- Learning events
```

### 4. Core Functionality

Test each feature:
- ✅ Homepage loads
- ✅ Onboarding flow works
- ✅ Math tutor responds
- ✅ English tutor responds
- ✅ Dashboard displays data
- ✅ Progress tracking updates
- ✅ Offline mode works (disable network in DevTools)

### 5. PWA Installation

**Desktop**:
1. Visit site in Chrome
2. Click install icon in address bar
3. Confirm installation
4. App opens in standalone window

**Mobile**:
1. Visit site in browser
2. Add to Home Screen
3. App icon appears
4. Opens as native app

---

## Monitoring Setup

### 1. GitHub Actions

Health checks run automatically:
- Every 15 minutes
- After each deployment
- Manual trigger available

View status:
```
https://github.com/YOUR_USERNAME/smartTuter/actions
```

### 2. Vercel Analytics

Enable in Vercel Dashboard:
```
Project Settings → Analytics → Enable

Tracks:
- Page views
- Unique visitors
- Core Web Vitals
- Geographic distribution
```

### 3. Sentry Dashboard

Monitor errors:
```
https://sentry.io/organizations/YOUR_ORG/issues/

View:
- Real-time errors
- Performance metrics
- Release tracking
- User feedback
```

### 4. Custom Metrics

Access real-time metrics:
```
Dashboard: https://smarttuter.vercel.app/monitoring

Metrics tracked:
- API latency (avg, P95, P99)
- Cache hit rate
- Learning events
- Error rates
- User activity
```

---

## Troubleshooting

### Build Failures

**Issue**: Type errors during build
```bash
# Fix
npm run build  # Test locally first
npx tsc --noEmit  # Check types

# Common fixes
- Update type definitions
- Fix import paths
- Resolve lint errors
```

**Issue**: Environment variables not found
```bash
# Verify in Vercel Dashboard
Settings → Environment Variables

# Redeploy
vercel --prod
```

### Runtime Errors

**Issue**: 500 errors on API routes
```bash
# Check Vercel logs
vercel logs https://smarttuter.vercel.app --follow

# Check Sentry
https://sentry.io/organizations/YOUR_ORG/issues/

# Check health endpoint
curl https://smarttuter.vercel.app/api/health
```

**Issue**: Redis connection timeout
```bash
# Verify Redis is running
curl -X POST \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN" \
  $UPSTASH_REDIS_REST_URL/ping

# Check Upstash dashboard
https://console.upstash.com/

# Update credentials if needed
vercel env rm UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_URL production
```

### Service Worker Issues

**Issue**: SW not registering
```bash
# Ensure HTTPS
# Check browser console
# Verify /sw.js is accessible

# Force update
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(r => r.update()))
```

**Issue**: Cached content not updating
```bash
# Clear cache in DevTools
Application → Storage → Clear site data

# Update cache version in sw.js
const CACHE_VERSION = 'v2';  // Increment version
```

### Health Check Failures

**Issue**: Health check endpoint returns 503
```bash
# Debug checklist
1. Verify Redis connection
2. Check environment variables
3. Review Vercel deployment logs
4. Test API keys manually

# View detailed health status
curl https://smarttuter.vercel.app/api/health | jq .checks
```

---

## Maintenance

### Regular Tasks

**Daily**:
- ✅ Check health endpoint status
- ✅ Review Sentry error rate
- ✅ Monitor Vercel bandwidth usage

**Weekly**:
- ✅ Review monitoring dashboard metrics
- ✅ Check Redis memory usage
- ✅ Update dependencies (if needed)

**Monthly**:
- ✅ Review Vercel/Upstash costs
- ✅ Analyze performance trends
- ✅ Update documentation

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update non-breaking changes
npm update

# Update Next.js (carefully)
npm install next@latest react@latest react-dom@latest

# Test thoroughly
npm run build
npm run dev  # Local testing

# Deploy to staging first
git checkout staging
git merge main
git push origin staging

# Verify staging deployment
# Then deploy to production
git checkout main
git merge staging
git push origin main
```

### Database Maintenance

```bash
# Monitor Redis usage
Upstash Dashboard → Database → Metrics

# Clean up expired keys (automatic)
# Redis handles TTL expiration automatically

# Manual cleanup if needed
# (Use with caution in production)
redis-cli -u $REDIS_URL --scan --pattern "metric:*" | xargs redis-cli -u $REDIS_URL del
```

### Backup Strategy

**Code**: Backed up on GitHub automatically

**Database**:
- Upstash provides automatic snapshots
- Export data periodically:
  ```bash
  # Export all keys matching pattern
  redis-cli -u $REDIS_URL --scan --pattern "progress:*" > backup.txt
  ```

**Environment Variables**:
- Keep secure backup in password manager
- Document all variables in team wiki

---

## Performance Optimization

### CDN Configuration

Vercel automatically provides:
- Global CDN (100+ locations)
- Automatic compression
- HTTP/2 & HTTP/3
- Smart caching

### Image Optimization

Already configured in `next.config.ts`:
```typescript
images: {
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 60,
}
```

### Bundle Size Optimization

Monitor bundle size:
```bash
npm run build

# Analyze bundle
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

Current bundle sizes (Phase 16):
- Shared chunks: 218 kB
- Average first load: 220 kB
- Static pages: < 1 kB each

---

## Security Checklist

### Pre-Deployment
- ✅ No hardcoded API keys in code
- ✅ Environment variables properly scoped
- ✅ Security headers configured
- ✅ HTTPS enforced
- ✅ CORS properly configured
- ✅ Rate limiting implemented

### Post-Deployment
- ✅ Verify HTTPS certificate
- ✅ Test security headers: https://securityheaders.com/
- ✅ Check for exposed secrets
- ✅ Review Sentry for security errors
- ✅ Monitor for unusual traffic patterns

### Ongoing
- ✅ Regular dependency updates
- ✅ Monitor Sentry for vulnerabilities
- ✅ Review access logs monthly
- ✅ Rotate API keys quarterly

---

## Rollback Procedure

### Automatic Rollback

GitHub Actions monitors health and triggers automatic rollback if:
- Health check fails
- Error rate > 50%
- Critical errors detected

### Manual Rollback

**Via Vercel Dashboard**:
```
1. Go to Deployments tab
2. Find last known good deployment
3. Click "..." → Promote to Production
4. Confirm
```

**Via Vercel CLI**:
```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback https://smarttuter-{hash}.vercel.app --yes
```

**Via Git**:
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Vercel auto-deploys the revert
```

---

## Support & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Upstash Docs](https://docs.upstash.com/)
- [Sentry Docs](https://docs.sentry.io/)

### Project Documentation
- [Phase 15: Deployment Optimization](./phase15-deployment-optimization.md)
- [Phase 16: Advanced Production Features](./phase16-advanced-production-features.md)
- [README](../README.md)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

### Emergency Contacts
- **Critical Issues**: Check GitHub Issues
- **Vercel Support**: support@vercel.com
- **Sentry Support**: support@sentry.io

---

## Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed and tested locally
- [ ] All tests passing (`npm run build`)
- [ ] Environment variables documented
- [ ] Dependencies up to date
- [ ] Documentation updated

### Deployment
- [ ] Deploy to staging first
- [ ] Verify staging deployment
- [ ] Run smoke tests on staging
- [ ] Deploy to production
- [ ] Verify health check

### Post-Deployment
- [ ] Test all core features
- [ ] Verify PWA installation
- [ ] Check Service Worker activation
- [ ] Monitor error rate (first hour)
- [ ] Verify metrics dashboard
- [ ] Test offline functionality
- [ ] Announce deployment to team

---

## Success Metrics

### Performance Targets
- ✅ Health check uptime: > 99.9%
- ✅ API response time (P95): < 1000ms
- ✅ Cache hit rate: > 80%
- ✅ Error rate: < 1%
- ✅ Core Web Vitals: All "Good"

### User Experience
- ✅ First Contentful Paint: < 1.5s
- ✅ Time to Interactive: < 3.5s
- ✅ Offline functionality: Available
- ✅ PWA installation: Working

### Operational
- ✅ Deployment time: < 3 minutes
- ✅ Rollback time: < 2 minutes
- ✅ Health check frequency: 15 minutes
- ✅ Monitoring coverage: 100%

---

**Deployment Status**: ✅ Ready for Production

**Next Steps**:
1. Push changes to GitHub
2. Deploy via Vercel
3. Verify health endpoint
4. Test core functionality
5. Monitor for 24 hours
6. Announce to users

**Version**: SmartTuter v1.0 (Phase 16 Complete)
