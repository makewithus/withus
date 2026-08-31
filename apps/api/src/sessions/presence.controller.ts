import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { RequirePermissions } from '../authorization/decorators/require-permissions.decorator';
import { OrganizationContext } from '../authorization/decorators/organization-context.decorator';
import { Permission } from '@repo/types';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { PresenceService } from './presence.service';

class HeartbeatDto {
  platform!: string;
}

/**
 * Presence Controller
 *
 * Routes:
 *   POST /organizations/:orgId/presence/heartbeat  — Extension sends heartbeat (all roles)
 *   GET  /organizations/:orgId/presence            — Admin dashboard polls presence (OWNER + ADMIN)
 *
 * Security:
 *   - Both routes require JWT authentication.
 *   - GET requires PRESENCE_READ permission (OWNER + ADMIN only).
 *   - POST has no @RequirePermissions → PermissionsGuard passes through → all authenticated members
 *     can send heartbeats (required for presence to work for any role).
 */
@Controller('organizations/:orgId/presence')
@OrganizationContext('orgId')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  /**
   * POST /organizations/:orgId/presence/heartbeat
   *
   * Fire-and-forget from the extension service worker (every 30s).
   * No @RequirePermissions → PermissionsGuard passes through for all authenticated members.
   * Always 204 — presence failures must never surface to the extension.
   */
  @Post('heartbeat')
  @HttpCode(HttpStatus.NO_CONTENT)
  async heartbeat(
    @Param('orgId') orgId: string,
    @Body() dto: HeartbeatDto,
    @Request() req: RequestWithUser,
  ): Promise<void> {
    this.presenceService
      .recordHeartbeat(orgId, req.user.id, dto.platform)
      .catch(() => {
        /* non-blocking */
      });
  }

  /**
   * GET /organizations/:orgId/presence
   *
   * Returns presence status for all org members.
   * Requires PRESENCE_READ → OWNER + ADMIN only.
   * MEMBER receives 403 Forbidden from PermissionsGuard.
   */
  @Get()
  @RequirePermissions(Permission.PRESENCE_READ)
  async getPresence(@Param('orgId') orgId: string) {
    return this.presenceService.getOrgPresence(orgId);
  }
}
