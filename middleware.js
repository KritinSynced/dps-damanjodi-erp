import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Protect portal routes explicitly
const isPortalRoute = createRouteMatcher([
  '/portal(.*)'
]);

export default clerkMiddleware((auth, request) => {
  if (isPortalRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.[^?]*$).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
