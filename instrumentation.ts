export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = async (
  err: Error,
  request: {
    path: string; // resource path, e.g. /blog?name=foo
    method: string; // request method. e.g. GET, POST, etc.
    headers: { [key: string]: string }; // request headers
  },
  context: {
    routerKind: 'Pages Router' | 'App Router'; // the router type
    routePath: string; // the route file path, e.g. /app/blog/[slug]/page.js
    routeType: 'render' | 'route' | 'action' | 'middleware'; // the context in which the error occurred
    renderSource:
      | 'react-server-components'
      | 'react-server-components-payload'
      | 'server-rendering';
    revalidateReason: 'on-demand' | 'stale' | undefined; // undefined is a normal request without revalidation
    renderType: 'dynamic' | 'dynamic-resume'; // 'dynamic-resume' for PPR
  }
) => {
  // Send error to Custom Error Tracker (Redis-based)
  // Use wrapper to prevent client bundle inclusion
  const { captureServerError } = await import('./lib/error-tracking/server-wrapper');

  await captureServerError(err, {
    path: request.path,
    method: request.method,
    userAgent: request.headers['user-agent'] || 'unknown',
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
    sessionId: request.headers['x-session-id'] || request.headers['cookie']?.split('sessionId=')[1]?.split(';')[0] || 'anonymous',
    userId: undefined, // Will be extracted from session if needed
    revalidateReason: context.revalidateReason,
    renderType: context.renderType,
  });

  // Optional: Keep Sentry as backup (comment out if not needed)
  // const Sentry = await import('@sentry/nextjs');
  // Sentry.captureException(err, {
  //   tags: {
  //     routerKind: context.routerKind,
  //     routeType: context.routeType,
  //     renderSource: context.renderSource,
  //   },
  //   extra: {
  //     path: request.path,
  //     method: request.method,
  //     routePath: context.routePath,
  //     renderType: context.renderType,
  //     revalidateReason: context.revalidateReason,
  //   },
  // });
}
