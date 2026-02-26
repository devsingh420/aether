import { FastifyInstance } from 'fastify';
import { notificationsService } from './notifications.service.js';
import { authGuard } from '../../common/guards/auth.guard.js';

export async function notificationsRoutes(app: FastifyInstance): Promise<void> {
  // List notifications
  app.get<{
    Querystring: { page?: number; limit?: number; unreadOnly?: boolean };
  }>(
    '/',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Notifications'],
        description: 'List user notifications',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1 },
            limit: { type: 'number', minimum: 1, maximum: 100 },
            unreadOnly: { type: 'boolean' },
          },
        },
      },
    },
    async (request) => {
      const result = await notificationsService.list(request.user!.id, request.query);
      return { success: true, ...result };
    }
  );

  // Get unread count
  app.get(
    '/unread-count',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Notifications'],
        description: 'Get unread notification count',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request) => {
      const count = await notificationsService.getUnreadCount(request.user!.id);
      return { success: true, data: { count } };
    }
  );

  // Mark notification as read
  app.patch<{ Params: { id: string } }>(
    '/:id/read',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Notifications'],
        description: 'Mark notification as read',
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
      await notificationsService.markAsRead(request.user!.id, request.params.id);
      return { success: true, message: 'Notification marked as read' };
    }
  );

  // Mark all as read
  app.patch(
    '/read-all',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Notifications'],
        description: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request) => {
      await notificationsService.markAllAsRead(request.user!.id);
      return { success: true, message: 'All notifications marked as read' };
    }
  );
}
