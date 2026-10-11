import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  // Avoid leaking raw stack traces or internal secrets to users
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error(`[Server Error ${statusCode}]`, {
    path: req.path,
    method: req.method,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    code: err.code || 'SERVER_ERROR',
  });
}
