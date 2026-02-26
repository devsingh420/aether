import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ordersService } from './orders.service.js';
import { authGuard } from '../../common/guards/auth.guard.js';
import { OrderStatus } from '@prisma/client';

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().positive(),
    })
  ).min(1),
  deliveryMethod: z.enum(['standard', 'express', 'coldChain', 'scheduled']),
  deliveryAddress: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    address: z.string().min(1),
    subdistrict: z.string().min(1),
    district: z.string().min(1),
    province: z.string().min(1),
    postalCode: z.string().min(5),
    notes: z.string().optional(),
  }),
  scheduledDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  notes: z.string().optional(),
  type: z.enum(['RETAIL', 'WHOLESALE']).optional(),
});

type CreateOrderInput = z.infer<typeof createOrderSchema>;

interface ListOrdersQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export async function ordersRoutes(app: FastifyInstance): Promise<void> {
  // Create order
  app.post<{ Body: CreateOrderInput }>(
    '/',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Orders'],
        description: 'Create a new order',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['items', 'deliveryMethod', 'deliveryAddress'],
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'string' },
                  quantity: { type: 'number', minimum: 1 },
                },
              },
            },
            deliveryMethod: {
              type: 'string',
              enum: ['standard', 'express', 'coldChain', 'scheduled'],
            },
            deliveryAddress: {
              type: 'object',
              required: ['name', 'phone', 'address', 'subdistrict', 'district', 'province', 'postalCode'],
              properties: {
                name: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string' },
                subdistrict: { type: 'string' },
                district: { type: 'string' },
                province: { type: 'string' },
                postalCode: { type: 'string' },
                notes: { type: 'string' },
              },
            },
            scheduledDate: { type: 'string', format: 'date-time' },
            notes: { type: 'string' },
            type: { type: 'string', enum: ['RETAIL', 'WHOLESALE'] },
          },
        },
      },
    },
    async (request, reply) => {
      const input = createOrderSchema.parse(request.body);
      const order = await ordersService.create(request.user!.id, input);

      reply.status(201);
      return { success: true, data: order };
    }
  );

  // List user's orders
  app.get<{ Querystring: ListOrdersQuery }>(
    '/',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Orders'],
        description: 'List current user orders',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100 },
            status: {
              type: 'string',
              enum: [
                'PENDING', 'PAID', 'CONFIRMED', 'PREPARING',
                'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED',
              ],
            },
          },
        },
      },
    },
    async (request) => {
      const result = await ordersService.list(request.user!.id, request.query);
      return { success: true, ...result };
    }
  );

  // Get order by ID
  app.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Orders'],
        description: 'Get order by ID',
        security: [{ bearerAuth: [] }],
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
      const order = await ordersService.getById(request.params.id, request.user!.id);
      return { success: true, data: order };
    }
  );

  // Get order by order number
  app.get<{ Params: { orderNumber: string } }>(
    '/number/:orderNumber',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Orders'],
        description: 'Get order by order number',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['orderNumber'],
          properties: {
            orderNumber: { type: 'string' },
          },
        },
      },
    },
    async (request) => {
      const order = await ordersService.getByOrderNumber(
        request.params.orderNumber,
        request.user!.id
      );
      return { success: true, data: order };
    }
  );

  // Cancel order
  app.patch<{ Params: { id: string } }>(
    '/:id/cancel',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Orders'],
        description: 'Cancel an order',
        security: [{ bearerAuth: [] }],
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
      const order = await ordersService.cancel(request.params.id, request.user!.id);
      return { success: true, data: order };
    }
  );
}
