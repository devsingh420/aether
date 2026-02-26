import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export function registerRequestLogger(app: FastifyInstance): void {
  app.addHook('onRequest', async (request: FastifyRequest) => {
    (request as any).startTime = Date.now();
  });

  app.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const duration = Date.now() - ((request as any).startTime || Date.now());
    console.log(
      `[${new Date().toISOString()}] ${request.method} ${request.url} ${reply.statusCode} ${duration}ms`
    );
  });
}
