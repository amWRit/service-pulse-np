// Global hard limit: max 5 reports per user per day (all services)
export const reportUserGlobalLimiter = new RateLimiterMemory({
  points: 5, // 5 reports
  duration: 24 * 60 * 60, // per day
});

// Global hard limit: max 10 reports per IP per day (all services, anonymous)
export const reportIpGlobalLimiter = new RateLimiterMemory({
  points: 10, // 10 reports
  duration: 24 * 60 * 60, // per day
});
// @ts-ignore: No type declarations for 'rate-limiter-flexible'
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Allow max 1 report per user per service per day (logged-in)
export const reportUserRateLimiter = new RateLimiterMemory({
  points: 1, // 1 report
  duration: 24 * 60 * 60, // per day
});

// Anonymous (IP-based):
// Soft limit: 2 reports per service per day (no captcha)
export const reportIpSoftRateLimiter = new RateLimiterMemory({
  points: 2, // 2 reports
  duration: 24 * 60 * 60, // per day
});
// Hard limit: 5 reports per service per day (captcha required after 2)
export const reportIpHardRateLimiter = new RateLimiterMemory({
  points: 5, // 5 reports
  duration: 24 * 60 * 60, // per day
});
