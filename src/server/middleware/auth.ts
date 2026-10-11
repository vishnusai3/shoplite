import type { Request, Response, NextFunction } from 'express';
import { supabasePublic, isSupabaseConfigured } from '../db/supabase.ts';
import { dataStore } from '../db/dataStore.ts';
import type { UserRole } from '../types.ts';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1]?.trim();
  if (!token) {
    return next();
  }

  // 1. If Supabase is connected, verify token with Supabase Auth
  if (isSupabaseConfigured && supabasePublic) {
    try {
      const { data: { user }, error } = await supabasePublic.auth.getUser(token);
      if (!error && user && user.email) {
        // Fetch user profile to verify role
        const profile = await dataStore.getProfileByEmail(user.email);
        req.user = {
          id: user.id,
          email: user.email,
          role: profile?.role || 'customer',
          fullName: profile?.fullName || user.user_metadata?.full_name,
        };
        return next();
      }
    } catch (e) {
      console.warn('Supabase token verification error:', e);
    }
  }

  // 2. Demo token / local session token parser (e.g. "demo_token_admin", "demo_token_customer", or base64 token)
  try {
    if (token === 'demo_token_admin') {
      const admin = await dataStore.getProfileByEmail('admin@shoplite.dev');
      if (admin) {
        req.user = {
          id: admin.id,
          email: admin.email,
          role: 'admin',
          fullName: admin.fullName,
        };
        return next();
      }
    } else if (token === 'demo_token_customer') {
      const cust = await dataStore.getProfileByEmail('customer@shoplite.dev');
      if (cust) {
        req.user = {
          id: cust.id,
          email: cust.email,
          role: 'customer',
          fullName: cust.fullName,
        };
        return next();
      }
    } else if (token.startsWith('user_')) {
      const profile = await dataStore.getProfileById(token);
      if (profile) {
        req.user = {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          fullName: profile.fullName,
        };
        return next();
      }
    }
  } catch (err) {
    console.warn('Fallback token verification failed:', err);
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in.',
    });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in as an administrator.',
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Forbidden: Administrator privileges required to perform this action.',
    });
    return;
  }

  next();
}
