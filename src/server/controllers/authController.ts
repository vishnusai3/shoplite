import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../db/dataStore.ts';
import { getDatabaseStatus } from '../db/supabase.ts';
import { getRazorpayPublicConfig } from '../services/razorpayService.ts';

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.json({
      success: true,
      data: {
        isAuthenticated: false,
        user: null,
      },
    });
    return;
  }

  const profile = await dataStore.getProfileById(req.user.id) || await dataStore.getProfileByEmail(req.user.email);
  const addresses = await dataStore.getUserAddresses(req.user.id);

  res.json({
    success: true,
    data: {
      isAuthenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        fullName: profile?.fullName || req.user.fullName || req.user.email.split('@')[0],
        role: profile?.role || req.user.role,
        phone: profile?.phone,
        avatarUrl: profile?.avatarUrl,
      },
      addresses,
    },
  });
}

export async function loginDemo(req: Request, res: Response): Promise<void> {
  const { role } = req.body; // 'admin' | 'customer'

  if (role === 'admin') {
    const admin = await dataStore.getProfileByEmail('admin@shoplite.dev');
    res.json({
      success: true,
      data: {
        token: 'demo_token_admin',
        user: admin,
      },
      message: 'Logged in as Administrator (Demo Mode)',
    });
    return;
  }

  const customer = await dataStore.getProfileByEmail('customer@shoplite.dev');
  res.json({
    success: true,
    data: {
      token: 'demo_token_customer',
      user: customer,
    },
    message: 'Logged in as Customer (Demo Mode)',
  });
}

export async function syncProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id, email, fullName, phone, role } = req.body;

    if (!id || !email) {
      res.status(400).json({ success: false, error: 'User ID and Email are required' });
      return;
    }

    // Role cannot be escalated by normal users
    let assignedRole: 'customer' | 'admin' = 'customer';
    if (req.user?.role === 'admin' && role === 'admin') {
      assignedRole = 'admin';
    } else if (email.toLowerCase() === (process.env.INITIAL_ADMIN_EMAIL || 'admin@shoplite.dev').toLowerCase()) {
      assignedRole = 'admin';
    }

    const profile = await dataStore.upsertProfile({
      id,
      email,
      fullName,
      phone,
      role: assignedRole,
    });

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSystemStatus(req: Request, res: Response): Promise<void> {
  const dbStatus = getDatabaseStatus();
  const paymentStatus = getRazorpayPublicConfig();

  res.json({
    success: true,
    data: {
      database: {
        provider: 'Supabase PostgreSQL',
        isConfigured: dbStatus.isConfigured,
        url: dbStatus.url,
        hasServiceRole: dbStatus.hasServiceRole,
      },
      payments: {
        provider: 'Razorpay',
        isConfigured: paymentStatus.isConfigured,
        keyId: paymentStatus.keyId,
        mode: paymentStatus.mode,
      },
      serverTime: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
}
