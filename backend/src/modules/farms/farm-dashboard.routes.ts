import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { farmDashboardService } from './farm-dashboard.service.js';
import { inquiriesService } from '../inquiries/inquiries.service.js';
import { farmOwnerGuard } from '../../common/guards/auth.guard.js';
import { Grade, OrderStatus, InquiryStatus } from '@prisma/client';

const createProductSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  description: z.string().min(1),
  specifications: z.array(z.string()),
  grade: z.enum(['A', 'B', 'C']),
  images: z.array(z.string().url()),
  unit: z.string().optional(),
  retailUnit: z.string(),
  retailQty: z.number().positive(),
  retailPrice: z.number().positive(),
  pricingTiers: z.array(
    z.object({
      min: z.number().positive(),
      max: z.number().positive(),
      price: z.number().positive(),
    })
  ),
  moqRetail: z.number().positive().optional(),
  moqWholesale: z.number().positive(),
  stock: z.number().nonnegative(),
  harvestSchedule: z.string().optional(),
  shelfLife: z.string().optional(),
  storageTemp: z.string().optional(),
  needsColdChain: z.boolean().optional(),
});

const updateProductSchema = createProductSchema.partial().extend({
  active: z.boolean().optional(),
});

const updateOrderSchema = z.object({
  status: z.enum(['CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED']),
  trackingNumber: z.string().optional(),
});

const respondInquirySchema = z.object({
  action: z.enum(['accept', 'reject', 'counter']),
  counterPrice: z.number().positive().optional(),
  message: z.string().optional(),
});

type CreateProductInput = z.infer<typeof createProductSchema>;
type UpdateProductInput = z.infer<typeof updateProductSchema>;
type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
type RespondInquiryInput = z.infer<typeof respondInquirySchema>;

export async function farmDashboardRoutes(app: FastifyInstance): Promise<void> {
  // All routes require farm owner auth
  app.addHook('preHandler', farmOwnerGuard);

  // Get dashboard stats
  app.get(
    '/dashboard',
    {
      schema: {
        tags: ['Farm Dashboard'],
        description: 'Get farm dashboard statistics',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request) => {
      const stats = await farmDashboardService.getStats(request.user!.farmId!);
      return { success: true, data: stats };
    }
  );

  // List farm products
  app.get<{
    Querystring: {
      page?: number;
      limit?: number;
      active?: boolean;
      category?: string;
      search?: string;
    };
  }>(
    '/products',
    {
      schema: {
        tags: ['Farm Dashboard'],
        description: 'List farm products',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request) => {
      const result = await farmDashboardService.listProducts(
        request.user!.farmId!,
        request.query
      );
      return { success: true, ...result };
    }
  );

  // Create product
  app.post<{ Body: CreateProductInput }>(
    '/products',
    {
      schema: {
        tags: ['Farm Dashboard'],
        description: 'Create a new product',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const input = createProductSchema.parse(request.body);
      const product = await farmDashboardService.createProduct(
        request.user!.farmId!,
        input
      );
      reply.status(201);
      return { success: true, data: product };
    }
  );

  // Update product
  app.patch<{ Params: { id: string }; Body: UpdateProductInput }>(
    '/products/:id',
    {
      schema: {
        tags: ['Farm Dashboard'],
        description: 'Update a product',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request) => {
      const input = updateProductSchema.parse(request.body);
      const product = await farmDashboardService.updateProduct(
        request.user!.farmId!,
        request.params.id,
        input
      );
      return { success: true, data: product };
    }
  );

  // Update inventory
  app.patch<{ Params: { id: string }; Body: { stock: number } }>(
    '/inventory/:id',
    {
      schema: {
        tags: ['Farm Dashboard'],
        description: 'Update product stock',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['stock'],
          properties: {
            stock: { type: 'number', minimum: 0 },
          },
        },
      },
    },
    async (request) => {
      const product = await farmDashboardService.updateInventory(
        request.user!.farmId!,
        request.params.id,
        request.body.stock
      );
      return { success: true, data: product };
    }
  );

  // List farm orders
  app.get<{
    Querystring: { page?: number; limit?: number; status?: OrderStatus };
  }>(
    '/orders',
    {
      schema: {
        tags: ['Farm Dashboard'],
        description: 'List farm orders',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request) => {
      const result = await farmDashboardService.listOrders(
        request.user!.farmId!,
        request.query
      );
      return { success: true, ...result };
    }
  );

  // Update order status
  app.patch<{ Params: { id: string }; Body: UpdateOrderInput }>(
    '/orders/:id',
    {
      schema: {
        tags: ['Farm Dashboard'],
        description: 'Update order status',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request) => {
      const input = updateOrderSchema.parse(request.body);
      const order = await farmDashboardService.updateOrderStatus(
        request.user!.farmId!,
        request.params.id,
        input.status,
        input.trackingNumber
      );
      return { success: true, data: order };
    }
  );

  // List farm inquiries
  app.get<{
    Querystring: { page?: number; limit?: number; status?: InquiryStatus };
  }>(
    '/inquiries',
    {
      schema: {
        tags: ['Farm Dashboard'],
        description: 'List farm inquiries (quote requests)',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request) => {
      const result = await inquiriesService.listForFarm(
        request.user!.farmId!,
        request.query
      );
      return { success: true, ...result };
    }
  );

  // Respond to inquiry
  app.post<{ Params: { id: string }; Body: RespondInquiryInput }>(
    '/inquiries/:id/respond',
    {
      schema: {
        tags: ['Farm Dashboard'],
        description: 'Respond to an inquiry',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request) => {
      const input = respondInquirySchema.parse(request.body);
      const inquiry = await inquiriesService.respond(
        request.params.id,
        request.user!.farmId!,
        input.action,
        input.counterPrice,
        input.message
      );
      return { success: true, data: inquiry };
    }
  );

  // List payouts
  app.get<{ Querystring: { page?: number; limit?: number } }>(
    '/payouts',
    {
      schema: {
        tags: ['Farm Dashboard'],
        description: 'List farm payouts',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request) => {
      const result = await farmDashboardService.listPayouts(
        request.user!.farmId!,
        request.query
      );
      return { success: true, ...result };
    }
  );

  // Get payout summary
  app.get(
    '/payouts/summary',
    {
      schema: {
        tags: ['Farm Dashboard'],
        description: 'Get payout summary',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request) => {
      const summary = await farmDashboardService.getPayoutSummary(
        request.user!.farmId!
      );
      return { success: true, data: summary };
    }
  );
}
