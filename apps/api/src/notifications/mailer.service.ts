import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * MailerService — the single transport abstraction for all outbound email.
 *
 * In development/test (NODE_ENV !== 'production' and no SMTP_HOST set):
 *   Uses Ethereal (https://ethereal.email) — a fake SMTP server that
 *   captures emails without delivering them. The preview URL is logged
 *   so you can inspect the email without configuring real SMTP.
 *
 * In production with Resend (SMTP_HOST === 'smtp.resend.com'):
 *   Uses Resend's HTTP API over HTTPS (port 443) instead of SMTP.
 *   This avoids port 465/587 blocking on hosting providers like Render.
 *   API key is read from SMTP_PASS.
 *
 * In production with other SMTP providers:
 *   Uses SMTP credentials from environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * Architectural contract: Extend this service only by adding new send*()
 * helper methods. Never instantiate nodemailer outside this service.
 * Email transport is an infrastructure concern — it must not leak into
 * domain services.
 */
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: Transporter | null = null;
  private readonly isProduction: boolean;
  private readonly from: string;
  private readonly useResendApi: boolean;
  private readonly resendApiKey: string | null;

  constructor(private readonly config: ConfigService) {
    this.isProduction = config.get<string>('NODE_ENV') === 'production';
    this.from =
      config.get<string>('SMTP_FROM') ?? 'WITHUS <noreply@withus.app>';

    // Use Resend HTTP API if SMTP_HOST is smtp.resend.com (avoids port blocking on Render)
    const smtpHost = config.get<string>('SMTP_HOST') ?? '';
    this.useResendApi = smtpHost === 'smtp.resend.com';
    this.resendApiKey = this.useResendApi
      ? (config.get<string>('SMTP_PASS') ?? null)
      : null;
  }

  private async getTransporter(): Promise<Transporter> {
    if (this.transporter) return this.transporter;

    const smtpHost = this.config.get<string>('SMTP_HOST');
    const rawPort = this.config.get<string | number>('SMTP_PORT');
    const port = rawPort ? Number(rawPort) : 587;

    if (this.isProduction || smtpHost) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost || this.config.getOrThrow<string>('SMTP_HOST'),
        port: port,
        secure: port === 465,
        auth: {
          user: this.config.getOrThrow<string>('SMTP_USER'),
          pass: this.config.getOrThrow<string>('SMTP_PASS'),
        },
      });
    } else {
      // Development / test: use Ethereal for email preview
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.logger.log(
        `[DEV] Ethereal email account: ${testAccount.user} / ${testAccount.pass}`,
      );
    }

    return this.transporter;
  }

  /**
   * Send via Resend HTTP API — bypasses SMTP port restrictions on Render.
   * Uses HTTPS port 443 which is always open.
   */
  private async sendViaResendApi(options: MailOptions): Promise<void> {
    if (!this.resendApiKey) {
      throw new Error('SMTP_PASS (Resend API key) is not configured');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Resend API error ${response.status}: ${body}`);
    }

    const result = (await response.json()) as { id?: string };
    this.logger.log(
      `Email delivered via Resend API to ${options.to} [id: ${result?.id}]`,
    );
  }

  async send(options: MailOptions): Promise<void> {
    try {
      // Use Resend HTTP API when configured — avoids SMTP port blocks on Render
      if (this.useResendApi) {
        await this.sendViaResendApi(options);
        return;
      }

      const transporter = await this.getTransporter();
      const info = await transporter.sendMail({
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (!this.isProduction) {
        // Log the Ethereal preview URL so devs can inspect the email
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          this.logger.log(`[DEV] Email preview URL: ${previewUrl}`);
        }
      }

      this.logger.log(`Email delivered to ${options.to}: ${options.subject}`);
    } catch (error) {
      // Email failure must never propagate to the caller — log and continue.
      // The underlying invite token was already created in the database.
      this.logger.error(
        `Failed to send email to ${options.to}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
