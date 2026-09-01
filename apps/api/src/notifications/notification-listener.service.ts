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
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 60px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
    <tr>
      <td style="padding: 48px 40px;">
        
        <!-- Header Brand Logo -->
        <div style="text-align: left; margin-bottom: 40px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; background: #0f172a; color: #ffffff; padding: 10px 16px; border-radius: 6px; font-size: 16px; font-weight: 800; letter-spacing: 0.05em;">
            WithUs ✦
          </div>
        </div>

        <!-- Heading -->
        <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; line-height: 1.3; letter-spacing: -0.02em;">
          You've been invited to join the team
        </h1>

        <!-- Subheading / Message -->
        <p style="font-size: 15px; color: #475569; margin: 0 0 32px 0; line-height: 1.6; font-weight: 500;">
          You have been invited to collaborate securely on <strong style="color: #0f172a;">WITHUS</strong>. Join your team to manage and access delegated credentials with zero raw password exposure.
        </p>

        <!-- CTA Button -->
        <div style="margin-bottom: 32px;">
          <a href="${inviteUrl}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 16px 32px; border-radius: 6px; transition: background-color 0.2s;">
            Accept Invitation
          </a>
        </div>

        <!-- Expiry Notice -->
        <div style="background-color: #f8fafc; padding: 16px 20px; border-radius: 6px; margin-bottom: 32px; border: 1px solid #e2e8f0;">
          <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.5; font-weight: 600;">
            <span style="font-size: 16px; vertical-align: middle; margin-right: 4px;">⏳</span> 
            This invitation link is secure and will expire in <strong style="color: #0f172a;">7 days</strong>.
          </p>
        </div>

        <!-- Link Fallback -->
        <p style="font-size: 12px; color: #94a3b8; margin: 0 0 32px 0; word-break: break-all; line-height: 1.6;">
          If the button above doesn't work, copy and paste this URL into your browser:<br />
          <a href="${inviteUrl}" style="color: #3b82f6; text-decoration: none; font-weight: 500;">${inviteUrl}</a>
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0 0 24px 0;" />

        <!-- Footer -->
        <p style="font-size: 12px; color: #94a3b8; margin: 0; font-weight: 500; line-height: 1.5;">
          <strong>WithUs Security</strong><br/>
          Enterprise Delegated Access Platform
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
}
