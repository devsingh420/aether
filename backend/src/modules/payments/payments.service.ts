import Stripe from 'stripe';
import { prisma, env } from '../../config/index.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { ordersService } from '../orders/orders.service.js';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  : null;

interface CreatePromptPayPaymentResult {
  paymentId: string;
  intentId: string;
  clientSecret: string;
  qrCodeUrl: string | null;
  expiresAt: Date;
}

interface CreateCardPaymentResult {
  paymentId: string;
  intentId: string;
  clientSecret: string;
}

export class PaymentsService {
  async createPromptPayPayment(orderId: string, userId: string): Promise<CreatePromptPayPaymentResult> {
    if (!stripe) {
      throw new BadRequestError('Payment system not configured');
    }

    const order = await ordersService.getById(orderId, userId);

    if (order.status !== 'PENDING') {
      throw new BadRequestError('Order is not pending payment');
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (existingPayment && existingPayment.status === 'COMPLETED') {
      throw new BadRequestError('Order is already paid');
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.total) * 100), // Convert to satang
      currency: 'thb',
      payment_method_types: ['promptpay'],
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId,
      },
    });

    // Confirm to generate QR code
    const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
      payment_method_data: {
        type: 'promptpay',
      },
      return_url: `${env.FRONTEND_URL}/orders/${order.orderNumber}`,
    });

    const nextAction = confirmedIntent.next_action as any;
    const qrCodeUrl = nextAction?.promptpay_display_qr_code?.image_url_svg || null;
    const expiresAt = new Date(
      (nextAction?.promptpay_display_qr_code?.expires_at || Date.now() / 1000 + 900) * 1000
    );

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        method: 'PROMPTPAY',
        amount: order.total,
        currency: 'THB',
        status: 'PENDING',
        stripeIntentId: paymentIntent.id,
        qrCodeUrl,
        expiresAt,
      },
      update: {
        stripeIntentId: paymentIntent.id,
        qrCodeUrl,
        expiresAt,
        status: 'PENDING',
      },
    });

    return {
      paymentId: payment.id,
      intentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      qrCodeUrl,
      expiresAt,
    };
  }

  async createCardPayment(orderId: string, userId: string): Promise<CreateCardPaymentResult> {
    if (!stripe) {
      throw new BadRequestError('Payment system not configured');
    }

    const order = await ordersService.getById(orderId, userId);

    if (order.status !== 'PENDING') {
      throw new BadRequestError('Order is not pending payment');
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (existingPayment && existingPayment.status === 'COMPLETED') {
      throw new BadRequestError('Order is already paid');
    }

    // Create payment intent for card
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.total) * 100),
      currency: 'thb',
      payment_method_types: ['card'],
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId,
      },
    });

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        method: 'CREDIT_CARD',
        amount: order.total,
        currency: 'THB',
        status: 'PENDING',
        stripeIntentId: paymentIntent.id,
      },
      update: {
        method: 'CREDIT_CARD',
        stripeIntentId: paymentIntent.id,
        status: 'PENDING',
      },
    });

    return {
      paymentId: payment.id,
      intentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
    };
  }

  async handleWebhook(payload: string, signature: string): Promise<void> {
    if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
      throw new BadRequestError('Payment system not configured');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      throw new BadRequestError('Invalid webhook signature');
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.canceled':
        await this.handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const orderId = paymentIntent.metadata.orderId;
    if (!orderId) return;

    await prisma.$transaction(async (tx) => {
      // Update payment record
      await tx.payment.update({
        where: { stripeIntentId: paymentIntent.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
          stripeResponse: paymentIntent as object,
        },
      });

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });
    });

    // TODO: Send notification to user and farm
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await prisma.payment.update({
      where: { stripeIntentId: paymentIntent.id },
      data: {
        status: 'FAILED',
        stripeResponse: paymentIntent as object,
      },
    });
  }

  private async handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    await prisma.payment.update({
      where: { stripeIntentId: paymentIntent.id },
      data: {
        status: 'FAILED',
        stripeResponse: paymentIntent as object,
      },
    });
  }

  async getPaymentStatus(orderId: string, userId?: string): Promise<{
    status: PaymentStatus;
    method: PaymentMethod | null;
    paidAt: Date | null;
    qrCodeUrl: string | null;
  }> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (userId && order.userId !== userId) {
      throw new BadRequestError('Access denied');
    }

    return {
      status: order.payment?.status || 'PENDING',
      method: order.payment?.method || null,
      paidAt: order.payment?.paidAt || null,
      qrCodeUrl: order.payment?.qrCodeUrl || null,
    };
  }

  async refund(orderId: string): Promise<void> {
    if (!stripe) {
      throw new BadRequestError('Payment system not configured');
    }

    const payment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment || !payment.stripeIntentId) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.status !== 'COMPLETED') {
      throw new BadRequestError('Payment has not been completed');
    }

    // Create refund
    await stripe.refunds.create({
      payment_intent: payment.stripeIntentId,
    });

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'REFUNDED' },
    });
  }

  async getPublishableKey(): Promise<string> {
    if (!env.STRIPE_PUBLISHABLE_KEY) {
      throw new BadRequestError('Payment system not configured');
    }
    return env.STRIPE_PUBLISHABLE_KEY;
  }
}

export const paymentsService = new PaymentsService();
