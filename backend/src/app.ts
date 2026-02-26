import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { env, connectDatabase, disconnectDatabase, redis, disconnectRedis } from './config/index.js';
import { errorHandler } from './common/filters/error.filter.js';
import { registerRequestLogger } from './common/middleware/request-logger.js';

import { authRoutes } from './modules/auth/auth.routes.js';
import { productsRoutes } from './modules/products/products.routes.js';
import { farmsRoutes } from './modules/farms/farms.routes.js';
import { ordersRoutes } from './modules/orders/orders.routes.js';
import { inquiriesRoutes } from './modules/inquiries/inquiries.routes.js';
import { paymentsRoutes } from './modules/payments/payments.routes.js';
import { farmDashboardRoutes } from './modules/farms/farm-dashboard.routes.js';
import { notificationsRoutes } from './modules/notifications/notifications.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';

const app = Fastify({
  logger: env.NODE_ENV === 'development',
});

async function bootstrap(): Promise<void> {
  // Register plugins
  await app.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cookie);

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Swagger documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Aether Produce API',
        description: 'B2B/B2C Thai Farm Produce Marketplace API',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://${env.HOST}:${env.PORT}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  });

  // Global hooks
  registerRequestLogger(app);

  // Error handler
  app.setErrorHandler(errorHandler);

  // Health check
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  }));

  // API Routes
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(productsRoutes, { prefix: '/api/v1/products' });
  await app.register(farmsRoutes, { prefix: '/api/v1/farms' });
  await app.register(ordersRoutes, { prefix: '/api/v1/orders' });
  await app.register(inquiriesRoutes, { prefix: '/api/v1/inquiries' });
  await app.register(paymentsRoutes, { prefix: '/api/v1/payments' });
  await app.register(farmDashboardRoutes, { prefix: '/api/v1/farm' });
  await app.register(notificationsRoutes, { prefix: '/api/v1/notifications' });
  await app.register(adminRoutes, { prefix: '/api/v1/admin' });

  // Market trends endpoint
  app.get('/api/v1/market/trends', async () => {
    // This would fetch real price data from database
    return {
      success: true,
      data: {
        fruits: { name: 'Fruits', data: [85, 89, 94, 92, 96, 91, 93], change: 9.2 },
        vegetables: { name: 'Vegetables', data: [62, 65, 68, 64, 67, 65, 68], change: 7.4 },
        grains: { name: 'Grains & Rice', data: [48, 46, 45, 44, 45, 44, 45], change: -5.2 },
        herbs: { name: 'Herbs & Spices', data: [125, 128, 132, 135, 130, 133, 135], change: 8.0 },
      },
    };
  });

  // Connect to databases
  await connectDatabase();

  // Start server
  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`Server running at http://${env.HOST}:${env.PORT}`);
    console.log(`API documentation at http://${env.HOST}:${env.PORT}/docs`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
signals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    await app.close();
    await disconnectDatabase();
    await disconnectRedis();
    process.exit(0);
  });
});

bootstrap();
