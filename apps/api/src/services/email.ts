import nodemailer, { type Transporter } from 'nodemailer';
import type { Logger } from 'pino';
import type { Env } from '../config/env.js';

export type EmailMessage = { to: string; subject: string; text: string; replyTo?: string };
export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

class ConsoleEmailProvider implements EmailProvider {
  constructor(
    private logger: Logger,
    private from: string,
  ) {}
  async send(message: EmailMessage) {
    this.logger.info(
      { email: { from: this.from, toDomain: message.to.split('@')[1], subject: message.subject } },
      'Development email captured (body redacted)',
    );
  }
}

class SmtpEmailProvider implements EmailProvider {
  private transporter: Transporter;
  constructor(private env: Env) {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    });
  }
  async send(message: EmailMessage) {
    await this.transporter.sendMail({ from: this.env.EMAIL_FROM, ...message });
  }
}

export function createEmailProvider(env: Env, logger: Logger): EmailProvider {
  return env.EMAIL_PROVIDER === 'smtp'
    ? new SmtpEmailProvider(env)
    : new ConsoleEmailProvider(logger, env.EMAIL_FROM);
}
