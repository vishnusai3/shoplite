import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../db/dataStore.ts';
import type { OrderStatus } from '../types.ts';

export async function getDashboardOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { products } = await dataStore.getProducts({ limit: 1000 });
    const { orders } = await dataStore.getOrders({ limit: 1000 });
    const categories = await dataStore.getAllCategoriesAdmin();

    const totalOrders = orders.length;
    const paidOrders = orders.filter(o => o.payment?.status === 'captured' || o.status === 'processing' || o.status === 'shipped' || o.status === 'delivered');
    const totalRevenueCents = paidOrders.reduce((sum, o) => sum + o.totalCents, 0);

    const lowStockProducts = products.filter(p => p.stockQuantity < 10);
    const outOfStockProducts = products.filter(p => p.stockQuantity === 0);

    const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
    const processingOrdersCount = orders.filter(o => o.status === 'processing').length;

    res.json({
      success: true,
      data: {
        stats: {
          totalRevenueCents,
          totalOrders,
          totalProducts: products.length,
          totalCategories: categories.length,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
          pendingOrdersCount,
          processingOrdersCount,
        },
        recentOrders: orders.slice(0, 5),
        lowStockProducts: lowStockProducts.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { 
      title, 
      description, 
      priceCents, 
      compareAtPriceCents, 
      stockQuantity, 
      categoryId, 
      images, 
      sku, 
      isFeatured, 
      isActive 
    } = req.body;

    if (!title || !description || priceCents === undefined || !categoryId) {
      res.status(400).json({ 
        success: false, 
        error: 'Title, description, price (in paise/cents), and category are required' 
      });
      return;
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    const product = await dataStore.createProduct({
      title,
      slug,
      description,
      priceCents: parseInt(priceCents, 10),
      compareAtPriceCents: compareAtPriceCents ? parseInt(compareAtPriceCents, 10) : undefined,
      stockQuantity: parseInt(stockQuantity || 0, 10),
      categoryId,
      sku,
      isFeatured: Boolean(isFeatured),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      images: Array.isArray(images) ? images : [],
    });

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.priceCents !== undefined) {
      updates.priceCents = parseInt(updates.priceCents, 10);
    }
    if (updates.stockQuantity !== undefined) {
      updates.stockQuantity = parseInt(updates.stockQuantity, 10);
    }

    const updated = await dataStore.updateProduct(id, updates);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    res.json({
      success: true,
      data: updated,
      message: 'Product updated successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await dataStore.deleteProduct(id);

    if (!deleted) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description, imageUrl, sortOrder } = req.body;

    if (!name) {
      res.status(400).json({ success: false, error: 'Category name is required' });
      return;
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const category = await dataStore.createCategory({
      name,
      slug,
      description: description || '',
      imageUrl,
      isActive: true,
      sortOrder: sortOrder || 0,
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, page, limit } = req.query;

    const result = await dataStore.getOrders({
      status: status as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 50,
    });

    res.json({
      success: true,
      data: result.orders,
      meta: {
        total: result.total,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const currentOrder = await dataStore.getOrderById(id);
    if (!currentOrder) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    // If order is transitioning to cancelled, restore the stock!
    if (status === 'cancelled' && currentOrder.status !== 'cancelled') {
      await dataStore.restoreStock(
        currentOrder.items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      );
    }

    const updated = await dataStore.updateOrderStatus(id, status);

    res.json({
      success: true,
      data: updated,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
}
