import { FastifyInstance } from 'fastify';
import { productsService } from './products.service.js';
import { Grade } from '@prisma/client';

interface ListProductsQuery {
  page?: number;
  limit?: number;
  category?: string;
  subcategory?: string;
  grade?: Grade;
  farmId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  needsColdChain?: boolean;
  sortBy?: 'price' | 'name' | 'createdAt' | 'stock';
  sortOrder?: 'asc' | 'desc';
}

export async function productsRoutes(app: FastifyInstance): Promise<void> {
  // List products with filters
  app.get<{ Querystring: ListProductsQuery }>(
    '/',
    {
      schema: {
        tags: ['Products'],
        description: 'List products with filters and pagination',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100 },
            category: { type: 'string' },
            subcategory: { type: 'string' },
            grade: { type: 'string', enum: ['A', 'B', 'C'] },
            farmId: { type: 'string' },
            search: { type: 'string' },
            minPrice: { type: 'number' },
            maxPrice: { type: 'number' },
            needsColdChain: { type: 'boolean' },
            sortBy: { type: 'string', enum: ['price', 'name', 'createdAt', 'stock'] },
            sortOrder: { type: 'string', enum: ['asc', 'desc'] },
          },
        },
      },
    },
    async (request) => {
      const result = await productsService.list(request.query);
      return { success: true, ...result };
    }
  );

  // Get product by ID
  app.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Products'],
        description: 'Get product by ID',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request) => {
      const product = await productsService.getById(request.params.id);
      return { success: true, data: product };
    }
  );

  // Get products by category
  app.get<{ Params: { category: string }; Querystring: ListProductsQuery }>(
    '/category/:category',
    {
      schema: {
        tags: ['Products'],
        description: 'Get products by category',
        params: {
          type: 'object',
          required: ['category'],
          properties: {
            category: { type: 'string' },
          },
        },
      },
    },
    async (request) => {
      const result = await productsService.getByCategory(
        request.params.category,
        request.query
      );
      return { success: true, ...result };
    }
  );

  // Get related products
  app.get<{ Params: { id: string }; Querystring: { limit?: number } }>(
    '/:id/related',
    {
      schema: {
        tags: ['Products'],
        description: 'Get related products',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'number', minimum: 1, maximum: 10 },
          },
        },
      },
    },
    async (request) => {
      const products = await productsService.getRelated(
        request.params.id,
        request.query.limit
      );
      return { success: true, data: products };
    }
  );

  // Get all categories
  app.get(
    '/meta/categories',
    {
      schema: {
        tags: ['Products'],
        description: 'Get all product categories',
      },
    },
    async () => {
      const categories = await productsService.getCategories();
      return { success: true, data: categories };
    }
  );

  // Check stock availability
  app.get<{ Params: { id: string }; Querystring: { quantity: number } }>(
    '/:id/stock',
    {
      schema: {
        tags: ['Products'],
        description: 'Check product stock availability',
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          required: ['quantity'],
          properties: {
            quantity: { type: 'number', minimum: 1 },
          },
        },
      },
    },
    async (request) => {
      const available = await productsService.checkStock(
        request.params.id,
        request.query.quantity
      );
      return { success: true, data: { available } };
    }
  );
}
