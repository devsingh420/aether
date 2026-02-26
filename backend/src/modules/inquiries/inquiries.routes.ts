import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { inquiriesService } from './inquiries.service.js';
import { authGuard } from '../../common/guards/auth.guard.js';
import { InquiryStatus } from '@prisma/client';

const createInquirySchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
  proposedPrice: z.number().positive(),
  deliveryMethod: z.enum(['standard', 'express', 'coldChain', 'scheduled']),
  recurring: z.boolean(),
  recurringDay: z.string().optional(),
  message: z.string().optional(),
});

const updateInquirySchema = z.object({
  status: z.enum(['PENDING', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'CONVERTED', 'EXPIRED']).optional(),
  agreedPrice: z.number().positive().optional(),
});

const addMessageSchema = z.object({
  message: z.string().min(1),
  attachment: z.string().optional(),
});

type CreateInquiryInput = z.infer<typeof createInquirySchema>;
type UpdateInquiryInput = z.infer<typeof updateInquirySchema>;
type AddMessageInput = z.infer<typeof addMessageSchema>;

interface ListInquiriesQuery {
  page?: number;
  limit?: number;
  status?: InquiryStatus;
}

export async function inquiriesRoutes(app: FastifyInstance): Promise<void> {
  // Create inquiry (quote request)
  app.post<{ Body: CreateInquiryInput }>(
    '/',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Inquiries'],
        description: 'Submit a B2B quote request',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['productId', 'quantity', 'proposedPrice', 'deliveryMethod', 'recurring'],
          properties: {
            productId: { type: 'string' },
            quantity: { type: 'number', minimum: 1 },
            proposedPrice: { type: 'number', minimum: 0 },
            deliveryMethod: {
              type: 'string',
              enum: ['standard', 'express', 'coldChain', 'scheduled'],
            },
            recurring: { type: 'boolean' },
            recurringDay: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const input = createInquirySchema.parse(request.body);
      const inquiry = await inquiriesService.create(request.user!.id, input);

      reply.status(201);
      return { success: true, data: inquiry };
    }
  );

  // List user's inquiries
  app.get<{ Querystring: ListInquiriesQuery }>(
    '/',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Inquiries'],
        description: 'List current user inquiries',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100 },
            status: {
              type: 'string',
              enum: ['PENDING', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'CONVERTED', 'EXPIRED'],
            },
          },
        },
      },
    },
    async (request) => {
      const result = await inquiriesService.list(request.user!.id, request.query);
      return { success: true, ...result };
    }
  );

  // Get inquiry by ID
  app.get<{ Params: { id: string } }>(
    '/:id',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Inquiries'],
        description: 'Get inquiry by ID',
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
      const inquiry = await inquiriesService.getById(request.params.id, request.user!.id);
      return { success: true, data: inquiry };
    }
  );

  // Update inquiry
  app.patch<{ Params: { id: string }; Body: UpdateInquiryInput }>(
    '/:id',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Inquiries'],
        description: 'Update inquiry (negotiate/accept)',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['PENDING', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'CONVERTED', 'EXPIRED'],
            },
            agreedPrice: { type: 'number', minimum: 0 },
          },
        },
      },
    },
    async (request) => {
      const input = updateInquirySchema.parse(request.body);
      const inquiry = await inquiriesService.update(
        request.params.id,
        request.user!.id,
        input
      );
      return { success: true, data: inquiry };
    }
  );

  // Add message to inquiry
  app.post<{ Params: { id: string }; Body: AddMessageInput }>(
    '/:id/messages',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Inquiries'],
        description: 'Add message to inquiry negotiation',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
        body: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string' },
            attachment: { type: 'string' },
          },
        },
      },
    },
    async (request) => {
      const input = addMessageSchema.parse(request.body);
      const inquiry = await inquiriesService.addMessage(
        request.params.id,
        request.user!.id,
        input.message,
        input.attachment
      );
      return { success: true, data: inquiry };
    }
  );

  // Convert inquiry to order
  app.post<{ Params: { id: string } }>(
    '/:id/convert',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Inquiries'],
        description: 'Convert accepted inquiry to order',
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
      const result = await inquiriesService.convertToOrder(
        request.params.id,
        request.user!.id
      );
      return { success: true, data: result };
    }
  );
}
