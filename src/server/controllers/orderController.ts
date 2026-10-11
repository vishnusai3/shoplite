import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../db/dataStore.ts';
import type { OrderItem } from '../types.ts';

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { 
      items, 
      shippingAddress, 
      customerEmail, 
      customerName, 
      customerPhone,
      notes 
    } = req.body;

    // 1. Server-side validation of inputs
    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: 'Order must contain at least one item' });
      return;
    }

    if (!customerEmail || !customerEmail.includes('@')) {
      res.status(400).json({ success: false, error: 'Valid customer email is required' });
      return;
    }

    if (!customerName || customerName.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Customer name is required' });
      return;
    }

    if (!shippingAddress || !shippingAddress.streetAddress || !shippingAddress.city || !shippingAddress.postalCode) {
      res.status(400).json({ success: false, error: 'Complete shipping address is required' });
      return;
    }

    // 2. TRUSTED SERVER-SIDE PRICE CALCULATION & STOCK VERIFICATION
    let calculatedSubtotalCents = 0;
    const verifiedOrderItems: OrderItem[] = [];
    const stockReservationList: { productId: string; quantity: number }[] = [];

    for (const item of items) {
      const quantity = parseInt(item.quantity, 10);
      if (!item.productId || isNaN(quantity) || quantity <= 0) {
        res.status(400).json({ success: false, error: `Invalid item quantity or product ID` });
        return;
      }

      // Fetch authentic product from database (trusted price)
      const product = await dataStore.getProductBySlugOrId(item.productId);
      if (!product || !product.isActive) {
        res.status(404).json({ success: false, error: `Product not found or inactive: ${item.productId}` });
        return;
      }

      // Validate stock availability
      if (product.stockQuantity < quantity) {
        res.status(400).json({
          success: false,
          error: `Insufficient stock for "${product.title}". Requested: ${quantity}, Available: ${product.stockQuantity}`,
        });
        return;
      }

      const itemTotalCents = product.priceCents * quantity;
      calculatedSubtotalCents += itemTotalCents;

      verifiedOrderItems.push({
        id: 'oi_' + Math.random().toString(36).substring(2, 9),
        orderId: '', // populated on save
        productId: product.id,
        productTitle: product.title,
        productImageUrl: product.images?.[0]?.url,
        unitPriceCents: product.priceCents, // TRUSTED DATABASE PRICE
        quantity,
        totalPriceCents: itemTotalCents,
      });

      stockReservationList.push({ productId: product.id, quantity });
    }

    // Free shipping above ₹999 (99900 cents), else standard ₹99 (9900 cents)
    const shippingCents = calculatedSubtotalCents >= 99900 ? 0 : 9900;
    const taxCents = 0; // Inclusive of taxes
    const totalCents = calculatedSubtotalCents + shippingCents + taxCents;

    // 3. ATOMIC STOCK DEDUCTION
    const stockDeduction = await dataStore.reserveAndDeductStock(stockReservationList);
    if (!stockDeduction.success) {
      res.status(400).json({ success: false, error: stockDeduction.error });
      return;
    }

    // 4. PERSIST ORDER
    const order = await dataStore.createOrder({
      userId: req.user?.id,
      customerEmail,
      customerName,
      customerPhone,
      subtotalCents: calculatedSubtotalCents,
      shippingCents,
      taxCents,
      totalCents,
      status: 'pending',
      shippingAddress,
      notes,
      items: verifiedOrderItems,
    });

    // Populate orderId on items
    order.items.forEach(i => (i.orderId = order.id));

    // Clear cart for the user or session if provided
    const sessionId = (req.headers['x-session-id'] as string) || undefined;
    await dataStore.clearCart({ userId: req.user?.id, sessionId });

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Login required' });
      return;
    }

    const { orders } = await dataStore.getOrders({ userId: req.user.id });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const order = await dataStore.getOrderById(id);

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    // Check authorization: Owner or admin only
    if (order.userId && (!req.user || (req.user.id !== order.userId && req.user.role !== 'admin'))) {
      res.status(403).json({ success: false, error: 'Access denied to this order' });
      return;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
}
