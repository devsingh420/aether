import { FastifyInstance } from 'fastify';
import { prisma } from '../../config/index.js';
import { adminGuard } from '../../common/guards/auth.guard.js';
import { parsePagination, paginatedResponse } from '../../common/utils.js';
import { OrderStatus, Prisma } from '@prisma/client';

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // All routes require admin auth
  app.addHook('preHandler', adminGuard);

  // List users
  app.get<{
    Querystring: { page?: number; limit?: number; search?: string; role?: string };
  }>(
    '/users',
    {
      schema: {
        tags: ['Admin'],
        description: 'List all users',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request) => {
      const pagination = parsePagination(request.query.page, request.query.limit);

      const where: Prisma.UserWhereInput = {};

      if (request.query.search) {
        where.OR = [
          { name: { contains: request.query.search, mode: 'insensitive' } },
          { email: { contains: request.query.search, mode: 'insensitive' } },
        ];
      }

      if (request.query.role) {
        where.role = request.query.role as any;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: pagination.skip,
          take: pagination.limit,
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            company: true,
            type: true,
            role: true,
            verified: true,
            createdAt: true,
            _count: { select: { orders: true } },
          },
        }),
        prisma.user.count({ where }),
      ]);

      return { success: true, ...paginatedResponse(users, total, pagination) };
    }
  );

  // List farms
  app.get<{
    Querystring: { page?: number; limit?: number; verified?: boolean; search?: string };
  }>(
    '/farms',
    {
      schema: {
        tags: ['Admin'],
        description: 'List all farms',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request) => {
      const pagination = parsePagination(request.query.page, request.query.limit);

      const where: Prisma.FarmWhereInput = {};

      if (request.query.verified !== undefined) {
        where.verified = request.query.verified;
      }

      if (request.query.search) {
        where.OR = [
          { name: { contains: request.query.search, mode: 'insensitive' } },
          { owner: { email: { contains: request.query.search, mode: 'insensitive' } } },
        ];
      }

      const [farms, total] = await Promise.all([
        prisma.farm.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: pagination.skip,
          take: pagination.limit,
          include: {
            owner: { select: { id: true, name: true, email: true } },
            _count: { select: { products: true, orders: true } },
          },
        }),
        prisma.farm.count({ where }),
      ]);

      return { success: true, ...paginatedResponse(farms, total, pagination) };
    }
  );

  // Verify farm
  app.patch<{ Params: { id: string }; Body: { verified: boolean } }>(
    '/farms/:id/verify',
    {
      schema: {
        tags: ['Admin'],
        description: 'Verify or unverify a farm',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['verified'],
          properties: {
            verified: { type: 'boolean' },
          },
        },
      },
    },
    async (request) => {
      const farm = await prisma.farm.update({
        where: { id: request.params.id },
        data: { verified: request.body.verified },
      });

      return { success: true, data: farm };
    }
  );

  // List orders
  app.get<{
    Querystring: {
      page?: number;
      limit?: number;
      status?: OrderStatus;
      farmId?: string;
    };
  }>(
    '/orders',
    {
      schema: {
        tags: ['Admin'],
        description: 'List all orders',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request) => {
      const pagination = parsePagination(request.query.page, request.query.limit);

      const where: Prisma.OrderWhereInput = {};

      if (request.query.status) {
        where.status = request.query.status;
      }

      if (request.query.farmId) {
        where.farmId = request.query.farmId;
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: pagination.skip,
          take: pagination.limit,
          include: {
            user: { select: { id: true, name: true, email: true } },
            farm: { select: { id: true, name: true } },
            payment: { select: { status: true, method: true } },
          },
        }),
        prisma.order.count({ where }),
      ]);

      return { success: true, ...paginatedResponse(orders, total, pagination) };
    }
  );

  // Get analytics
  app.get(
    '/analytics',
    {
      schema: {
        tags: ['Admin'],
        description: 'Get platform analytics',
        security: [{ bearerAuth: [] }],
      },
    },
    async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const [
        totalUsers,
        totalFarms,
        totalProducts,
        totalOrders,
        totalRevenue,
        monthlyOrders,
        monthlyRevenue,
        lastMonthRevenue,
        ordersByStatus,
        topFarms,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.farm.count(),
        prisma.product.count({ where: { active: true } }),
        prisma.order.count(),
        prisma.order.aggregate({
          where: { status: 'DELIVERED' },
          _sum: { total: true },
        }),
        prisma.order.count({
          where: { createdAt: { gte: startOfMonth } },
        }),
        prisma.order.aggregate({
          where: {
            status: 'DELIVERED',
            deliveredAt: { gte: startOfMonth },
          },
          _sum: { total: true },
        }),
        prisma.order.aggregate({
          where: {
            status: 'DELIVERED',
            deliveredAt: { gte: startOfLastMonth, lt: startOfMonth },
          },
          _sum: { total: true },
        }),
        prisma.order.groupBy({
          by: ['status'],
          _count: true,
        }),
        prisma.farm.findMany({
          take: 5,
          orderBy: { rating: 'desc' },
          select: {
            id: true,
            name: true,
            rating: true,
            _count: { select: { orders: true } },
          },
        }),
      ]);

      const currentMonthRev = Number(monthlyRevenue._sum.total) || 0;
      const lastMonthRev = Number(lastMonthRevenue._sum.total) || 0;
      const revenueGrowth = lastMonthRev > 0
        ? ((currentMonthRev - lastMonthRev) / lastMonthRev) * 100
        : 0;

      return {
        success: true,
        data: {
          overview: {
            totalUsers,
            totalFarms,
            totalProducts,
            totalOrders,
            totalRevenue: Number(totalRevenue._sum.total) || 0,
          },
          monthly: {
            orders: monthlyOrders,
            revenue: currentMonthRev,
            revenueGrowth: Math.round(revenueGrowth * 100) / 100,
          },
          ordersByStatus: ordersByStatus.reduce((acc, item) => {
            acc[item.status] = item._count;
            return acc;
          }, {} as Record<string, number>),
          topFarms: topFarms.map((f) => ({
            id: f.id,
            name: f.name,
            rating: Number(f.rating),
            orderCount: f._count.orders,
          })),
        },
      };
    }
  );
}
