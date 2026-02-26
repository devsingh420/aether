import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../errors.js';
import { env } from '../../config/env.js';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    errors?: Record<string, string[]>;
    stack?: string;
  };
}

export function errorHandler(
  error: FastifyError | AppError | ZodError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  console.error(`[ERROR] ${request.method} ${request.url}:`, error);

  const response: ErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };

  let statusCode = 500;

  if (error instanceof ZodError) {
    statusCode = 422;
    const fieldErrors: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(err.message);
    });
    response.error = {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors: fieldErrors,
    };
  } else if (error instanceof ValidationError) {
    statusCode = error.statusCode;
    response.error = {
      code: error.code,
      message: error.message,
      errors: error.errors,
    };
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    response.error = {
      code: error.code,
      message: error.message,
    };
  } else if ('statusCode' in error && typeof error.statusCode === 'number') {
    statusCode = error.statusCode;
    response.error = {
      code: (error as FastifyError).code || 'ERROR',
      message: error.message,
    };
  }

  if (env.NODE_ENV === 'development' && error.stack) {
    response.error.stack = error.stack;
  }

  reply.status(statusCode).send(response);
}
