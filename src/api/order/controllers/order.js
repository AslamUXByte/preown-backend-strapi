'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const Razorpay = require('razorpay');
const crypto = require('crypto');

module.exports = createCoreController('api::order.order', ({ strapi }) => ({

  async createPayment(ctx) {
    try {
      // Receive product IDs from the frontend
      const { productIds } = ctx.request.body;

      if (!productIds || productIds.length === 0) {
        return ctx.badRequest('No products provided');
      }

      // 1. Fetch products securely from DB to calculate the total price
      const products = await strapi.db.query('api::product.product').findMany({
        where: { id: productIds }
      });

      // Calculate total (Assuming your Product model has a 'price' field)
      const totalAmount = products.reduce((sum, product) => sum + product.price, 0);

      // 2. Initialize Razorpay instance
      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      // 3. Create an order in Razorpay (amount must be in paise / smallest currency unit)
      const options = {
        amount: totalAmount * 100, // Multiply by 100 for INR
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`,
      };

      const razorpayOrder = await instance.orders.create(options);

      // Return the order details to the frontend
      ctx.send({
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      });

    } catch (error) {
      ctx.throw(500, 'Error creating Razorpay order', { error });
    }
  },

  async verifyPayment(ctx) {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        productIds,
        addressId,
        userId // Optional: extract from ctx.state.user if using JWT auth
      } = ctx.request.body;

      // 1. Verify the signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;

      if (!isAuthentic) {
        return ctx.badRequest('Invalid signature');
      }

      // 2. Fetch products to get total amount for saving in DB
      const products = await strapi.db.query('api::product.product').findMany({
        where: { id: productIds }
      });
      const totalAmount = products.reduce((sum, product) => sum + product.price, 0);

      // 3. Create the Order in Strapi database
      const newOrder = await strapi.entityService.create('api::order.order', {
        data: {
          products: productIds,
          address: addressId,
          user: userId, // Link the user
          totalAmount: totalAmount,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          paymentStatus: 'success',
          status: 'processing', // Initial status for admin to update later
          publishedAt: new Date(), // Required if drafting is enabled on the collection
        }
      });

      ctx.send({ message: 'Payment verified and order created', order: newOrder });

    } catch (error) {
      ctx.throw(500, 'Error verifying payment', { error });
    }
  }
}));