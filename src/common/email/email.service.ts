import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  private appPassTransporter: any | undefined;

  private isAppPasswordEnabled(): boolean {
    const enabled =
      this.configService.get('USE_GMAIL_APP_PASSWORD', 'false') === 'true';
    const user = this.configService.get('MAIL_USER');
    const pass = this.configService.get('MAIL_PASS');
    return enabled && !!user && !!pass;
  }

  private async ensureAppPassTransporter() {
    if (this.appPassTransporter) return;
    const user = this.configService.get('MAIL_USER');
    const pass = this.configService.get('MAIL_PASS');
    // Use Gmail SMTP with App Password
    this.appPassTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
    try {
      await this.appPassTransporter.verify();
    } catch (e) {
      this.appPassTransporter = undefined;
      throw e;
    }
  }

  async sendEmail(
    toEmail: string[],
    subject: string,
    content: string,
    html?: string,
  ) {
    try {
      // Prefer App Password if enabled
      if (this.isAppPasswordEnabled()) {
        try {
          await this.ensureAppPassTransporter();
          const from = this.configService.get('MAIL_USER');
          const result = await this.appPassTransporter.sendMail({
            from: `Twendee Work <${from}>`,
            to: toEmail.join(', '),
            subject,
            text: content,
            html,
          });
          return { success: true, messageId: result?.messageId };
        } catch (err) {
          throw err;
          console.error('App Password SMTP failed, falling back to N8N:', err);
        }
      }
    } catch (e) {
      console.error('sendEmail failed:', e);
    }
  }
}
