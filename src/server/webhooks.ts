import express from 'express';
import crypto from 'crypto';
import { upgradeUserPlan, burnCoupon, saveToHistory } from './db.js';
import { sendEventToUser } from './sse.js';

export const webhookRoutes = express.Router();

// Middleware to capture raw body for Lemon Squeezy signature verification
const rawBodyMiddleware = express.raw({ type: 'application/json' });

// ==========================================
// 1. Fawaterk Webhook (Egypt)
// ==========================================
webhookRoutes.post('/fawaterk', express.json(), (req, res) => {
  try {
    const signature = req.headers['x-fawaterk-signature'] as string;
    const secret = process.env.FAWATERK_WEBHOOK_SECRET || 'fawaterk_secret_mock';
    
    // Fawaterk signature verification (HMAC SHA256 of the payload)
    const payloadString = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');

    // In a real scenario, we check if signature === expectedSignature
    // For this preview, we'll allow it or mock it.
    if (process.env.NODE_ENV === 'production' && signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const { invoice_status, invoice_id, custom_data, items } = req.body;

    // Only process paid invoices
    if (invoice_status === 'paid') {
      const userId = custom_data?.user_id;
      const couponCode = custom_data?.coupon_code;
      const wheelVersion = custom_data?.wheel_version;
      const productId = items?.[0]?.product_id; // e.g., 'ID1'

      if (userId && productId) {
        // Atomic transaction simulation
        upgradeUserPlan(userId, productId);
        
        if (couponCode && wheelVersion) {
          try {
            burnCoupon(userId, couponCode, parseInt(wheelVersion, 10));
          } catch (e) {
            console.error('Coupon already burned or error:', e);
          }
        }

        // Send SSE event to the client to stop countdown and show success modal
        sendEventToUser(userId, {
          type: 'PAYMENT_SUCCESS',
          planId: productId,
        });
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Fawaterk webhook error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ==========================================
// 3. File Processing Webhook (e.g., from a cloud worker)
// ==========================================
webhookRoutes.post('/file-processed', express.json(), (req, res) => {
  try {
    const { userId, fileName, toolUsed, cloudLink, status } = req.body;

    if (status === 'success' && userId && fileName && toolUsed && cloudLink) {
      // Save to history
      saveToHistory(userId, fileName, toolUsed, cloudLink);

      // Notify client via SSE for live sync
      sendEventToUser(userId, {
        type: 'FILE_PROCESSED',
        fileName,
        toolUsed,
        cloudLink
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('File processing webhook error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// ==========================================
// 2. Lemon Squeezy Webhook (Global)
// ==========================================
webhookRoutes.post('/lemonsqueezy', rawBodyMiddleware, (req, res) => {
  try {
    const signature = req.headers['x-signature'] as string;
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || 'lemon_secret_mock';

    // Lemon Squeezy signature verification
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.body)
      .digest('hex');

    if (process.env.NODE_ENV === 'production' && !crypto.timingSafeEqual(Buffer.from(signature || ''), Buffer.from(expectedSignature))) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const payload = JSON.parse(req.body.toString());
    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data;
    const attributes = payload.data.attributes;

    if (eventName === 'order_created' && attributes.status === 'paid') {
      const userId = customData?.user_id;
      const couponCode = customData?.coupon_code;
      const wheelVersion = customData?.wheel_version;
      const variantId = attributes.first_order_item?.variant_id?.toString(); // e.g., 'ID2'

      if (userId && variantId) {
        // Atomic transaction simulation
        upgradeUserPlan(userId, variantId);
        
        if (couponCode && wheelVersion) {
          try {
            burnCoupon(userId, couponCode, parseInt(wheelVersion, 10));
          } catch (e) {
            console.error('Coupon already burned or error:', e);
          }
        }

        // Send SSE event to the client
        sendEventToUser(userId, {
          type: 'PAYMENT_SUCCESS',
          planId: variantId,
        });
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Lemon Squeezy webhook error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
