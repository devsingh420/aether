import { FastifyReply, FastifyRequest } from 'fastify';
import { UnauthorizedError, ForbiddenError } from '../errors.js';
import { Role } from '@prisma/client';

export async function authGuard(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export function requireRole(...roles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    await authGuard(request, reply);

    if (!request.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    if (!roles.includes(request.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
  };
}

export async function optionalAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    // Token is optional, continue without user
  }
}

export async function farmOwnerGuard(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  await authGuard(request, reply);

  if (!request.user) {
    throw new UnauthorizedError('User not authenticated');
  }

  if (request.user.role !== 'FARM_OWNER' || !request.user.farmId) {
    throw new ForbiddenError('This action requires farm owner access');
  }
}

export async function adminGuard(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  await authGuard(request, reply);

  if (!request.user) {
    throw new UnauthorizedError('User not authenticated');
  }

  if (request.user.role !== 'ADMIN') {
    throw new ForbiddenError('Admin access required');
  }
}
