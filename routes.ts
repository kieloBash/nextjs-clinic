//FOR ROUTINGS

/**
 * An array of routes that is accessible even when user is logged out
 * Do not require authentication
 * @type {string[]}
 */
export const publicRoutes = [
  "/",
  "/auth/new-verification",
  "/api/ping"
];

/**
 * An array of routes that is NOT accessible if user is logged out.
 * REQUIRES authentication
 * @type {string[]}
 */
export const authRoutes = [
  "/auth/sign-up",
  "/auth/sign-in",
  "/auth/error",
  "/auth/reset-password",
  "/auth/reset-password/new",
  "/api/auth/register"
];

/**
 * Prefix for API authentication routes
 * Routes that start with this prefix are used for api authentication
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth"; //always allowed for middleware

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
