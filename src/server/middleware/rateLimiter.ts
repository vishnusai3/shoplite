import type { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, message = 'Too many requests, please try again shortly.' } = options;
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  // Cleanup old entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of requestCounts.entries()) {
      if (now > value.resetTime) {
        requestCounts.delete(key);
      }
    }
  }, 300000);

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = requestCounts.get(clientIp);

    if (!record || now > record.resetTime) {
      requestCounts.set(clientIp, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (record.count >= maxRequests) {
      res.status(429).json({
        success: false,
        error: message,
        retryAfterMs: record.resetTime - now,
      });
      return;
    }

    record.count++;
    next();
  };
}

export const sensitiveEndpointLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  message: 'Rate limit exceeded for sensitive operation. Please wait a moment.',
});
