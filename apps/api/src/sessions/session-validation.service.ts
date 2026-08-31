import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import {
  DelegatedSession,
  SessionStatus,
  SessionPermission,
} from '@prisma/client';

@Injectable()
export class SessionValidationService {
  /**
   * Validates if a session is currently usable.
   * Throws UnauthorizedException if invalid.
   * Throws ForbiddenException if the session permission does not allow reveal.
   */
  validateSessionForUse(session: DelegatedSession, granteeId: string) {
    if (session.granteeId !== granteeId) {
      throw new UnauthorizedException(
        'You are not the grantee of this session.',
      );
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new UnauthorizedException(
        `Session is ${session.status.toLowerCase()}.`,
      );
    }

    if (new Date() > session.expiresAt) {
      throw new UnauthorizedException('Session has expired.');
    }

    if (
      session.maxReveals !== null &&
      session.revealCount >= session.maxReveals
    ) {
      throw new UnauthorizedException(
        'Session has reached its maximum allowed uses.',
      );
    }

    return true;
  }

  /**
   * Additional check specifically for password reveal via session.
   * EXTENSION sessions must never be used to reveal plaintext in the web portal.
   * Called by revealSecretViaSession() before decryption.
   */
  validateSessionForReveal(session: DelegatedSession, granteeId: string) {
    this.validateSessionForUse(session, granteeId);

    if (session.permission !== SessionPermission.REVEAL) {
      throw new ForbiddenException(
        'This session grants browser extension access only. Password reveal is not permitted.',
      );
    }

    return true;
  }
}
