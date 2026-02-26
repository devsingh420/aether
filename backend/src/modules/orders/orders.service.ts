import { prisma, env } from '../../config/index.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../common/errors.js';
import {
  generateOrderNumber,
  calculatePlatformFee,
  parsePagination,
  paginatedResponse,
  PaginatedResponse,
} from '../../common/utils.js';
import { productsService } from '../products/products.service.js';
import { Order, OrderStatus, OrderType, Prisma } from '@prisma/client';

interface CartItem {
  productId: string;
  quantity: number;
}

interface CreateOrderInput {
  items: CartItem[];
  deliveryMethod: string;
  deliveryAddress: {
    name: string;
    phone: string;
    address: string;
    subdistrict: string;
    district: string;
    province: string;
    postalCode: string;
    notes?: string;
  };
  scheduledDate?: Date;
  notes?: string;
  type?: OrderType;
}

interface OrderWithDetails extends Order {
  items: {
    id: string;
    productId: string;
    productName: string;
    quantity: Prisma.Decimal;
    unitPrice: Prisma.Decimal;
    total: Prisma.Decimal;
    product: {
      images: string[];
      unit: string;
    };
  }[];
  farm: {
    id: string;
    name: string;
    slug: string;
  };
  payment?: {
    status: string;
    method: string;
  };
  delivery?: {
    status: string;
    trackingNumber: string | null;
    provider: string;
  };
}

const DELIVERY_FEES: Record<string, number> = {
  standard: 50,
  express: 150,
  coldChain: 200,
  scheduled: 100,
};

export class OrdersService {
  async create(userId: string, input: CreateOrderInput): Promise<OrderWithDetails> {
    // Validate cart items
    if (!input.items.length) {
      throw new BadRequestError('Cart is empty');
    }

    // Get all products
    const productIds = input.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        farm: { select: { id: true, name: true, slug: true } },
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestError('Some products not found');
    }

    // Verify all items are from the same farm
    const farmIds = new Set(products.map((p) => p.farmId));
    if (farmIds.size > 1) {
      throw new BadRequestError('All items must be from the same farm');
    }

    const farm = products[0].farm;

    // Calculate totals
    let subtotal = 0;
    const orderItems: {
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[] = [];

    for (const item of input.items) {
      const product = products.find((p) => p.id === item.productId)!;

      // Check stock
      const isAvailable = await productsService.checkStock(product.id, item.quantity);
      if (!isAvailable) {
        throw new BadRequestError(`Insufficient stock for ${product.name}`);
      }

      // Calculate price based on quantity (use tier pricing for wholesale)
      let unitPrice = Number(product.retailPrice);
      if (input.type === 'WHOLESALE') {
        const tiers = product.pricingTiers as { min: number; max: number; price: number }[];
        for (const tier of tiers) {
          if (item.quantity >= tier.min && item.quantity <= tier.max) {
            unitPrice = tier.price;
            break;
          }
        }
      }

      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        total: itemTotal,
      });
    }

    // Calculate fees
    const deliveryFee = DELIVERY_FEES[input.deliveryMethod] || DELIVERY_FEES.standard;
    const isWholesale = input.type === 'WHOLESALE';
    const platformFee = calculatePlatformFee(
      subtotal,
      isWholesale,
      env.PLATFORM_FEE_RETAIL,
      env.PLATFORM_FEE_WHOLESALE
    );
    const total = subtotal + deliveryFee + platformFee;

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Reserve stock for all items
      for (const item of input.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { reservedStock: { increment: item.quantity } },
        });
      }

      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          farmId: farm.id,
          type: input.type || 'RETAIL',
          status: 'PENDING',
          subtotal,
          deliveryFee,
          platformFee,
          total,
          deliveryMethod: input.deliveryMethod,
          deliveryAddress: input.deliveryAddress,
          scheduledDate: input.scheduledDate,
          notes: input.notes,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { images: true, unit: true },
              },
            },
          },
          farm: {
            select: { id: true, name: true, slug: true },
          },
        },
      });

      return newOrder;
    });

    return order as OrderWithDetails;
  }

  async list(
    userId: string,
    params: {
      page?: number;
      limit?: number;
      status?: OrderStatus;
    }
  ): Promise<PaginatedResponse<OrderWithDetails>> {
    const pagination = parsePagination(params.page, params.limit);

    const where: Prisma.OrderWhereInput = { userId };

    if (params.status) {
      where.status = params.status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          items: {
            include: {
              product: {
                select: { images: true, unit: true },
              },
            },
          },
          farm: {
            select: { id: true, name: true, slug: true },
          },
          payment: {
            select: { status: true, method: true },
          },
          delivery: {
            select: { status: true, trackingNumber: true, provider: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return paginatedResponse(orders as OrderWithDetails[], total, pagination);
  }

  async getById(orderId: string, userId?: string): Promise<OrderWithDetails> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: { images: true, unit: true },
            },
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            deliveryBangkok: true,
            deliveryRegional: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        payment: true,
        delivery: true,
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (userId && order.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return order as OrderWithDetails;
  }

  async getByOrderNumber(orderNumber: string, userId?: string): Promise<OrderWithDetails> {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              select: { images: true, unit: true },
            },
          },
        },
        farm: {
          select: { id: true, name: true, slug: true },
        },
        payment: true,
        delivery: true,
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (userId && order.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return order as OrderWithDetails;
  }

  async cancel(orderId: string, userId: string): Promise<OrderWithDetails> {
    const order = await this.getById(orderId, userId);

    if (!['PENDING', 'PAID'].includes(order.status)) {
      throw new BadRequestError('Order cannot be cancelled at this stage');
    }

    // Release reserved stock
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { reservedStock: { decrement: Number(item.quantity) } },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
        },
      });
    });

    return this.getById(orderId);
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    farmId?: string
  ): Promise<OrderWithDetails> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (farmId && order.farmId !== farmId) {
      throw new ForbiddenError('Access denied');
    }

    // Validate status transition
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['PAID', 'CANCELLED'],
      PAID: ['CONFIRMED', 'REFUNDED', 'CANCELLED'],
      CONFIRMED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['SHIPPED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
      REFUNDED: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      throw new BadRequestError(
        `Cannot transition from ${order.status} to ${status}`
      );
    }

    const updateData: Prisma.OrderUpdateInput = { status };

    // Set timestamps
    if (status === 'PAID') updateData.paidAt = new Date();
    if (status === 'CONFIRMED') updateData.confirmedAt = new Date();
    if (status === 'SHIPPED') updateData.shippedAt = new Date();
    if (status === 'DELIVERED') updateData.deliveredAt = new Date();
    if (status === 'CANCELLED') updateData.cancelledAt = new Date();

    // If confirmed, confirm stock (deduct from available)
    if (status === 'CONFIRMED') {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: Number(item.quantity) },
              reservedStock: { decrement: Number(item.quantity) },
            },
          });
        }

        await tx.order.update({
          where: { id: orderId },
          data: updateData,
        });
      });
    } else if (status === 'CANCELLED' || status === 'REFUNDED') {
      // Release reserved stock
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { reservedStock: { decrement: Number(item.quantity) } },
          });
        }

        await tx.order.update({
          where: { id: orderId },
          data: updateData,
        });
      });
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: updateData,
      });
    }

    return this.getById(orderId);
  }

  async markAsPaid(orderId: string): Promise<void> {
    await this.updateStatus(orderId, 'PAID');
  }
}

export const ordersService = new OrdersService();
