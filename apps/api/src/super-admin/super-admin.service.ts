import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuperAdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── KPI Overview ──────────────────────────────────────────────────────────

  async getOverview() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalOrgs,
      activeOrgs,
      newOrgs,
      totalVaults,
      totalSecrets,
      activeSessions,
      pendingSessions,
      revokedSessions,
      expiredSessions,
      recentAuditEvents,
    ] = await Promise.all([
      // Users
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.user.count({
        where: { deletedAt: null, createdAt: { gte: thirtyDaysAgo } },
      }),
      // Organizations
      this.prisma.organization.count({ where: { deletedAt: null } }),
      this.prisma.organization.count({
        where: { deletedAt: null, isActive: true },
      }),
      this.prisma.organization.count({
        where: { deletedAt: null, createdAt: { gte: thirtyDaysAgo } },
      }),
      // Vaults & Secrets
      this.prisma.vault.count({ where: { deletedAt: null } }),
      this.prisma.secret.count({ where: { deletedAt: null } }),
      // Sessions by status
      this.prisma.delegatedSession.count({ where: { status: 'ACTIVE' } }),
      this.prisma.delegatedSession.count({
        where: { status: 'PENDING_GRANT' },
      }),
      this.prisma.delegatedSession.count({ where: { status: 'REVOKED' } }),
      this.prisma.delegatedSession.count({ where: { status: 'EXPIRED' } }),
      // Recent audit activity (last 7 days)
      this.prisma.auditEvent.count({
        where: {
          createdAt: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Top platforms by active session count
    const platformStats = await this.prisma.delegatedSession.groupBy({
      by: ['integrationProvider'],
      where: { status: 'ACTIVE', integrationProvider: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        newLast30Days: newUsers,
        inactive: totalUsers - activeUsers,
      },
      organizations: {
        total: totalOrgs,
        active: activeOrgs,
        newLast30Days: newOrgs,
      },
      vaults: { total: totalVaults },
      secrets: { total: totalSecrets },
      sessions: {
        active: activeSessions,
        pending: pendingSessions,
        revoked: revokedSessions,
        expired: expiredSessions,
        total:
          activeSessions + pendingSessions + revokedSessions + expiredSessions,
      },
      audit: { eventsLast7Days: recentAuditEvents },
      topPlatforms: platformStats.map((p) => ({
        provider: p.integrationProvider,
        activeSessions: p._count.id,
      })),
    };
  }

  // ─── Users ─────────────────────────────────────────────────────────────────

  async getAllUsers(page: number = 1, limit: number = 50, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          fullName: true,
          isActive: true,
          isSuperAdmin: true,
          createdAt: true,
          emailVerifiedAt: true,
          organizationMemberships: {
            where: { removedAt: null },
            select: {
              role: true,
              organization: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserDetail(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        isSuperAdmin: true,
        createdAt: true,
        updatedAt: true,
        emailVerifiedAt: true,
        organizationMemberships: {
          where: { removedAt: null },
          select: {
            role: true,
            joinedAt: true,
            organization: {
              select: { id: true, name: true, slug: true, isActive: true },
            },
          },
        },
        // Intentionally: no passwordHash, no refreshTokens, no providerProfiles
      },
    });
  }

  // ─── Organizations ─────────────────────────────────────────────────────────

  async getAllOrganizations(
    page: number = 1,
    limit: number = 50,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [orgs, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              members: true,
              vaults: true,
              delegatedSessions: true,
            },
          },
          members: {
            where: { role: 'OWNER', removedAt: null },
            take: 1,
            select: {
              user: { select: { id: true, email: true, fullName: true } },
            },
          },
        },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      data: orgs.map((org) => ({
        ...org,
        owner: org.members[0]?.user ?? null,
        members: undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrganizationDetail(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        members: {
          where: { removedAt: null },
          select: {
            role: true,
            joinedAt: true,
            user: {
              select: { id: true, email: true, fullName: true, isActive: true },
            },
          },
        },
        vaults: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            createdAt: true,
            // Intentionally: no secrets content, only counts
            _count: { select: { secrets: true } },
          },
        },
        integrationConnections: {
          where: { deletedAt: null },
          select: { provider: true, status: true, createdAt: true },
        },
        _count: {
          select: {
            members: true,
            vaults: true,
            delegatedSessions: true,
            approvalRequests: true,
          },
        },
      },
    });

    if (!org) return null;

    // Active sessions count
    const activeSessionCount = await this.prisma.delegatedSession.count({
      where: { organizationId: orgId, status: 'ACTIVE' },
    });
    const pendingApprovalCount = await this.prisma.approvalRequest.count({
      where: { organizationId: orgId, status: 'PENDING' },
    });

    // Secret count (aggregate, not content)
    const secretCount = await this.prisma.secret.count({
      where: {
        vault: { organizationId: orgId },
        deletedAt: null,
      },
    });

    // Recent audit events (last 10, metadata only — no secret content)
    const recentAudit = await this.prisma.auditEvent.findMany({
      where: { organizationId: orgId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        resourceType: true,
        createdAt: true,
        actor: { select: { email: true, fullName: true } },
      },
    });

    return {
      ...org,
      activeSessionCount,
      pendingApprovalCount,
      secretCount,
      recentAudit,
    };
  }

  // ─── Sessions ──────────────────────────────────────────────────────────────

  async getAllSessions(page: number = 1, limit: number = 50, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [sessions, total] = await Promise.all([
      this.prisma.delegatedSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          scope: true,
          permission: true,
          integrationProvider: true,
          expiresAt: true,
          createdAt: true,
          revokedAt: true,
          organization: { select: { id: true, name: true } },
          grantor: { select: { id: true, email: true, fullName: true } },
          grantee: { select: { id: true, email: true, fullName: true } },
          // Intentionally: no resourceId details (could expose credential IDs)
        },
      }),
      this.prisma.delegatedSession.count({ where }),
    ]);

    return {
      data: sessions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Platform Audit ────────────────────────────────────────────────────────

  async getGlobalAuditEvents(
    page: number = 1,
    limit: number = 50,
    filters: {
      organizationId?: string;
      action?: string;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters.organizationId) where.organizationId = filters.organizationId;
    if (filters.action)
      where.action = { contains: filters.action, mode: 'insensitive' };
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [events, total] = await Promise.all([
      this.prisma.auditEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          resourceType: true,
          resourceId: true,
          createdAt: true,
          organization: { select: { id: true, name: true } },
          actor: { select: { id: true, email: true, fullName: true } },
        },
      }),
      this.prisma.auditEvent.count({ where }),
    ]);

    return {
      data: events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Platform Audit Log (Super Admin actions) ──────────────────────────────

  async logPlatformAction(
    actorId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
  ) {
    await this.prisma.platformAuditEvent.create({
      data: {
        actorId,
        action,
        targetType,
        targetId,
        metadata,
        ipAddress,
      },
    });
  }

  async getPlatformAuditLog(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      this.prisma.platformAuditEvent.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { email: true, fullName: true } },
        },
      }),
      this.prisma.platformAuditEvent.count(),
    ]);

    return {
      data: events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
