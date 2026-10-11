import { Router } from 'express';
import * as productController from '../controllers/productController.ts';
import * as categoryController from '../controllers/categoryController.ts';
import * as cartController from '../controllers/cartController.ts';
import * as orderController from '../controllers/orderController.ts';
import * as paymentController from '../controllers/paymentController.ts';
import * as adminController from '../controllers/adminController.ts';
import * as authController from '../controllers/authController.ts';
import { requireAuth, requireAdmin } from '../middleware/auth.ts';
import { sensitiveEndpointLimiter } from '../middleware/rateLimiter.ts';

export const apiRouter = Router();

// --- SYSTEM & STATUS ---
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
apiRouter.get('/status', authController.getSystemStatus);
apiRouter.get('/test-runner', async (req, res) => {
  const { runAllBackendTests } = await import('../services/tests.ts');
  const results = await runAllBackendTests();
  res.json({ success: true, data: results });
});

// --- AUTH & PROFILE ---
apiRouter.get('/auth/me', authController.getMe);
apiRouter.post('/auth/sync-profile', authController.syncProfile);
apiRouter.post('/auth/demo-login', sensitiveEndpointLimiter, authController.loginDemo);

// --- CATALOG (PUBLIC) ---
apiRouter.get('/products', productController.getProducts);
apiRouter.get('/products/featured', productController.getFeaturedProducts);
apiRouter.get('/products/:slug', productController.getProductBySlug);
apiRouter.get('/categories', categoryController.getCategories);

// --- CART (GUEST + AUTH) ---
apiRouter.get('/cart', cartController.getCart);
apiRouter.post('/cart/items', cartController.addToCart);
apiRouter.patch('/cart/items/:itemId', cartController.updateCartItem);
apiRouter.delete('/cart/items/:itemId', cartController.removeCartItem);
apiRouter.delete('/cart', cartController.clearCart);

// --- ORDERS ---
apiRouter.post('/orders', sensitiveEndpointLimiter, orderController.createOrder);
apiRouter.get('/orders/my-orders', requireAuth, orderController.getMyOrders);
apiRouter.get('/orders/:id', orderController.getOrderById);

// --- PAYMENTS & RAZORPAY ---
apiRouter.get('/payments/config', paymentController.getConfig);
apiRouter.post('/payments/create-order', sensitiveEndpointLimiter, paymentController.createPaymentOrder);
apiRouter.post('/payments/verify', sensitiveEndpointLimiter, paymentController.verifyPayment);
// Razorpay webhook endpoint
apiRouter.post('/payments/webhook', paymentController.handleWebhook);

// --- ADMINISTRATOR DASHBOARD (PROTECTED WITH RBAC) ---
apiRouter.get('/admin/overview', requireAdmin, adminController.getDashboardOverview);
apiRouter.post('/admin/products', requireAdmin, adminController.createProduct);
apiRouter.patch('/admin/products/:id', requireAdmin, adminController.updateProduct);
apiRouter.delete('/admin/products/:id', requireAdmin, adminController.deleteProduct);
apiRouter.post('/admin/categories', requireAdmin, adminController.createCategory);
apiRouter.get('/admin/orders', requireAdmin, adminController.getAllOrders);
apiRouter.patch('/admin/orders/:id/status', requireAdmin, adminController.updateOrderStatus);
