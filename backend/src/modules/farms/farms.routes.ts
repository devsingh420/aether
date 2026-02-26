import { FastifyInstance } from 'fastify';
import { farmsService } from './farms.service.js';

interface ListFarmsQuery {
  page?: number;
  limit?: number;
  province?: string;
  verified?: boolean;
  coldChain?: boolean;
  search?: string;
  sortBy?: 'rating' | 'name' | 'createdAt' | 'reviewCount';
  sortOrder?: 'asc' | 'desc';
}

export async function farmsRoutes(app: FastifyInstance): Promise<void> {
  // List farms
  app.get<{ Querystring: ListFarmsQuery }>(
    '/',
    {
      schema: {
        tags: ['Farms'],
        description: 'List farms with filters and pagination',
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100 },
            province: { type: 'string' },
            verified: { type: 'boolean' },
            coldChain: { type: 'boolean' },
            search: { type: 'string' },
            sortBy: { type: 'string', enum: ['rating', 'name', 'createdAt', 'reviewCount'] },
            sortOrder: { type: 'string', enum: ['asc', 'desc'] },
          },
        },
      },
    },
    async (request) => {
      const result = await farmsService.list(request.query);
      return { success: true, ...result };
    }
  );

  // Get farm by ID
  app.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        tags: ['Farms'],
        description: 'Get farm by ID',
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
      const farm = await farmsService.getById(request.params.id);
      return { success: true, data: farm };
    }
  );

  // Get farm by slug
  app.get<{ Params: { slug: string } }>(
    '/slug/:slug',
    {
      schema: {
        tags: ['Farms'],
        description: 'Get farm by slug',
        params: {
          type: 'object',
          required: ['slug'],
          properties: {
            slug: { type: 'string' },
          },
        },
      },
    },
    async (request) => {
      const farm = await farmsService.getBySlug(request.params.slug);
      return { success: true, data: farm };
    }
  );

  // Get farm products
  app.get<{
    Params: { id: string };
    Querystring: { page?: number; limit?: number; active?: boolean };
  }>(
    '/:id/products',
    {
      schema: {
        tags: ['Farms'],
        description: 'Get products from a specific farm',
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
            page: { type: 'number', minimum: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100 },
            active: { type: 'boolean' },
          },
        },
      },
    },
    async (request) => {
      const result = await farmsService.getProducts(request.params.id, request.query);
      return { success: true, ...result };
    }
  );

  // Get all provinces
  app.get(
    '/meta/provinces',
    {
      schema: {
        tags: ['Farms'],
        description: 'Get all provinces with farm counts',
      },
    },
    async () => {
      const provinces = await farmsService.getProvinces();
      return { success: true, data: provinces };
    }
  );
}
