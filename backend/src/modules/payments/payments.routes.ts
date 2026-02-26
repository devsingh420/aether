import { FastifyInstance, FastifyRequest } from 'fastify';
import { paymentsService } from './payments.service.js';
import { authGuard } from '../../common/guards/auth.guard.js';

export async function paymentsRoutes(app: FastifyInstance): Promise<void> {
  // Get Stripe publishable key
  app.get(
    '/config',
    {
      schema: {
        tags: ['Payments'],
        description: 'Get payment configuration',
      },
    },
    async () => {
      const publishableKey = await paymentsService.getPublishableKey();
      return { success: true, data: { publishableKey } };
    }
  );

  // Create PromptPay payment
  app.post<{ Body: { orderId: string } }>(
    '/promptpay',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Payments'],
        description: 'Create PromptPay payment (generates QR code)',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['orderId'],
          properties: {
            orderId: { type: 'string' },
          },
        },
      },
    },
    async (request) => {
      const result = await paymentsService.createPromptPayPayment(
        request.body.orderId,
        request.user!.id
      );
      return { success: true, data: result };
    }
  );

  // Create card payment
  app.post<{ Body: { orderId: string } }>(
    '/card',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Payments'],
        description: 'Create card payment intent',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['orderId'],
          properties: {
            orderId: { type: 'string' },
          },
        },
      },
    },
    async (request) => {
      const result = await paymentsService.createCardPayment(
        request.body.orderId,
        request.user!.id
      );
      return { success: true, data: result };
    }
  );

  // Stripe webhook
  app.post(
    '/webhook',
    {
      config: {
        rawBody: true,
      } as any,
      schema: {
        tags: ['Payments'],
        description: 'Stripe webhook endpoint',
      },
    },
    async (request: FastifyRequest<{ Body: string }>, reply) => {
      const signature = request.headers['stripe-signature'] as string;

      if (!signature) {
        reply.status(400);
        return { success: false, error: { message: 'Missing signature' } };
      }

      // Access raw body
      const rawBody = (request as any).rawBody || request.body;

      await paymentsService.handleWebhook(
        typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody),
        signature
      );

      return { received: true };
    }
  );

  // Get payment status
  app.get<{ Params: { orderId: string } }>(
    '/:orderId/status',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Payments'],
        description: 'Get payment status for an order',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['orderId'],
          properties: {
            orderId: { type: 'string' },
          },
        },
      },
    },
    async (request) => {
      const status = await paymentsService.getPaymentStatus(
        request.params.orderId,
        request.user!.id
      );
      return { success: true, data: status };
    }
  );
}
