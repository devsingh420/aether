import bcrypt from 'bcrypt';
import { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';
import { prisma, env, redis } from '../../config/index.js';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../../common/errors.js';
import { Role, UserType } from '@prisma/client';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  company?: string;
  type?: UserType;
}

interface LoginInput {
  email: string;
  password: string;
}

interface TokenPayload {
  id: string;
  email: string;
  role: Role;
  farmId?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  constructor(private app: FastifyInstance) {}

  async register(input: RegisterInput): Promise<{ user: any; tokens: AuthTokens }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
        phone: input.phone,
        company: input.company,
        type: input.type || 'INDIVIDUAL',
        role: 'BUYER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        company: true,
        type: true,
        role: true,
        avatar: true,
        verified: true,
        createdAt: true,
      },
    });

    const tokens = await this.generateTokens({ id: user.id, email: user.email, role: user.role });

    return { user, tokens };
  }

  async login(input: LoginInput): Promise<{ user: any; tokens: AuthTokens }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: {
        farm: {
          select: { id: true },
        },
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      farmId: user.farm?.id,
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: {
            farm: { select: { id: true } },
          },
        },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new UnauthorizedError('Refresh token expired');
    }

    // Delete old token (rotation)
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Generate new tokens
    const tokens = await this.generateTokens({
      id: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
      farmId: storedToken.user.farm?.id,
    });

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async getMe(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        company: true,
        type: true,
        role: true,
        avatar: true,
        verified: true,
        lineUserId: true,
        createdAt: true,
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            verified: true,
          },
        },
        addresses: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async lineCallback(code: string): Promise<{ user: any; tokens: AuthTokens }> {
    if (!env.LINE_CHANNEL_ID || !env.LINE_CHANNEL_SECRET) {
      throw new BadRequestError('LINE Login not configured');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: env.LINE_CALLBACK_URL || '',
        client_id: env.LINE_CHANNEL_ID,
        client_secret: env.LINE_CHANNEL_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      throw new BadRequestError('Failed to exchange LINE code');
    }

    const tokenData = await tokenResponse.json() as { access_token: string; id_token: string };

    // Get user profile
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new BadRequestError('Failed to get LINE profile');
    }

    const profile = await profileResponse.json() as {
      userId: string;
      displayName: string;
      pictureUrl?: string;
    };

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { lineUserId: profile.userId },
      include: {
        farm: { select: { id: true } },
      },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          lineUserId: profile.userId,
          email: `line_${profile.userId}@aetherproduce.com`,
          name: profile.displayName,
          avatar: profile.pictureUrl,
          role: 'BUYER',
          type: 'INDIVIDUAL',
        },
        include: {
          farm: { select: { id: true } },
        },
      });
    } else {
      // Update avatar if changed
      if (profile.pictureUrl !== user.avatar) {
        await prisma.user.update({
          where: { id: user.id },
          data: { avatar: profile.pictureUrl },
        });
      }
    }

    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
      farmId: user.farm?.id,
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  private async generateTokens(payload: TokenPayload): Promise<AuthTokens> {
    const accessToken = this.app.jwt.sign(payload);

    const refreshToken = nanoid(64);
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: payload.id,
        expiresAt: refreshExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}
