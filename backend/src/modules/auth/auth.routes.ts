import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  lineCallbackSchema,
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  LineCallbackInput,
} from './auth.schemas.js';
import { authGuard } from '../../common/guards/auth.guard.js';
import { env } from '../../config/index.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const authService = new AuthService(app);

  // Register
  app.post<{ Body: RegisterInput }>(
    '/register',
    {
      schema: {
        tags: ['Auth'],
        description: 'Register a new user',
        body: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            name: { type: 'string', minLength: 2 },
            phone: { type: 'string' },
            company: { type: 'string' },
            type: { type: 'string', enum: ['INDIVIDUAL', 'BUSINESS'] },
          },
        },
      },
    },
    async (request, reply) => {
      const input = registerSchema.parse(request.body);
      const result = await authService.register(input);

      // Set refresh token as HTTP-only cookie
      reply.setCookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/v1/auth',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return {
        success: true,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
      };
    }
  );

  // Login
  app.post<{ Body: LoginInput }>(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        description: 'Login with email and password',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const input = loginSchema.parse(request.body);
      const result = await authService.login(input);

      reply.setCookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/v1/auth',
        maxAge: 7 * 24 * 60 * 60,
      });

      return {
        success: true,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        },
      };
    }
  );

  // Refresh token
  app.post<{ Body: RefreshTokenInput }>(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        description: 'Refresh access token',
      },
    },
    async (request, reply) => {
      // Get refresh token from cookie or body
      const refreshToken =
        request.cookies.refreshToken ||
        (request.body as RefreshTokenInput)?.refreshToken;

      if (!refreshToken) {
        reply.status(401);
        return { success: false, error: { message: 'Refresh token required' } };
      }

      const tokens = await authService.refreshTokens(refreshToken);

      reply.setCookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/v1/auth',
        maxAge: 7 * 24 * 60 * 60,
      });

      return {
        success: true,
        data: {
          accessToken: tokens.accessToken,
          expiresIn: tokens.expiresIn,
        },
      };
    }
  );

  // Logout
  app.post(
    '/logout',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Auth'],
        description: 'Logout current session',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const refreshToken = request.cookies.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      reply.clearCookie('refreshToken', { path: '/api/v1/auth' });

      return { success: true, message: 'Logged out successfully' };
    }
  );

  // Get current user
  app.get(
    '/me',
    {
      preHandler: [authGuard],
      schema: {
        tags: ['Auth'],
        description: 'Get current authenticated user',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request) => {
      const user = await authService.getMe(request.user!.id);
      return { success: true, data: user };
    }
  );

  // LINE Login redirect URL
  app.get(
    '/line',
    {
      schema: {
        tags: ['Auth'],
        description: 'Get LINE Login URL',
      },
    },
    async (request, reply) => {
      if (!env.LINE_CHANNEL_ID || !env.LINE_CALLBACK_URL) {
        reply.status(501);
        return { success: false, error: { message: 'LINE Login not configured' } };
      }

      const state = Math.random().toString(36).substring(7);
      const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
      lineAuthUrl.searchParams.set('response_type', 'code');
      lineAuthUrl.searchParams.set('client_id', env.LINE_CHANNEL_ID);
      lineAuthUrl.searchParams.set('redirect_uri', env.LINE_CALLBACK_URL);
      lineAuthUrl.searchParams.set('state', state);
      lineAuthUrl.searchParams.set('scope', 'profile openid');

      return { success: true, data: { url: lineAuthUrl.toString() } };
    }
  );

  // LINE Login callback
  app.get<{ Querystring: LineCallbackInput }>(
    '/line/callback',
    {
      schema: {
        tags: ['Auth'],
        description: 'LINE Login OAuth callback',
      },
    },
    async (request, reply) => {
      const { code } = lineCallbackSchema.parse(request.query);
      const result = await authService.lineCallback(code);

      reply.setCookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/v1/auth',
        maxAge: 7 * 24 * 60 * 60,
      });

      // Redirect to frontend with token
      const redirectUrl = new URL(`${env.FRONTEND_URL}/auth/callback`);
      redirectUrl.searchParams.set('token', result.tokens.accessToken);
      reply.redirect(redirectUrl.toString());
    }
  );
}
