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
    const logoUrl = `${this.appUrl}/favicon.svg`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been invited to WITHUS</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; margin: 0; padding: 40px 16px; -webkit-font-smoothing: antialiased;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);">
    
    <!-- Top Header Bar -->
    <tr>
      <td style="background-color: #09090b; padding: 24px 32px; border-bottom: 1px solid #27272a;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align: middle;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">
                    <!-- Favicon Logo Image & Fallback -->
                    <img src="${logoUrl}" alt="WITHUS Icon" width="32" height="32" style="display: block; width: 32px; height: 32px; border-radius: 7px; background-color: #09090b;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="color: #ffffff; font-size: 18px; font-weight: 800; tracking-tight; letter-spacing: -0.03em;">WITHUS</span>
                  </td>
                </tr>
              </table>
            </td>
            <td style="text-align: right; vertical-align: middle;">
              <span style="display: inline-block; background-color: #18181b; color: #a1a1aa; border: 1px solid #27272a; border-radius: 9999px; padding: 4px 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
                🔒 Secure Invite
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 40px 32px 32px 32px; background-color: #ffffff;">
        
        <!-- Heading -->
        <h1 style="font-size: 22px; font-weight: 800; color: #09090b; margin: 0 0 12px 0; letter-spacing: -0.025em; line-height: 1.3;">
          You've been invited to join the team
        </h1>

        <!-- Description -->
        <p style="font-size: 14px; color: #52525b; margin: 0 0 28px 0; line-height: 1.6; font-weight: 450;">
          You have been invited to join an organization on <strong style="color: #09090b;">WITHUS</strong>. Collaborators use WITHUS to grant and access delegated credentials securely with zero raw password exposure.
        </p>

        <!-- CTA Button -->
        <div style="margin-bottom: 28px;">
          <a href="${inviteUrl}" target="_blank" style="display: inline-block; background-color: #09090b; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px; border: 1px solid #09090b; box-shadow: 0 4px 12px rgba(9, 9, 11, 0.15); transition: all 0.2s;">
            Accept Invitation &rarr;
          </a>
        </div>

        <!-- Expiry Warning Card -->
        <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width: 20px; vertical-align: top; font-size: 14px;">⏳</td>
              <td style="font-size: 12px; color: #854d0e; line-height: 1.5; font-weight: 500;">
                This invitation link is encrypted and will expire automatically in <strong>7 days</strong>.
              </td>
            </tr>
          </table>
        </div>

        <!-- Direct Link Box -->
        <div style="background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 8px; padding: 14px 16px; margin-bottom: 32px;">
          <p style="font-size: 11px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 6px 0;">
            Direct Link / Fallback URL:
          </p>
          <p style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #09090b; margin: 0; word-break: break-all; line-height: 1.5; select-all;">
            <a href="${inviteUrl}" style="color: #2563eb; text-decoration: underline;">${inviteUrl}</a>
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #f4f4f5; margin: 0 0 24px 0;" />

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size: 11px; color: #a1a1aa; line-height: 1.5; font-weight: 500;">
              &copy; WITHUS &mdash; Enterprise Delegated Access Platform<br />
              Zero-Trust Security &bull; Zero Raw Password Exposure
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
  }
}
