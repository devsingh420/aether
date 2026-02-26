import { prisma } from '../../config/index.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../common/errors.js';
import {
  generateInquiryNumber,
  parsePagination,
  paginatedResponse,
  PaginatedResponse,
} from '../../common/utils.js';
import { Inquiry, InquiryStatus, Prisma } from '@prisma/client';

interface CreateInquiryInput {
  productId: string;
  quantity: number;
  proposedPrice: number;
  deliveryMethod: string;
  recurring: boolean;
  recurringDay?: string;
  message?: string;
}

interface UpdateInquiryInput {
  status?: InquiryStatus;
  agreedPrice?: number;
}

interface InquiryWithDetails extends Inquiry {
  product: {
    id: string;
    name: string;
    images: string[];
    unit: string;
    retailPrice: Prisma.Decimal;
    pricingTiers: Prisma.JsonValue;
    moqWholesale: number;
  };
  farm: {
    id: string;
    name: string;
    slug: string;
    image: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    company: string | null;
  };
  messages: {
    id: string;
    senderId: string;
    senderType: string;
    message: string;
    createdAt: Date;
  }[];
}

export class InquiriesService {
  async create(userId: string, input: CreateInquiryInput): Promise<InquiryWithDetails> {
    // Get product with farm
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
      include: { farm: { select: { id: true } } },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Validate quantity against wholesale MOQ
    if (input.quantity < product.moqWholesale) {
      throw new BadRequestError(
        `Minimum order quantity is ${product.moqWholesale}${product.unit}`
      );
    }

    // Set expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const inquiry = await prisma.inquiry.create({
      data: {
        inquiryNumber: generateInquiryNumber(),
        userId,
        farmId: product.farm.id,
        productId: input.productId,
        quantity: input.quantity,
        proposedPrice: input.proposedPrice,
        deliveryMethod: input.deliveryMethod,
        recurring: input.recurring,
        recurringDay: input.recurringDay,
        message: input.message,
        status: 'PENDING',
        expiresAt,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true,
            unit: true,
            retailPrice: true,
            pricingTiers: true,
            moqWholesale: true,
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        messages: true,
      },
    });

    return inquiry as InquiryWithDetails;
  }

  async list(
    userId: string,
    params: {
      page?: number;
      limit?: number;
      status?: InquiryStatus;
    }
  ): Promise<PaginatedResponse<InquiryWithDetails>> {
    const pagination = parsePagination(params.page, params.limit);

    const where: Prisma.InquiryWhereInput = { userId };

    if (params.status) {
      where.status = params.status;
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              unit: true,
              retailPrice: true,
              pricingTiers: true,
              moqWholesale: true,
            },
          },
          farm: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      prisma.inquiry.count({ where }),
    ]);

    return paginatedResponse(inquiries as InquiryWithDetails[], total, pagination);
  }

  async getById(inquiryId: string, userId?: string): Promise<InquiryWithDetails> {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true,
            unit: true,
            retailPrice: true,
            pricingTiers: true,
            moqWholesale: true,
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    // Verify access (user or farm owner)
    if (userId && inquiry.userId !== userId) {
      // Check if user is farm owner
      const farm = await prisma.farm.findFirst({
        where: { id: inquiry.farmId, ownerId: userId },
      });
      if (!farm) {
        throw new ForbiddenError('Access denied');
      }
    }

    return inquiry as InquiryWithDetails;
  }

  async update(
    inquiryId: string,
    userId: string,
    input: UpdateInquiryInput
  ): Promise<InquiryWithDetails> {
    const inquiry = await this.getById(inquiryId, userId);

    // Validate status transitions
    if (input.status) {
      const validTransitions: Record<InquiryStatus, InquiryStatus[]> = {
        PENDING: ['NEGOTIATING', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
        NEGOTIATING: ['ACCEPTED', 'REJECTED', 'EXPIRED'],
        ACCEPTED: ['CONVERTED'],
        REJECTED: [],
        CONVERTED: [],
        EXPIRED: [],
      };

      if (!validTransitions[inquiry.status].includes(input.status)) {
        throw new BadRequestError(
          `Cannot transition from ${inquiry.status} to ${input.status}`
        );
      }
    }

    const updated = await prisma.inquiry.update({
      where: { id: inquiryId },
      data: {
        status: input.status,
        agreedPrice: input.agreedPrice,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true,
            unit: true,
            retailPrice: true,
            pricingTiers: true,
            moqWholesale: true,
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return updated as InquiryWithDetails;
  }

  async addMessage(
    inquiryId: string,
    userId: string,
    message: string,
    attachment?: string
  ): Promise<InquiryWithDetails> {
    const inquiry = await this.getById(inquiryId, userId);

    // Determine sender type
    const farm = await prisma.farm.findFirst({
      where: { id: inquiry.farmId, ownerId: userId },
    });
    const senderType = farm ? 'FARM' : 'BUYER';

    // Add message
    await prisma.inquiryMessage.create({
      data: {
        inquiryId,
        senderId: userId,
        senderType,
        message,
        attachment,
      },
    });

    // Update status to NEGOTIATING if still PENDING
    if (inquiry.status === 'PENDING') {
      await prisma.inquiry.update({
        where: { id: inquiryId },
        data: { status: 'NEGOTIATING' },
      });
    }

    return this.getById(inquiryId);
  }

  async convertToOrder(inquiryId: string, userId: string): Promise<{ orderId: string }> {
    const inquiry = await this.getById(inquiryId, userId);

    if (inquiry.status !== 'ACCEPTED') {
      throw new BadRequestError('Inquiry must be accepted before converting to order');
    }

    if (!inquiry.agreedPrice) {
      throw new BadRequestError('Agreed price must be set');
    }

    // This would create an order from the inquiry
    // For now, just mark as converted
    await prisma.inquiry.update({
      where: { id: inquiryId },
      data: { status: 'CONVERTED' },
    });

    // In a real implementation, we'd create the order here
    // and link it via the inquiryId field
    return { orderId: 'pending-implementation' };
  }

  // For farm owners
  async listForFarm(
    farmId: string,
    params: {
      page?: number;
      limit?: number;
      status?: InquiryStatus;
    }
  ): Promise<PaginatedResponse<InquiryWithDetails>> {
    const pagination = parsePagination(params.page, params.limit);

    const where: Prisma.InquiryWhereInput = { farmId };

    if (params.status) {
      where.status = params.status;
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              unit: true,
              retailPrice: true,
              pricingTiers: true,
              moqWholesale: true,
            },
          },
          farm: {
            select: {
              id: true,
              name: true,
              slug: true,
              image: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              company: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
      prisma.inquiry.count({ where }),
    ]);

    return paginatedResponse(inquiries as InquiryWithDetails[], total, pagination);
  }

  async respond(
    inquiryId: string,
    farmId: string,
    action: 'accept' | 'reject' | 'counter',
    counterPrice?: number,
    message?: string
  ): Promise<InquiryWithDetails> {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
    });

    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    if (inquiry.farmId !== farmId) {
      throw new ForbiddenError('Access denied');
    }

    if (!['PENDING', 'NEGOTIATING'].includes(inquiry.status)) {
      throw new BadRequestError('Cannot respond to this inquiry');
    }

    let status: InquiryStatus = inquiry.status;
    let agreedPrice = inquiry.agreedPrice;

    if (action === 'accept') {
      status = 'ACCEPTED';
      agreedPrice = inquiry.proposedPrice;
    } else if (action === 'reject') {
      status = 'REJECTED';
    } else if (action === 'counter') {
      if (!counterPrice) {
        throw new BadRequestError('Counter price is required');
      }
      status = 'NEGOTIATING';
    }

    // Add message if provided
    if (message) {
      const farm = await prisma.farm.findUnique({
        where: { id: farmId },
        select: { ownerId: true },
      });

      await prisma.inquiryMessage.create({
        data: {
          inquiryId,
          senderId: farm!.ownerId,
          senderType: 'FARM',
          message: action === 'counter'
            ? `Counter offer: ฿${counterPrice}/kg. ${message}`
            : message,
        },
      });
    }

    return this.update(inquiryId, inquiry.userId, {
      status,
      agreedPrice: agreedPrice ? Number(agreedPrice) : undefined
    });
  }
}

export const inquiriesService = new InquiriesService();
