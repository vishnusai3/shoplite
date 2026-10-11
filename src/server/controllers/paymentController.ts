import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../db/dataStore.ts';
import { 
  createRazorpayOrder, 
  verifyPaymentSignature, 
  verifyWebhookSignature,
  getRazorpayPublicConfig, 
  isRazorpayConfigured 
} from '../services/razorpayService.ts';

export async function getConfig(req: Request, res: Response): Promise<void> {
  const config = getRazorpayPublicConfig();
  res.json({
    success: true,
    data: config,
  });
}

export async function createPaymentOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      res.status(400).json({ success: false, error: 'Order ID is required' });
      return;
    }

    const order = await dataStore.getOrderById(orderId);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    if (order.status !== 'pending') {
      res.status(400).json({ 
        success: false, 
        error: `Order is already in ${order.status} state, cannot initiate new payment.` 
      });
      return;
    }

    // Check if an active payment record exists for this order
    const existingPayment = order.payment;
    if (existingPayment && existingPayment.status === 'captured') {
      res.status(400).json({ success: false, error: 'Order has already been paid for' });
      return;
    }

    // Create Razorpay Order
    const razorpayOrder = await createRazorpayOrder({
      amountCents: order.totalCents,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerEmail: order.customerEmail,
      },
    });

    // Save payment record in DB
    const payment = await dataStore.savePayment({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amountCents: order.totalCents,
      currency: 'INR',
      status: 'pending',
      gatewayResponse: {
        orderStatus: razorpayOrder.status,
        isSimulated: razorpayOrder.isSimulated,
      },
    });

    const publicConfig = getRazorpayPublicConfig();

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amountCents: order.totalCents,
        currency: 'INR',
        keyId: publicConfig.keyId,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        isSimulated: razorpayOrder.isSimulated,
        isConfigured: publicConfig.isConfigured,
      },
    });
  } catch (error: any) {
    next(error);
  }
}

export async function verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400).json({
        success: false,
        error: 'Missing required payment verification details (order ID, payment ID, or signature)',
      });
      return;
    }

    // Strict HMAC SHA256 Signature verification
    const verification = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!verification.isValid) {
      // Record failed payment
      await dataStore.updatePaymentStatus(razorpayOrderId, 'failed', {
        razorpayPaymentId,
        gatewayResponse: { reason: verification.reason },
      });

      res.status(400).json({
        success: false,
        error: 'Payment verification failed: Invalid signature',
        details: verification.reason,
      });
      return;
    }

    // Update payment record to captured and order to processing
    const payment = await dataStore.updatePaymentStatus(razorpayOrderId, 'captured', {
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!payment) {
      res.status(404).json({ success: false, error: 'Associated payment record not found' });
      return;
    }

    const order = await dataStore.getOrderById(payment.orderId);

    res.json({
      success: true,
      data: {
        payment,
        order,
      },
      message: 'Payment verified and order confirmed successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Razorpay Webhook Handler
 * Verified using raw body HMAC-SHA256 signature
 * Idempotent event processing
 */
export async function handleWebhook(req: Request, res: Response): Promise<void> {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    // Verify signature if webhook secret is configured
    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        console.warn('[Webhook] Invalid signature received from Razorpay');
        res.status(400).json({ success: false, error: 'Invalid webhook signature' });
        return;
      }
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const event = payload?.event;
    const eventId = payload?.event_id || `${event}_${Date.now()}`;

    // IDEMPOTENCY CHECK: Don't re-process duplicate webhook deliveries
    if (dataStore.isWebhookProcessed(eventId)) {
      console.log(`[Webhook] Event ${eventId} was already processed. Skipping.`);
      res.status(200).json({ success: true, message: 'Event already processed' });
      return;
    }

    console.log(`[Webhook] Processing Razorpay event: ${event}`);

    // Process event types
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        await dataStore.updatePaymentStatus(razorpayOrderId, 'captured', {
          razorpayPaymentId,
          gatewayResponse: paymentEntity,
        });
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        await dataStore.updatePaymentStatus(razorpayOrderId, 'failed', {
          razorpayPaymentId,
          gatewayResponse: paymentEntity,
        });
      }
    }

    // Mark event processed for idempotency
    dataStore.markWebhookProcessed(eventId);

    res.status(200).json({ success: true, message: 'Webhook processed successfully' });
  } catch (error: any) {
    console.error('[Webhook Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
