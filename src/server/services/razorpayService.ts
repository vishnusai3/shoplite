import 'dotenv/config';
import crypto from 'crypto';
import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

export const isRazorpayConfigured = Boolean(
  keyId && 
  keySecret && 
  !keyId.includes('YourTestKeyId') &&
  !keySecret.includes('your_razorpay_key_secret')
);

// Initialize official Razorpay SDK instance if configured
let razorpayInstance: Razorpay | null = null;
if (isRazorpayConfigured) {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  } catch (err) {
    console.error('Failed to initialize Razorpay SDK:', err);
  }
}

export function getRazorpayPublicConfig() {
  return {
    isConfigured: isRazorpayConfigured,
    keyId: isRazorpayConfigured ? keyId : 'rzp_test_placeholder_unconfigured',
    currency: 'INR',
    mode: 'test',
  };
}

export interface CreateOrderParams {
  amountCents: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  isSimulated: boolean;
}

/**
 * Creates a Razorpay order via official SDK or simulated sandbox if keys pending
 */
export async function createRazorpayOrder(params: CreateOrderParams): Promise<RazorpayOrderResult> {
  if (isRazorpayConfigured && razorpayInstance) {
    try {
      const order = await razorpayInstance.orders.create({
        amount: params.amountCents, // Razorpay takes amounts in paise (1 INR = 100 paise)
        currency: params.currency || 'INR',
        receipt: params.receipt,
        notes: params.notes,
      });

      return {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        receipt: order.receipt || params.receipt,
        status: order.status,
        isSimulated: false,
      };
    } catch (error: any) {
      console.error('Razorpay API error creating order:', error);
      throw new Error(`Razorpay gateway error: ${error?.error?.description || error.message}`);
    }
  }

  // Clear simulated fallback when test credentials have not been configured yet
  const simulatedId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: simulatedId,
    amount: params.amountCents,
    currency: params.currency || 'INR',
    receipt: params.receipt,
    status: 'created',
    isSimulated: true,
  };
}

/**
 * Verifies Razorpay payment signature: HMAC-SHA256(order_id + "|" + payment_id, secret)
 */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): { isValid: boolean; reason?: string } {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return { isValid: false, reason: 'Missing required payment verification parameters' };
  }

  // If live credentials are setup, perform strict HMAC SHA256 verification
  if (isRazorpayConfigured) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      const isMatch = crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(razorpaySignature)
      );

      return {
        isValid: isMatch,
        reason: isMatch ? undefined : 'Payment signature mismatch',
      };
    } catch (err: any) {
      return { isValid: false, reason: `Signature verification error: ${err.message}` };
    }
  }

  // Simulation mode check for demo test runner
  if (razorpayOrderId.startsWith('order_sim_') && razorpaySignature.startsWith('sig_sim_')) {
    return { isValid: true };
  }

  return { isValid: false, reason: 'Razorpay keys not configured and signature unrecognized' };
}

/**
 * Verifies Razorpay Webhook signature: HMAC-SHA256(rawBody, webhookSecret)
 */
export function verifyWebhookSignature(rawBody: string | Buffer, signatureHeader: string): boolean {
  if (!signatureHeader) return false;

  const secretToUse = webhookSecret || keySecret;
  if (!secretToUse) {
    // If webhook secret not configured yet, reject for security
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secretToUse)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signatureHeader)
    );
  } catch (err) {
    console.error('Webhook signature verification error:', err);
    return false;
  }
}
