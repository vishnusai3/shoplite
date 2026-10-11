import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../db/dataStore.ts';

function getCartKey(req: Request) {
  const userId = req.user?.id;
  const sessionId = (req.headers['x-session-id'] as string) || (req.query.sessionId as string);
  return { userId, sessionId };
}

export async function getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cart = await dataStore.getOrCreateCart(getCartKey(req));
    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
}

export async function addToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      res.status(400).json({ success: false, error: 'Product ID is required' });
      return;
    }

    const qty = parseInt(quantity, 10) || 1;
    const cart = await dataStore.addItemToCart(getCartKey(req), productId, qty);

    res.json({
      success: true,
      data: cart,
      message: 'Item added to cart',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to add item to cart',
    });
  }
}

export async function updateCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      res.status(400).json({ success: false, error: 'Quantity is required' });
      return;
    }

    const qty = parseInt(quantity, 10);
    const cart = await dataStore.updateCartItemQuantity(getCartKey(req), itemId, qty);

    res.json({
      success: true,
      data: cart,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update item quantity',
    });
  }
}

export async function removeCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { itemId } = req.params;
    const cart = await dataStore.removeCartItem(getCartKey(req), itemId);

    res.json({
      success: true,
      data: cart,
      message: 'Item removed from cart',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to remove item',
    });
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await dataStore.clearCart(getCartKey(req));
    res.json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    next(error);
  }
}
