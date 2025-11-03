# Performance Optimization Guide - AI Park

This document outlines the performance optimizations implemented in AI Park and provides guidelines for maintaining optimal performance.

## Overview

AI Park is optimized for fast initial load, smooth interactions, and minimal resource usage. Target metrics:
- **First Contentful Paint (FCP)**: < 1.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

## Implemented Optimizations

### 1. Code Splitting

#### Dynamic Imports
Components are loaded on-demand to reduce initial bundle size:

```tsx
// Example: Lazy load heavy components
const DashboardChart = dynamic(() => import('@/components/dashboard/Chart'), {
  loading: () => <SkeletonCard />,
  ssr: false,
});

// Example: Lazy load tutor components
const EnglishTutorClient = dynamic(
  () => import('@/components/tutor-pages/EnglishTutorClient'),
  { ssr: false }
);
```

#### Route-based Code Splitting
Next.js automatically splits code by route:
- `/dashboard` bundle: ~150KB
- `/tutor` bundle: ~200KB
- `/profile` bundle: ~80KB

### 2. Loading States

#### Skeleton Screens
Provide immediate visual feedback while content loads:

```tsx
// Dashboard loading
if (isLoading) {
  return <SkeletonDashboard />;
}

// Profile loading
if (status === 'loading') {
  return <SkeletonProfile />;
}
```

#### Progressive Loading
Load critical content first, defer non-critical:

```tsx
// Critical: User profile and navigation
// Deferred: Analytics, recommendations
useEffect(() => {
  loadUserProfile(); // Immediate
  setTimeout(() => loadAnalytics(), 1000); // Deferred
}, []);
```

### 3. Caching Strategy

#### API Response Caching
```typescript
// Cache API responses for 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

export async function fetchWithCache<T>(url: string): Promise<T> {
  const cached = cache.get(url);
  const now = Date.now();

  if (cached && now - cached.timestamp < 300000) {
    return cached.data;
  }

  const data = await fetch(url).then(r => r.json());
  cache.set(url, { data, timestamp: now });
  return data;
}
```

#### localStorage Caching
User profiles and preferences cached locally:
- Profile data: `aipark_user_profile`
- Onboarding data: `onboarding_data`
- Sync with server on login

### 4. Image Optimization

#### Next.js Image Component
Use `next/image` for automatic optimization:

```tsx
import Image from 'next/image';

// Optimized image loading
<Image
  src="/hero.png"
  alt="AI Park"
  width={1200}
  height={630}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/..." // Low-quality placeholder
/>
```

#### Lazy Loading
Images below the fold load on demand:

```tsx
<Image
  src="/dashboard-chart.png"
  alt="Progress chart"
  width={800}
  height={400}
  loading="lazy" // Default for next/image
/>
```

### 5. React Performance

#### Memoization
Prevent unnecessary re-renders:

```tsx
// Memoize expensive components
const MemoizedChart = React.memo(Chart);

// Memoize expensive calculations
const processedData = useMemo(() => {
  return expensiveProcessing(rawData);
}, [rawData]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(param);
}, [param]);
```

#### Virtual Scrolling
For long lists (100+ items):

```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      {items[index]}
    </div>
  )}
</FixedSizeList>
```

### 6. Bundle Optimization

#### Tree Shaking
Import only what you need:

```tsx
// Bad: Imports entire library
import _ from 'lodash';

// Good: Import specific functions
import debounce from 'lodash/debounce';

// Best: Use native alternatives
const debounce = (fn, ms) => { /* custom implementation */ };
```

#### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

Current bundle sizes:
- Main bundle: ~180KB gzipped
- First Load JS: ~250KB total
- Shared chunks: ~70KB

### 7. Network Optimization

#### HTTP/2 Server Push
Preload critical resources:

```tsx
// In layout.tsx head
<head>
  <link rel="preload" href="/fonts/inter.woff2" as="font" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
</head>
```

#### API Request Batching
Combine multiple API calls:

```typescript
// Bad: Multiple sequential requests
const user = await fetch('/api/user');
const progress = await fetch('/api/progress');
const achievements = await fetch('/api/achievements');

// Good: Parallel requests
const [user, progress, achievements] = await Promise.all([
  fetch('/api/user'),
  fetch('/api/progress'),
  fetch('/api/achievements'),
]);

// Better: Single batched request
const data = await fetch('/api/dashboard-data');
```

