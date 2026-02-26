import { Role } from '@prisma/client';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      role: Role;
      farmId?: string;
    };
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: string;
      email: string;
      role: Role;
      farmId?: string;
    };
    user: {
      id: string;
      email: string;
      role: Role;
      farmId?: string;
    };
  }
}
