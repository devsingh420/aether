import sgMail from '@sendgrid/mail';
import { prisma, env } from '../../config/index.js';
import { NotificationType, Prisma } from '@prisma/client';
import { parsePagination, paginatedResponse } from '../../common/utils.js';

// Initialize SendGrid
if (env.SENDGRID_API_KEY) {
  sgMail.setApiKey(env.SENDGRID_API_KEY);
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface NotificationData {
  orderId?: string;
  orderNumber?: string;
  inquiryId?: string;
  productId?: string;
  [key: string]: any;
}

const EMAIL_TEMPLATES = {
  ORDER_CONFIRMED: (data: NotificationData) => ({
    subject: `Order Confirmed - ${data.orderNumber}`,
    html: `
      <h2>Your order has been confirmed!</h2>
      <p>Order Number: <strong>${data.orderNumber}</strong></p>
      <p>The farm is preparing your order. You will receive a notification when it ships.</p>
      <p><a href="${env.FRONTEND_URL}/orders/${data.orderNumber}">View Order Details</a></p>
    `,
  }),
  ORDER_SHIPPED: (data: NotificationData) => ({
    subject: `Order Shipped - ${data.orderNumber}`,
    html: `
      <h2>Your order is on its way!</h2>
      <p>Order Number: <strong>${data.orderNumber}</strong></p>
      ${data.trackingNumber ? `<p>Tracking Number: <strong>${data.trackingNumber}</strong></p>` : ''}
      <p><a href="${env.FRONTEND_URL}/orders/${data.orderNumber}">Track Your Order</a></p>
    `,
  }),
  ORDER_DELIVERED: (data: NotificationData) => ({
    subject: `Order Delivered - ${data.orderNumber}`,
    html: `
      <h2>Your order has been delivered!</h2>
      <p>Order Number: <strong>${data.orderNumber}</strong></p>
      <p>Thank you for shopping with Aether Produce.</p>
      <p><a href="${env.FRONTEND_URL}/orders/${data.orderNumber}">View Order Details</a></p>
    `,
  }),
  PAYMENT_RECEIVED: (data: NotificationData) => ({
    subject: `Payment Received - ${data.orderNumber}`,
    html: `
      <h2>Payment Received</h2>
      <p>We've received your payment for order <strong>${data.orderNumber}</strong>.</p>
      <p>Amount: <strong>฿${data.amount}</strong></p>
      <p><a href="${env.FRONTEND_URL}/orders/${data.orderNumber}">View Order Details</a></p>
    `,
  }),
  INQUIRY_RECEIVED: (data: NotificationData) => ({
    subject: 'New Quote Request Received',
    html: `
      <h2>You have a new quote request!</h2>
      <p>Product: <strong>${data.productName}</strong></p>
      <p>Quantity: <strong>${data.quantity} ${data.unit}</strong></p>
      <p>Proposed Price: <strong>฿${data.proposedPrice}/${data.unit}</strong></p>
      <p><a href="${env.FRONTEND_URL}/farm/inquiries">View Inquiry</a></p>
    `,
  }),
  INQUIRY_RESPONSE: (data: NotificationData) => ({
    subject: `Quote Response - ${data.productName}`,
    html: `
      <h2>The farm has responded to your quote request</h2>
      <p>Product: <strong>${data.productName}</strong></p>
      <p>Status: <strong>${data.status}</strong></p>
      ${data.agreedPrice ? `<p>Agreed Price: <strong>฿${data.agreedPrice}/${data.unit}</strong></p>` : ''}
      <p><a href="${env.FRONTEND_URL}/inquiries">View Details</a></p>
    `,
  }),
  LOW_STOCK: (data: NotificationData) => ({
    subject: `Low Stock Alert - ${data.productName}`,
    html: `
      <h2>Low Stock Alert</h2>
      <p>Your product <strong>${data.productName}</strong> is running low on stock.</p>
      <p>Current Stock: <strong>${data.currentStock} ${data.unit}</strong></p>
      <p><a href="${env.FRONTEND_URL}/farm/products">Update Inventory</a></p>
    `,
  }),
  PAYOUT_PROCESSED: (data: NotificationData) => ({
    subject: 'Payout Processed',
    html: `
      <h2>Your payout has been processed</h2>
      <p>Amount: <strong>฿${data.amount}</strong></p>
      <p>Reference: <strong>${data.reference}</strong></p>
      <p>The funds should arrive in your bank account within 1-2 business days.</p>
    `,
  }),
};

export class NotificationsService {
  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: NotificationData
  ) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data || {},
      },
    });
  }

  async list(
    userId: string,
    params: { page?: number; limit?: number; unreadOnly?: boolean }
  ) {
    const pagination = parsePagination(params.page, params.limit);

    const where: Prisma.NotificationWhereInput = { userId };

    if (params.unreadOnly) {
      where.read = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return paginatedResponse(notifications, total, pagination);
  }

  async markAsRead(userId: string, notificationId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    if (!env.SENDGRID_API_KEY) {
      console.log('SendGrid not configured, skipping email:', options.subject);
      return false;
    }

    try {
      await sgMail.send({
        to: options.to,
        from: env.SENDGRID_FROM_EMAIL,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendLINEMessage(lineUserId: string, message: string): Promise<boolean> {
    if (!env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN) {
      console.log('LINE Messaging not configured, skipping message');
      return false;
    }

    try {
      const response = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          to: lineUserId,
          messages: [{ type: 'text', text: message }],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send LINE message:', error);
      return false;
    }
  }

  // High-level notification methods
  async notifyOrderConfirmed(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) return;

    const data: NotificationData = {
      orderId: order.id,
      orderNumber: order.orderNumber,
    };

    // Create in-app notification
    await this.create(
      order.userId,
      'ORDER_CONFIRMED',
      'Order Confirmed',
      `Your order ${order.orderNumber} has been confirmed.`,
      data
    );

    // Send email
    const template = EMAIL_TEMPLATES.ORDER_CONFIRMED(data);
    await this.sendEmail({
      to: order.user.email,
      subject: template.subject,
      html: template.html,
    });

    // Send LINE message if user has LINE connected
    if (order.user.lineUserId) {
      await this.sendLINEMessage(
        order.user.lineUserId,
        `Your order ${order.orderNumber} has been confirmed! The farm is preparing your order.`
      );
    }
  }

  async notifyOrderShipped(orderId: string, trackingNumber?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) return;

    const data: NotificationData = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      trackingNumber,
    };

    await this.create(
      order.userId,
      'ORDER_SHIPPED',
      'Order Shipped',
      `Your order ${order.orderNumber} is on its way!`,
      data
    );

    const template = EMAIL_TEMPLATES.ORDER_SHIPPED(data);
    await this.sendEmail({
      to: order.user.email,
      subject: template.subject,
      html: template.html,
    });

    if (order.user.lineUserId) {
      let message = `Your order ${order.orderNumber} has been shipped!`;
      if (trackingNumber) {
        message += ` Tracking: ${trackingNumber}`;
      }
      await this.sendLINEMessage(order.user.lineUserId, message);
    }
  }

  async notifyPaymentReceived(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, farm: { include: { owner: true } } },
    });

    if (!order) return;

    const data: NotificationData = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total.toString(),
    };

    // Notify buyer
    await this.create(
      order.userId,
      'PAYMENT_RECEIVED',
      'Payment Received',
      `Payment received for order ${order.orderNumber}`,
      data
    );

    // Notify farm owner
    await this.create(
      order.farm.ownerId,
      'PAYMENT_RECEIVED',
      'New Order Received',
      `New order ${order.orderNumber} - ฿${order.total}`,
      data
    );

    // Email to farm owner
    await this.sendEmail({
      to: order.farm.owner.email,
      subject: `New Order Received - ${order.orderNumber}`,
      html: `
        <h2>You have a new order!</h2>
        <p>Order Number: <strong>${order.orderNumber}</strong></p>
        <p>Total: <strong>฿${order.total}</strong></p>
        <p><a href="${env.FRONTEND_URL}/farm/orders">View Order</a></p>
      `,
    });
  }

  async notifyNewInquiry(inquiryId: string) {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: {
        product: true,
        farm: { include: { owner: true } },
      },
    });

    if (!inquiry) return;

    const data: NotificationData = {
      inquiryId: inquiry.id,
      productName: inquiry.product.name,
      quantity: inquiry.quantity.toString(),
      unit: inquiry.product.unit,
      proposedPrice: inquiry.proposedPrice.toString(),
    };

    await this.create(
      inquiry.farm.ownerId,
      'INQUIRY_RECEIVED',
      'New Quote Request',
      `Quote request for ${inquiry.product.name}`,
      data
    );

    const template = EMAIL_TEMPLATES.INQUIRY_RECEIVED(data);
    await this.sendEmail({
      to: inquiry.farm.owner.email,
      subject: template.subject,
      html: template.html,
    });
  }

  async notifyLowStock(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { farm: { include: { owner: true } } },
    });

    if (!product) return;

    const data: NotificationData = {
      productId: product.id,
      productName: product.name,
      currentStock: product.stock.toString(),
      unit: product.unit,
    };

    await this.create(
      product.farm.ownerId,
      'LOW_STOCK',
      'Low Stock Alert',
      `${product.name} is running low`,
      data
    );

    const template = EMAIL_TEMPLATES.LOW_STOCK(data);
    await this.sendEmail({
      to: product.farm.owner.email,
      subject: template.subject,
      html: template.html,
    });
  }
}

export const notificationsService = new NotificationsService();
