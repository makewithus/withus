import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

/**
 * SuperAdminGuard — Platform-level access control.
 *
 * This guard is completely separate from PermissionsGuard / PermissionEvaluator.
 * It does NOT check OrganizationMember roles or organization RBAC.
 *
 * It validates:
 *   1. The JWT token is valid (via AuthGuard('jwt'))
 *   2. The resolved user has User.isSuperAdmin === true in the DB
 *
 * Usage: @UseGuards(SuperAdminGuard) on any route or controller.
 */
@Injectable()
export class SuperAdminGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Step 1: Validate JWT (throws UnauthorizedException if invalid/missing)
    const jwtValid = await super.canActivate(context);
    if (!jwtValid) {
      throw new UnauthorizedException();
    }

    // Step 2: Get the authenticated user from request
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new UnauthorizedException();
    }

    // Step 3: Check isSuperAdmin from DB — never trust token payload
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isSuperAdmin: true, isActive: true, deletedAt: true },
    });

    if (!user || !user.isActive || user.deletedAt || !user.isSuperAdmin) {
      throw new ForbiddenException(
        'Access denied. This area is restricted to WITHUS platform administrators.',
      );
    }

    return true;
  }
}
