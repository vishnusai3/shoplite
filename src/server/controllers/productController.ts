import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../db/dataStore.ts';

export async function getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { category, search, sort, page, limit } = req.query;

    const result = await dataStore.getProducts({
      categorySlug: category as string,
      search: search as string,
      sortBy: sort as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 12,
    });

    res.json({
      success: true,
      data: result.products,
      meta: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getFeaturedProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await dataStore.getProducts({
      featured: true,
      limit: 6,
    });

    res.json({
      success: true,
      data: result.products,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;
    const product = await dataStore.getProductBySlugOrId(slug);

    if (!product) {
      res.status(404).json({
        success: false,
        error: 'Product not found',
      });
      return;
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
}
