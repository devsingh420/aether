import { prisma } from '../../config/index.js';
import { NotFoundError } from '../../common/errors.js';
import { parsePagination, paginatedResponse, PaginatedResponse } from '../../common/utils.js';
import { Grade, Product, Prisma } from '@prisma/client';

interface ProductWithFarm extends Product {
  farm: {
    id: string;
    name: string;
    slug: string;
    province: string;
    verified: boolean;
    rating: Prisma.Decimal;
    coldChain: boolean;
  };
}

interface ProductFilters {
  category?: string;
  subcategory?: string;
  grade?: Grade;
  farmId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  needsColdChain?: boolean;
  active?: boolean;
}

interface ListProductsParams extends ProductFilters {
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'name' | 'createdAt' | 'stock';
  sortOrder?: 'asc' | 'desc';
}

export class ProductsService {
  async list(params: ListProductsParams): Promise<PaginatedResponse<ProductWithFarm>> {
    const pagination = parsePagination(params.page, params.limit);

    const where: Prisma.ProductWhereInput = {
      active: params.active ?? true,
    };

    if (params.category) {
      where.category = params.category;
    }

    if (params.subcategory) {
      where.subcategory = params.subcategory;
    }

    if (params.grade) {
      where.grade = params.grade;
    }

    if (params.farmId) {
      where.farmId = params.farmId;
    }

    if (params.needsColdChain !== undefined) {
      where.needsColdChain = params.needsColdChain;
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { farm: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    if (params.minPrice || params.maxPrice) {
      where.retailPrice = {};
      if (params.minPrice) {
        where.retailPrice.gte = params.minPrice;
      }
      if (params.maxPrice) {
        where.retailPrice.lte = params.maxPrice;
      }
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    if (sortBy === 'price') {
      orderBy.retailPrice = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'stock') {
      orderBy.stock = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          farm: {
            select: {
              id: true,
              name: true,
              slug: true,
              province: true,
              verified: true,
              rating: true,
              coldChain: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return paginatedResponse(products, total, pagination);
  }

  async getById(id: string): Promise<ProductWithFarm> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            location: true,
            province: true,
            description: true,
            image: true,
            verified: true,
            rating: true,
            reviewCount: true,
            coldChain: true,
            escrowEnabled: true,
            deliveryBangkok: true,
            deliveryRegional: true,
            certifications: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product as ProductWithFarm;
  }

  async getBySlug(farmSlug: string, productSlug: string): Promise<ProductWithFarm> {
    const farm = await prisma.farm.findUnique({
      where: { slug: farmSlug },
      select: { id: true },
    });

    if (!farm) {
      throw new NotFoundError('Farm not found');
    }

    const product = await prisma.product.findUnique({
      where: {
        farmId_slug: {
          farmId: farm.id,
          slug: productSlug,
        },
      },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            location: true,
            province: true,
            description: true,
            image: true,
            verified: true,
            rating: true,
            reviewCount: true,
            coldChain: true,
            escrowEnabled: true,
            deliveryBangkok: true,
            deliveryRegional: true,
            certifications: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product as ProductWithFarm;
  }

  async getByCategory(category: string, params: ListProductsParams): Promise<PaginatedResponse<ProductWithFarm>> {
    return this.list({ ...params, category });
  }

  async getRelated(productId: string, limit: number = 4): Promise<ProductWithFarm[]> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { category: true, farmId: true },
    });

    if (!product) {
      return [];
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        AND: [
          { id: { not: productId } },
          { active: true },
          {
            OR: [{ category: product.category }, { farmId: product.farmId }],
          },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            province: true,
            verified: true,
            rating: true,
            coldChain: true,
          },
        },
      },
    });

    return relatedProducts as ProductWithFarm[];
  }

  async getCategories() {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        subcategories: {
          where: { active: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Get product counts per category
    const counts = await prisma.product.groupBy({
      by: ['category'],
      where: { active: true },
      _count: true,
    });

    const countMap = new Map(counts.map((c) => [c.category, c._count]));

    return categories.map((cat) => ({
      ...cat,
      productCount: countMap.get(cat.slug) || 0,
    }));
  }

  async checkStock(productId: string, quantity: number): Promise<boolean> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, reservedStock: true },
    });

    if (!product) {
      return false;
    }

    const availableStock = product.stock - product.reservedStock;
    return availableStock >= quantity;
  }

  async reserveStock(productId: string, quantity: number): Promise<void> {
    await prisma.product.update({
      where: { id: productId },
      data: {
        reservedStock: { increment: quantity },
      },
    });
  }

  async releaseStock(productId: string, quantity: number): Promise<void> {
    await prisma.product.update({
      where: { id: productId },
      data: {
        reservedStock: { decrement: quantity },
      },
    });
  }

  async confirmStock(productId: string, quantity: number): Promise<void> {
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: { decrement: quantity },
        reservedStock: { decrement: quantity },
      },
    });
  }
}

export const productsService = new ProductsService();
