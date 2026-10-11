import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../db/dataStore.ts';

export async function getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await dataStore.getCategories();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}
