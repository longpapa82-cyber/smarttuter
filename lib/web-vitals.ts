import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import * as Sentry from '@sentry/nextjs';

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

function sendToAnalytics(metric: WebVitalsMetric) {
  // Send to Sentry for monitoring
  Sentry.captureMessage(`Web Vitals: ${metric.name}`, {
    level: 'info',
    tags: {
      metric_name: metric.name,
      metric_rating: metric.rating,
    },
    extra: {
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
    },
  });

  // Send to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    });
  }

  // Send to analytics service (optional)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
}

export function reportWebVitals() {
  if (typeof window === 'undefined') return;

  // Core Web Vitals
  onCLS(sendToAnalytics); // Cumulative Layout Shift
  onLCP(sendToAnalytics); // Largest Contentful Paint
  onINP(sendToAnalytics); // Interaction to Next Paint (replaces FID)

  // Additional metrics
  onFCP(sendToAnalytics); // First Contentful Paint
  onTTFB(sendToAnalytics); // Time to First Byte
}

export function getWebVitalsRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  // Thresholds based on web.dev recommendations
  const thresholds: Record<string, [number, number]> = {
    CLS: [0.1, 0.25],      // Good: ≤0.1, Poor: >0.25
    FCP: [1800, 3000],     // Good: ≤1.8s, Poor: >3s
    INP: [200, 500],       // Good: ≤200ms, Poor: >500ms
    LCP: [2500, 4000],     // Good: ≤2.5s, Poor: >4s
    TTFB: [800, 1800],     // Good: ≤800ms, Poor: >1.8s
  };

  const [good, poor] = thresholds[name] || [0, 0];

  if (value <= good) return 'good';
  if (value > poor) return 'poor';
  return 'needs-improvement';
}
