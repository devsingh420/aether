import { prisma, env } from '../../config/index.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../common/errors.js';
import {
  slugify,
  parsePagination,
  paginatedResponse,
  PaginatedResponse,
} from '../../common/utils.js';
import { Grade, OrderStatus, Prisma, Product } from '@prisma/client';

interface CreateProductInput {
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  specifications: string[];
  grade: Grade;
  images: string[];
  unit?: string;
  retailUnit: string;
  retailQty: number;
  retailPrice: number;
  pricingTiers: { min: number; max: number; price: number }[];
  moqRetail?: number;
  moqWholesale: number;
  stock: number;
  harvestSchedule?: string;
  shelfLife?: string;
  storageTemp?: string;
  needsColdChain?: boolean;
}

interface UpdateProductInput extends Partial<CreateProductInput> {
  active?: boolean;
}

interface FarmStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingInquiries: number;
  averageRating: number;
  pendingPayouts: number;
}

export class FarmDashboardService {
  async getStats(farmId: string): Promise<FarmStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      productStats,
      activeProductsCount,
      orderStats,
      totalRevenueData,
      monthlyRevenueData,
      pendingInquiriesCount,
      farm,
      pendingPayoutsData,
    ] = await Promise.all([
      prisma.product.aggregate({
        where: { farmId },
        _count: { _all: true },
      }),
      prisma.product.count({
        where: { farmId, active: true },
      }),
      prisma.order.aggregate({
        where: { farmId },
        _count: { _all: true },
      }),
      prisma.order.aggregate({
        where: { farmId, status: 'DELIVERED' },
        _sum: { subtotal: true },
      }),
      prisma.order.aggregate({
        where: {
          farmId,
          status: 'DELIVERED',
          deliveredAt: { gte: startOfMonth },
        },
        _sum: { subtotal: true },
      }),
      prisma.inquiry.count({
        where: { farmId, status: 'PENDING' },
      }),
      prisma.farm.findUnique({
        where: { id: farmId },
        select: { rating: true },
      }),
      prisma.payout.aggregate({
        where: { farmId, status: 'PENDING' },
        _sum: { netAmount: true },
      }),
    ]);

    const pendingOrders = await prisma.order.count({
      where: {
        farmId,
        status: { in: ['PAID', 'CONFIRMED', 'PREPARING'] },
      },
    });

    return {
      totalProducts: productStats._count._all,
      activeProducts: activeProductsCount,
      totalOrders: orderStats._count._all,
      pendingOrders,
      totalRevenue: Number(totalRevenueData._sum.subtotal) || 0,
      monthlyRevenue: Number(monthlyRevenueData._sum.subtotal) || 0,
      pendingInquiries: pendingInquiriesCount,
      averageRating: farm ? Number(farm.rating) : 5.0,
      pendingPayouts: Number(pendingPayoutsData._sum.netAmount) || 0,
    };
  }

  async listProducts(
    farmId: string,
    params: {
      page?: number;
      limit?: number;
      active?: boolean;
      category?: string;
      search?: string;
    }
  ): Promise<PaginatedResponse<Product>> {
    const pagination = parsePagination(params.page, params.limit);

    const where: Prisma.ProductWhereInput = { farmId };

    if (params.active !== undefined) {
      where.active = params.active;
    }

    if (params.category) {
      where.category = params.category;
    }

    if (params.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.product.count({ where }),
    ]);

    return paginatedResponse(products, total, pagination);
  }

  async createProduct(farmId: string, input: CreateProductInput): Promise<Product> {
    const slug = slugify(input.name);

    // Check for duplicate slug
    const existing = await prisma.product.findUnique({
      where: { farmId_slug: { farmId, slug } },
    });

    if (existing) {
      throw new BadRequestError('A product with this name already exists');
    }

    const product = await prisma.product.create({
      data: {
        farmId,
        name: input.name,
        slug,
        category: input.category,
        subcategory: input.subcategory,
        description: input.description,
        specifications: input.specifications,
        grade: input.grade,
        images: input.images,
        unit: input.unit || 'kg',
        retailUnit: input.retailUnit,
        retailQty: input.retailQty,
        retailPrice: input.retailPrice,
        pricingTiers: input.pricingTiers,
        moqRetail: input.moqRetail || 1,
        moqWholesale: input.moqWholesale,
        stock: input.stock,
        harvestSchedule: input.harvestSchedule,
        shelfLife: input.shelfLife,
        storageTemp: input.storageTemp,
        needsColdChain: input.needsColdChain || false,
      },
    });

    return product;
  }

  async updateProduct(
    farmId: string,
    productId: string,
    input: UpdateProductInput
  ): Promise<Product> {
    const product = await prisma.product.findFirst({
      where: { id: productId, farmId },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const updateData: Prisma.ProductUpdateInput = {};

    if (input.name !== undefined) {
      updateData.name = input.name;
      updateData.slug = slugify(input.name);
    }
    if (input.category !== undefined) updateData.category = input.category;
    if (input.subcategory !== undefined) updateData.subcategory = input.subcategory;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.specifications !== undefined) updateData.specifications = input.specifications;
    if (input.grade !== undefined) updateData.grade = input.grade;
    if (input.images !== undefined) updateData.images = input.images;
    if (input.unit !== undefined) updateData.unit = input.unit;
    if (input.retailUnit !== undefined) updateData.retailUnit = input.retailUnit;
    if (input.retailQty !== undefined) updateData.retailQty = input.retailQty;
    if (input.retailPrice !== undefined) {
      updateData.retailPrice = input.retailPrice;
      updateData.priceUpdated = new Date();
    }
    if (input.pricingTiers !== undefined) updateData.pricingTiers = input.pricingTiers;
    if (input.moqRetail !== undefined) updateData.moqRetail = input.moqRetail;
    if (input.moqWholesale !== undefined) updateData.moqWholesale = input.moqWholesale;
    if (input.harvestSchedule !== undefined) updateData.harvestSchedule = input.harvestSchedule;
    if (input.shelfLife !== undefined) updateData.shelfLife = input.shelfLife;
    if (input.storageTemp !== undefined) updateData.storageTemp = input.storageTemp;
    if (input.needsColdChain !== undefined) updateData.needsColdChain = input.needsColdChain;
    if (input.active !== undefined) updateData.active = input.active;

    return prisma.product.update({
      where: { id: productId },
      data: updateData,
    });
  }

  async updateInventory(
    farmId: string,
    productId: string,
    stock: number
  ): Promise<Product> {
    const product = await prisma.product.findFirst({
      where: { id: productId, farmId },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return prisma.product.update({
      where: { id: productId },
      data: { stock },
    });
  }

  async listOrders(
    farmId: string,
    params: {
      page?: number;
      limit?: number;
      status?: OrderStatus;
    }
  ) {
    const pagination = parsePagination(params.page, params.limit);

    const where: Prisma.OrderWhereInput = { farmId };

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
                select: { name: true, images: true, unit: true },
              },
            },
          },
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          payment: {
            select: { status: true, method: true, paidAt: true },
          },
          delivery: {
            select: { status: true, trackingNumber: true, provider: true },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return paginatedResponse(orders, total, pagination);
  }

  async updateOrderStatus(
    farmId: string,
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string
  ) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, farmId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Validate status transition
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: [],
      PAID: ['CONFIRMED'],
      CONFIRMED: ['PREPARING'],
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

    if (status === 'CONFIRMED') {
      updateData.confirmedAt = new Date();

      // Confirm stock (deduct from available)
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
      });
    }

    if (status === 'SHIPPED') {
      updateData.shippedAt = new Date();

      // Create/update delivery record
      if (trackingNumber) {
        await prisma.delivery.upsert({
          where: { orderId },
          create: {
            orderId,
            provider: 'manual',
            trackingNumber,
            status: 'IN_TRANSIT',
          },
          update: {
            trackingNumber,
            status: 'IN_TRANSIT',
          },
        });
      }
    }

    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();

      await prisma.delivery.update({
        where: { orderId },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
        },
      });
    }

    return prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: {
          include: {
            product: { select: { name: true, images: true, unit: true } },
          },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        payment: true,
        delivery: true,
      },
    });
  }

  async listPayouts(
    farmId: string,
    params: { page?: number; limit?: number }
  ) {
    const pagination = parsePagination(params.page, params.limit);

    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({
        where: { farmId },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.payout.count({ where: { farmId } }),
    ]);

    return paginatedResponse(payouts, total, pagination);
  }

  async getPayoutSummary(farmId: string) {
    const [pending, processing, completed, thisMonth] = await Promise.all([
      prisma.payout.aggregate({
        where: { farmId, status: 'PENDING' },
        _sum: { netAmount: true },
      }),
      prisma.payout.aggregate({
        where: { farmId, status: 'PROCESSING' },
        _sum: { netAmount: true },
      }),
      prisma.payout.aggregate({
        where: { farmId, status: 'COMPLETED' },
        _sum: { netAmount: true },
      }),
      prisma.payout.aggregate({
        where: {
          farmId,
          status: 'COMPLETED',
          processedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { netAmount: true },
      }),
    ]);

    return {
      pendingAmount: Number(pending._sum.netAmount) || 0,
      processingAmount: Number(processing._sum.netAmount) || 0,
      completedAmount: Number(completed._sum.netAmount) || 0,
      thisMonthAmount: Number(thisMonth._sum.netAmount) || 0,
    };
  }
}

export const farmDashboardService = new FarmDashboardService();
