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
    const inviteUrl = `${this.appUrl}/invite?token=${event.rawToken}`;

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
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 16px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; margin: 0 auto;">
    <tr>
      <td style="background-color: #ffffff; padding: 40px 32px; border: 1px solid #e4e4e7; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
        
        <!-- Header Brand Logo -->
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; background: #09090b; color: #ffffff; padding: 10px 20px; font-size: 16px; font-weight: 700; letter-spacing: -0.02em;">
            WITHUS &nbsp;✴
          </div>
        </div>

        <!-- Heading -->
        <h1 style="font-size: 22px; font-weight: 800; color: #09090b; margin: 0 0 12px 0; text-align: center; letter-spacing: -0.02em;">
          You've been invited to join the team
        </h1>

        <!-- Subheading / Message -->
        <p style="font-size: 14px; color: #71717a; margin: 0 0 32px 0; text-align: center; line-height: 1.6; font-weight: 500;">
          You have been invited to join an organization on <strong style="color: #09090b;">WITHUS</strong>. Manage delegated credentials with zero raw password exposure.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${inviteUrl}" target="_blank" style="display: inline-block; background-color: #09090b; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border: 1px solid #09090b;">
            Accept Invitation →
          </a>
        </div>

        <!-- Expiry Notice -->
        <div style="background-color: #f4f4f5; padding: 12px 16px; margin-bottom: 24px; text-align: center; border: 1px solid #e4e4e7;">
          <p style="font-size: 12px; color: #71717a; margin: 0; line-height: 1.5; font-weight: 500;">
            ⏳ This link expires in <strong>7 days</strong>.
          </p>
        </div>

        <!-- Link Fallback -->
        <p style="font-size: 11px; color: #a1a1aa; text-align: center; margin: 0 0 24px 0; word-break: break-all; line-height: 1.5;">
          If the button doesn't work, copy and paste this URL into your browser:<br />
          <a href="${inviteUrl}" style="color: #18181b; text-decoration: underline;">${inviteUrl}</a>
        </p>

        <hr style="border: none; border-top: 1px solid #f4f4f5; margin: 24px 0;" />

        <!-- Footer -->
        <p style="font-size: 11px; color: #a1a1aa; text-align: center; margin: 0; font-weight: 500;">
          © WITHUS — Enterprise Delegated Access Platform
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
