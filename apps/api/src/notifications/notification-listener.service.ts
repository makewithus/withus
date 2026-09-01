import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { MemberInvitedEvent } from '../organizations/organizations.events';
import { MailerService } from './mailer.service';

/**
 * NotificationListenerService
 *
 * Listens to domain events and delivers email notifications.
 * Uses the same @OnEvent pattern as AuditListenerService — extend
 * this class for any new notification type; never scatter email
 * logic across other services.
 *
 * Architectural contract: This service is the ONLY place that sends
 * outbound email. All other services emit events; this service handles
 * delivery. This separation ensures email failures never break the
 * originating business transaction.
 */
@Injectable()
export class NotificationListenerService {
  private readonly logger = new Logger(NotificationListenerService.name);
  private readonly appUrl: string;

  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {
    this.appUrl = this.config.get<string>('APP_URL') ?? 'http://localhost:3000';
  }

  @OnEvent('member.invited', { async: true })
  async handleMemberInvited(event: MemberInvitedEvent) {
    const inviteUrl = `${this.appUrl}/invite/${event.rawToken}`;

    this.logger.log(
      `Sending invite email to ${event.email} for org ${event.organizationId}`,
    );

    await this.mailer.send({
      to: event.email,
      subject: 'You have been invited to join WITHUS',
      html: this.buildInviteEmailHtml(inviteUrl),
      text: `You have been invited to join a WITHUS organization. Accept your invitation here: ${inviteUrl}\n\nThis link expires in 7 days.`,
    });
  }

  private buildInviteEmailHtml(inviteUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been invited to WITHUS</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 48px 16px; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; margin: 0 auto;">
    <tr>
      <td style="background-color: #ffffff; padding: 40px 36px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">

        <!-- Header Brand Logo -->
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="display: inline-block; background-color: #09090b; color: #ffffff; padding: 8px 18px; border-radius: 6px; font-size: 15px; font-weight: 800; letter-spacing: 0.04em;">
            WITHUS ✦
          </div>
        </div>

        <!-- Heading -->
        <h1 style="font-size: 20px; font-weight: 700; color: #09090b; margin: 0 0 10px 0; text-align: center; letter-spacing: -0.02em;">
          You've been invited to join the team
        </h1>

        <!-- Subheading -->
        <p style="font-size: 14px; color: #64748b; margin: 0 0 28px 0; text-align: center; line-height: 1.55; font-weight: 400;">
          You have been invited to collaborate on <strong style="color: #09090b;">WITHUS</strong>. Manage delegated credentials securely with zero raw password exposure.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${inviteUrl}" target="_blank" style="display: inline-block; background-color: #09090b; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 6px; border: 1px solid #09090b;">
            Accept Invitation &rarr;
          </a>
        </div>

        <!-- Expiry Notice -->
        <div style="background-color: #f8fafc; padding: 10px 14px; margin-bottom: 24px; text-align: center; border: 1px solid #e2e8f0; border-radius: 6px;">
          <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.5; font-weight: 500;">
            ⏳ This link expires in <strong>7 days</strong>.
          </p>
        </div>

        <!-- Link Fallback -->
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0 0 24px 0; word-break: break-all; line-height: 1.5;">
          If the button doesn't work, copy and paste this URL into your browser:<br />
          <a href="${inviteUrl}" style="color: #2563eb; text-decoration: underline;">${inviteUrl}</a>
        </p>

        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 20px 0;" />

        <!-- Footer -->
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0; font-weight: 400;">
          © WITHUS &mdash; Enterprise Delegated Access Platform
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