#### Debouncing & Throttling
Reduce API call frequency:

```tsx
import { debounce } from '@/lib/utils';

// Debounce search input
const handleSearch = debounce((query: string) => {
  fetchResults(query);
}, 300);

// Throttle scroll events
const handleScroll = throttle(() => {
  updateScrollPosition();
}, 100);
```

### 8. Database Optimization

#### Indexing
All frequently queried fields are indexed:
- `users.email` (unique)
- `users.id` (primary key)
- `sessions.userId`
- `progress.userId`

#### Query Optimization
```typescript
// Bad: N+1 query problem
const users = await db.users.findMany();
for (const user of users) {
  user.progress = await db.progress.findMany({ userId: user.id });
}

// Good: Join/include
const users = await db.users.findMany({
  include: { progress: true }
});
```

### 9. Service Worker

#### Offline Support
Cache static assets for offline use:

```javascript
// public/sw.js
const CACHE_NAME = 'aipark-v1';
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/offline',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});
```

#### Background Sync
Sync data when connection restored:

```javascript
// Queue API calls when offline
if (!navigator.onLine) {
  await saveToIndexedDB(data);
  await registration.sync.register('sync-data');
}
```

### 10. Monitoring

#### Web Vitals Tracking
```tsx
// components/WebVitalsReporter.tsx
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    console.log(metric);
    // Send to analytics
    if (typeof window !== 'undefined') {
      window.gtag?.('event', metric.name, {
        value: Math.round(metric.value),
        event_label: metric.id,
      });
    }
  });

  return null;
}
```

## Performance Checklist

### Before Deployment
- [ ] Run Lighthouse audit (target score: 90+)
- [ ] Analyze bundle size (`npm run build`)
- [ ] Test on slow 3G network
- [ ] Test on low-end mobile devices
- [ ] Check Core Web Vitals
- [ ] Verify images are optimized
- [ ] Ensure code splitting is working
- [ ] Test offline functionality

### Regular Maintenance
- [ ] Monitor bundle size trends
- [ ] Review and update dependencies
- [ ] Audit unused code
- [ ] Check for memory leaks
- [ ] Monitor error rates
- [ ] Review slow API endpoints

## Common Performance Issues

### 1. Large Bundle Size
**Symptom**: Slow initial load
**Solution**:
- Lazy load non-critical components
- Use dynamic imports
- Remove unused dependencies
- Use tree-shaking

### 2. Slow API Responses
**Symptom**: Loading spinners for >2s
**Solution**:
- Add caching layer
- Optimize database queries
- Use CDN for static assets
- Implement request batching

### 3. Layout Shifts (CLS)
**Symptom**: Content jumping during load
**Solution**:
- Reserve space for dynamic content
- Use skeleton screens
- Set image dimensions
- Avoid inserting content above existing content

### 4. Memory Leaks
**Symptom**: App slows down over time
**Solution**:
- Clean up event listeners
- Cancel pending requests on unmount
- Clear intervals/timeouts
- Dispose of heavy objects

## Best Practices

### Component Organization
```
components/
├── ui/                 # Reusable UI components
│   ├── Skeleton.tsx
│   ├── LoadingSpinner.tsx
│   └── Button.tsx
├── features/           # Feature-specific components
│   ├── dashboard/
│   └── tutor/
└── providers/          # Context providers
```

### Code Style
- Use TypeScript for type safety
- Prefer functional components over class components
- Use hooks for state management
- Extract reusable logic into custom hooks
- Keep components small (<200 lines)

### Testing Performance
```bash
# Local testing
npm run build
npm run start

# Lighthouse CI
lighthouse http://localhost:3000 --view

# Bundle analysis
npx @next/bundle-analyzer
```

## Resources

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [React DevTools Profiler](https://reactjs.org/blog/2018/09/10/introducing-the-react-profiler.html)
- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

### Documentation
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [React Performance](https://reactjs.org/docs/optimizing-performance.html)
- [MDN Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)

## Contact

For performance concerns or optimization suggestions:
- Email: performance@aipark.com
- GitHub Issues: [Report performance issue](https://github.com/aipark/issues)
