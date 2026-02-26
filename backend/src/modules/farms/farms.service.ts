import { prisma } from '../../config/index.js';
import { NotFoundError } from '../../common/errors.js';
import { parsePagination, paginatedResponse, PaginatedResponse } from '../../common/utils.js';
import { Farm, Prisma } from '@prisma/client';

interface FarmWithDetails extends Farm {
  certifications: { name: string }[];
  _count: { products: number };
}

interface ListFarmsParams {
  page?: number;
  limit?: number;
  province?: string;
  verified?: boolean;
  coldChain?: boolean;
  search?: string;
  sortBy?: 'rating' | 'name' | 'createdAt' | 'reviewCount';
  sortOrder?: 'asc' | 'desc';
}

export class FarmsService {
  async list(params: ListFarmsParams): Promise<PaginatedResponse<FarmWithDetails>> {
    const pagination = parsePagination(params.page, params.limit);

    const where: Prisma.FarmWhereInput = {};

    if (params.province) {
      where.province = params.province;
    }

    if (params.verified !== undefined) {
      where.verified = params.verified;
    }

    if (params.coldChain !== undefined) {
      where.coldChain = params.coldChain;
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { location: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.FarmOrderByWithRelationInput = {};
    const sortBy = params.sortBy || 'rating';
    const sortOrder = params.sortOrder || 'desc';

    if (sortBy === 'rating') {
      orderBy.rating = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'reviewCount') {
      orderBy.reviewCount = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [farms, total] = await Promise.all([
      prisma.farm.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          certifications: {
            select: { name: true },
          },
          _count: {
            select: { products: true },
          },
        },
      }),
      prisma.farm.count({ where }),
    ]);

    return paginatedResponse(farms as FarmWithDetails[], total, pagination);
  }

  async getById(id: string): Promise<FarmWithDetails> {
    const farm = await prisma.farm.findUnique({
      where: { id },
      include: {
        certifications: {
          select: {
            id: true,
            name: true,
            issuedBy: true,
            issuedAt: true,
            expiresAt: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: { products: true, orders: true },
        },
      },
    });

    if (!farm) {
      throw new NotFoundError('Farm not found');
    }

    return farm as FarmWithDetails;
  }

  async getBySlug(slug: string): Promise<FarmWithDetails> {
    const farm = await prisma.farm.findUnique({
      where: { slug },
      include: {
        certifications: {
          select: {
            id: true,
            name: true,
            issuedBy: true,
            issuedAt: true,
            expiresAt: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: { products: true, orders: true },
        },
      },
    });

    if (!farm) {
      throw new NotFoundError('Farm not found');
    }

    return farm as FarmWithDetails;
  }

  async getProducts(farmId: string, params: { page?: number; limit?: number; active?: boolean }) {
    const pagination = parsePagination(params.page, params.limit);

    const where: Prisma.ProductWhereInput = {
      farmId,
      active: params.active ?? true,
    };

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

  async getProvinces(): Promise<{ province: string; count: number }[]> {
    const provinces = await prisma.farm.groupBy({
      by: ['province'],
      _count: true,
      orderBy: {
        _count: {
          province: 'desc',
        },
      },
    });

    return provinces.map((p) => ({
      province: p.province,
      count: p._count,
    }));
  }

  async getStats(farmId: string) {
    const [
      productCount,
      orderCount,
      totalRevenue,
      pendingOrders,
      pendingInquiries,
    ] = await Promise.all([
      prisma.product.count({ where: { farmId, active: true } }),
      prisma.order.count({
        where: { farmId, status: { in: ['DELIVERED', 'SHIPPED'] } },
      }),
      prisma.order.aggregate({
        where: { farmId, status: 'DELIVERED' },
        _sum: { subtotal: true },
      }),
      prisma.order.count({
        where: { farmId, status: { in: ['PAID', 'CONFIRMED', 'PREPARING'] } },
      }),
      prisma.inquiry.count({
        where: { farmId, status: 'PENDING' },
      }),
    ]);

    return {
      productCount,
      orderCount,
      totalRevenue: totalRevenue._sum.subtotal || 0,
      pendingOrders,
      pendingInquiries,
    };
  }
}

export const farmsService = new FarmsService();
