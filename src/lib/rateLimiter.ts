// @ts-ignore: No type declarations for 'rate-limiter-flexible'
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Allow max 1 report per user per service per day (logged-in)
export const reportUserRateLimiter = new RateLimiterMemory({
  points: 1,
  duration: 24 * 60 * 60,
});

// Global hard limit: max 5 reports per user per day (all services)
export const reportUserGlobalLimiter = new RateLimiterMemory({
  points: 5,
  duration: 24 * 60 * 60,
});

// Anonymous (IP-based):
// Hard limit: 5 reports per service per IP per day
export const reportIpHardRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 24 * 60 * 60,
});

// Global hard limit: max 10 reports per IP per day (all services, anonymous)
export const reportIpGlobalLimiter = new RateLimiterMemory({
  points: 10,
  duration: 24 * 60 * 60,
});

// Challenge creation: max 15 per IP per hour (prevent challenge flooding)
export const challengeCreateLimiter = new RateLimiterMemory({
  points: 15,
  duration: 60 * 60,
});
